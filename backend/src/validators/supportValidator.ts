import { z } from 'zod';
import { SupportCategory, SupportPriority } from '../config/constants.js';

export const createSupportTicketSchema = z.object({
  category: z.nativeEnum(SupportCategory),
  subject: z.string().min(5, 'Subject must be at least 5 characters').trim(),
  description: z.string().min(15, 'Description must be at least 15 characters'),
  priority: z.nativeEnum(SupportPriority).optional().default(SupportPriority.MEDIUM),
});

export const replyTicketSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').trim(),
});

export const updateTicketStatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_FOR_USER', 'RESOLVED', 'CLOSED']),
});
