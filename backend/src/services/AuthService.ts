import { userRepository } from '../repositories/UserRepository.js';
import { studentProfileRepository } from '../repositories/StudentProfileRepository.js';
import { facultyProfileRepository } from '../repositories/FacultyProfileRepository.js';
import { auditLogRepository } from '../repositories/AuditLogRepository.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, hashToken, generateRandomToken } from '../utils/tokens.js';
import { UnauthorizedError, BadRequestError, NotFoundError, ForbiddenError, AccountLinkingRequiredError } from '../errors/AppError.js';
import { UserRole, AuditAction } from '../config/constants.js';
import { IUser, User } from '../models/User.js';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.js';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    avatarUrl?: string;
    isEmailVerified: boolean;
  };
  profile?: any;
  tokens: AuthTokens;
  previewVerificationToken?: string;
}

export class AuthService {
  async signIn(email: string, pass: string, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
    const normalizedEmail = email ? email.toLowerCase().trim() : '';
    const user = await userRepository.findByEmail(normalizedEmail);
    if (!user) {
      await auditLogRepository.log({
        action: AuditAction.LOGIN_FAILED,
        resourceType: 'User',
        details: { emailAttempted: normalizedEmail, reason: 'Invalid credentials' },
        ipAddress,
        userAgent,
      });
      throw new UnauthorizedError('Invalid institutional email or password.');
    }

    if (!user.passwordHash) {
      await auditLogRepository.log({
        action: AuditAction.LOGIN_FAILED,
        resourceType: 'User',
        details: { emailAttempted: normalizedEmail, reason: 'Account uses Google Sign-In' },
        ipAddress,
        userAgent,
      });
      throw new UnauthorizedError('This account was created with Google. Please use Continue with Google.');
    }

    const isValidPassword = await comparePassword(pass, user.passwordHash);
    if (!isValidPassword) {
      await auditLogRepository.log({
        userId: user._id.toString(),
        action: AuditAction.LOGIN_FAILED,
        resourceType: 'User',
        resourceId: user._id.toString(),
        details: { reason: 'Invalid credentials' },
        ipAddress,
        userAgent,
      });
      throw new UnauthorizedError('Invalid institutional email or password.');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Your account has been deactivated. Please contact the ACRM Administrator.');
    }

    // Generate tokens
    const { token: refreshToken, hash: refreshTokenHash } = generateRefreshToken();
    user.refreshTokenHash = refreshTokenHash;
    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    await auditLogRepository.log({
      userId: user._id.toString(),
      action: AuditAction.LOGIN_SUCCESS,
      resourceType: 'User',
      resourceId: user._id.toString(),
      ipAddress,
      userAgent,
    });

    // Load academic profile
    let profile = null;
    if (user.role === UserRole.STUDENT) {
      profile = await studentProfileRepository.findByUserId(user._id);
    } else if (user.role === UserRole.FACULTY) {
      profile = await facultyProfileRepository.findByUserId(user._id);
    }

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isEmailVerified: user.isEmailVerified,
      },
      profile,
      tokens: { accessToken, refreshToken },
    };
  }

  async registerStudent(data: {
    fullName: string;
    email: string;
    password: string;
    studentId: string;
    department: string;
    program: string;
    yearOfStudy: number;
    phone?: string;
    researchInterests?: string[];
  }): Promise<AuthResponse> {
    const normalizedEmail = data.email.toLowerCase().trim();
    const normalizedStudentId = data.studentId.trim();

    const existingUser = await userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new BadRequestError('Unable to create the account. Please check your details or sign in if you already have an account.');
    }

    const existingStudentId = await studentProfileRepository.findByStudentId(normalizedStudentId);
    if (existingStudentId) {
      throw new BadRequestError('Unable to create the account. Please check your details or sign in if you already have an account.');
    }

    const passwordHash = await hashPassword(data.password);
    const verificationToken = generateRandomToken();
    const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    let user: any = null;
    let studentProfile: any = null;

    try {
      user = await userRepository.create({
        email: normalizedEmail,
        fullName: data.fullName.trim(),
        passwordHash,
        role: UserRole.STUDENT,
        phone: data.phone || '',
        verificationToken,
        verificationTokenExpiresAt,
        isEmailVerified: false,
      });

      studentProfile = await studentProfileRepository.create({
        userId: user._id,
        studentId: normalizedStudentId,
        department: data.department.trim(),
        program: data.program.trim(),
        yearOfStudy: data.yearOfStudy,
        researchInterests: data.researchInterests || [],
      });
    } catch (createErr) {
      // Roll back user creation if profile creation fails
      if (user && user._id) {
        await User.findByIdAndDelete(user._id).catch(() => {});
      }
      throw createErr;
    }

    const { token: refreshToken, hash: refreshTokenHash } = generateRefreshToken();
    user.refreshTokenHash = refreshTokenHash;
    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isEmailVerified: user.isEmailVerified,
      },
      profile: studentProfile,
      tokens: { accessToken, refreshToken },
      previewVerificationToken: process.env.NODE_ENV !== 'production' ? verificationToken : undefined,
    };
  }

  async registerFaculty(data: {
    fullName: string;
    email: string;
    password: string;
    employeeId: string;
    designation: any;
    department: string;
    experienceYears: number;
    areasOfExpertise: string[];
    cabinLocation?: string;
    phone?: string;
  }): Promise<AuthResponse> {
    const normalizedEmail = data.email.toLowerCase().trim();
    const normalizedEmployeeId = data.employeeId.trim();

    const existingUser = await userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new BadRequestError('Unable to create the account. Please check your details or sign in if you already have an account.');
    }

    const existingEmployeeId = await facultyProfileRepository.findByEmployeeId(normalizedEmployeeId);
    if (existingEmployeeId) {
      throw new BadRequestError('Unable to create the account. Please check your details or sign in if you already have an account.');
    }

    const passwordHash = await hashPassword(data.password);
    const verificationToken = generateRandomToken();
    const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    let user: any = null;
    let facultyProfile: any = null;

    try {
      user = await userRepository.create({
        email: normalizedEmail,
        fullName: data.fullName.trim(),
        passwordHash,
        role: UserRole.FACULTY,
        phone: data.phone || '',
        verificationToken,
        verificationTokenExpiresAt,
        isEmailVerified: false,
      });

      facultyProfile = await facultyProfileRepository.create({
        userId: user._id,
        employeeId: normalizedEmployeeId,
        designation: data.designation,
        department: data.department.trim(),
        experienceYears: data.experienceYears,
        areasOfExpertise: data.areasOfExpertise,
        cabinLocation: data.cabinLocation || '',
      });
    } catch (createErr) {
      if (user && user._id) {
        await User.findByIdAndDelete(user._id).catch(() => {});
      }
      throw createErr;
    }

    const { token: refreshToken, hash: refreshTokenHash } = generateRefreshToken();
    user.refreshTokenHash = refreshTokenHash;
    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isEmailVerified: user.isEmailVerified,
      },
      profile: facultyProfile,
      tokens: { accessToken, refreshToken },
      previewVerificationToken: process.env.NODE_ENV !== 'production' ? verificationToken : undefined,
    };
  }

  async refreshToken(rawRefreshToken: string): Promise<AuthTokens> {
    if (!rawRefreshToken) {
      throw new UnauthorizedError('Refresh token required.');
    }

    const hashed = hashToken(rawRefreshToken);
    const user = await userRepository.list({ refreshTokenHash: hashed }, 0, 1);
    if (!user.users.length) {
      throw new UnauthorizedError('Invalid or revoked session. Please sign in again.');
    }

    const currentUser = user.users[0];
    if (!currentUser.isActive) {
      throw new UnauthorizedError('User account has been disabled.');
    }

    // Rotate refresh token
    const { token: newRefreshToken, hash: newHash } = generateRefreshToken();
    currentUser.refreshTokenHash = newHash;
    await currentUser.save();

    const newAccessToken = generateAccessToken({
      userId: currentUser._id.toString(),
      email: currentUser.email,
      role: currentUser.role,
      fullName: currentUser.fullName,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async signOut(userId?: string, rawRefreshToken?: string): Promise<void> {
    if (userId) {
      await userRepository.update(userId, { refreshTokenHash: undefined });
    } else if (rawRefreshToken) {
      const hashed = hashToken(rawRefreshToken);
      const userList = await userRepository.list({ refreshTokenHash: hashed }, 0, 1);
      if (userList.users.length > 0) {
        userList.users[0].refreshTokenHash = undefined;
        await userList.users[0].save();
      }
    }
  }

  async forgotPassword(email: string): Promise<{ message: string; previewToken?: string }> {
    const user = await userRepository.findByEmail(email);
    // Generic response to prevent user enumeration
    if (!user) {
      return { message: 'If the institutional email exists in our system, reset instructions have been dispatched.' };
    }

    const resetToken = generateRandomToken();
    user.passwordResetToken = resetToken;
    user.passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    await auditLogRepository.log({
      userId: user._id.toString(),
      action: AuditAction.PASSWORD_RESET_REQUESTED,
      resourceType: 'User',
      resourceId: user._id.toString(),
    });

    return {
      message: 'If the institutional email exists in our system, reset instructions have been dispatched.',
      // In dev environment, return previewToken for convenient testing
      previewToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
    };
  }

  async resetPassword(token: string, newPass: string): Promise<void> {
    const user = await userRepository.findByPasswordResetToken(token);
    if (!user) {
      throw new BadRequestError('Invalid or expired password reset token.');
    }

    user.passwordHash = await hashPassword(newPass);
    user.passwordResetToken = undefined;
    user.passwordResetExpiresAt = undefined;
    user.refreshTokenHash = undefined; // invalidate existing sessions
    await user.save();

    await auditLogRepository.log({
      userId: user._id.toString(),
      action: AuditAction.PASSWORD_RESET_COMPLETED,
      resourceType: 'User',
      resourceId: user._id.toString(),
    });
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await userRepository.findByVerificationToken(token);
    if (!user) {
      throw new BadRequestError('Invalid or expired email verification token.');
    }

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();
  }

  async getCurrentUser(userId: string): Promise<{ user: any; profile: any }> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    let profile = null;
    if (user.role === UserRole.STUDENT) {
      profile = await studentProfileRepository.findByUserId(user._id);
    } else if (user.role === UserRole.FACULTY) {
      profile = await facultyProfileRepository.findByUserId(user._id);
    }

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      },
      profile,
    };
  }

  /**
   * Safe development provisioning method for administrator or onboarding use.
   */
  async provisionDevUser(data: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    studentIdOrEmployeeId?: string;
    department?: string;
  }): Promise<{ user: any; message: string }> {
    const normalizedEmail = data.email.toLowerCase().trim();
    let existingUser = await userRepository.findByEmail(normalizedEmail);

    const passwordHash = await hashPassword(data.password);

    if (existingUser) {
      existingUser.passwordHash = passwordHash;
      existingUser.fullName = data.fullName.trim();
      existingUser.isActive = true;
      existingUser.isEmailVerified = true;
      await existingUser.save();
      return {
        user: { id: existingUser._id.toString(), email: existingUser.email, role: existingUser.role },
        message: 'Account successfully updated and verified.',
      };
    }

    const newUser = await userRepository.create({
      email: normalizedEmail,
      fullName: data.fullName.trim(),
      passwordHash,
      role: data.role,
      isActive: true,
      isEmailVerified: true,
    });

    if (data.role === UserRole.STUDENT) {
      const studentId = data.studentIdOrEmployeeId || `ACRM-${Date.now().toString().slice(-6)}`;
      await studentProfileRepository.create({
        userId: newUser._id,
        studentId,
        department: data.department || 'Computer Science & Engineering',
        program: 'Bachelor of Technology',
        yearOfStudy: 4,
        researchInterests: [],
      });
    }

    return {
      user: { id: newUser._id.toString(), email: newUser.email, role: newUser.role },
      message: 'Account successfully provisioned and verified.',
    };
  }

  /**
   * Real authenticated password change with cryptographic verification.
   */
  async changePassword(userId: string, currentPassword?: string, newPassword?: string): Promise<void> {
    if (!newPassword || newPassword.length < 8) {
      throw new BadRequestError('New password must be at least 8 characters long.');
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User account not found.');
    }

    // If the user already has a password set, require current password verification
    if (user.passwordHash) {
      if (!currentPassword) {
        throw new BadRequestError('Current password is required to change password.');
      }
      const isValid = await comparePassword(currentPassword, user.passwordHash);
      if (!isValid) {
        throw new UnauthorizedError('Current password is incorrect.');
      }
    }

    user.passwordHash = await hashPassword(newPassword);
    // Revoke current session refresh token to enforce fresh authentication
    user.refreshTokenHash = undefined;
    await user.save();

    await auditLogRepository.log({
      userId: user._id.toString(),
      action: AuditAction.PASSWORD_CHANGED,
      resourceType: 'User',
      resourceId: user._id.toString(),
    });
  }

  /**
   * Google Identity Services authentication and secure account linking.
   */
  async authenticateGoogle(data: {
    idToken: string;
    linkPassword?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuthResponse> {
    if (!data.idToken) {
      throw new BadRequestError('Google ID token is required.');
    }

    let payload: any;
    try {
      const oauth2Client = new OAuth2Client(env.GOOGLE_CLIENT_ID || undefined);
      const ticket = await oauth2Client.verifyIdToken({
        idToken: data.idToken,
        audience: env.GOOGLE_CLIENT_ID ? env.GOOGLE_CLIENT_ID : undefined,
      });
      payload = ticket.getPayload();
    } catch (err: any) {
      await auditLogRepository.log({
        action: AuditAction.LOGIN_FAILED,
        resourceType: 'User',
        details: { reason: 'Google ID token verification failed', error: err.message },
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      });
      throw new UnauthorizedError(`Google authentication failed: ${err.message || 'invalid token'}`);
    }

    if (!payload || !payload.sub || !payload.email) {
      throw new UnauthorizedError('Invalid Google identity token payload.');
    }

    if (!payload.email_verified) {
      throw new UnauthorizedError('Google institutional email address has not been verified.');
    }

    const normalizedEmail = payload.email.toLowerCase().trim();

    // Check institutional domain restrictions if configured
    if (env.GOOGLE_ALLOWED_DOMAINS && env.GOOGLE_ALLOWED_DOMAINS.length > 0) {
      const emailDomain = normalizedEmail.split('@')[1];
      const hd = (payload.hd || '').toLowerCase();
      const domainAllowed = env.GOOGLE_ALLOWED_DOMAINS.some(
        (allowed) => allowed === emailDomain || allowed === hd
      );
      if (!domainAllowed) {
        throw new ForbiddenError(
          `Google account domain is not authorized for institutional access. Authorized domains: [${env.GOOGLE_ALLOWED_DOMAINS.join(', ')}]`
        );
      }
    }

    // Step 1: Look up existing user by Google subject ID
    let user = await userRepository.findByGoogleId(payload.sub);

    if (user) {
      if (user.email.toLowerCase() !== normalizedEmail) {
        throw new BadRequestError('This Google account is already linked to another institutional user profile.');
      }

      if (!user.isActive) {
        throw new UnauthorizedError('Your account has been deactivated. Please contact the ACRM Administrator.');
      }

      user.lastLoginAt = new Date();
      if (payload.picture && !user.avatarUrl) {
        user.avatarUrl = payload.picture;
      }
      await user.save();
    } else {
      // Step 2: Check by verified email to prevent unauthorized automatic linking
      const existingUserWithEmail = await userRepository.findByEmail(normalizedEmail);

      if (existingUserWithEmail) {
        if (!existingUserWithEmail.isActive) {
          throw new UnauthorizedError('Your account has been deactivated. Please contact the ACRM Administrator.');
        }

        // Verify that this Google ID is not already linked to another account
        const duplicateGoogleUser = await userRepository.findByGoogleId(payload.sub);
        if (duplicateGoogleUser && duplicateGoogleUser._id.toString() !== existingUserWithEmail._id.toString()) {
          throw new BadRequestError('This Google account is already linked to another institutional user.');
        }

        // Secure account linking: require password confirmation
        if (!data.linkPassword) {
          throw new AccountLinkingRequiredError(
            'An existing account with this institutional email was found. Please enter your existing password to link your Google identity.',
            normalizedEmail
          );
        }

        if (existingUserWithEmail.passwordHash) {
          const isPasswordValid = await comparePassword(data.linkPassword, existingUserWithEmail.passwordHash);
          if (!isPasswordValid) {
            await auditLogRepository.log({
              userId: existingUserWithEmail._id.toString(),
              action: AuditAction.LOGIN_FAILED,
              resourceType: 'User',
              resourceId: existingUserWithEmail._id.toString(),
              details: { reason: 'Invalid password during Google account linking' },
              ipAddress: data.ipAddress,
              userAgent: data.userAgent,
            });
            throw new UnauthorizedError('Invalid password for linking existing account.');
          }
        }

        // Link Google identity while strictly preserving all existing projects, roles, faculty records, IPR
        existingUserWithEmail.googleId = payload.sub;
        existingUserWithEmail.isEmailVerified = true;
        existingUserWithEmail.lastLoginAt = new Date();
        if (payload.picture && !existingUserWithEmail.avatarUrl) {
          existingUserWithEmail.avatarUrl = payload.picture;
        }
        await existingUserWithEmail.save();

        await auditLogRepository.log({
          userId: existingUserWithEmail._id.toString(),
          action: AuditAction.ACCOUNT_LINKED,
          resourceType: 'User',
          resourceId: existingUserWithEmail._id.toString(),
          details: { googleSub: payload.sub, email: normalizedEmail },
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        });

        user = existingUserWithEmail;
      } else {
        // Step 3: New user registration via Google (default to STUDENT role, never grant elevated roles)
        user = await userRepository.create({
          email: normalizedEmail,
          fullName: (payload.name || 'Campus Researcher').trim(),
          role: UserRole.STUDENT,
          googleId: payload.sub,
          avatarUrl: payload.picture || '',
          isActive: true,
          isEmailVerified: true,
        });

        const studentId = `STU-G${Date.now().toString().slice(-6)}`;
        await studentProfileRepository.create({
          userId: user._id,
          studentId,
          department: 'General Sciences & Engineering',
          program: 'Undergraduate Research Program',
          yearOfStudy: 1,
          researchInterests: [],
        });

        await auditLogRepository.log({
          userId: user._id.toString(),
          action: AuditAction.USER_REGISTERED,
          resourceType: 'User',
          resourceId: user._id.toString(),
          details: { method: 'GOOGLE_OAUTH', googleSub: payload.sub },
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        });
      }
    }

    // Issue ACRM's own application session tokens (never use Google ID token as app session)
    const { token: refreshToken, hash: refreshTokenHash } = generateRefreshToken();
    user.refreshTokenHash = refreshTokenHash;
    await user.save();

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    await auditLogRepository.log({
      userId: user._id.toString(),
      action: AuditAction.LOGIN_SUCCESS,
      resourceType: 'User',
      resourceId: user._id.toString(),
      details: { method: 'GOOGLE_OAUTH' },
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });

    // Load academic profile
    let profile = null;
    if (user.role === UserRole.STUDENT) {
      profile = await studentProfileRepository.findByUserId(user._id);
    } else if (user.role === UserRole.FACULTY) {
      profile = await facultyProfileRepository.findByUserId(user._id);
    }

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isEmailVerified: user.isEmailVerified,
      },
      profile,
      tokens: { accessToken, refreshToken },
    };
  }
}

export const authService = new AuthService();
