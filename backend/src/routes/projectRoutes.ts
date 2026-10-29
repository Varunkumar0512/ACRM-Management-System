import { Router } from 'express';
import { projectController } from '../controllers/ProjectController.js';
import { authenticateUser } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { UserRole } from '../config/constants.js';
import { validateBody } from '../middleware/validate.js';
import {
  createProjectSchema,
  updateProjectSchema,
  updateProjectStatusSchema,
  createMilestoneSchema,
  updateMilestoneSchema,
  createCommentSchema,
  createReviewSchema,
  respondGuideSchema,
} from '../validators/projectValidator.js';

const router = Router();

router.use(authenticateUser);

router.post('/', validateBody(createProjectSchema), projectController.createProject);
router.get('/', projectController.listProjects);
router.get('/:id', projectController.getProjectWorkspace);
router.patch('/:id', validateBody(updateProjectSchema), projectController.updateProject);
router.patch('/:id/status', validateBody(updateProjectStatusSchema), projectController.updateStatus);

// Milestones
router.post('/:id/milestones', validateBody(createMilestoneSchema), projectController.addMilestone);
router.patch('/:id/milestones/:milestoneId', validateBody(updateMilestoneSchema), projectController.updateMilestone);
router.delete('/:id/milestones/:milestoneId', projectController.deleteMilestone);

// Comments
router.post('/:id/comments', validateBody(createCommentSchema), projectController.addComment);
router.patch('/:id/comments/:commentId/resolve', projectController.resolveComment);

// Reviews (Faculty guides or Administrator only)
router.post('/:id/reviews', requireRoles(UserRole.FACULTY, UserRole.ADMIN), validateBody(createReviewSchema), projectController.submitReview);

// Faculty guidance response (Faculty guides or Administrator only)
router.post('/:id/guide/respond', requireRoles(UserRole.FACULTY, UserRole.ADMIN), validateBody(respondGuideSchema), projectController.respondToGuideRequest);

// Documents metadata
router.post('/:id/documents', projectController.addDocumentMetadata);

// Discussions
router.post('/:id/discussions', projectController.sendDiscussion);

export default router;
