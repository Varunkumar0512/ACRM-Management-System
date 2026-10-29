import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/AdminService.js';
import { researchRepository } from '../repositories/ResearchRepository.js';
import { projectIdeaRepository } from '../repositories/ProjectIdeaRepository.js';
import { UserRole } from '../config/constants.js';

export class AdminController {
  getAnalytics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const analytics = await adminService.getDashboardAnalytics();
      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  };

  listUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { role, search, skip, limit } = req.query;
      const result = await adminService.listUsers(
        role as UserRole,
        search as string,
        Number(skip) || 0,
        Number(limit) || 50
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  toggleUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await adminService.toggleUserActiveStatus(req.params.id, req.user!.userId);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  updateFaculty = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { designation, department } = req.body;
      const updated = await adminService.updateFacultyDesignation(
        req.params.id,
        designation,
        department,
        req.user!.userId
      );

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  updateUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { role } = req.body;
      const user = await adminService.updateUserRole(req.params.id, role, req.user!.userId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  getAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { action, userId, skip, limit } = req.query;
      const result = await adminService.getAuditLogs({
        action: action as string,
        userId: userId as string,
        skip: Number(skip) || 0,
        limit: Number(limit) || 50,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  createDomain = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const domain = await researchRepository.createDomain({
        ...req.body,
        slug,
      });

      res.status(201).json({
        success: true,
        data: domain,
      });
    } catch (error) {
      next(error);
    }
  };

  createTopic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const topic = await researchRepository.createTopic({
        ...req.body,
        slug,
        addedBy: req.user!.userId as any,
      });

      res.status(201).json({
        success: true,
        data: topic,
      });
    } catch (error) {
      next(error);
    }
  };

  createPaper = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paper = await researchRepository.createPaper({
        ...req.body,
        publicationDate: new Date(req.body.publicationDate),
      });

      res.status(201).json({
        success: true,
        data: paper,
      });
    } catch (error) {
      next(error);
    }
  };

  createProjectIdea = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const idea = await projectIdeaRepository.create({
        ...req.body,
        slug,
        isCurated: true,
        addedBy: req.user!.userId as any,
      });

      res.status(201).json({
        success: true,
        data: idea,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const adminController = new AdminController();
