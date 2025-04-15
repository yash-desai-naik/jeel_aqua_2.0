import { Router } from 'express'
import { body, param } from 'express-validator'
import {
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  createOrder,
  updateOrder,
  deleteOrder
} from '../controllers/orderController'
import { authenticateToken } from '../middleware/authMiddleware'
import { handleValidationErrors } from '../middleware/validationMiddleware'
// import { checkAdminRole } from '../middleware/roleMiddleware'; // Role check might be needed for update/delete

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Management of customer orders
 */

// Protect all order routes
router.use(authenticateToken)

// GET /api/orders
router.get('/', getAllOrders)

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order for the logged-in user
 *     tags: [Orders]
 *     security: [{"bearerAuth": []}]
 *     requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/OrderInput' } } } }
 *     responses:
 *       201: { description: 'Order created', content: { application/json: { schema: { properties: { message: {type: string}, id: {type: integer} } } } } }
 *       400: { description: 'Validation Error' }
 *       401: { description: 'Unauthorized' }
 *       500: { description: 'Internal Server Error' }
 */
router.post(
  '/',
  [
    body('service_id').isInt({ gt: 0 }).withMessage('Valid service_id is required.'),
    body('quantity').isInt({ gt: 0 }).withMessage('Quantity must be a positive integer.'),
    body('discount').optional().isFloat({ min: 0 }).withMessage('Discount must be a non-negative number.'),
    body('notes').optional({ checkFalsy: true }).isString()
  ],
  handleValidationErrors,
  createOrder
)

/**
 * @swagger
 * /orders/user/{userId}:
 *   get:
 *     summary: Get all orders for a specific user ID
 *     tags: [Orders]
 *     security: [{"bearerAuth": []}]
 *     parameters: [ { $ref: '#/components/parameters/UserIdParam' } ] # Reuses user ID param
 *     responses:
 *       200: { description: 'List of orders', content: { application/json: { schema: { type: array, items: { $ref: '#/components/schemas/Order' } } } } }
 *       400: { description: 'Invalid User ID' }
 *       401: { description: 'Unauthorized' }
 *       403: { description: 'Forbidden (Admin or matching user required)' }
 *       500: { description: 'Internal Server Error' }
 */
router.get(
  '/user/:userId',
  [
    param('userId').isInt({ gt: 0 }).withMessage('Invalid User ID')
  ],
  handleValidationErrors,
  getOrdersByUserId
)

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get an order by ID
 *     tags: [Orders]
 *     security: [{"bearerAuth": []}]
 *     parameters: [ { $ref: '#/components/parameters/OrderIdParam' } ]
 *     responses:
 *       200: { description: 'Order data', content: { application/json: { schema: { $ref: '#/components/schemas/Order' } } } }
 *       400: { description: 'Invalid ID' }
 *       401: { description: 'Unauthorized' }
 *       403: { description: 'Forbidden (if user check implemented)' }
 *       404: { description: 'Order not found' }
 *       500: { description: 'Internal Server Error' }
 */
router.get(
  '/:id',
  [
    param('id').isInt({ gt: 0 }).withMessage('Invalid Order ID')
  ],
  handleValidationErrors,
  getOrderById
)

/**
 * @swagger
 * /orders/{id}:
 *   patch:
 *     summary: Update an order (e.g., quantity, discount)
 *     tags: [Orders]
 *     security: [{"bearerAuth": []}]
 *     parameters: [ { $ref: '#/components/parameters/OrderIdParam' } ]
 *     requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/OrderUpdateInput' } } } }
 *     responses:
 *       200: { description: 'Order updated' }
 *       400: { description: 'Validation Error or Invalid ID' }
 *       401: { description: 'Unauthorized' }
 *       403: { description: 'Forbidden (Admin or user owner required)' }
 *       404: { description: 'Order not found' }
 *       500: { description: 'Internal Server Error' }
 */
router.patch(
  '/:id',
  // Add checkAdminRole or other check if needed
  [
    param('id').isInt({ gt: 0 }).withMessage('Invalid Order ID'),
    body('quantity').optional().isInt({ gt: 0 }).withMessage('Quantity must be a positive integer.'),
    body('discount').optional().isFloat({ min: 0 }).withMessage('Discount must be non-negative.'),
    body('notes').optional({ checkFalsy: true }).isString()
  ],
  handleValidationErrors,
  updateOrder
)

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Delete an order (Soft delete - requires DB schema update)
 *     tags: [Orders]
 *     security: [{"bearerAuth": []}]
 *     parameters: [ { $ref: '#/components/parameters/OrderIdParam' } ]
 *     responses:
 *       200: { description: 'Order deleted' }
 *       400: { description: 'Invalid ID or Delete not supported by schema' }
 *       401: { description: 'Unauthorized' }
 *       403: { description: 'Forbidden (Admin required)' }
 *       404: { description: 'Order not found' }
 *       500: { description: 'Internal Server Error' }
 */
router.delete(
  '/:id',
  // Add checkAdminRole if needed
  [
    param('id').isInt({ gt: 0 }).withMessage('Invalid Order ID')
  ],
  handleValidationErrors,
  deleteOrder
)

// Add other routes for CRUD operations later (PUT, DELETE)

export default router 

/**
 * @swagger
 * components:
 *   parameters:
 *     OrderIdParam:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: integer
 *       description: The order ID
 */ 