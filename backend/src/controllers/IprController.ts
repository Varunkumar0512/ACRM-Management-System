import { Request, Response, NextFunction } from 'express';
import { iprService } from '../services/IprService.js';
import { UserRole } from '../config/constants.js';

export class IprController {
  submitDisclosure = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await iprService.submitDisclosure(req.user!.userId, req.body, req.user!.role as UserRole);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  listDisclosures = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { category, status, projectId, mineOnly, skip, limit } = req.query;
      const result = await iprService.listDisclosures(
        req.user!.userId,
        req.user!.role as UserRole,
        {
          category: category as string,
          status: status as string,
          projectId: projectId as string,
          mineOnly: mineOnly === 'true',
        },
        skip ? Number(skip) : 0,
        limit ? Number(limit) : 50
      );
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getDisclosureById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await iprService.getDisclosureById(req.params.id, req.user!.userId, req.user!.role as UserRole);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, notes } = req.body;
      const result = await iprService.updateStatus(req.params.id, status, req.user!.userId, req.user!.role as UserRole, notes);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  addComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await iprService.addComment(req.params.id, req.user!.userId, req.user!.role as UserRole, req.body);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  resolveComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await iprService.resolveComment(req.params.commentId, req.user!.userId, req.user!.role as UserRole);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  addDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await iprService.addDocument(req.params.id, req.user!.userId, req.user!.role as UserRole, req.body);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  recordApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await iprService.recordApplication(req.params.id, req.body, req.user!.userId, req.user!.role as UserRole);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const iprController = new IprController();
