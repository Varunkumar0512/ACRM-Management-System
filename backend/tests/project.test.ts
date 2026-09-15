import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { Project } from '../src/models/Project.js';
import { ProjectMember } from '../src/models/ProjectMember.js';
import { ProjectGuide } from '../src/models/ProjectGuide.js';
import { Milestone } from '../src/models/Milestone.js';
import { ResearchDomain } from '../src/models/ResearchDomain.js';
import { User } from '../src/models/User.js';

const app = createApp();

let studentToken = '';
let facultyToken = '';
let facultyUserId = '';
let testDomainId = '';
let createdDraftId = '';
let createdProjectId = '';

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
    facultyUserId = facultyRes.body.data.user.id;
  }

  // Get a valid domain ID
  const domain = await ResearchDomain.findOne();
  if (domain) {
    testDomainId = domain._id.toString();
  }
});

afterAll(async () => {
  // Clean up test projects created in this test file
  if (createdDraftId) {
    await Project.deleteOne({ _id: createdDraftId }).catch(() => {});
    await ProjectMember.deleteMany({ projectId: createdDraftId }).catch(() => {});
    await ProjectGuide.deleteMany({ projectId: createdDraftId }).catch(() => {});
    await Milestone.deleteMany({ projectId: createdDraftId }).catch(() => {});
  }
  if (createdProjectId) {
    await Project.deleteOne({ _id: createdProjectId }).catch(() => {});
    await ProjectMember.deleteMany({ projectId: createdProjectId }).catch(() => {});
    await ProjectGuide.deleteMany({ projectId: createdProjectId }).catch(() => {});
    await Milestone.deleteMany({ projectId: createdProjectId }).catch(() => {});
  }
  await disconnectDB();
});

describe('Project Proposal Wizard & Submission Lifecycle', () => {
  it('should reject formal submission with transparent field-level error messages if required data is missing', async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'AB', // too short (< 3)
        department: '', // empty
        problemStatement: 'Too short', // < 20 chars
        objectives: [],
        technologies: [],
        asDraft: false,
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.fields).toBeDefined();
    expect(res.body.error.fields.title).toBeDefined();
    expect(res.body.error.fields.department).toBeDefined();
    expect(res.body.error.fields.problemStatement).toBeDefined();
    expect(res.body.error.fields.objectives).toBeDefined();
    expect(res.body.error.fields.technologies).toBeDefined();
  });

  it('should accept empty string for expectedCompletionDate and empty foreign keys without throwing datetime error', async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Draft Project With Empty Fields',
        domainId: testDomainId,
        department: 'Computer Science & Engineering',
        problemStatement: '',
        objectives: [],
        technologies: [],
        expectedCompletionDate: '', // empty string should convert to undefined!
        repositoryUrl: '',
        fromProjectIdeaId: '',
        facultyGuideId: '',
        coGuideId: '',
        teamMemberEmails: '',
        asDraft: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('DRAFT');
    createdDraftId = res.body.data._id;
  });

  it('should allow resuming and updating an existing draft', async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        draftId: createdDraftId,
        title: 'Draft Project Updated Specifications',
        domainId: testDomainId,
        department: 'Electronics & Communication Engineering',
        problemStatement: 'Investigating automated campus research management and institutional project lifecycles.',
        objectives: ['Establish literature baseline', 'Construct functional prototype'],
        technologies: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
        expectedCompletionDate: '2026-12-31', // YYYY-MM-DD should parse cleanly
        asDraft: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(createdDraftId);
    expect(res.body.data.title).toBe('Draft Project Updated Specifications');
    expect(res.body.data.department).toBe('Electronics & Communication Engineering');
    expect(res.body.data.status).toBe('DRAFT');
  });

  it('should submit an updated draft proposal for institutional review with faculty guidance and milestones', async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        draftId: createdDraftId,
        title: 'Automated Campus Research Management Proposal',
        domainId: testDomainId,
        department: 'Electronics & Communication Engineering',
        problemStatement: 'Automated campus research management addressing fragmented departmental documentation and review cycles.',
        objectives: ['Establish literature baseline', 'Construct functional prototype', 'Conduct empirical validation'],
        technologies: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Python'],
        expectedCompletionDate: '2026-12-31',
        facultyGuideId: facultyUserId,
        asDraft: false,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('SUBMITTED');
    expect(res.body.data.code).toBeDefined();

    // Verify in MongoDB that milestones were generated
    const milestones = await Milestone.find({ projectId: createdDraftId });
    expect(milestones.length).toBe(5);

    // Verify faculty guide request was created
    const guide = await ProjectGuide.findOne({ projectId: createdDraftId, facultyId: facultyUserId });
    expect(guide).toBeDefined();
    expect(guide?.role).toBe('PRIMARY_GUIDE');
    expect(guide?.status).toBe('REQUESTED');
  });

  it('should directly create a submitted project and resolve team member emails', async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Autonomous Campus Distributed Computing Platform',
        domainId: testDomainId,
        department: 'Computer Science & Engineering',
        problemStatement: 'Current computational resources across campus laboratories suffer from sub-optimal utilization.',
        objectives: ['Design distributed task broker', 'Develop worker daemon node', 'Evaluate throughput'],
        technologies: ['Go', 'Rust', 'Docker', 'gRPC'],
        expectedCompletionDate: '2027-05-15',
        facultyGuideId: facultyUserId,
        teamMemberEmails: 'student@university.edu', // self is skipped, but valid format
        asDraft: false,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('SUBMITTED');
    createdProjectId = res.body.data._id;

    // Verify owner membership
    const ownerMember = await ProjectMember.findOne({ projectId: createdProjectId, role: 'OWNER' });
    expect(ownerMember).toBeDefined();
    expect(ownerMember?.status).toBe('ACCEPTED');
  });
});
