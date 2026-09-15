import { Router } from 'express';
import { searchController } from '../controllers/SearchController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

router.use(authenticateUser);
router.get('/', searchController.globalSearch);

export default router;
