import { userRepository } from '../repositories/UserRepository.js';
import { studentProfileRepository } from '../repositories/StudentProfileRepository.js';
import { facultyProfileRepository } from '../repositories/FacultyProfileRepository.js';
import { projectRepository } from '../repositories/ProjectRepository.js';
import { researchRepository } from '../repositories/ResearchRepository.js';
import { supportTicketRepository } from '../repositories/SupportTicketRepository.js';
import { auditLogRepository } from '../repositories/AuditLogRepository.js';
import { UserRole, AuditAction } from '../config/constants.js';
import { NotFoundError, BadRequestError } from '../errors/AppError.js';
import { Project } from '../models/Project.js';
import { ResearchPaper } from '../models/ResearchPaper.js';

export class AdminService {
  async getDashboardAnalytics() {
    const [
      studentsCount,
      facultyCount,
      projectsCount,
      papersCount,
      projectsByStatus,
      ticketsByStatus,
      recentAuditLogs,
    ] = await Promise.all([
      userRepository.countByRole(UserRole.STUDENT),
      userRepository.countByRole(UserRole.FACULTY),
      Project.countDocuments(),
      ResearchPaper.countDocuments(),
      projectRepository.countByStatus(),
      supportTicketRepository.countByStatus(),
      auditLogRepository.list({}, 0, 8),
    ]);

    // Aggregate domain distribution from actual projects in DB
    const domainAggregation = await Project.aggregate([
      { $group: { _id: '$domainId', count: { $sum: 1 } } },
      { $lookup: { from: 'researchdomains', localField: '_id', foreignField: '_id', as: 'domain' } },
      { $unwind: '$domain' },
      { $project: { domainName: '$domain.name', count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    return {
      metrics: {
        totalStudents: studentsCount,
        totalFaculty: facultyCount,
        totalProjects: projectsCount,
        totalResearchPapers: papersCount,
      },
      projectsByStatus,
      ticketsByStatus,
      domainDistribution: domainAggregation,
      recentAuditLogs: recentAuditLogs.logs,
    };
  }

  async listUsers(role?: UserRole, search?: string, skip = 0, limit = 50) {
    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const { users, total } = await userRepository.list(filter, skip, limit);

    // Attach profile details
    const usersWithProfiles = await Promise.all(
      users.map(async (u) => {
        let profile = null;
        if (u.role === UserRole.STUDENT) {
          profile = await studentProfileRepository.findByUserId(u._id);
        } else if (u.role === UserRole.FACULTY) {
          profile = await facultyProfileRepository.findByUserId(u._id);
        }
        return {
          user: u,
          profile,
        };
      })
    );

    return { users: usersWithProfiles, total };
  }

  async toggleUserActiveStatus(userId: string, adminUserId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found.');

    if (user._id.toString() === adminUserId) {
      throw new BadRequestError('Administrators cannot deactivate their own account.');
    }

    user.isActive = !user.isActive;
    await user.save();

    await auditLogRepository.log({
      userId: adminUserId,
      action: AuditAction.USER_STATUS_CHANGED,
      resourceType: 'User',
      resourceId: user._id.toString(),
      details: { email: user.email, newStatus: user.isActive ? 'ACTIVE' : 'DEACTIVATED' },
    });

    return user;
  }

  async updateFacultyDesignation(facultyUserId: string, designation: any, department: string, adminUserId: string) {
    const updated = await facultyProfileRepository.updateByUserId(facultyUserId, { designation, department });
    if (!updated) throw new NotFoundError('Faculty profile not found.');

    await auditLogRepository.log({
      userId: adminUserId,
      action: AuditAction.USER_STATUS_CHANGED,
      resourceType: 'FacultyProfile',
      resourceId: facultyUserId,
      details: { designation, department },
    });

    return updated;
  }

  async updateUserRole(targetUserId: string, newRoleInput: string, adminUserId: string) {
    const user = await userRepository.findById(targetUserId);
    if (!user) throw new NotFoundError('User not found.');

    const normalizedRole = (newRoleInput || '').toUpperCase() as UserRole;
    if (!Object.values(UserRole).includes(normalizedRole)) {
      throw new BadRequestError(`Invalid role: ${newRoleInput}. Allowed roles: [STUDENT, FACULTY, ADMIN]`);
    }

    if (user._id.toString() === adminUserId && normalizedRole !== UserRole.ADMIN) {
      throw new BadRequestError('Administrators cannot demote their own account role.');
    }

    const previousRole = user.role;
    user.role = normalizedRole;
    await user.save();

    // Ensure corresponding profile exists
    if (normalizedRole === UserRole.FACULTY) {
      const existingProfile = await facultyProfileRepository.findByUserId(user._id);
      if (!existingProfile) {
        await facultyProfileRepository.create({
          userId: user._id,
          employeeId: `FAC-${Date.now().toString().slice(-6)}`,
          designation: 'Associate Professor' as any,
          department: 'Computer Science & Engineering',
          experienceYears: 5,
          areasOfExpertise: ['Academic Research'],
          currentResearchSummary: 'Institutional faculty research supervision',
          maxActiveProjectsGuide: 6,
          currentActiveProjectsCount: 0,
          isAvailableForGuidance: true,
        });
      }
    } else if (normalizedRole === UserRole.STUDENT) {
      const existingProfile = await studentProfileRepository.findByUserId(user._id);
      if (!existingProfile) {
        await studentProfileRepository.create({
          userId: user._id,
          studentId: `STU-${Date.now().toString().slice(-6)}`,
          department: 'Computer Science & Engineering',
          program: 'Undergraduate Research Program',
          yearOfStudy: 1,
          researchInterests: [],
        });
      }
    }

    await auditLogRepository.log({
      userId: adminUserId,
      action: AuditAction.USER_ROLE_ASSIGNED,
      resourceType: 'User',
      resourceId: user._id.toString(),
      details: { email: user.email, previousRole, newRole: normalizedRole },
    });

    return user;
  }

  async getAuditLogs(query: { action?: string; userId?: string; skip?: number; limit?: number }) {
    const filter: Record<string, unknown> = {};
    if (query.action) filter.action = query.action;
    if (query.userId) filter.userId = query.userId;
    return auditLogRepository.list(filter, query.skip || 0, query.limit || 50);
  }
}

export const adminService = new AdminService();
