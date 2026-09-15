import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';

const app = createApp();

let studentToken = '';
let facultyToken = '';
let adminToken = '';
let sampleProjectId = '';

beforeAll(async () => {
  await connectDB();

  // Login as student
  const studentRes = await request(app)
    .post('/api/v1/auth/sign-in')
    .send({ email: 'student@university.edu', password: 'Password123!' });
  if (studentRes.status === 200) {
    studentToken = studentRes.body.data.tokens.accessToken;
  }

  // Login as faculty
  const facultyRes = await request(app)
    .post('/api/v1/auth/sign-in')
    .send({ email: 'faculty@university.edu', password: 'Password123!' });
  if (facultyRes.status === 200) {
    facultyToken = facultyRes.body.data.tokens.accessToken;
  }

  // Login as admin
  const adminRes = await request(app)
    .post('/api/v1/auth/sign-in')
    .send({ email: 'admin@university.edu', password: 'AdminSecret123!' });
  if (adminRes.status === 200) {
    adminToken = adminRes.body.data.tokens.accessToken;
  }
});

afterAll(async () => {
  await disconnectDB();
});

describe('ACR System Health & Public Endpoints', () => {
  it('GET /api/v1/health should return 200 healthy', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('GET /api/v1/research/domains should return active research taxonomy', async () => {
    const res = await request(app).get('/api/v1/research/domains');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(10);
  });

  it('GET /api/v1/research/papers should return research papers catalog with metadata', async () => {
    const res = await request(app).get('/api/v1/research/papers');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.papers)).toBe(true);
  });
});

describe('Authentication & Security', () => {
  it('should reject invalid credentials without leaking specific errors', async () => {
    const res = await request(app)
      .post('/api/v1/auth/sign-in')
      .send({ email: 'nonexistent@university.edu', password: 'WrongPassword99!' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should reject unauthenticated access to protected routes', async () => {
    const res = await request(app).get('/api/v1/projects');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should prevent student from accessing Admin endpoints (RBAC check)', async () => {
    const res = await request(app)
      .get('/api/v1/admin/analytics')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('should allow Admin to access Admin analytics', async () => {
    const res = await request(app)
      .get('/api/v1/admin/analytics')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.metrics).toBeDefined();
    expect(res.body.data.metrics.totalStudents).toBeGreaterThanOrEqual(1);
  });
});

describe('Student Research & Recommendation Engine', () => {
  it('GET /api/v1/research/recommendations should return deterministic matched items', async () => {
    const res = await request(app)
      .get('/api/v1/research/recommendations')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.recommendedPapers).toBeDefined();
    expect(res.body.data.algorithmMetadata).toBeDefined();
  });
});

describe('Project Workspace & Academic Life-cycle', () => {
  it('POST /api/v1/projects should allow student to create new project draft', async () => {
    const domains = await request(app).get('/api/v1/research/domains');
    const domainId = domains.body.data[0]._id;

    const res = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Automated Solar Panel Fault Diagnostics via Computer Vision',
        domainId,
        department: 'Computer Science & Engineering',
        problemStatement: 'Dust accumulation and micro-cracks in solar arrays severely lower institutional grid power yield.',
        objectives: ['Deploy drone vision', 'Build classification model'],
        technologies: ['PyTorch', 'React', 'OpenCV'],
        asDraft: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.code).toBeDefined();
    expect(res.body.data.status).toBe('DRAFT');
    sampleProjectId = res.body.data._id;
  });

  it('GET /api/v1/projects/:id should return complete project workspace', async () => {
    const res = await request(app)
      .get(`/api/v1/projects/${sampleProjectId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.project).toBeDefined();
    expect(res.body.data.milestones).toBeDefined();
    expect(res.body.data.userPermissions.isOwner).toBe(true);
  });
});
