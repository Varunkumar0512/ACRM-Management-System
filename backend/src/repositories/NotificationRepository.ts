import { Notification, INotification } from '../models/Notification.js';
import mongoose from 'mongoose';

export class NotificationRepository {
  async getNotificationsForUser(recipientId: string | mongoose.Types.ObjectId, limit = 30): Promise<INotification[]> {
    return Notification.find({ recipientId })
      .populate('senderId', 'email fullName avatarUrl role')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async getUnreadCount(recipientId: string | mongoose.Types.ObjectId): Promise<number> {
    return Notification.countDocuments({ recipientId, isRead: false });
  }

  async create(data: Partial<INotification>): Promise<INotification> {
    return Notification.create(data);
  }

  async markAsRead(id: string, recipientId: string | mongoose.Types.ObjectId): Promise<INotification | null> {
    return Notification.findOneAndUpdate(
      { _id: id, recipientId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
  }

  async markAllAsRead(recipientId: string | mongoose.Types.ObjectId): Promise<number> {
    const res = await Notification.updateMany(
      { recipientId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    return res.modifiedCount;
  }
}

export const notificationRepository = new NotificationRepository();
