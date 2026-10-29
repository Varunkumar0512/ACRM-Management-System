import { Request, Response, NextFunction } from 'express';
import { projectService } from '../services/ProjectService.js';
import { projectRepository } from '../repositories/ProjectRepository.js';
import { ProjectMember } from '../models/ProjectMember.js';
import { ProjectGuide } from '../models/ProjectGuide.js';
import { UserRole, ProjectStatus } from '../config/constants.js';
import { ForbiddenError, NotFoundError } from '../errors/AppError.js';
import { verifyProjectAccess } from '../utils/projectAuth.js';
import mongoose from 'mongoose';

export class ProjectController {
  createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const project = await projectService.createProject(req.user!.userId, req.body);
      res.status(201).json({
        success: true,
        data: project,
      });
    } catch (error) {
      next(error);
    }
  };

  listProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { filterType, status, domainId, search, skip, limit } = req.query;
      const query: Record<string, unknown> = {};

      if (status) query.status = status;
      if (domainId) query.domainId = domainId;
      if (search) {
        query.$text = { $search: search as string };
      }

      const user = req.user!;
      if (filterType === 'my') {
        // Projects where user is owner
        query.ownerId = user.userId;
      } else if (filterType === 'team') {
        // Projects where user is a team member
        const memberships = await ProjectMember.find({ studentId: user.userId, status: 'ACCEPTED' });
        const projectIds = memberships.map((m) => m.projectId);
        query._id = { $in: projectIds };
      } else if (filterType === 'guided') {
        // Projects where user is a faculty guide
        const guides = await ProjectGuide.find({ facultyId: user.userId, status: 'ACCEPTED' });
        const projectIds = guides.map((g) => g.projectId);
        query._id = { $in: projectIds };
      } else if (user.role !== UserRole.ADMIN) {
        // Enforce confidential project privacy: non-admins only see public or their own/team/guided projects
        const [memberships, guides] = await Promise.all([
          ProjectMember.find({ studentId: user.userId, status: 'ACCEPTED' }),
          ProjectGuide.find({ facultyId: user.userId, status: 'ACCEPTED' }),
        ]);
        const userProjectIds = [
          ...memberships.map((m) => m.projectId),
          ...guides.map((g) => g.projectId),
        ];
        query.$or = [{ isPublic: true }, { ownerId: user.userId }, { _id: { $in: userProjectIds } }];
      }

      const result = await projectRepository.list(query, Number(skip) || 0, Number(limit) || 20);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getProjectWorkspace = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspace = await projectService.getProjectWorkspace(req.params.id, {
        userId: req.user!.userId,
        role: req.user!.role,
      });

      res.status(200).json({
        success: true,
        data: workspace,
      });
    } catch (error) {
      next(error);
    }
  };

  updateProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const project = await projectRepository.findById(req.params.id);
      if (!project) throw new NotFoundError('Project not found.');

      const isOwner = project.ownerId && (project.ownerId as any)._id?.toString() === req.user!.userId;
      const isAdmin = req.user!.role === UserRole.ADMIN;
      if (!isOwner && !isAdmin) {
        throw new ForbiddenError('Only the project owner or administrator can modify project specifications.');
      }

      const updated = await projectRepository.update(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = await projectService.updateProjectStatus(
        req.params.id,
        req.body.status,
        { userId: req.user!.userId, role: req.user!.role },
        req.body.reason
      );

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  addMilestone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await verifyProjectAccess(req.params.id, req.user!.userId, req.user!.role, true);

      const milestone = await projectRepository.createMilestone({
        projectId: new mongoose.Types.ObjectId(req.params.id),
        title: req.body.title,
        description: req.body.description,
        orderIndex: req.body.orderIndex,
        dueDate: new Date(req.body.dueDate),
        assignedMemberIds: (req.body.assignedMemberIds || []).map((id: string) => new mongoose.Types.ObjectId(id)),
        weight: req.body.weight || 1,
      });

      await projectRepository.calculateProjectProgress(req.params.id);

      res.status(201).json({
        success: true,
        data: milestone,
      });
    } catch (error) {
      next(error);
    }
  };

  updateMilestone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const existing = await projectRepository.findMilestoneById(req.params.milestoneId);
      if (!existing) throw new NotFoundError('Milestone not found.');
      await verifyProjectAccess(existing.projectId.toString(), req.user!.userId, req.user!.role, true);

      const updates: any = { ...req.body };
      if (updates.dueDate) updates.dueDate = new Date(updates.dueDate);
      if (updates.status === 'COMPLETED') updates.completionDate = new Date();

      const milestone = await projectRepository.updateMilestone(req.params.milestoneId, updates);
      if (!milestone) throw new NotFoundError('Milestone not found.');

      const progress = await projectRepository.calculateProjectProgress(milestone.projectId.toString());

      res.status(200).json({
        success: true,
        data: { milestone, progress },
      });
    } catch (error) {
      next(error);
    }
  };

  deleteMilestone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const existing = await projectRepository.findMilestoneById(req.params.milestoneId);
      if (!existing) throw new NotFoundError('Milestone not found.');
      const access = await verifyProjectAccess(existing.projectId.toString(), req.user!.userId, req.user!.role, true);
      if (!access.isOwner && !access.isGuide && !access.isAdmin) {
        throw new ForbiddenError('Only project owners, faculty guides, or administrators can remove milestones.');
      }

      await projectRepository.deleteMilestone(req.params.milestoneId);
      await projectRepository.calculateProjectProgress(req.params.id);

      res.status(200).json({
        success: true,
        data: { message: 'Milestone deleted successfully.' },
      });
    } catch (error) {
      next(error);
    }
  };

  addComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await verifyProjectAccess(req.params.id, req.user!.userId, req.user!.role, false);

      const comment = await projectService.addComment(
        req.params.id,
        { userId: req.user!.userId, role: req.user!.role },
        req.body.content,
        req.body.referencedMilestoneId,
        req.body.referencedDocumentId,
        req.body.parentCommentId
      );

      res.status(201).json({
        success: true,
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  };

  resolveComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const comment = await projectRepository.findCommentById(req.params.commentId);
      if (!comment) throw new NotFoundError('Comment not found.');
      const access = await verifyProjectAccess(comment.projectId.toString(), req.user!.userId, req.user!.role, false);
      const isAuthor =
        (comment.authorId as any)?._id?.toString() === req.user!.userId ||
        comment.authorId?.toString() === req.user!.userId;
      if (!isAuthor && !access.isOwner && !access.isGuide && !access.isAdmin) {
        throw new ForbiddenError(
          'Only the comment author, project owner, faculty guide, or administrator can resolve comments.'
        );
      }

      const updated = await projectRepository.updateComment(req.params.commentId, {
        status: req.body.status || 'RESOLVED',
        resolvedBy: new mongoose.Types.ObjectId(req.user!.userId),
        resolvedAt: new Date(),
      });

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  submitReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const review = await projectService.submitReview(
        req.params.id,
        { userId: req.user!.userId, role: req.user!.role },
        req.body
      );

      res.status(201).json({
        success: true,
        data: review,
      });
    } catch (error) {
      next(error);
    }
  };

  respondToGuideRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const guide = await projectService.respondToGuideRequest(
        req.params.id,
        req.user!.userId,
        req.body.status,
        req.body.rejectionReason
      );

      res.status(200).json({
        success: true,
        data: guide,
      });
    } catch (error) {
      next(error);
    }
  };

  addDocumentMetadata = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await verifyProjectAccess(req.params.id, req.user!.userId, req.user!.role, true);

      const doc = await projectRepository.createDocument({
        projectId: new mongoose.Types.ObjectId(req.params.id),
        milestoneId: req.body.milestoneId ? new mongoose.Types.ObjectId(req.body.milestoneId) : undefined,
        filename: req.body.filename || 'research_deliverable.pdf',
        originalName: req.body.originalName || 'Project Report.pdf',
        type: req.body.type,
        fileSize: req.body.fileSize || 1024 * 512,
        mimeType: req.body.mimeType || 'application/pdf',
        storagePath: req.body.storagePath || '/uploads/documents/deliverable.pdf',
        version: req.body.version || 1,
        uploadedBy: new mongoose.Types.ObjectId(req.user!.userId),
        description: req.body.description || '',
      });

      res.status(201).json({
        success: true,
        data: doc,
      });
    } catch (error) {
      next(error);
    }
  };

  sendDiscussion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await verifyProjectAccess(req.params.id, req.user!.userId, req.user!.role, true);

      const msg = await projectRepository.createDiscussionMessage({
        projectId: new mongoose.Types.ObjectId(req.params.id),
        senderId: new mongoose.Types.ObjectId(req.user!.userId),
        message: req.body.message,
        attachments: req.body.attachments || [],
      });

      res.status(201).json({
        success: true,
        data: msg,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const projectController = new ProjectController();
