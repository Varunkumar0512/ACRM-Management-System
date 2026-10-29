import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { NotFoundError } from './errors/AppError.js';

export function createApp(): Express {
  const app = express();

  // Trust proxy in production if behind reverse proxy
  app.set('trust proxy', 1);

  // Security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false, // Managed per environment
    })
  );

  // CORS
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Parsers
  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // General rate limiting
  app.use('/api/', apiRateLimiter);

  // API Router (supporting both /api/v1 and standard /api routes)
  app.use('/api/v1', apiRouter);
  app.use('/api', apiRouter);

  // 404 Fallback
  app.use((req, _res, next) => {
    next(new NotFoundError(`API endpoint [${req.method} ${req.originalUrl}] does not exist.`));
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
