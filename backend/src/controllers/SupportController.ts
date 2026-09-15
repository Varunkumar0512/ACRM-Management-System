import { Request, Response, NextFunction } from 'express';
import { supportService } from '../services/SupportService.js';

export class SupportController {
  createTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticket = await supportService.createTicket(req.user!.userId, req.body);
      res.status(201).json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  };

  listTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, skip, limit } = req.query;
      const result = await supportService.getTickets(
        { userId: req.user!.userId, role: req.user!.role },
        status as string,
        Number(skip) || 0,
        Number(limit) || 20
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticket = await supportService.getTicketDetails(req.params.id, {
        userId: req.user!.userId,
        role: req.user!.role,
      });

      res.status(200).json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  };

  replyTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticket = await supportService.replyTicket(
        req.params.id,
        { userId: req.user!.userId, role: req.user!.role },
        req.body.message
      );

      res.status(200).json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticket = await supportService.updateTicketStatus(
        req.params.id,
        req.body.status,
        req.user!.userId
      );

      res.status(200).json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const supportController = new SupportController();
