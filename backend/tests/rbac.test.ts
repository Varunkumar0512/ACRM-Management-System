import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';

const app = createApp();

let studentToken = '';
let facultyToken = '';
let adminToken = '';
let studentUserId = '';

beforeAll(async () => {
  await connectDB();

  // Login as student
  const studentRes = await request(app)
    .post('/api/v1/auth/sign-in')
    .send({ email: 'student@university.edu', password: 'Password123!' });
  expect(studentRes.status).toBe(200);
  studentToken = studentRes.body.data.tokens.accessToken;
  studentUserId = studentRes.body.data.user.id;

  // Login as faculty
  const facultyRes = await request(app)
    .post('/api/v1/auth/sign-in')
    .send({ email: 'faculty@university.edu', password: 'Password123!' });
  expect(facultyRes.status).toBe(200);
  facultyToken = facultyRes.body.data.tokens.accessToken;

  // Login as admin
  const adminRes = await request(app)
    .post('/api/v1/auth/sign-in')
    .send({ email: 'admin@university.edu', password: 'AdminSecret123!' });
  expect(adminRes.status).toBe(200);
  adminToken = adminRes.body.data.tokens.accessToken;
});

afterAll(async () => {
  await disconnectDB();
});

describe('Role-Based Access Control (RBAC) & Authorization Integrity', () => {
  describe('Unauthenticated Request Handling (401)', () => {
    it('should reject unauthenticated request to /admin/analytics with 401', async () => {
      const res = await request(app).get('/api/v1/admin/analytics');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject unauthenticated request to /faculty/dashboard with 401', async () => {
      const res = await request(app).get('/api/v1/faculty/dashboard');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Student Authorization Boundaries (403 Forbidden)', () => {
    it('should deny student access to Admin dashboard analytics', async () => {
      const res = await request(app)
        .get('/api/v1/admin/analytics')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should deny student access to Admin user governance roster', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should deny student access to Faculty mentor dashboard', async () => {
      const res = await request(app)
        .get('/api/v1/faculty/dashboard')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('Faculty Authorization Boundaries (403 Forbidden)', () => {
    it('should allow faculty access to Faculty mentor dashboard', async () => {
      const res = await request(app)
        .get('/api/v1/faculty/dashboard')
        .set('Authorization', `Bearer ${facultyToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.stats).toBeDefined();
      expect(res.body.data.activeProjects).toBeDefined();
    });

    it('should deny faculty access to Admin analytics', async () => {
      const res = await request(app)
        .get('/api/v1/admin/analytics')
        .set('Authorization', `Bearer ${facultyToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should deny faculty access to Admin audit security logs', async () => {
      const res = await request(app)
        .get('/api/v1/admin/audit-logs')
        .set('Authorization', `Bearer ${facultyToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('Admin Authorized Access & Role Governance', () => {
    it('should allow Admin to retrieve system analytics', async () => {
      const res = await request(app)
        .get('/api/v1/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should allow Admin to view user governance directory', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.users)).toBe(true);
    });

    it('should reject invalid role assignment with 400 Bad Request', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/users/${studentUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'SUPER_HACKER' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Role Integrity & Client Tampering Resistance', () => {
    it('never trusts a role sent by frontend in login body', async () => {
      // Even if client maliciously sends { role: 'ADMIN' }, backend must fetch role from DB
      const res = await request(app)
        .post('/api/v1/auth/sign-in')
        .send({
          email: 'student@university.edu',
          password: 'Password123!',
          role: 'ADMIN', // Tampering attempt
        });
      expect(res.status).toBe(200);
      expect(res.body.data.user.role).toBe('STUDENT');
    });

    it('never allows public registration to assign ADMIN role', async () => {
      const res = await request(app)
        .post('/api/v1/auth/sign-up/student')
        .send({
          fullName: 'Security Tester',
          email: `sec_test_${Date.now()}@university.edu`,
          password: 'Password123!',
          studentId: `SEC-${Date.now().toString().slice(-4)}`,
          department: 'Computer Science',
          program: 'B.Tech',
          yearOfStudy: 3,
          role: 'ADMIN', // Tampering attempt
        });
      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('STUDENT');
    });
  });
});
