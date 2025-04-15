import { Router } from 'express'
import { body, param } from 'express-validator'
import { getAllZones, getZoneById, createZone, updateZone, deleteZone } from '../controllers/zoneController'
import { authenticateToken } from '../middleware/authMiddleware'
import { checkAdminRole } from '../middleware/roleMiddleware'
import { handleValidationErrors } from '../middleware/validationMiddleware'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Zones
 *   description: Management of delivery zones
 */

// Middleware for all zone routes
router.use(authenticateToken)
router.use(checkAdminRole) // Assuming only admins manage zones

/**
 * @swagger
 * /zones:
 *   get:
 *     summary: Get all active zones
 *     tags: [Zones]
 *     security: [{"bearerAuth": []}]
 *     responses:
 *       200: { description: 'List of zones', content: { application/json: { schema: { type: array, items: { $ref: '#/components/schemas/Zone' } } } } }
 *       401: { description: 'Unauthorized' }
 *       403: { description: 'Forbidden' }
 *       500: { description: 'Internal Server Error' }
 */
router.get('/', getAllZones)

/**
 * @swagger
 * /zones:
 *   post:
 *     summary: Create a new zone
 *     tags: [Zones]
 *     security: [{"bearerAuth": []}]
 *     requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/ZoneInput' } } } }
 *     responses:
 *       201: { description: 'Zone created', content: { application/json: { schema: { properties: { message: {type: string}, id: {type: integer} } } } } }
 *       400: { description: 'Validation Error' }
 *       401: { description: 'Unauthorized' }
 *       403: { description: 'Forbidden' }
 *       500: { description: 'Internal Server Error' }
 */
router.post(
    '/',
    [
        body('title').isString().trim().notEmpty(),
        body('from_area').optional().isString(),
        body('to_area').optional().isString(),
        body('is_active').optional().isInt({ min: 0, max: 1 })
    ],
    handleValidationErrors,
    createZone
)

/**
 * @swagger
 * /zones/{id}:
 *   get:
 *     summary: Get a zone by ID
 *     tags: [Zones]
 *     security: [{"bearerAuth": []}]
 *     parameters: [ { $ref: '#/components/parameters/ZoneIdParam' } ]
 *     responses:
 *       200: { description: 'Zone data', content: { application/json: { schema: { $ref: '#/components/schemas/Zone' } } } }
 *       400: { description: 'Invalid ID' }
 *       401: { description: 'Unauthorized' }
 *       403: { description: 'Forbidden' }
 *       404: { description: 'Zone not found' }
 *       500: { description: 'Internal Server Error' }
 */
router.get(
    '/:id',
    [param('id').isInt({ gt: 0 })],
    handleValidationErrors,
    getZoneById
)

/**
 * @swagger
 * /zones/{id}:
 *   patch:
 *     summary: Update a zone
 *     tags: [Zones]
 *     security: [{"bearerAuth": []}]
 *     parameters: [ { $ref: '#/components/parameters/ZoneIdParam' } ]
 *     requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/ZoneInput' } } } }
 *     responses:
 *       200: { description: 'Zone updated' }
 *       400: { description: 'Validation Error' }
 *       401: { description: 'Unauthorized' }
 *       403: { description: 'Forbidden' }
 *       404: { description: 'Zone not found' }
 *       500: { description: 'Internal Server Error' }
 */
router.patch(
    '/:id',
    [
        param('id').isInt({ gt: 0 }),
        body('title').optional().isString().trim().notEmpty(),
        body('from_area').optional().isString(),
        body('to_area').optional().isString(),
        body('is_active').optional().isInt({ min: 0, max: 1 })
    ],
    handleValidationErrors,
    updateZone
)

/**
 * @swagger
 * /zones/{id}:
 *   delete:
 *     summary: Delete a zone (Soft delete)
 *     tags: [Zones]
 *     security: [{"bearerAuth": []}]
 *     parameters: [ { $ref: '#/components/parameters/ZoneIdParam' } ]
 *     responses:
 *       200: { description: 'Zone deleted' }
 *       400: { description: 'Invalid ID or Zone in use' }
 *       401: { description: 'Unauthorized' }
 *       403: { description: 'Forbidden' }
 *       404: { description: 'Zone not found' }
 *       500: { description: 'Internal Server Error' }
 */
router.delete(
    '/:id',
    [param('id').isInt({ gt: 0 })],
    handleValidationErrors,
    deleteZone
)

export default router 

/**
 * @swagger
 * components:
 *   parameters:
 *     ZoneIdParam:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: integer
 *       description: The zone ID
 */ 