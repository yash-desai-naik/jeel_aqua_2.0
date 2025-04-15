import { Router } from 'express';
import { getAllOrderStatuses } from '../controllers/orderStatusController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Allow authenticated users to read statuses
router.use(authenticateToken);

router.get('/', getAllOrderStatuses);

// Admin routes for managing statuses can be added later if required

export default router; 