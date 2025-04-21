import { Router } from 'express'
import { body, param } from 'express-validator'
import {
  getAllDeliveries,
  getDeliveryById,
  getDeliveriesByOrderId,
  getDeliveriesByDeliveryBoyId,
  createDelivery,
  updateDelivery
} from '../controllers/orderDeliveryController'
import { authenticateToken } from '../middleware/authMiddleware'
import { handleValidationErrors } from '../middleware/validationMiddleware'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Deliveries
 *   description: Management of order deliveries
 */

// Protect all delivery routes
router.use(authenticateToken)

/**
 * @swagger
 * /deliveries:
 *   get:
 *     summary: Get all delivery records (consider pagination)
 *     tags: [Deliveries]
 *     security: [{"bearerAuth": []}]
 *     parameters:
 *       - in: query
 *         name: orderId
 *         schema: { type: integer }
 *         description: Filter by Order ID
 *       - in: query
 *         name: deliveryBoyId
 *         schema: { type: integer }
 *         description: Filter by Delivery Boy ID
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *         description: Filter by delivery date (start)
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *         description: Filter by delivery date (end)
 *     responses:
 *       200: { description: 'List of deliveries', content: { application/json: { schema: { type: array, items: { $ref: '#/components/schemas/OrderDelivery' } } } } }
 *       401: { description: 'Unauthorized' }
 *       500: { description: 'Internal Server Error' }
 */
router.get('/', getAllDeliveries)

/**
 * @swagger
 * /deliveries:
 *   post:
 *     summary: Create a new delivery record
 *     tags: [Deliveries]
 *     security: [{"bearerAuth": []}]
 *     requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/OrderDeliveryInput' } } } }
 *     responses:
 *       201: { description: 'Delivery created', content: { application/json: { schema: { properties: { message: {type: string}, id: {type: integer} } } } } }
 *       400: { description: 'Validation Error' }
 *       401: { description: 'Unauthorized' }
 *       500: { description: 'Internal Server Error' }
 */
router.post('/', [
  body('order_id').isInt({ gt: 0 }),
  body('delivery_boy_id').isInt({ gt: 0 }),
  body('delivery_date').isISO8601().toDate(),
  body('qty_ordered').isInt({ gt: 0 }),
  body('total_amount').isFloat({ gt: -1 }), // Allow 0
  body('notes').optional({ checkFalsy: true }).isString()
], handleValidationErrors, createDelivery)

/**
 * @swagger
 * /deliveries/by-order/{orderId}:
 *   get:
 *     summary: Get deliveries for a specific order ID
 *     tags: [Deliveries]
 *     security: [{"bearerAuth": []}]
 *     parameters:
 *       - in: path         # Define parameter inline
 *         name: orderId    # Use correct name matching the path
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The ID of the order to fetch deliveries for.
 *     responses:
 *       200: { description: 'List of deliveries', content: { application/json: { schema: { type: array, items: { $ref: '#/components/schemas/OrderDelivery' } } } } }
 *       400: { description: 'Invalid Order ID' }
 *       401: { description: 'Unauthorized' }
 *       404: { description: 'Order not found (no deliveries, or order itself invalid)' } # Clarified 404
 *       500: { description: 'Internal Server Error' }
 */
router.get('/by-order/:orderId', [param('orderId').isInt({ gt: 0 })], handleValidationErrors, getDeliveriesByOrderId)

/**
 * @swagger
 * /deliveries/by-delivery-boy/{deliveryBoyId}:
 *   get:
 *     summary: Get deliveries assigned to a specific delivery boy ID
 *     tags: [Deliveries]
 *     security: [{"bearerAuth": []}]
 *     parameters: [ { $ref: '#/components/parameters/UserIdParam' } ] # Reuses User ID Param for deliveryBoyId
 *     responses:
 *       200: { description: 'List of deliveries', content: { application/json: { schema: { type: array, items: { $ref: '#/components/schemas/OrderDelivery' } } } } }
 *       400: { description: 'Invalid Delivery Boy ID' }
 *       401: { description: 'Unauthorized' }
 *       500: { description: 'Internal Server Error' }
 */
router.get('/by-delivery-boy/:deliveryBoyId', [param('deliveryBoyId').isInt({ gt: 0 })], handleValidationErrors, getDeliveriesByDeliveryBoyId)

/**
 * @swagger
 * /deliveries/{id}:
 *   get:
 *     summary: Get a specific delivery record by ID
 *     tags: [Deliveries]
 *     security: [{"bearerAuth": []}]
 *     parameters: [ { $ref: '#/components/parameters/DeliveryIdParam' } ]
 *     responses:
 *       200: { description: 'Delivery data', content: { application/json: { schema: { $ref: '#/components/schemas/OrderDelivery' } } } }
 *       400: { description: 'Invalid ID' }
 *       401: { description: 'Unauthorized' }
 *       404: { description: 'Delivery not found' }
 *       500: { description: 'Internal Server Error' }
 */
router.get('/:id', [param('id').isInt({ gt: 0 })], handleValidationErrors, getDeliveryById)

/**
 * @swagger
 * /deliveries/{id}:
 *   patch:
 *     summary: Update a delivery record (e.g., returned quantity, status)
 *     tags: [Deliveries]
 *     security: [{"bearerAuth": []}]
 *     parameters: [ { $ref: '#/components/parameters/DeliveryIdParam' } ]
 *     requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/OrderDeliveryUpdateInput' } } } }
 *     responses:
 *       200: { description: 'Delivery updated' }
 *       400: { description: 'Validation Error' }
 *       401: { description: 'Unauthorized' }
 *       403: { description: 'Forbidden' }
 *       404: { description: 'Delivery not found' }
 *       500: { description: 'Internal Server Error' }
 */
router.patch('/:id', [
  param('id').isInt({ gt: 0 }),
  body('delivery_boy_id').optional().isInt({ gt: 0 }),
  body('delivery_date').optional().isISO8601().toDate(),
  body('qty_return').optional().isInt({ min: 0 }),
  body('total_amount').optional().isFloat({ gt: -1 }),
  body('notes').optional({ checkFalsy: true }).isString()
], handleValidationErrors, updateDelivery)

// No DELETE route for deliveries for now?

export default router 

/**
 * @swagger
 * components:
 *   parameters:
 *     DeliveryIdParam:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: integer
 *       description: The delivery record ID
 */ 