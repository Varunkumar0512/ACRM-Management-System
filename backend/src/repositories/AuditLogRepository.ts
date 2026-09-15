import { AuditLog, IAuditLog } from '../models/AuditLog.js';
import { AuditAction } from '../config/constants.js';

export class AuditLogRepository {
  async log(data: {
    userId?: string;
    action: AuditAction;
    resourceType: string;
    resourceId?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<IAuditLog> {
    return AuditLog.create(data);
  }

  async list(filter: Record<string, unknown> = {}, skip = 0, limit = 50): Promise<{ logs: IAuditLog[]; total: number }> {
    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('userId', 'email fullName role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(filter),
    ]);
    return { logs, total };
  }
}

export const auditLogRepository = new AuditLogRepository();
