import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { Project } from '../src/models/Project.js';
import { ProjectGuide } from '../src/models/ProjectGuide.js';
import { ProjectMember } from '../src/models/ProjectMember.js';
import { Milestone } from '../src/models/Milestone.js';
import { Notification } from '../src/models/Notification.js';
import { ResearchDomain } from '../src/models/ResearchDomain.js';

const app = createApp();

let studentToken = '';
let facultyToken = '';
let facultyUserId = '';
let coGuideUserId = '';
let testDomainId = '';
let testProjectId = '';

beforeAll(async () => {
  await connectDB();

  // Sign in as student
  const studentRes = await request(app)
    .post('/api/v1/auth/sign-in')
    .send({ email: 'student@university.edu', password: 'Password123!' });
  if (studentRes.status === 200) {
    studentToken = studentRes.body.data.tokens.accessToken;
  }

  // Sign in as faculty
  const facultyRes = await request(app)
    .post('/api/v1/auth/sign-in')
    .send({ email: 'faculty@university.edu', password: 'Password123!' });
  if (facultyRes.status === 200) {
    facultyToken = facultyRes.body.data.tokens.accessToken;
    facultyUserId = facultyRes.body.data.user.id;
  }

  // Find domain ID
  const domain = await ResearchDomain.findOne();
  if (domain) {
    testDomainId = domain._id.toString();
  }
});

afterAll(async () => {
  if (testProjectId) {
    await Project.deleteOne({ _id: testProjectId }).catch(() => {});
    await ProjectGuide.deleteMany({ projectId: testProjectId }).catch(() => {});
    await ProjectMember.deleteMany({ projectId: testProjectId }).catch(() => {});
    await Milestone.deleteMany({ projectId: testProjectId }).catch(() => {});
  }
  await disconnectDB();
});

describe('Faculty Directory & Mentorship API', () => {
  it('GET /api/v1/faculty should be accessible without strict authentication', async () => {
    const res = await request(app).get('/api/v1/faculty');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data.profiles)).toBe(true);
    expect(res.body.data.profiles.length).toBeGreaterThanOrEqual(4);

    // Verify populated userId fields
    const firstProfile = res.body.data.profiles[0];
    expect(firstProfile.userId).toBeDefined();
    expect(firstProfile.userId._id).toBeDefined();
    expect(firstProfile.userId.fullName).toBeDefined();
    expect(firstProfile.userId.isActive).toBe(true);
  });

  it('GET /api/v1/faculty?availableOnly=true should return available faculty mentors', async () => {
    const res = await request(app)
      .get('/api/v1/faculty?availableOnly=true')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.profiles)).toBe(true);
    for (const p of res.body.data.profiles) {
      expect(p.isAvailableForGuidance).toBe(true);
    }

    // Pick a second faculty member for co-guide tests
    const otherFaculty = res.body.data.profiles.find((p: any) => p.userId?._id !== facultyUserId);
    if (otherFaculty) {
      coGuideUserId = otherFaculty.userId?._id || otherFaculty._id;
    }
  });

  it('GET /api/v1/faculty?department=... should filter by academic department', async () => {
    const dept = 'Cybersecurity & Information Security';
    const res = await request(app)
      .get(`/api/v1/faculty?department=${encodeURIComponent(dept)}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.profiles.length).toBeGreaterThanOrEqual(1);
    for (const p of res.body.data.profiles) {
      expect(p.department).toBe(dept);
    }
  });

  it('GET /api/v1/faculty/dashboard should enforce RBAC (401 without auth, 403 for student, 200 for faculty)', async () => {
    // 1. Without auth
    const noAuthRes = await request(app).get('/api/v1/faculty/dashboard');
    expect(noAuthRes.status).toBe(401);

    // 2. With student token
    const studentRes = await request(app)
      .get('/api/v1/faculty/dashboard')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(studentRes.status).toBe(403);

    // 3. With faculty token
    const facultyDashboardRes = await request(app)
      .get('/api/v1/faculty/dashboard')
      .set('Authorization', `Bearer ${facultyToken}`);
    expect(facultyDashboardRes.status).toBe(200);
    expect(facultyDashboardRes.body.success).toBe(true);
    expect(facultyDashboardRes.body.data.stats).toBeDefined();
    expect(facultyDashboardRes.body.data.stats.capacityLimit).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/v1/projects should record Primary Guide and Co-Guide with notifications', async () => {
    expect(facultyUserId).toBeDefined();
    expect(testDomainId).toBeDefined();

    const payload = {
      title: 'Automated Microgrid Frequency Stabilization via Edge RL',
      department: 'Computer Science & Engineering',
      domainId: testDomainId,
      problemStatement: 'Frequency volatility under transient renewable loads demands microsecond edge decisions.',
      objectives: ['Train edge actor-critic network', 'Validate on campus distribution bus'],
      technologies: ['PyTorch', 'Rust', 'MQTT'],
      facultyGuideId: facultyUserId,
      coGuideId: coGuideUserId || undefined,
      asDraft: false,
    };

    const res = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${studentToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    testProjectId = res.body.data._id;

    // Verify guides recorded
    const guides = await ProjectGuide.find({ projectId: testProjectId });
    expect(guides.length).toBeGreaterThanOrEqual(1);

    const primaryGuide = guides.find((g) => g.role === 'PRIMARY_GUIDE');
    expect(primaryGuide).toBeDefined();
    expect(primaryGuide?.facultyId.toString()).toBe(facultyUserId);
    expect(primaryGuide?.status).toBe('REQUESTED');

    if (coGuideUserId) {
      const coGuide = guides.find((g) => g.role === 'CO_GUIDE');
      expect(coGuide).toBeDefined();
      expect(coGuide?.facultyId.toString()).toBe(coGuideUserId);
    }

    // Verify notification was generated for primary faculty member
    const notif = await Notification.findOne({
      recipientId: facultyUserId,
      type: 'GUIDE_REQUEST',
    });
    expect(notif).toBeDefined();
  });
});
