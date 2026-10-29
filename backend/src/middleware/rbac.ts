import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../config/constants.js';
import { ForbiddenError, UnauthorizedError } from '../errors/AppError.js';

export function requireRoles(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required. Please sign in.'));
    }

    const currentRole = ((req.user.role || '') as string).toUpperCase() as UserRole;
    const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());

    if (!normalizedAllowed.includes(currentRole)) {
      return next(
        new ForbiddenError(
          `Access restricted to roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`
        )
      );
    }

    next();
  };
}
