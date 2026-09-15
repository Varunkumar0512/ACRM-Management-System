import { SupportTicket, ISupportTicket } from '../models/SupportTicket.js';
import mongoose from 'mongoose';

export class SupportTicketRepository {
  async create(data: Partial<ISupportTicket>): Promise<ISupportTicket> {
    return SupportTicket.create(data);
  }

  async findById(id: string): Promise<ISupportTicket | null> {
    return SupportTicket.findById(id)
      .populate('userId', 'email fullName role avatarUrl')
      .populate('messages.senderId', 'email fullName role avatarUrl');
  }

  async list(filter: Record<string, unknown> = {}, skip = 0, limit = 20): Promise<{ tickets: ISupportTicket[]; total: number }> {
    const [tickets, total] = await Promise.all([
      SupportTicket.find(filter)
        .populate('userId', 'email fullName role')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      SupportTicket.countDocuments(filter),
    ]);
    return { tickets, total };
  }

  async addMessage(ticketId: string, senderId: string | mongoose.Types.ObjectId, message: string): Promise<ISupportTicket | null> {
    return SupportTicket.findByIdAndUpdate(
      ticketId,
      {
        $push: { messages: { senderId, message, createdAt: new Date() } },
        $set: { updatedAt: new Date() },
      },
      { new: true }
    )
      .populate('userId', 'email fullName role avatarUrl')
      .populate('messages.senderId', 'email fullName role avatarUrl');
  }

  async updateStatus(ticketId: string, status: string, resolvedBy?: string | mongoose.Types.ObjectId): Promise<ISupportTicket | null> {
    const update: Record<string, unknown> = { status };
    if (status === 'RESOLVED' || status === 'CLOSED') {
      update.resolvedAt = new Date();
      if (resolvedBy) update.resolvedBy = resolvedBy;
    }
    return SupportTicket.findByIdAndUpdate(ticketId, update, { new: true });
  }

  async countByStatus(): Promise<Record<string, number>> {
    const counts = await SupportTicket.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const result: Record<string, number> = {};
    counts.forEach((c) => {
      result[c._id] = c.count;
    });
    return result;
  }
}

export const supportTicketRepository = new SupportTicketRepository();
