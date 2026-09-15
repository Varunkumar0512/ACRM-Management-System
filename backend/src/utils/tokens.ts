import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { AuthUserPayload } from '../types/express.js';

export function generateAccessToken(payload: AuthUserPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): AuthUserPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthUserPayload;
}

export function generateRefreshToken(): { token: string; hash: string } {
  const token = crypto.randomBytes(40).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hash };
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateRandomToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
