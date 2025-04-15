import { Router } from 'express'
import { getAllServices, getServiceById, createService, updateService, deleteService } from '../controllers/serviceController'
import { authenticateToken } from '../middleware/authMiddleware'
import { checkAdminRole } from '../middleware/roleMiddleware'
import { handleValidationErrors } from '../middleware/validationMiddleware'
import { body, param } from 'express-validator'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Management of products/services offered (e.g., Water Bottles)
 */

// Apply middleware to all routes in this file
router.use(authenticateToken)

/**
 * @swagger
 * /services:
 *   get:
 *     summary: Get all active services
 *     tags: [Services]
 *     security: [{"bearerAuth": []}]
 *     responses:
 *       200: { description: 'List of services', content: { application/json: { schema: { type: array, items: { $ref: '#/components/schemas/Service' } } } } }
 *       401: { description: 'Unauthorized' }
 *       500: { description: 'Internal Server Error' }
 */
router.get('/', getAllServices)

/**
 * @swagger
 * /services:
 *   post:
 *     summary: Create a new service (Admin only)
 *     tags: [Services]
 *     security: [{"bearerAuth": []}]
 *     requestBody: 
 *       required: true
 *       content:
 *         multipart/form-data: # Assuming image upload
 *           schema:
 *             $ref: '#/components/schemas/ServiceInput'
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceInput'
 *     responses:
 *       201: { description: 'Service created', content: { application/json: { schema: { properties: { message: {type: string}, id: {type: integer} } } } } }
 *       400: { description: 'Validation Error' }
 *       401: { description: 'Unauthorized' }
 *       403: { description: 'Forbidden' }
 *       500: { description: 'Internal Server Error' }
 */
router.post('/', checkAdminRole, [
    body('title').isString().trim().notEmpty(),
    body('qty').isFloat({ gt: 0 }),
    body('measure_id').isInt({ gt: 0 }),
    body('price').isFloat({ gt: 0 }),
    body('notes').optional().isString(),
    body('is_active').optional().isInt({ min: 0, max: 1 })
], handleValidationErrors, createService)

/**
 * @swagger
 * /services/{id}:
 *   get:
 *     summary: Get a service by ID
 *     tags: [Services]
 *     security: [{"bearerAuth": []}]
 *     parameters: [ { $ref: '#/components/parameters/ServiceIdParam' } ]
 *     responses:
 *       200: { description: 'Service data', content: { application/json: { schema: { $ref: '#/components/schemas/Service' } } } }
 *       400: { description: 'Invalid ID' }
 *       401: { description: 'Unauthorized' }
 *       404: { description: 'Service not found' }
 *       500: { description: 'Internal Server Error' }
 */
router.get('/:id', [param('id').isInt({ gt: 0 })], handleValidationErrors, getServiceById)

/**
 * @swagger
 * /services/{id}:
 *   patch:
 *     summary: Update a service (Admin only)
 *     tags: [Services]
 *     security: [{"bearerAuth": []}]
 *     parameters: [ { $ref: '#/components/parameters/ServiceIdParam' } ]
 *     requestBody: 
 *       required: true
 *       content:
 *         multipart/form-data: # Assuming image upload
 *           schema:
 *             $ref: '#/components/schemas/ServiceInput'
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceInput'
 *     responses:
 *       200: { description: 'Service updated' }
 *       400: { description: 'Validation Error' }
 *       401: { description: 'Unauthorized' }
 *       403: { description: 'Forbidden' }
 *       404: { description: 'Service not found' }
 *       500: { description: 'Internal Server Error' }
 */
router.patch('/:id', checkAdminRole, [
    param('id').isInt({ gt: 0 }),
    body('title').optional().isString().trim().notEmpty(),
    body('qty').optional().isFloat({ gt: 0 }),
    body('measure_id').optional().isInt({ gt: 0 }),
    body('price').optional().isFloat({ gt: 0 }),
    body('notes').optional().isString(),
    body('is_active').optional().isInt({ min: 0, max: 1 })
], handleValidationErrors, updateService)

/**
 * @swagger
 * /services/{id}:
 *   delete:
 *     summary: Delete a service (Admin only)
 *     tags: [Services]
 *     security: [{"bearerAuth": []}]
 *     parameters: [ { $ref: '#/components/parameters/ServiceIdParam' } ]
 *     responses:
 *       200: { description: 'Service deleted' }
 *       400: { description: 'Validation Error' }
 *       401: { description: 'Unauthorized' }
 *       403: { description: 'Forbidden' }
 *       404: { description: 'Service not found' }
 *       500: { description: 'Internal Server Error' }
 */
router.delete('/:id', checkAdminRole, [param('id').isInt({ gt: 0 })], handleValidationErrors, deleteService)

// Add other routes for CRUD operations later (DELETE)

export default router 