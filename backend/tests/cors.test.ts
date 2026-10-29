import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('ACRM Cross-Origin Resource Sharing (CORS) Security & Origin Validation', () => {
  const PRODUCTION_ORIGIN = 'https://acrm-management-system.vercel.app';
  const LOCAL_ORIGIN_3000 = 'http://localhost:3000';
  const LOCAL_ORIGIN_5173 = 'http://localhost:5173';
  const DISALLOWED_ORIGIN = 'https://malicious-attacker.com';

  describe('Preflight OPTIONS Request Handling', () => {
    it('should correctly handle OPTIONS preflight for POST /api/v1/auth/sign-in from production Vercel origin', async () => {
      const res = await request(app)
        .options('/api/v1/auth/sign-in')
        .set('Origin', PRODUCTION_ORIGIN)
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type, Authorization, X-Requested-With');

      expect(res.status).toBe(204);
      expect(res.headers['access-control-allow-origin']).toBe(PRODUCTION_ORIGIN);
      expect(res.headers['access-control-allow-credentials']).toBe('true');
      expect(res.headers['access-control-allow-methods']).toContain('POST');
      expect(res.headers['access-control-allow-headers']).toContain('Content-Type');
      expect(res.headers['vary']).toContain('Origin');
    });

    it('should correctly handle OPTIONS preflight for POST /api/v1/auth/google from production Vercel origin', async () => {
      const res = await request(app)
        .options('/api/v1/auth/google')
        .set('Origin', PRODUCTION_ORIGIN)
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type, Authorization');

      expect(res.status).toBe(204);
      expect(res.headers['access-control-allow-origin']).toBe(PRODUCTION_ORIGIN);
      expect(res.headers['access-control-allow-credentials']).toBe('true');
      expect(res.headers['access-control-allow-methods']).toContain('POST');
    });

    it('should correctly handle OPTIONS preflight from local development port 3000', async () => {
      const res = await request(app)
        .options('/api/v1/auth/sign-in')
        .set('Origin', LOCAL_ORIGIN_3000)
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type');

      expect(res.status).toBe(204);
      expect(res.headers['access-control-allow-origin']).toBe(LOCAL_ORIGIN_3000);
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should correctly handle OPTIONS preflight from local Vite port 5173', async () => {
      const res = await request(app)
        .options('/api/v1/auth/sign-in')
        .set('Origin', LOCAL_ORIGIN_5173)
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type');

      expect(res.status).toBe(204);
      expect(res.headers['access-control-allow-origin']).toBe(LOCAL_ORIGIN_5173);
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should handle origin with trailing slash safely and normalize correctly', async () => {
      const res = await request(app)
        .options('/api/v1/auth/sign-in')
        .set('Origin', `${PRODUCTION_ORIGIN}/`)
        .set('Access-Control-Request-Method', 'POST');

      expect(res.status).toBe(204);
      expect(res.headers['access-control-allow-origin']).toBe(`${PRODUCTION_ORIGIN}/`);
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should not return Access-Control-Allow-Origin header for disallowed preflight origins', async () => {
      const res = await request(app)
        .options('/api/v1/auth/sign-in')
        .set('Origin', DISALLOWED_ORIGIN)
        .set('Access-Control-Request-Method', 'POST');

      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });
  });

  describe('Standard HTTP Requests Origin Validation', () => {
    it('should set matching Access-Control-Allow-Origin on responses to production Vercel frontend', async () => {
      const res = await request(app)
        .get('/api/v1/health')
        .set('Origin', PRODUCTION_ORIGIN);

      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe(PRODUCTION_ORIGIN);
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should set matching Access-Control-Allow-Origin on responses to localhost:3000', async () => {
      const res = await request(app)
        .get('/api/v1/health')
        .set('Origin', LOCAL_ORIGIN_3000);

      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe(LOCAL_ORIGIN_3000);
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should set matching Access-Control-Allow-Origin on responses to localhost:5173', async () => {
      const res = await request(app)
        .get('/api/v1/health')
        .set('Origin', LOCAL_ORIGIN_5173);

      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe(LOCAL_ORIGIN_5173);
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should never reflect arbitrary or malicious origins in Access-Control-Allow-Origin', async () => {
      const res = await request(app)
        .get('/api/v1/health')
        .set('Origin', DISALLOWED_ORIGIN);

      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('should allow server-to-server or non-browser requests without Origin header', async () => {
      const res = await request(app).get('/api/v1/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });
  });
});
