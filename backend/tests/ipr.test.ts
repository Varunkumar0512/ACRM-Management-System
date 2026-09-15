import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { StudentProfile } from '../src/models/StudentProfile.js';

const app = createApp();

let studentToken = '';
let facultyToken = '';
let adminToken = '';
let testProjectId = '';
let createdScreeningId = '';
const testEmail = `student.test.${Date.now()}@university.edu`;
const testStudentId = `STU-TEST-${Date.now().toString().slice(-6)}`;

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
  }

  // Sign in as admin
  const adminRes = await request(app)
    .post('/api/v1/auth/sign-in')
    .send({ email: 'admin@university.edu', password: 'AdminSecret123!' });
  if (adminRes.status === 200) {
    adminToken = adminRes.body.data.tokens.accessToken;
  }

  // Get or create a project ID for IPR testing
  const projectsRes = await request(app)
    .get('/api/v1/projects')
    .set('Authorization', `Bearer ${studentToken}`);
  if (projectsRes.status === 200 && projectsRes.body.data?.projects?.length > 0) {
    testProjectId = projectsRes.body.data.projects[0]._id;
  }
});

afterAll(async () => {
  // Clean up created test student
  await User.deleteOne({ email: testEmail }).catch(() => {});
  await StudentProfile.deleteOne({ studentId: testStudentId }).catch(() => {});
  await disconnectDB();
});

describe('ACRM Authentication, Argon2id & Registration Fixes', () => {
  it('should successfully register a student with program and Argon2id hash', async () => {
    const res = await request(app)
      .post('/api/v1/auth/sign-up/student')
      .send({
        fullName: 'Test Student Argon2',
        email: testEmail,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        studentId: testStudentId,
        department: 'Computer Science and Engineering',
        program: 'Bachelor of Technology',
        yearOfStudy: 3,
        phone: '+91 9876543210',
        researchInterests: ['Distributed Systems', 'Privacy'],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);

    // Verify in database that hash uses Argon2id ($argon2id$)
    const user = await User.findOne({ email: testEmail });
    expect(user).toBeDefined();
    expect(user?.passwordHash.startsWith('$argon2id$')).toBe(true);
  });

  it('should reject duplicate email or studentId with safe generic message', async () => {
    const res = await request(app)
      .post('/api/v1/auth/sign-up/student')
      .send({
        fullName: 'Duplicate Student',
        email: testEmail,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        studentId: testStudentId,
        department: 'Computer Science and Engineering',
        program: 'Bachelor of Technology',
        yearOfStudy: 3,
      });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe(
      'Unable to create the account. Please check your details or sign in if you already have an account.'
    );
  });
});

describe('ACRM IPR & AI Novelty Screening Workflows', () => {
  it('should run preliminary novelty screening with database transparency and legal disclaimer', async () => {
    const res = await request(app)
      .post('/api/v1/ipr/novelty/screen')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        projectId: testProjectId,
        innovationTitle: 'Decentralized Zero-Knowledge Identity Verification',
        problem: 'Campus credentials currently rely on centralized databases vulnerable to single point of failure.',
        proposedSolution: 'A peer-to-peer zk-SNARK protocol verifying university certificates on-device without plaintext exposure.',
        keyTechnicalFeatures: [
          'Groth16 proving system running in browser WASM',
          'Selective disclosure of graduation year without revealing student ID',
          'Revocation registry utilizing sparse Merkle trees',
        ],
        differentiation: 'Unlike existing campus cards, credentials are cryptographic and verifiable offline.',
        technologiesUsed: ['WASM', 'Circom', 'Ethereum', 'TypeScript'],
        targetApplication: 'Campus digital ID, exam hall admission, inter-library resource sharing',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.assessment).toBeDefined();
    expect(res.body.data.confidence).toBeDefined();
    expect(res.body.data.sourcesConsulted).toBeDefined();
    expect(res.body.data.sourcesConsulted.externalConnected).toBe(false);
    expect(res.body.data.sourcesConsulted.message).toContain(
      'External prior-art search is not currently connected'
    );

    createdScreeningId = res.body.data._id;
  });

  it('should reject IPR disclosure submission if novelty screening is not acknowledged', async () => {
    const res = await request(app)
      .post('/api/v1/ipr/disclosures')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        screeningId: createdScreeningId,
        title: 'Decentralized Zero-Knowledge Identity Verification',
        category: 'PATENT',
        projectId: testProjectId,
        confidentiality: 'INSTITUTION_ONLY',
        summary: 'A privacy-preserving cryptographic identity protocol for academic institutions.',
        coInventors: [],
        acknowledgementAccepted: true,
      });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('acknowledge the preliminary novelty screening');
  });

  it('should allow student to acknowledge preliminary screening with disclaimer', async () => {
    const res = await request(app)
      .post(`/api/v1/ipr/novelty/${createdScreeningId}/acknowledge`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ acknowledged: true });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.studentAcknowledged).toBe(true);
  });

  it('should successfully submit IPR disclosure once screening is acknowledged', async () => {
    const res = await request(app)
      .post('/api/v1/ipr/disclosures')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        screeningId: createdScreeningId,
        title: 'Decentralized Zero-Knowledge Identity Verification',
        category: 'PATENT',
        projectId: testProjectId,
        confidentiality: 'INSTITUTION_ONLY',
        summary: 'A privacy-preserving cryptographic identity protocol for academic institutions.',
        commercialPotential: 'Commercial software license for educational institutions and ed-tech companies.',
        stageOfDevelopment: 'Functional Prototype',
        coInventors: [
          {
            name: 'Dr. Jane Mentor',
            email: 'faculty@university.edu',
            department: 'Computer Science',
            sharePercentage: 30,
          },
        ],
        acknowledgementAccepted: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.iprNumber).toBeDefined();
    expect(res.body.data.status).toBe('SUBMITTED');
  });

  it('should retrieve institutional disclosures with filters', async () => {
    const res = await request(app)
      .get('/api/v1/ipr/disclosures?category=PATENT')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.disclosures)).toBe(true);
  });
});
