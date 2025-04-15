import { Router } from 'express';
import { body, param } from 'express-validator'; // Import validation functions
import {
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole
} from '../controllers/roleController';
import { authenticateToken } from '../middleware/authMiddleware';
import { checkAdminRole } from '../middleware/roleMiddleware'; // Import the middleware
import { handleValidationErrors } from '../middleware/validationMiddleware'; // Import error handler

const router = Router();

// Protect all role management routes - Only Admins
router.use(authenticateToken);
router.use(checkAdminRole); // Apply admin check middleware here

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: API for managing user roles (Admin access required)
 */

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Retrieve a list of all active roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of active roles.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
 *       401: { description: 'Unauthorized' }
 *       403: { description: 'Forbidden (Admin Required)' }
 *       500: { description: 'Internal server error' }
 */
router.get('/', getAllRoles);       // Get all roles

/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoleInput'
 *     responses:
 *       201:
 *         description: Role created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 id: { type: integer }
 *       400: { description: 'Bad Request (Validation Error)' }
 *       401: { description: 'Unauthorized' }
 *       403: { description: 'Forbidden (Admin Required)' }
 *       409: { description: 'Conflict (Role name exists)' }
 *       500: { description: 'Internal server error' }
 */
router.post(
    '/',
    [
        body('rolename', 'Rolename is required and must be a non-empty string').isString().trim().notEmpty()
    ],
    handleValidationErrors,
    createRole
);

/**
 * @swagger
 * /roles/{id}:
 *   get:
 *     summary: Get a specific role by ID
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the role to get.
 *     responses:
 *       200:
 *         description: Role data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 *       400: { description: 'Bad Request (Invalid ID)' }
 *       401: { description: 'Unauthorized' }
 *       403: { description: 'Forbidden (Admin Required)' }
 *       404: { description: 'Role not found' }
 *       500: { description: 'Internal server error' }
 */
router.get(
    '/:id',
    [
        param('id', 'Invalid Role ID parameter').isInt({ gt: 0 })
    ],
    handleValidationErrors,
    getRoleById
);

/**
 * @swagger
 * /roles/{id}:
 *   patch:
 *     summary: Update a role by ID
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the role to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoleInput' # Can reuse input schema
 *     responses:
 *       200:
 *         description: Role updated successfully.
 *       400: { description: 'Bad Request (Validation Error)' }
 *       401: { description: 'Unauthorized' }
 *       403: { description: 'Forbidden (Admin Required)' }
 *       404: { description: 'Role not found' }
 *       409: { description: 'Conflict (Role name exists)' }
 *       500: { description: 'Internal server error' }
 */
router.patch(
    '/:id',
    [
        param('id', 'Invalid Role ID parameter').isInt({ gt: 0 }),
        body('rolename', 'Rolename must be a non-empty string').optional().isString().trim().notEmpty(),
        body('is_active', 'is_active must be 0 or 1').optional().isInt({ min: 0, max: 1 })
    ],
    handleValidationErrors,
    updateRole
);

/**
 * @swagger
 * /roles/{id}:
 *   delete:
 *     summary: Delete a role by ID (Soft delete)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the role to delete.
 *     responses:
 *       200:
 *         description: Role deleted successfully.
 *       400: { description: 'Bad Request (Invalid ID or Role in use)' }
 *       401: { description: 'Unauthorized' }
 *       403: { description: 'Forbidden (Admin Required)' }
 *       404: { description: 'Role not found' }
 *       500: { description: 'Internal server error' }
 */
router.delete(
    '/:id',
    [
        param('id', 'Invalid Role ID parameter').isInt({ gt: 0 })
    ],
    handleValidationErrors,
    deleteRole
);

export default router; 