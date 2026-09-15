import { Router } from 'express';
import { authController } from '../controllers/AuthController.js';
import { authenticateUser } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { validateBody } from '../middleware/validate.js';
import {
  signInSchema,
  studentSignUpSchema,
  facultySignUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/authValidator.js';

const router = Router();

router.post('/sign-in', authRateLimiter, validateBody(signInSchema), authController.signIn);
router.post('/sign-up/student', authRateLimiter, validateBody(studentSignUpSchema), authController.signUpStudent);
router.post('/sign-up/faculty', authRateLimiter, validateBody(facultySignUpSchema), authController.signUpFaculty);
router.post('/refresh', authController.refreshToken);
router.post('/sign-out', authenticateUser, authController.signOut);
router.get('/me', authenticateUser, authController.getCurrentUser);
router.post('/forgot-password', authRateLimiter, validateBody(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authRateLimiter, validateBody(resetPasswordSchema), authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);

export default router;
