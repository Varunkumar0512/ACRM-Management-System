import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error(`Error processing request: ${req.method} ${req.originalUrl}`, err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    const flattened = err.flatten().fieldErrors;
    const fields: Record<string, string> = {};
    for (const [key, msgs] of Object.entries(flattened)) {
      if (msgs && msgs.length > 0) {
        fields[key] = msgs[0];
      }
    }
    const summary = Object.entries(fields)
      .map(([k, msg]) => `${k}: ${msg}`)
      .join('; ');

    res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: summary ? `Validation failed: ${summary}` : 'Request validation failed',
        fields,
        details: flattened,
      },
    });
    return;
  }

  // Handle Mongoose duplicate key error (11000)
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue || {})[0] || 'field';
    res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_KEY',
        message: `A record with this ${field} already exists.`,
      },
    });
    return;
  }

  // Generic unexpected error (never leak internal details or stacks in production)
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred. Please try again later.',
      details: env.NODE_ENV === 'development' ? err.message : undefined,
    },
  });
}
