import { Router } from 'express';
import { noveltyController } from '../controllers/NoveltyController.js';
import { iprController } from '../controllers/IprController.js';
import { authenticateUser } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
  preliminaryScreeningSchema,
  noveltyChatSchema,
  noveltyAcknowledgeSchema,
  iprDisclosureCreateSchema,
  iprStatusUpdateSchema,
  iprCommentSchema,
  iprApplicationSchema,
} from '../validators/iprValidator.js';

import { requireRoles } from '../middleware/rbac.js';
import { UserRole } from '../config/constants.js';

const router = Router();

// All IPR routes require authenticated institutional session
router.use(authenticateUser);

// Novelty Screening
router.post('/novelty/screen', validateBody(preliminaryScreeningSchema), noveltyController.runScreening);
router.post('/novelty/chat', validateBody(noveltyChatSchema), noveltyController.processChatMessage);
router.post('/novelty/:id/acknowledge', validateBody(noveltyAcknowledgeSchema), noveltyController.acknowledgeScreening);
router.get('/novelty/history/:projectId', noveltyController.getProjectScreenings);
router.get('/novelty/:id', noveltyController.getScreeningById);

// IPR Disclosures & Review
router.post('/disclosures', validateBody(iprDisclosureCreateSchema), iprController.submitDisclosure);
router.get('/disclosures', iprController.listDisclosures);
router.get('/disclosures/:id', iprController.getDisclosureById);
router.patch('/disclosures/:id/status', requireRoles(UserRole.FACULTY, UserRole.ADMIN), validateBody(iprStatusUpdateSchema), iprController.updateStatus);
router.post('/disclosures/:id/comments', validateBody(iprCommentSchema), iprController.addComment);
router.patch('/disclosures/:id/comments/:commentId/resolve', iprController.resolveComment);
router.post('/disclosures/:id/documents', iprController.addDocument);
router.post('/disclosures/:id/applications', requireRoles(UserRole.FACULTY, UserRole.ADMIN), validateBody(iprApplicationSchema), iprController.recordApplication);

export default router;
