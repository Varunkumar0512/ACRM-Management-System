import { Request, Response, NextFunction } from 'express';
import { facultyService } from '../services/FacultyService.js';

export class FacultyController {
  listFaculty = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { department, availableOnly } = req.query;
      const result = await facultyService.listFaculty(
        department as string,
        availableOnly === 'true'
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await facultyService.getFacultyDashboard(req.user!.userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const facultyController = new FacultyController();
