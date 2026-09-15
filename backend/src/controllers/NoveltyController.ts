import { Request, Response, NextFunction } from 'express';
import { noveltyService } from '../services/NoveltyService.js';

export class NoveltyController {
  runScreening = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await noveltyService.runPreliminaryScreening(req.user!.userId, req.body);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  processChatMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await noveltyService.processAssistantMessage(req.user!.userId, req.body);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  acknowledgeScreening = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await noveltyService.acknowledgeScreening(req.params.id, req.user!.userId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getProjectScreenings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await noveltyService.getProjectScreenings(req.params.projectId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getScreeningById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await noveltyService.getScreeningById(req.params.id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const noveltyController = new NoveltyController();
