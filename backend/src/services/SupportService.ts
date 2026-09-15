import { supportTicketRepository } from '../repositories/SupportTicketRepository.js';
import { SupportCategory, SupportPriority, SupportStatus, UserRole } from '../config/constants.js';
import { ForbiddenError, NotFoundError } from '../errors/AppError.js';
import mongoose from 'mongoose';

export class SupportService {
  async generateTicketNumber(): Promise<string> {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TKT-${random}`;
  }

  async createTicket(userId: string, data: {
    category: SupportCategory;
    subject: string;
    description: string;
    priority?: SupportPriority;
  }) {
    const ticketNumber = await this.generateTicketNumber();
    const ticket = await supportTicketRepository.create({
      ticketNumber,
      userId: new mongoose.Types.ObjectId(userId),
      category: data.category,
      subject: data.subject,
      description: data.description,
      priority: data.priority || SupportPriority.MEDIUM,
      status: SupportStatus.OPEN,
      messages: [
        {
          senderId: new mongoose.Types.ObjectId(userId),
          message: data.description,
          createdAt: new Date(),
        },
      ],
    });
    return ticket;
  }

  async getTickets(user: { userId: string; role: UserRole }, status?: string, skip = 0, limit = 20) {
    const filter: Record<string, unknown> = {};
    if (user.role !== UserRole.ADMIN) {
      filter.userId = user.userId;
    }
    if (status) {
      filter.status = status;
    }
    return supportTicketRepository.list(filter, skip, limit);
  }

  async getTicketDetails(ticketId: string, user: { userId: string; role: UserRole }) {
    const ticket = await supportTicketRepository.findById(ticketId);
    if (!ticket) throw new NotFoundError('Support ticket not found.');

    if (user.role !== UserRole.ADMIN && ticket.userId && (ticket.userId as any)._id?.toString() !== user.userId) {
      throw new ForbiddenError('You do not have permission to view this ticket.');
    }

    return ticket;
  }

  async replyTicket(ticketId: string, user: { userId: string; role: UserRole }, message: string) {
    const ticket = await supportTicketRepository.findById(ticketId);
    if (!ticket) throw new NotFoundError('Support ticket not found.');

    if (user.role !== UserRole.ADMIN && ticket.userId && (ticket.userId as any)._id?.toString() !== user.userId) {
      throw new ForbiddenError('You do not have permission to reply to this ticket.');
    }

    // If admin replies, change status to WAITING_FOR_USER if currently open
    if (user.role === UserRole.ADMIN && ticket.status === SupportStatus.OPEN) {
      ticket.status = SupportStatus.WAITING_FOR_USER;
      await ticket.save();
    } else if (user.role !== UserRole.ADMIN && ticket.status === SupportStatus.WAITING_FOR_USER) {
      ticket.status = SupportStatus.IN_PROGRESS;
      await ticket.save();
    }

    return supportTicketRepository.addMessage(ticketId, user.userId, message);
  }

  async updateTicketStatus(ticketId: string, status: string, adminUserId: string) {
    return supportTicketRepository.updateStatus(ticketId, status, adminUserId);
  }
}

export const supportService = new SupportService();
