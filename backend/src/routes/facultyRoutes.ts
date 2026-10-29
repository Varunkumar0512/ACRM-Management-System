import { Router } from 'express';
import { facultyController } from '../controllers/FacultyController.js';
import { authenticateUser, optionalAuthenticateUser } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { UserRole } from '../config/constants.js';

const router = Router();

// Browse faculty guides (supports authenticated students and optional auth directory browsing)
router.get('/', optionalAuthenticateUser, facultyController.listFaculty);

// Faculty dashboard (faculty role only)
router.get('/dashboard', authenticateUser, requireRoles(UserRole.FACULTY), facultyController.getDashboard);

export default router;
