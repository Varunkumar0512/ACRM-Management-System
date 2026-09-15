import { Request, Response, NextFunction } from 'express';
import { researchService } from '../services/ResearchService.js';

export class ResearchController {
  listDomains = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const domains = await researchService.listDomains();
      res.status(200).json({
        success: true,
        data: domains,
      });
    } catch (error) {
      next(error);
    }
  };

  listTopics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { domainId, search, skip, limit } = req.query;
      const result = await researchService.listTopics({
        domainId: domainId as string,
        search: search as string,
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

  listPapers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { domainId, department, search, sortBy, skip, limit } = req.query;
      const result = await researchService.listPapers({
        domainId: domainId as string,
        department: department as string,
        search: search as string,
        sortBy: sortBy as any,
        skip: Number(skip) || 0,
        limit: Number(limit) || 20,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getPaperDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await researchService.getPaperDetails(req.params.id);
      if (!result) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Research paper not found.' },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  listProjectIdeas = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { domainId, difficulty, search, skip, limit } = req.query;
      const result = await researchService.listProjectIdeas({
        domainId: domainId as string,
        difficulty: difficulty as string,
        search: search as string,
        skip: Number(skip) || 0,
        limit: Number(limit) || 20,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  toggleSaved = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { itemType, itemId, notes } = req.body;
      const result = await researchService.toggleSavedResearch(req.user!.userId, itemType, itemId, notes);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getSaved = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await researchService.getSavedResearch(req.user!.userId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getRecommendations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await researchService.getRecommendations(req.user!.userId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const researchController = new ResearchController();
