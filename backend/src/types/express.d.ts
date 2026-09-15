import { UserRole } from '../config/constants.js';

export interface AuthUserPayload {
  userId: string;
  email: string;
  role: UserRole;
  fullName: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}
