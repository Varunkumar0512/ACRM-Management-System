import { Router } from 'express';
import { authController } from '../controllers/AuthController.js';
import { authenticateUser, optionalAuthenticateUser } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { validateBody } from '../middleware/validate.js';
import {
  signInSchema,
  studentSignUpSchema,
  facultySignUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  googleAuthSchema,
} from '../validators/authValidator.js';

const router = Router();

router.post('/sign-in', authRateLimiter, validateBody(signInSchema), authController.signIn);
router.post('/google', authRateLimiter, validateBody(googleAuthSchema), authController.googleAuth);
router.post('/sign-up/student', authRateLimiter, validateBody(studentSignUpSchema), authController.signUpStudent);
router.post('/sign-up/faculty', authRateLimiter, validateBody(facultySignUpSchema), authController.signUpFaculty);
router.post('/change-password', authenticateUser, authRateLimiter, validateBody(changePasswordSchema), authController.changePassword);
router.post('/refresh', authController.refreshToken);
router.post('/sign-out', optionalAuthenticateUser, authController.signOut);
router.get('/me', authenticateUser, authController.getCurrentUser);
router.post('/forgot-password', authRateLimiter, validateBody(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authRateLimiter, validateBody(resetPasswordSchema), authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);

export default router;
