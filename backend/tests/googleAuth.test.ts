import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { StudentProfile } from '../src/models/StudentProfile.js';
import { Project } from '../src/models/Project.js';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../src/config/env.js';

const app = createApp();

const GOOGLE_TEST_USER_EMAIL = 'google.student.test@university.edu';
const GOOGLE_TEST_SUB = '112233445566778899001';

const LINKING_TEST_EMAIL = 'existing.password.user@university.edu';
const LINKING_TEST_PASSWORD = 'Password123!';
const LINKING_TEST_GOOGLE_SUB = '998877665544332211002';

const DISABLED_TEST_EMAIL = 'disabled.google.user@university.edu';
const DISABLED_TEST_SUB = '555555555555555555555';

let existingUserToken = '';
let existingUserId = '';

beforeAll(async () => {
  await connectDB();

  await User.deleteMany({
    email: {
      $in: [
        GOOGLE_TEST_USER_EMAIL,
        LINKING_TEST_EMAIL,
        DISABLED_TEST_EMAIL,
        'unverified.google@university.edu',
        'domain.restricted@other.edu',
        'second.researcher@university.edu',
      ],
    },
  }).catch(() => {});

  // Create an existing password-based account to test account-linking flows
  const studentRes = await request(app)
    .post('/api/v1/auth/sign-up/student')
    .send({
      fullName: 'Existing Institutional Researcher',
      email: LINKING_TEST_EMAIL,
      password: LINKING_TEST_PASSWORD,
      confirmPassword: LINKING_TEST_PASSWORD,
      studentId: `STU-${Date.now().toString().slice(-5)}`,
      department: 'Computer Science and Engineering',
      program: 'Bachelor of Technology',
      yearOfStudy: 4,
    });

  if (studentRes.status === 201) {
    existingUserToken = studentRes.body.data.tokens.accessToken;
    existingUserId = studentRes.body.data.user.id;
  }

  // Create a disabled user with a pre-linked Google ID to test disabled rejection
  const disabledUser = await User.create({
    email: DISABLED_TEST_EMAIL,
    fullName: 'Disabled Scholar',
    role: 'STUDENT',
    googleId: DISABLED_TEST_SUB,
    isActive: false,
    isEmailVerified: true,
  });
});

afterAll(async () => {
  // Cleanup test users
  await User.deleteMany({
    email: {
      $in: [
        GOOGLE_TEST_USER_EMAIL,
        LINKING_TEST_EMAIL,
        DISABLED_TEST_EMAIL,
        'unverified.google@university.edu',
        'domain.restricted@other.edu',
        'second.researcher@university.edu',
      ],
    },
  }).catch(() => {});

  await StudentProfile.deleteMany({}).catch(() => {});
  await disconnectDB();
  vi.restoreAllMocks();
});

describe('ACRM Google Authentication & Security Verification', () => {
  it('should register a new student user from a valid Google ID token with default STUDENT role', async () => {
    const spy = vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValueOnce({
      getPayload: () => ({
        sub: GOOGLE_TEST_SUB,
        email: GOOGLE_TEST_USER_EMAIL,
        email_verified: true,
        name: 'Google New Student',
        picture: 'https://lh3.googleusercontent.com/test-avatar.jpg',
      }),
    } as any);

    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({ idToken: 'valid-mock-google-id-token' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.email).toBe(GOOGLE_TEST_USER_EMAIL);
    expect(res.body.data.user.role).toBe('STUDENT'); // Must default to student, never elevated
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.body.data.tokens.refreshToken).toBeDefined();

    // Verify session HttpOnly cookies are set
    const cookies = res.headers['set-cookie'] || [];
    expect(cookies.some((c: string) => c.includes('accessToken'))).toBe(true);
    expect(cookies.some((c: string) => c.includes('refreshToken'))).toBe(true);

    // Verify in database that googleId is persisted and user is email-verified
    const dbUser = await User.findOne({ email: GOOGLE_TEST_USER_EMAIL });
    expect(dbUser).toBeDefined();
    expect(dbUser?.googleId).toBe(GOOGLE_TEST_SUB);
    expect(dbUser?.isEmailVerified).toBe(true);
    expect(dbUser?.role).toBe('STUDENT');

    spy.mockRestore();
  });

  it('should authenticate an existing Google-linked user on subsequent sign-in without duplicate registration', async () => {
    const spy = vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValueOnce({
      getPayload: () => ({
        sub: GOOGLE_TEST_SUB,
        email: GOOGLE_TEST_USER_EMAIL,
        email_verified: true,
        name: 'Google New Student',
        picture: 'https://lh3.googleusercontent.com/test-avatar.jpg',
      }),
    } as any);

    const res = await request(app)
      .post('/api/auth/google') // Also tests /api/auth/google alias
      .send({ idToken: 'subsequent-google-token' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(GOOGLE_TEST_USER_EMAIL);
    expect(res.body.data.tokens.accessToken).toBeDefined();

    // Ensure count of users with this email is still strictly 1
    const count = await User.countDocuments({ email: GOOGLE_TEST_USER_EMAIL });
    expect(count).toBe(1);

    spy.mockRestore();
  });

  it('should reject invalid, expired, or malformed Google ID token with 401 Unauthorized', async () => {
    const spy = vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockRejectedValueOnce(
      new Error('Token used too late or invalid signature')
    );

    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({ idToken: 'expired-or-tampered-token' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');

    spy.mockRestore();
  });

  it('should reject Google ID token with mismatched OAuth audience (wrong client ID)', async () => {
    const spy = vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockRejectedValueOnce(
      new Error('Wrong recipient, payload audience != requiredAudience')
    );

    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({ idToken: 'wrong-audience-token' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');

    spy.mockRestore();
  });

  it('should reject Google ID token if email is unverified by Google', async () => {
    const spy = vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValueOnce({
      getPayload: () => ({
        sub: '999999999999999999999',
        email: 'unverified.google@university.edu',
        email_verified: false, // Unverified!
        name: 'Unverified Google User',
      }),
    } as any);

    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({ idToken: 'unverified-email-token' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('verified');

    spy.mockRestore();
  });

  it('should reject deactivated/disabled accounts trying to sign in with Google', async () => {
    const spy = vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValueOnce({
      getPayload: () => ({
        sub: DISABLED_TEST_SUB,
        email: DISABLED_TEST_EMAIL,
        email_verified: true,
        name: 'Disabled Scholar',
      }),
    } as any);

    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({ idToken: 'disabled-user-token' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('deactivated');

    spy.mockRestore();
  });

  it('should require explicit account linking if an existing password account matches the Google email', async () => {
    const spy = vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValueOnce({
      getPayload: () => ({
        sub: LINKING_TEST_GOOGLE_SUB,
        email: LINKING_TEST_EMAIL, // Matches existing password-based account
        email_verified: true,
        name: 'Existing Institutional Researcher',
      }),
    } as any);

    // Call without password -> must NOT auto-link blindly!
    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({ idToken: 'linking-candidate-token' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ACCOUNT_LINKING_REQUIRED');
    expect(res.body.error.details.email).toBe(LINKING_TEST_EMAIL);

    // Ensure account is NOT linked yet
    const checkUser = await User.findOne({ email: LINKING_TEST_EMAIL });
    expect(checkUser?.googleId).toBeUndefined();

    spy.mockRestore();
  });

  it('should reject account linking if an incorrect password is provided', async () => {
    const spy = vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValueOnce({
      getPayload: () => ({
        sub: LINKING_TEST_GOOGLE_SUB,
        email: LINKING_TEST_EMAIL,
        email_verified: true,
        name: 'Existing Institutional Researcher',
      }),
    } as any);

    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({
        idToken: 'linking-candidate-token',
        linkPassword: 'WrongPassword999!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('Invalid password');

    spy.mockRestore();
  });

  it('should securely link Google identity when correct existing password is provided and preserve existing records', async () => {
    const spy = vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValueOnce({
      getPayload: () => ({
        sub: LINKING_TEST_GOOGLE_SUB,
        email: LINKING_TEST_EMAIL,
        email_verified: true,
        name: 'Existing Institutional Researcher',
      }),
    } as any);

    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({
        idToken: 'linking-candidate-token',
        linkPassword: LINKING_TEST_PASSWORD,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(LINKING_TEST_EMAIL);
    expect(res.body.data.tokens.accessToken).toBeDefined();

    // Verify database record has been linked with Google sub while preserving existing ID
    const updatedUser = await User.findOne({ email: LINKING_TEST_EMAIL });
    expect(updatedUser).toBeDefined();
    expect(updatedUser?.googleId).toBe(LINKING_TEST_GOOGLE_SUB);
    expect(updatedUser?._id.toString()).toBe(existingUserId);

    spy.mockRestore();
  });

  it('should prevent one Google identity from being linked to multiple institutional accounts', async () => {
    // Create another account
    const secondEmail = 'second.researcher@university.edu';
    await User.deleteMany({ email: secondEmail });
    await User.create({
      email: secondEmail,
      fullName: 'Second Researcher',
      role: 'STUDENT',
      passwordHash: 'dummy',
      isActive: true,
      isEmailVerified: true,
    });

    // Try to link the already-used LINKING_TEST_GOOGLE_SUB to second account
    const spy = vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValueOnce({
      getPayload: () => ({
        sub: LINKING_TEST_GOOGLE_SUB, // Already linked to existingUser!
        email: secondEmail,
        email_verified: true,
        name: 'Second Researcher',
      }),
    } as any);

    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({
        idToken: 'duplicate-sub-token',
        linkPassword: 'any',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('already linked');

    await User.deleteOne({ email: secondEmail });
    spy.mockRestore();
  });
});

describe('ACRM Password Management & Session Revocation', () => {
  it('should allow authenticated user to change password via real backend API', async () => {
    // Change password from LINKING_TEST_PASSWORD to NewSecurePass123!
    const newPass = 'NewSecurePass123!';
    const res = await request(app)
      .post('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${existingUserToken}`)
      .send({
        currentPassword: LINKING_TEST_PASSWORD,
        newPassword: newPass,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toContain('successfully updated');

    // Verify old password no longer works
    const oldLoginRes = await request(app)
      .post('/api/v1/auth/sign-in')
      .send({ email: LINKING_TEST_EMAIL, password: LINKING_TEST_PASSWORD });
    expect(oldLoginRes.status).toBe(401);

    // Verify new password works
    const newLoginRes = await request(app)
      .post('/api/v1/auth/sign-in')
      .send({ email: LINKING_TEST_EMAIL, password: newPass });
    expect(newLoginRes.status).toBe(200);
    expect(newLoginRes.body.data.tokens.accessToken).toBeDefined();
  });

  it('should reject password change when current password is wrong', async () => {
    const res = await request(app)
      .post('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${existingUserToken}`)
      .send({
        currentPassword: 'WrongCurrentPassword!',
        newPassword: 'AnotherNewPass456!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should properly revoke session on logout and clear cookies', async () => {
    const res = await request(app)
      .post('/api/v1/auth/sign-out')
      .set('Authorization', `Bearer ${existingUserToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const cookies = res.headers['set-cookie'] || [];
    // Cookies should be cleared with empty value or Max-Age=0
    expect(cookies.some((c: string) => c.includes('accessToken=;') || c.includes('Max-Age=0'))).toBe(true);
  });
});
