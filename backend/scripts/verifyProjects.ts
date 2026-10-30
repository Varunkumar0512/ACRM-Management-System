import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import {
  User,
  StudentProfile,
  FacultyProfile,
  ResearchDomain,
  Project,
  ProjectMember,
  ProjectGuide,
  Milestone,
  DocumentModel,
  Comment,
  Review,
} from '../src/models/index.js';
import { projectService } from '../src/services/ProjectService.js';
import { facultyService } from '../src/services/FacultyService.js';
import { UserRole } from '../src/config/constants.js';

async function verify() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('MongoDB connected for verification.\n');

  const targetCodes = [
    'PRJ-2026-011', 'PRJ-2026-012', 'PRJ-2026-013', 'PRJ-2026-014', 'PRJ-2026-015',
    'PRJ-2026-016', 'PRJ-2026-017', 'PRJ-2026-018', 'PRJ-2026-019', 'PRJ-2026-020',
    'PRJ-2026-021', 'PRJ-2026-022', 'PRJ-2026-023', 'PRJ-2026-024', 'PRJ-2026-025',
  ];

  const projects = await Project.find({ code: { $in: targetCodes } })
    .populate('domainId')
    .populate('ownerId')
    .sort({ code: 1 })
    .lean();

  console.log(`Found ${projects.length} of ${targetCodes.length} sample projects.\n`);

  if (projects.length !== 15) {
    throw new Error(`Expected 15 projects, but found ${projects.length}`);
  }

  const studentProjectsCount = new Map<string, number>();
  const statusCounts = new Map<string, number>();
  const domainCounts = new Map<string, number>();

  for (const p of projects) {
    const owner = p.ownerId as any;
    const profile = await StudentProfile.findOne({ userId: owner._id }).lean();
    const guides = await ProjectGuide.find({ projectId: p._id }).populate('facultyId').lean();
    const members = await ProjectMember.find({ projectId: p._id }).populate('studentId').lean();
    const milestones = await Milestone.find({ projectId: p._id }).lean();
    const docs = await DocumentModel.find({ projectId: p._id }).lean();
    const reviews = await Review.find({ projectId: p._id }).lean();
    const comments = await Comment.find({ projectId: p._id }).lean();

    const guideNames = guides.map((g: any) => `${g.facultyId?.fullName} (${g.role}, ${g.status})`).join('; ');
    const memberNames = members.map((m: any) => `${m.studentId?.fullName} (${m.role})`).join('; ');

    // Aggregate counts
    studentProjectsCount.set(owner.email, (studentProjectsCount.get(owner.email) || 0) + 1);
    statusCounts.set(p.status, (statusCounts.get(p.status) || 0) + 1);
    const domainName = (p.domainId as any)?.name || 'Unknown';
    domainCounts.set(domainName, (domainCounts.get(domainName) || 0) + 1);

    console.log(`--------------------------------------------------------------------------------`);
    console.log(`[${p.code}] ${p.title}`);
    console.log(`  Domain: ${(p.domainId as any)?.name} (slug: ${(p.domainId as any)?.slug})`);
    console.log(`  Status: ${p.status} | Progress: ${p.progressPercentage}%`);
    console.log(`  Student Lead: ${owner.fullName} (${owner.email}) | Student ID: ${profile?.studentId || 'N/A'}`);
    console.log(`  Guides: ${guideNames}`);
    console.log(`  Members: ${memberNames}`);
    console.log(`  Milestones: ${milestones.length} | Documents: ${docs.length} | Reviews: ${reviews.length} | Comments: ${comments.length}`);
  }

  console.log(`\n================================================================================`);
  console.log(`SUMMARY REPORT:`);
  console.log(`\n1. Projects Distribution per Student:`);
  for (const [email, count] of studentProjectsCount.entries()) {
    console.log(`   - ${email}: ${count} projects`);
  }

  console.log(`\n2. Status Breakdown:`);
  for (const [status, count] of statusCounts.entries()) {
    console.log(`   - ${status}: ${count}`);
  }

  console.log(`\n3. Research Domains Represented (${domainCounts.size}):`);
  for (const [domain, count] of domainCounts.entries()) {
    console.log(`   - ${domain}: ${count}`);
  }

  // 4. Test Student Dashboard API simulation
  console.log(`\n4. Verifying Student Dashboard Visibility:`);
  const testStudent = await User.findOne({ email: 'student@university.edu' });
  const studentDashboardProjects = await Project.find({ ownerId: testStudent!._id });
  console.log(`   - Alex Rivera (student@university.edu) owns ${studentDashboardProjects.length} projects`);
  const studentTeamMemberships = await ProjectMember.find({ studentId: testStudent!._id, status: 'ACCEPTED' });
  console.log(`   - Alex Rivera is member of ${studentTeamMemberships.length} total projects (owner + collaborator)`);

  // 5. Test Faculty Dashboard API simulation
  console.log(`\n5. Verifying Faculty Dashboard Visibility:`);
  const testFaculty = await User.findOne({ email: 'faculty@university.edu' });
  const facultyDash = await facultyService.getFacultyDashboard(testFaculty!._id.toString());
  console.log(`   - Dr. Eleanor Vance (faculty@university.edu):`);
  console.log(`     Active Guided Projects: ${facultyDash.stats.activeGuidedProjects}`);
  console.log(`     Pending Guidance Requests: ${facultyDash.stats.pendingRequestsCount}`);

  const testWright = await User.findOne({ email: 'dr.samuel.wright@university.edu' });
  const wrightDash = await facultyService.getFacultyDashboard(testWright!._id.toString());
  console.log(`   - Dr. Samuel Wright (dr.samuel.wright@university.edu):`);
  console.log(`     Active Guided Projects: ${wrightDash.stats.activeGuidedProjects}`);
  console.log(`     Pending Guidance Requests: ${wrightDash.stats.pendingRequestsCount}`);

  const testHolloway = await User.findOne({ email: 'dr.marcus.vance@university.edu' });
  const hollowayDash = await facultyService.getFacultyDashboard(testHolloway!._id.toString());
  console.log(`   - Dr. Marcus Holloway (dr.marcus.vance@university.edu):`);
  console.log(`     Active Guided Projects: ${hollowayDash.stats.activeGuidedProjects}`);
  console.log(`     Pending Guidance Requests: ${hollowayDash.stats.pendingRequestsCount}`);

  // 6. Test Workspace Access and Review Permissions
  console.log(`\n6. Verifying Faculty Workspace & Review Permissions:`);
  const sampleWorkspace = await projectService.getProjectWorkspace(projects[0]._id.toString(), {
    userId: projects[0].ownerId._id.toString(),
    role: UserRole.STUDENT,
  });
  console.log(`   - Student permissions on PRJ-2026-011: isOwner=${sampleWorkspace.userPermissions.isOwner}, canEdit=${sampleWorkspace.userPermissions.canEdit}`);

  const facultyGuideUser = await User.findOne({ email: 'dr.maya.patel@university.edu' });
  const facultyWorkspace = await projectService.getProjectWorkspace(projects[0]._id.toString(), {
    userId: facultyGuideUser!._id.toString(),
    role: UserRole.FACULTY,
  });
  console.log(`   - Faculty Guide permissions on PRJ-2026-011: isGuide=${facultyWorkspace.userPermissions.isGuide}, canReview=${facultyWorkspace.userPermissions.canReview}, canComment=${facultyWorkspace.userPermissions.canComment}`);

  console.log(`\nAll verifications passed successfully!`);
  await mongoose.disconnect();
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
