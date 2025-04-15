import { Router } from 'express'
import {
  getAllSocieties,
  getSocietyById,
  getSocietiesByZoneId,
  createSociety,
  updateSociety,
  deleteSociety
} from '../controllers/societyController'
import { authenticateToken } from '../middleware/authMiddleware'
import { checkAdminRole } from '../middleware/roleMiddleware'
import { handleValidationErrors } from '../middleware/validationMiddleware'
import { body, param } from 'express-validator'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Societies
 *   description: Management of societies within zones
 */

// Apply middleware to all routes in this file
router.use(authenticateToken)
router.use(checkAdminRole) // Assuming only admins manage societies

/**
 * @swagger
 * /societies:
 *   get:
 *     summary: Get all active societies (optionally filtered by zone)
 *     tags: [Societies]
 *     security: [{"bearerAuth": []}]
 *     parameters:
 *       - in: query
 *         name: zoneId
 *         schema: { type: integer }
 *         required: false
 *         description: Filter societies by zone ID.
 *     responses:
 *       200: { description: 'List of societies', content: { application/json: { schema: { type: array, items: { $ref: '#/components/schemas/Society' } } } } }
 *       401: { description: 'Unauthorized' }
 *       403: { description: 'Forbidden' }
 *       500: { description: 'Internal Server Error' }
 */
router.get('/', getAllSocieties)

/**
 * @swagger
 * /societies:
 *   post:
 *     summary: Create a new society
 *     tags: [Societies]
 *     security: [{"bearerAuth": []}]
 *     requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/SocietyInput' } } } }
 *     responses:
 *       201: { description: 'Society created', content: { application/json: { schema: { properties: { message: {type: string}, id: {type: integer} } } } } }
 *       400: { description: 'Validation Error' }
 *       401: { description: 'Unauthorized' }
 *       403: { description: 'Forbidden' }
 *       500: { description: 'Internal Server Error' }
 */
router.post('/', [
  body('name').isString().trim().notEmpty(),
  body('zone_id').isInt({ gt: 0 }),
  body('is_active').optional().isInt({ min: 0, max: 1 })
], handleValidationErrors, createSociety)

// GET /api/societies/by-zone/:zoneId
// Note: Changed path to avoid conflict with /:id
router.get('/by-zone/:zoneId', getSocietiesByZoneId)

/**
 * @swagger
 * /societies/{id}:
 *   get:
 *     summary: Get a society by ID
 *     tags: [Societies]
 *     security: [{"bearerAuth": []}]
 *     parameters: [ { $ref: '#/components/parameters/SocietyIdParam' } ]
 *     responses:
 *       200: { description: 'Society data', content: { application/json: { schema: { $ref: '#/components/schemas/Society' } } } }
 *       400: { description: 'Invalid ID' }
 *       401: { description: 'Unauthorized' }
 *       403: { description: 'Forbidden' }
 *       404: { description: 'Society not found' }
 *       500: { description: 'Internal Server Error' }
 */
router.get('/:id', [param('id').isInt({ gt: 0 })], handleValidationErrors, getSocietyById)

/**
 * @swagger
 * /societies/{id}:
 *   patch:
 *     summary: Update a society
 *     tags: [Societies]
 *     security: [{"bearerAuth": []}]
 *     parameters: [ { $ref: '#/components/parameters/SocietyIdParam' } ]
 *     requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/SocietyInput' } } } }
 *     responses:
 *       200: { description: 'Society updated' }
 *       400: { description: 'Validation Error' }
 *       401: { description: 'Unauthorized' }
 *       403: { description: 'Forbidden' }
 *       404: { description: 'Society not found' }
 *       500: { description: 'Internal Server Error' }
 */
router.patch('/:id', [
  param('id').isInt({ gt: 0 }),
  body('name').optional().isString().trim().notEmpty(),
  body('zone_id').optional().isInt({ gt: 0 }),
  body('is_active').optional().isInt({ min: 0, max: 1 })
], handleValidationErrors, updateSociety)

/**
 * @swagger
 * /societies/{id}:
 *   delete:
 *     summary: Delete a society (Soft delete)
 *     tags: [Societies]
 *     security: [{"bearerAuth": []}]
 *     parameters: [ { $ref: '#/components/parameters/SocietyIdParam' } ]
 *     responses:
 *       200: { description: 'Society deleted' }
 *       400: { description: 'Invalid ID or Society in use' }
 *       401: { description: 'Unauthorized' }
 *       403: { description: 'Forbidden' }
 *       404: { description: 'Society not found' }
 *       500: { description: 'Internal Server Error' }
 */
router.delete('/:id', [param('id').isInt({ gt: 0 })], handleValidationErrors, deleteSociety)

// Add other routes for CRUD operations later (DELETE)

export default router

/**
 * @swagger
 * components:
 *   parameters:
 *     SocietyIdParam:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: integer
 *       description: The society ID
 */ 