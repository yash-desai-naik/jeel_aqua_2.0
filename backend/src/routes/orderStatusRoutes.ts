import { Router } from 'express';
import { getAllOrderStatuses } from '../controllers/orderStatusController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Allow authenticated users to read statuses
router.use(authenticateToken);

/**
 * @swagger
 * /order-statuses:
 *   get:
 *     summary: Get all available order statuses
 *     tags: [Order Statuses]
 *     description: Retrieves a list of all possible statuses an order delivery can have.
 *     security: [{"bearerAuth": []}]
 *     responses:
 *       200:
 *         description: A list of order statuses.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrderStatus' # Assuming OrderStatus schema is defined in model
 *       401: { description: 'Unauthorized' }
 *       500: { description: 'Internal Server Error' }
 */
router.get('/', getAllOrderStatuses);

// Admin routes for managing statuses can be added later if required

export default router; 