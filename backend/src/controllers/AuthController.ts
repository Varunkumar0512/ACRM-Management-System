import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/AuthService.js';
import { env } from '../config/env.js';

export class AuthController {
  private setTokenCookies(res: Response, accessToken: string, refreshToken: string) {
    const isSecure = env.COOKIE_SECURE || env.NODE_ENV === 'production';
    const sameSiteSetting = isSecure ? 'none' : 'lax';

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: sameSiteSetting,
      maxAge: 15 * 60 * 1000, // 15 mins
      path: '/',
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: sameSiteSetting,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });
  }

  signIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await authService.signIn(email, password, ipAddress, userAgent);
      this.setTokenCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  signUpStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await authService.registerStudent(req.body);
      this.setTokenCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  signUpFaculty = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await authService.registerFaculty(req.body);
      this.setTokenCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      const tokens = await authService.refreshToken(token);
      this.setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

      res.status(200).json({
        success: true,
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  };

  private clearTokenCookies(res: Response) {
    const isSecure = env.COOKIE_SECURE || env.NODE_ENV === 'production';
    const sameSiteSetting = isSecure ? 'none' : 'lax';

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: isSecure,
      sameSite: sameSiteSetting,
      path: '/',
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isSecure,
      sameSite: sameSiteSetting,
      path: '/',
    });
  }

  googleAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { idToken, linkPassword } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await authService.authenticateGoogle({
        idToken,
        linkPassword,
        ipAddress,
        userAgent,
      });

      this.setTokenCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.user!.userId, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        data: { message: 'Password has been successfully updated.' },
      });
    } catch (error) {
      next(error);
    }
  };

  signOut = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      await authService.signOut(req.user?.userId, rawRefreshToken);
      this.clearTokenCookies(res);

      res.status(200).json({
        success: true,
        data: { message: 'Successfully signed out.' },
      });
    } catch (error) {
      next(error);
    }
  };

  getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await authService.getCurrentUser(req.user!.userId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await authService.forgotPassword(req.body.email);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await authService.resetPassword(req.body.token, req.body.newPassword);
      res.status(200).json({
        success: true,
        data: { message: 'Password has been successfully reset. You may now sign in with your new password.' },
      });
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await authService.verifyEmail(req.params.token);
      res.status(200).json({
        success: true,
        data: { message: 'Institutional email successfully verified.' },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
