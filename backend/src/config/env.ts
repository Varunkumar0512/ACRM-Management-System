import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/acr_platform',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'acr_dev_access_secret_change_in_production_key_64',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'acr_dev_refresh_secret_change_in_production_key_64',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  COOKIE_SECURE: process.env.COOKIE_SECURE === 'true',
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
};
