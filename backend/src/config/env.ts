import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const isProduction = process.env.NODE_ENV === 'production';
const DEV_ACCESS_SECRET = 'acr_dev_access_secret_change_in_production_key_64';
const DEV_REFRESH_SECRET = 'acr_dev_refresh_secret_change_in_production_key_64';

if (isProduction) {
  if (!process.env.JWT_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET === DEV_ACCESS_SECRET) {
    throw new Error(
      'FATAL CONFIGURATION ERROR: JWT_ACCESS_SECRET must be explicitly set to a secure secret in production mode.'
    );
  }
  if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET === DEV_REFRESH_SECRET) {
    throw new Error(
      'FATAL CONFIGURATION ERROR: JWT_REFRESH_SECRET must be explicitly set to a secure secret in production mode.'
    );
  }
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/acr_platform',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || DEV_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || DEV_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  COOKIE_SECURE: process.env.COOKIE_SECURE === 'true' || (isProduction && process.env.COOKIE_SECURE !== 'false'),
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_ALLOWED_DOMAINS: (process.env.GOOGLE_ALLOWED_DOMAINS || '')
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean),
};
