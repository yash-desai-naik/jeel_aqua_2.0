import { Router } from 'express'
import {
  getMyProfile,
  getUserById,
  getAllUsers,
  updateMyProfile,
  changeMyPassword,
  deleteUser,
  getCurrentUser,
  createUser,
  updateUser
} from '../controllers/userController'
import { authenticateToken } from '../middleware/authMiddleware'
import { checkAdminRole } from '../middleware/roleMiddleware'
import { handleValidationErrors } from '../middleware/validationMiddleware'
import { body, param } from 'express-validator'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and profile operations
 */

/**
 * @swagger
 * components:
 *   parameters:
 *     UserIdParam:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: integer
 *         minimum: 1
 *       description: The user ID
 */

// Apply authentication middleware to all user routes
router.use(authenticateToken)

// --- Read --- 
/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get the profile of the currently logged-in user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401: { description: 'Unauthorized' }
 *       404: { description: 'User profile not found' }
 *       500: { description: 'Internal server error' }
 */
router.get('/me', getCurrentUser)
// Get a specific user by ID (likely admin only - check in controller)
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Retrieve a specific user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdParam'
 *     responses:
 *       200:
 *         description: User data found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad Request (Invalid ID)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin Required)
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', checkAdminRole, [param('id').isInt({ gt: 0 })], handleValidationErrors, getUserById)
// Get all users (likely admin only - check/implement in controller)
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve a list of all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: roleId
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter users by role ID.
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401: { description: 'Unauthorized' }
 *       403: { description: 'Forbidden (Admin Required)' }
 *       500: { description: 'Internal server error' }
 */
router.get('/', checkAdminRole, getAllUsers)

// --- Update ---
// Update own profile
router.patch('/me', updateMyProfile)
// Change own password
router.post('/me/change-password', changeMyPassword)

// --- Delete ---
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user by ID (Soft delete) (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The user ID to delete
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User deleted successfully"
 *       400:
 *         description: Bad Request (Invalid ID)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid user ID"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin Required)
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', checkAdminRole, [param('id').isInt({ gt: 0 })], handleValidationErrors, deleteUser)

// --- Admin Protected Routes (Example - Apply checkAdminRole) ---
// router.use(checkAdminRole)

// --- Admin Protected Routes ---
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInputRequired'
 *     responses:
 *       201:
 *         description: User created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 id: { type: integer }
 *       400: { description: 'Bad Request (Validation Error or Duplicate Phone/Invalid ID)' }
 *       401: { description: 'Unauthorized' }
 *       403: { description: 'Forbidden (Admin Required)' }
 *       500: { description: 'Internal server error' }
 */
router.post('/', checkAdminRole, [
  body('firstname').isString().trim().notEmpty().withMessage('First name is required.'),
  body('lastname').isString().trim().notEmpty().withMessage('Last name is required.'),
  body('phone').isString().trim().isLength({ min: 10, max: 15 }).withMessage('Valid phone number is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Valid email is required if provided.'),
  body('role_id').isInt({ gt: 0 }).withMessage('Valid role_id is required.'),
  body('city').isString().trim().notEmpty().withMessage('City is required.'),
  body('state').isString().trim().notEmpty().withMessage('State is required.'),
  body('address_1').optional().isString().trim(),
  body('address_2').optional().isString().trim(),
  body('zone_id').optional({ checkFalsy: true }).isInt({ gt: 0 }).withMessage('Valid zone_id is required if provided.'),
  body('society_id').optional({ checkFalsy: true }).isInt({ gt: 0 }).withMessage('Valid society_id is required if provided.'),
  body('is_active').optional().isInt({ min: 0, max: 1 }).withMessage('is_active must be 0 or 1 if provided.'),
  body('deposit').optional({ checkFalsy: true }).isNumeric().withMessage('Deposit must be a number if provided.'),
  body('due_amount').optional({ checkFalsy: true }).isNumeric().withMessage('Due amount must be a number if provided.')
], handleValidationErrors, createUser)
/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update a user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInputOptional'
 *     responses:
 *       200:
 *         description: User updated successfully.
 *       400: { description: 'Bad Request (Validation Error or Duplicate Phone/Invalid ID)' }
 *       401: { description: 'Unauthorized' }
 *       403: { description: 'Forbidden (Admin Required)' }
 *       404: { description: 'User not found' }
 *       500: { description: 'Internal server error' }
 */
router.patch('/:id', checkAdminRole, [
  param('id').isInt({ gt: 0 }).withMessage('Valid User ID parameter is required.'),
  body('firstname').optional().isString().trim().notEmpty().withMessage('First name cannot be empty.'),
  body('lastname').optional().isString().trim().notEmpty().withMessage('Last name cannot be empty.'),
  body('phone').optional().isString().trim().isLength({ min: 10, max: 15 }).withMessage('Valid phone number is required.'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Valid email is required.'),
  body('city').optional().isString().trim().notEmpty().withMessage('City cannot be empty.'),
  body('state').optional().isString().trim().notEmpty().withMessage('State cannot be empty.'),
  body('address_1').optional().isString().trim(),
  body('address_2').optional().isString().trim(),
  body('zone_id').optional({ checkFalsy: true }).isInt({ gt: 0 }).withMessage('Valid zone_id is required.'),
  body('society_id').optional({ checkFalsy: true }).isInt({ gt: 0 }).withMessage('Valid society_id is required.'),
  body('is_active').optional().isInt({ min: 0, max: 1 }).withMessage('is_active must be 0 or 1.'),
  body('deposit').optional({ checkFalsy: true }).isNumeric().withMessage('Deposit must be a number.'),
  body('due_amount').optional({ checkFalsy: true }).isNumeric().withMessage('Due amount must be a number.')
], handleValidationErrors, updateUser)

export default router 