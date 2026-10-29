import { projectRepository } from '../repositories/ProjectRepository.js';
import { userRepository } from '../repositories/UserRepository.js';
import { studentProfileRepository } from '../repositories/StudentProfileRepository.js';
import { facultyProfileRepository } from '../repositories/FacultyProfileRepository.js';
import { notificationRepository } from '../repositories/NotificationRepository.js';
import { auditLogRepository } from '../repositories/AuditLogRepository.js';
import { IProject, Project } from '../models/Project.js';
import { ProjectStatus, MilestoneStatus, NotificationType, AuditAction, UserRole, ReviewDecision, GuideRole } from '../config/constants.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../errors/AppError.js';
import mongoose from 'mongoose';

// Valid status transitions map
const VALID_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  [ProjectStatus.DRAFT]: [ProjectStatus.SUBMITTED, ProjectStatus.ARCHIVED],
  [ProjectStatus.SUBMITTED]: [ProjectStatus.UNDER_REVIEW, ProjectStatus.CHANGES_REQUESTED, ProjectStatus.APPROVED, ProjectStatus.REJECTED],
  [ProjectStatus.UNDER_REVIEW]: [ProjectStatus.CHANGES_REQUESTED, ProjectStatus.APPROVED, ProjectStatus.REJECTED],
  [ProjectStatus.CHANGES_REQUESTED]: [ProjectStatus.SUBMITTED, ProjectStatus.UNDER_REVIEW],
  [ProjectStatus.APPROVED]: [ProjectStatus.IN_PROGRESS],
  [ProjectStatus.IN_PROGRESS]: [ProjectStatus.FINAL_REVIEW, ProjectStatus.COMPLETED],
  [ProjectStatus.FINAL_REVIEW]: [ProjectStatus.CHANGES_REQUESTED, ProjectStatus.COMPLETED],
  [ProjectStatus.COMPLETED]: [ProjectStatus.ARCHIVED],
  [ProjectStatus.REJECTED]: [ProjectStatus.DRAFT, ProjectStatus.ARCHIVED],
  [ProjectStatus.ARCHIVED]: [],
};

export class ProjectService {
  async generateProjectCode(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await projectRepository.list({}, 0, 1);
    let nextNum = count.total + 1;
    let code = `PRJ-${year}-${nextNum.toString().padStart(3, '0')}`;
    while (await Project.exists({ code })) {
      nextNum += 1;
      code = `PRJ-${year}-${nextNum.toString().padStart(3, '0')}`;
    }
    return code;
  }

  async createProject(userId: string, data: any): Promise<IProject> {
    let project: any = null;

    if (data.draftId) {
      project = await projectRepository.findById(data.draftId);
      if (!project) {
        throw new NotFoundError('Draft project not found.');
      }
      const isOwner =
        project.ownerId &&
        ((project.ownerId as any)._id?.toString() === userId || project.ownerId.toString() === userId);
      if (!isOwner) {
        throw new ForbiddenError('You can only modify your own project drafts.');
      }
      if (project.status !== ProjectStatus.DRAFT) {
        throw new BadRequestError('This project has already been submitted and is no longer a draft.');
      }

      // Update draft fields
      project.title = data.title.trim();
      if (data.domainId) project.domainId = new mongoose.Types.ObjectId(data.domainId);
      if (data.department) project.department = data.department.trim();
      if (data.problemStatement) project.problemStatement = data.problemStatement.trim();
      if (data.objectives && data.objectives.length > 0) project.objectives = data.objectives;
      if (data.technologies && data.technologies.length > 0) project.technologies = data.technologies;
      if (data.expectedCompletionDate) project.expectedCompletionDate = new Date(data.expectedCompletionDate);
      if (data.repositoryUrl !== undefined) project.repositoryUrl = data.repositoryUrl || '';
      if (data.isPublic !== undefined) project.isPublic = data.isPublic;

      if (!data.asDraft) {
        project.status = ProjectStatus.SUBMITTED;
      }
      await project.save();
    } else {
      const code = await this.generateProjectCode();
      const initialStatus = data.asDraft ? ProjectStatus.DRAFT : ProjectStatus.SUBMITTED;

      project = await projectRepository.create({
        code,
        title: data.title.trim(),
        domainId: data.domainId ? new mongoose.Types.ObjectId(data.domainId) : undefined,
        department: data.department ? data.department.trim() : '',
        problemStatement: data.problemStatement ? data.problemStatement.trim() : '',
        objectives: data.objectives || [],
        technologies: data.technologies || [],
        status: initialStatus,
        progressPercentage: 0,
        ownerId: new mongoose.Types.ObjectId(userId),
        fromProjectIdeaId: data.fromProjectIdeaId ? new mongoose.Types.ObjectId(data.fromProjectIdeaId) : undefined,
        expectedCompletionDate: data.expectedCompletionDate ? new Date(data.expectedCompletionDate) : undefined,
        repositoryUrl: data.repositoryUrl || '',
        isPublic: data.isPublic ?? true,
        startDate: new Date(),
      });

      // Add owner as ProjectMember
      await projectRepository.addMember(project._id, userId, 'OWNER', userId);
    }

    // Resolve team members (both IDs and emails/student IDs)
    const resolvedMemberIds: string[] = [...(data.teamMemberIds || [])];
    if (data.teamMemberEmails) {
      const emailStrings = Array.isArray(data.teamMemberEmails)
        ? data.teamMemberEmails
        : data.teamMemberEmails
            .split(/[,;\n]+/)
            .map((s: string) => s.trim())
            .filter(Boolean);

      for (const str of emailStrings) {
        let u = await userRepository.findByEmail(str.toLowerCase());
        if (!u) {
          const sp = await studentProfileRepository.findByStudentId(str);
          if (sp && sp.userId) {
            u = (sp.userId as any)._id
              ? (sp.userId as any)
              : await userRepository.findById((sp.userId as any).toString());
          }
        }
        if (u && u._id && u._id.toString() !== userId && !resolvedMemberIds.includes(u._id.toString())) {
          resolvedMemberIds.push(u._id.toString());
        }
      }
    }

    for (const memberId of resolvedMemberIds) {
      if (memberId && memberId !== userId) {
        const existing = await projectRepository.findMembership(project._id.toString(), memberId);
        if (!existing) {
          await projectRepository.addMember(project._id, memberId, 'MEMBER', userId);
          await notificationRepository.create({
            recipientId: new mongoose.Types.ObjectId(memberId),
            senderId: new mongoose.Types.ObjectId(userId),
            type: NotificationType.PROJECT_INVITE,
            title: 'Project Team Invitation',
            message: `You have been invited to join the research project: "${project.title}"`,
            linkUrl: `/projects/${project._id}`,
          });
        }
      }
    }

    // Faculty guide requests
    if (data.facultyGuideId) {
      const existingGuide = await projectRepository.findGuide(project._id.toString(), data.facultyGuideId);
      if (!existingGuide) {
        await projectRepository.addGuideRequest(project._id, data.facultyGuideId, GuideRole.PRIMARY_GUIDE);
        await notificationRepository.create({
          recipientId: new mongoose.Types.ObjectId(data.facultyGuideId),
          senderId: new mongoose.Types.ObjectId(userId),
          type: NotificationType.GUIDE_REQUEST,
          title: 'New Faculty Guidance Request',
          message: `Student team requested you as Primary Faculty Guide for project: "${project.title}"`,
          linkUrl: `/projects/${project._id}`,
        });
      }
    }

    if (data.coGuideId && data.coGuideId !== data.facultyGuideId) {
      const existingCoGuide = await projectRepository.findGuide(project._id.toString(), data.coGuideId);
      if (!existingCoGuide) {
        await projectRepository.addGuideRequest(project._id, data.coGuideId, GuideRole.CO_GUIDE);
        await notificationRepository.create({
          recipientId: new mongoose.Types.ObjectId(data.coGuideId),
          senderId: new mongoose.Types.ObjectId(userId),
          type: NotificationType.GUIDE_REQUEST,
          title: 'New Faculty Co-Guide Request',
          message: `Student team requested you as Faculty Co-Guide for project: "${project.title}"`,
          linkUrl: `/projects/${project._id}`,
        });
      }
    }

    // If formally submitted, generate default milestones if none exist
    if (project.status === ProjectStatus.SUBMITTED) {
      const existingMilestones = await projectRepository.getMilestones(project._id.toString());
      if (existingMilestones.length === 0) {
        const defaultMilestones = [
          {
            title: 'Literature Survey & Analysis',
            description: 'Comprehensive review of recent papers, citations, and state-of-the-art benchmarks.',
            orderIndex: 1,
            daysOffset: 14,
            weight: 2,
          },
          {
            title: 'Problem Definition & Architecture Specification',
            description:
              'Formalize problem requirements, input/output specifications, and system architecture design.',
            orderIndex: 2,
            daysOffset: 30,
            weight: 2,
          },
          {
            title: 'Module Prototyping & Core Implementation',
            description:
              'Implementation of primary algorithmic pipelines, core backend services, and interface design.',
            orderIndex: 3,
            daysOffset: 60,
            weight: 3,
          },
          {
            title: 'System Integration & Experimental Validation',
            description:
              'Rigorous testing against empirical benchmark datasets, evaluating precision and metrics.',
            orderIndex: 4,
            daysOffset: 90,
            weight: 2,
          },
          {
            title: 'Final Research Paper & Institutional Presentation',
            description:
              'Drafting project thesis documentation, code repository delivery, and presentation defense.',
            orderIndex: 5,
            daysOffset: 120,
            weight: 3,
          },
        ];

        for (const m of defaultMilestones) {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + m.daysOffset);
          await projectRepository.createMilestone({
            projectId: project._id,
            title: m.title,
            description: m.description,
            orderIndex: m.orderIndex,
            dueDate,
            status: MilestoneStatus.NOT_STARTED,
            assignedMemberIds: [new mongoose.Types.ObjectId(userId)],
            weight: m.weight,
          });
        }
      }
    }

    await auditLogRepository.log({
      userId,
      action: data.draftId ? AuditAction.PROJECT_UPDATED : AuditAction.PROJECT_CREATED,
      resourceType: 'Project',
      resourceId: project._id.toString(),
      details: { title: project.title, code: project.code, status: project.status, asDraft: !!data.asDraft },
    });

    return project;
  }

  async getProjectWorkspace(projectId: string, user: { userId: string; role: UserRole }) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found.');
    }

    // Permission check: if private, only members, guides, or admin can view
    const members = await projectRepository.getMembers(projectId);
    const guides = await projectRepository.getGuides(projectId);

    const isMember = members.some((m) => m.studentId && (m.studentId as any)._id?.toString() === user.userId);
    const isGuide = guides.some((g) => g.facultyId && (g.facultyId as any)._id?.toString() === user.userId);
    const isAdmin = user.role === UserRole.ADMIN;

    if (!project.isPublic && !isMember && !isGuide && !isAdmin) {
      throw new ForbiddenError('You do not have permission to access this private project workspace.');
    }

    const [milestones, documents, comments, reviews, discussions] = await Promise.all([
      projectRepository.getMilestones(projectId),
      projectRepository.getDocuments(projectId),
      projectRepository.getComments(projectId),
      projectRepository.getReviews(projectId),
      projectRepository.getDiscussions(projectId),
    ]);

    return {
      project,
      members,
      guides,
      milestones,
      documents,
      comments,
      reviews,
      discussions,
      userPermissions: {
        isOwner: project.ownerId && (project.ownerId as any)._id?.toString() === user.userId,
        isMember,
        isGuide,
        isAdmin,
        canEdit: (project.ownerId && (project.ownerId as any)._id?.toString() === user.userId) || isAdmin,
        canReview: isGuide || isAdmin,
        canComment: isMember || isGuide || isAdmin,
      },
    };
  }

  async updateProjectStatus(projectId: string, newStatus: ProjectStatus, user: { userId: string; role: UserRole }, reason?: string) {
    const project = await projectRepository.findById(projectId);
    if (!project) throw new NotFoundError('Project not found.');

    const guides = await projectRepository.getGuides(projectId);
    const isGuide = guides.some((g) => g.facultyId && (g.facultyId as any)._id?.toString() === user.userId && g.status === 'ACCEPTED');
    const isOwner = project.ownerId && (project.ownerId as any)._id?.toString() === user.userId;
    const isAdmin = user.role === UserRole.ADMIN;

    // Validate state machine
    const allowedTransitions = VALID_TRANSITIONS[project.status] || [];
    if (!allowedTransitions.includes(newStatus) && !isAdmin) {
      throw new BadRequestError(
        `Invalid status transition from ${project.status} to ${newStatus}. Allowed: [${allowedTransitions.join(', ')}]`
      );
    }

    // Role verification on transitions
    if ([ProjectStatus.APPROVED, ProjectStatus.REJECTED, ProjectStatus.CHANGES_REQUESTED].includes(newStatus)) {
      if (!isGuide && !isAdmin) {
        throw new ForbiddenError('Only assigned Faculty Guides or Administrators can approve/reject/request changes on projects.');
      }
    }

    if (newStatus === ProjectStatus.SUBMITTED && !isOwner && !isAdmin) {
      throw new ForbiddenError('Only the Project Owner can submit the project for review.');
    }

    project.status = newStatus;
    if (newStatus === ProjectStatus.COMPLETED) {
      project.actualCompletionDate = new Date();
    }
    await project.save();

    // Notify team members
    const members = await projectRepository.getMembers(projectId);
    for (const member of members) {
      if (member.studentId) {
        await notificationRepository.create({
          recipientId: (member.studentId as any)._id,
          senderId: new mongoose.Types.ObjectId(user.userId),
          type: NotificationType.STATUS_CHANGED,
          title: `Project Status Updated: ${newStatus}`,
          message: `Your project "${project.title}" is now marked as ${newStatus}.${reason ? ` Reason: ${reason}` : ''}`,
          linkUrl: `/projects/${project._id}`,
        });
      }
    }

    await auditLogRepository.log({
      userId: user.userId,
      action: AuditAction.PROJECT_STATUS_CHANGED,
      resourceType: 'Project',
      resourceId: project._id.toString(),
      details: { from: project.status, to: newStatus, reason },
    });

    return project;
  }

  async respondToGuideRequest(projectId: string, facultyUserId: string, status: 'ACCEPTED' | 'REJECTED', rejectionReason?: string) {
    const guide = await projectRepository.findGuide(projectId, facultyUserId);
    if (!guide) {
      throw new NotFoundError('No guidance request found for this faculty member on this project.');
    }

    guide.status = status as any;
    guide.respondedAt = new Date();
    if (rejectionReason) guide.rejectionReason = rejectionReason;
    await guide.save();

    const project = await projectRepository.findById(projectId);
    if (status === 'ACCEPTED') {
      await facultyProfileRepository.incrementProjectCount(facultyUserId, 1);
    }

    if (project) {
      await notificationRepository.create({
        recipientId: (project.ownerId as any)._id || project.ownerId,
        senderId: new mongoose.Types.ObjectId(facultyUserId),
        type: status === 'ACCEPTED' ? NotificationType.GUIDE_ACCEPTED : NotificationType.GUIDE_REJECTED,
        title: `Faculty Guide ${status === 'ACCEPTED' ? 'Accepted' : 'Declined'}`,
        message: `Faculty mentor has ${status.toLowerCase()} guidance for project "${project.title}".`,
        linkUrl: `/projects/${project._id}`,
      });
    }

    await auditLogRepository.log({
      userId: facultyUserId,
      action: AuditAction.FACULTY_GUIDE_RESPONDED,
      resourceType: 'Project',
      resourceId: projectId,
      details: { status, rejectionReason },
    });

    return guide;
  }

  async addComment(projectId: string, user: { userId: string; role: UserRole }, content: string, milestoneId?: string, documentId?: string, parentCommentId?: string) {
    const comment = await projectRepository.createComment({
      projectId: new mongoose.Types.ObjectId(projectId),
      authorId: new mongoose.Types.ObjectId(user.userId),
      content,
      referencedMilestoneId: milestoneId ? new mongoose.Types.ObjectId(milestoneId) : undefined,
      referencedDocumentId: documentId ? new mongoose.Types.ObjectId(documentId) : undefined,
      parentCommentId: parentCommentId ? new mongoose.Types.ObjectId(parentCommentId) : undefined,
    });

    const project = await projectRepository.findById(projectId);

    // Notify project members and guides (excluding the author)
    const members = await projectRepository.getMembers(projectId);
    const guides = await projectRepository.getGuides(projectId);

    const recipientIds = new Set<string>();
    members.forEach((m) => {
      const id = (m.studentId as any)?._id?.toString() || m.studentId?.toString();
      if (id && id !== user.userId) recipientIds.add(id);
    });
    guides.forEach((g) => {
      const id = (g.facultyId as any)?._id?.toString() || g.facultyId?.toString();
      if (id && id !== user.userId) recipientIds.add(id);
    });

    for (const recipientId of recipientIds) {
      await notificationRepository.create({
        recipientId: new mongoose.Types.ObjectId(recipientId),
        senderId: new mongoose.Types.ObjectId(user.userId),
        type: NotificationType.COMMENT_ADDED,
        title: 'New Feedback Comment',
        message: `New feedback added on project "${project?.title || 'Research Project'}".`,
        linkUrl: `/projects/${projectId}`,
      });
    }

    await auditLogRepository.log({
      userId: user.userId,
      action: AuditAction.COMMENT_ADDED,
      resourceType: 'Project',
      resourceId: projectId,
      details: { commentId: comment._id.toString() },
    });

    return comment;
  }

  async submitReview(projectId: string, user: { userId: string; role: UserRole }, data: any) {
    const project = await projectRepository.findById(projectId);
    if (!project) throw new NotFoundError('Project not found.');

    const guides = await projectRepository.getGuides(projectId);
    const isGuide = guides.some((g) => g.facultyId && (g.facultyId as any)._id?.toString() === user.userId);
    const isAdmin = user.role === UserRole.ADMIN;

    if (!isGuide && !isAdmin) {
      throw new ForbiddenError('Only assigned faculty guides or administrators can submit formal project reviews.');
    }

    let totalScore = 0;
    let maxPossibleScore = 0;

    data.rubricScores.forEach((item: any) => {
      totalScore += item.score;
      maxPossibleScore += item.maxScore;
    });

    const percentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

    const existingReviews = await projectRepository.getReviews(projectId);
    const version = existingReviews.length + 1;

    const review = await projectRepository.createReview({
      projectId: new mongoose.Types.ObjectId(projectId),
      reviewerId: new mongoose.Types.ObjectId(user.userId),
      milestoneId: data.milestoneId ? new mongoose.Types.ObjectId(data.milestoneId) : undefined,
      rubricScores: data.rubricScores,
      totalScore,
      maxPossibleScore,
      percentage,
      comments: data.comments,
      recommendations: data.recommendations || '',
      decision: data.decision,
      version,
    });

    // If decision is APPROVED or CHANGES_REQUESTED, update project status accordingly
    if (data.decision === ReviewDecision.APPROVED) {
      if (project.status === ProjectStatus.SUBMITTED || project.status === ProjectStatus.UNDER_REVIEW) {
        project.status = ProjectStatus.APPROVED;
        await project.save();
      }
    } else if (data.decision === ReviewDecision.CHANGES_REQUESTED) {
      project.status = ProjectStatus.CHANGES_REQUESTED;
      await project.save();
    }

    // Notify student team
    const members = await projectRepository.getMembers(projectId);
    for (const member of members) {
      if (member.studentId) {
        await notificationRepository.create({
          recipientId: (member.studentId as any)._id,
          senderId: new mongoose.Types.ObjectId(user.userId),
          type: NotificationType.REVIEW_SUBMITTED,
          title: `Project Review Evaluated: ${data.decision}`,
          message: `Evaluation completed for "${project.title}" with score ${percentage}%. Decision: ${data.decision}`,
          linkUrl: `/projects/${projectId}`,
        });
      }
    }

    await auditLogRepository.log({
      userId: user.userId,
      action: AuditAction.REVIEW_SUBMITTED,
      resourceType: 'Project',
      resourceId: projectId,
      details: { reviewId: review._id.toString(), score: percentage, decision: data.decision },
    });

    return review;
  }
}

export const projectService = new ProjectService();
