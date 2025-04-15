import { Router } from 'express'
import { body, param } from 'express-validator'
import {
  getAllMeasures,
  getMeasureById,
  createMeasure,
  updateMeasure,
  deleteMeasure
} from '../controllers/measureController'
import { authenticateToken } from '../middleware/authMiddleware'
import { checkAdminRole } from '../middleware/roleMiddleware'
import { handleValidationErrors } from '../middleware/validationMiddleware'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Measures
 *   description: Management of product measurement units (e.g., Liter, Kg)
 */

// Middleware for all measure routes
router.use(authenticateToken)
router.use(checkAdminRole) // Assuming only admins manage measures

/**
 * @swagger
 * /measures:
 *   get:
 *     summary: Get all active measures
 *     tags: [Measures]
 *     security: [{"bearerAuth": []}]
 *     responses:
 *       200: { description: 'List of measures', content: { application/json: { schema: { type: array, items: { $ref: '#/components/schemas/Measure' } } } } }
 *       401: { description: 'Unauthorized' }
 *       403: { description: 'Forbidden' }
 *       500: { description: 'Internal Server Error' }
 */
router.get('/', getAllMeasures)

/**
 * @swagger
 * /measures:
 *   post:
 *     summary: Create a new measure
 *     tags: [Measures]
 *     security: [{"bearerAuth": []}]
 *     requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/MeasureInput' } } } }
 *     responses:
 *       201: { description: 'Measure created', content: { application/json: { schema: { properties: { message: {type: string}, id: {type: integer} } } } } }
 *       400: { description: 'Validation Error' }
 *       401: { description: 'Unauthorized' }
 *       403: { description: 'Forbidden' }
 *       500: { description: 'Internal Server Error' }
 */
router.post(
  '/',
  [
    body('title').isString().trim().notEmpty(),
    body('notes').optional().isString(),
    body('is_active').optional().isInt({ min: 0, max: 1 })
  ],
  handleValidationErrors,
  createMeasure
)

/**
 * @swagger
 * /measures/{id}:
 *   get:
 *     summary: Get a measure by ID
 *     tags: [Measures]
 *     security: [{"bearerAuth": []}]
 *     parameters: [ { $ref: '#/components/parameters/MeasureIdParam' } ]
 *     responses:
 *       200: { description: 'Measure data', content: { application/json: { schema: { $ref: '#/components/schemas/Measure' } } } }
 *       400: { description: 'Invalid ID' }
 *       401: { description: 'Unauthorized' }
 *       403: { description: 'Forbidden' }
 *       404: { description: 'Measure not found' }
 *       500: { description: 'Internal Server Error' }
 */
router.get('/:id', [param('id').isInt({ gt: 0 })], handleValidationErrors, getMeasureById)

/**
 * @swagger
 * /measures/{id}:
 *   patch:
 *     summary: Update a measure
 *     tags: [Measures]
 *     security: [{"bearerAuth": []}]
 *     parameters: [ { $ref: '#/components/parameters/MeasureIdParam' } ]
 *     requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/MeasureInput' } } } }
 *     responses:
 *       200: { description: 'Measure updated' }
 *       400: { description: 'Validation Error' }
 *       401: { description: 'Unauthorized' }
 *       403: { description: 'Forbidden' }
 *       404: { description: 'Measure not found' }
 *       500: { description: 'Internal Server Error' }
 */
router.patch(
  '/:id',
  [
    param('id').isInt({ gt: 0 }),
    body('title').optional().isString().trim().notEmpty(),
    body('notes').optional().isString(),
    body('is_active').optional().isInt({ min: 0, max: 1 })
  ],
  handleValidationErrors,
  updateMeasure
)

/**
 * @swagger
 * /measures/{id}:
 *   delete:
 *     summary: Delete a measure (Soft delete)
 *     tags: [Measures]
 *     security: [{"bearerAuth": []}]
 *     parameters: [ { $ref: '#/components/parameters/MeasureIdParam' } ]
 *     responses:
 *       200: { description: 'Measure deleted' }
 *       400: { description: 'Invalid ID or Measure in use' }
 *       401: { description: 'Unauthorized' }
 *       403: { description: 'Forbidden' }
 *       404: { description: 'Measure not found' }
 *       500: { description: 'Internal Server Error' }
 */
router.delete(
  '/:id',
  [param('id').isInt({ gt: 0 })],
  handleValidationErrors,
  deleteMeasure
)

export default router

/**
 * @swagger
 * components:
 *   parameters:
 *     MeasureIdParam:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: integer
 *       description: The measure ID
 */ 