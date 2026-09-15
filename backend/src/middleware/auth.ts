import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/tokens.js';
import { UnauthorizedError } from '../errors/AppError.js';
import { userRepository } from '../repositories/UserRepository.js';

export async function authenticateUser(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new UnauthorizedError('Authentication required. Please sign in.');
    }

    const payload = verifyAccessToken(token);

    // Verify user exists and is active in database
    const user = await userRepository.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedError('User account not found.');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('User account has been disabled. Please contact the administrator.');
    }

    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Access token expired. Please refresh your session.'));
    } else if (error.name === 'JsonWebTokenError') {
      next(new UnauthorizedError('Invalid access token.'));
    } else {
      next(error);
    }
  }
}
