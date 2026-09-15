import { Router } from 'express';
import { supportController } from '../controllers/SupportController.js';
import { authenticateUser } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validate.js';
import { UserRole } from '../config/constants.js';
import {
  createSupportTicketSchema,
  replyTicketSchema,
  updateTicketStatusSchema,
} from '../validators/supportValidator.js';

const router = Router();

router.use(authenticateUser);

router.post('/', validateBody(createSupportTicketSchema), supportController.createTicket);
router.get('/', supportController.listTickets);
router.get('/:id', supportController.getTicket);
router.post('/:id/reply', validateBody(replyTicketSchema), supportController.replyTicket);
router.patch('/:id/status', requireRoles(UserRole.ADMIN), validateBody(updateTicketStatusSchema), supportController.updateStatus);

export default router;
