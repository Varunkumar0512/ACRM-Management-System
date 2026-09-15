import { Router } from 'express';
import { adminController } from '../controllers/AdminController.js';
import { authenticateUser } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validate.js';
import { UserRole } from '../config/constants.js';
import {
  createDomainSchema,
  createTopicSchema,
  createPaperSchema,
  createProjectIdeaSchema,
} from '../validators/researchValidator.js';

const router = Router();

// Strictly enforce admin authentication & authorization
router.use(authenticateUser);
router.use(requireRoles(UserRole.ADMIN));

router.get('/analytics', adminController.getAnalytics);
router.get('/users', adminController.listUsers);
router.patch('/users/:id/toggle-status', adminController.toggleUserStatus);
router.patch('/users/:id/faculty', adminController.updateFaculty);
router.get('/audit-logs', adminController.getAuditLogs);

// Taxonomy management
router.post('/research/domains', validateBody(createDomainSchema), adminController.createDomain);
router.post('/research/topics', validateBody(createTopicSchema), adminController.createTopic);
router.post('/research/papers', validateBody(createPaperSchema), adminController.createPaper);
router.post('/research/ideas', validateBody(createProjectIdeaSchema), adminController.createProjectIdea);

export default router;
