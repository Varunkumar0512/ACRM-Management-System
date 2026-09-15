import { Request, Response, NextFunction } from 'express';
import { notificationRepository } from '../repositories/NotificationRepository.js';

export class NotificationController {
  getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const [notifications, unreadCount] = await Promise.all([
        notificationRepository.getNotificationsForUser(req.user!.userId),
        notificationRepository.getUnreadCount(req.user!.userId),
      ]);

      res.status(200).json({
        success: true,
        data: { notifications, unreadCount },
      });
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const notification = await notificationRepository.markAsRead(req.params.id, req.user!.userId);
      res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  };

  markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const count = await notificationRepository.markAllAsRead(req.user!.userId);
      res.status(200).json({
        success: true,
        data: { markedCount: count },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const notificationController = new NotificationController();
