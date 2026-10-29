import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env, ALLOWED_ORIGINS } from './config/env.js';
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

  // CORS configuration allowing production Vercel frontend, local development ports, and validated origins
  const corsOptions: cors.CorsOptions = {
    origin: (requestOrigin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, health checks)
      if (!requestOrigin) {
        return callback(null, true);
      }

      const normalized = requestOrigin.trim().replace(/\/+$/, '').toLowerCase();
      const isAllowed = ALLOWED_ORIGINS.some(
        (allowed) => allowed.trim().replace(/\/+$/, '').toLowerCase() === normalized
      );

      if (isAllowed) {
        return callback(null, true);
      }

      // Do not reflect unapproved origins
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 204,
  };

  // CORS middleware - mounted before parsers, rate limiters, and routes
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

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
