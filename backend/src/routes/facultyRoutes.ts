import { Router } from 'express';
import { facultyController } from '../controllers/FacultyController.js';
import { authenticateUser } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { UserRole } from '../config/constants.js';

const router = Router();

// Browse faculty guides (requires login)
router.use(authenticateUser);
router.get('/', facultyController.listFaculty);

// Faculty dashboard (faculty role only)
router.get('/dashboard', requireRoles(UserRole.FACULTY), facultyController.getDashboard);

export default router;
