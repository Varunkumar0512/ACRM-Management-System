import { Router } from 'express';
import { researchController } from '../controllers/ResearchController.js';
import { authenticateUser } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { saveItemSchema } from '../validators/researchValidator.js';

const router = Router();

// Publicly browseable research taxonomy
router.get('/domains', researchController.listDomains);
router.get('/topics', researchController.listTopics);
router.get('/papers', researchController.listPapers);
router.get('/papers/:id', researchController.getPaperDetails);
router.get('/ideas', researchController.listProjectIdeas);

// Authenticated actions
router.use(authenticateUser);
router.post('/saved', validateBody(saveItemSchema), researchController.toggleSaved);
router.get('/saved', researchController.getSaved);
router.get('/recommendations', researchController.getRecommendations);

export default router;
