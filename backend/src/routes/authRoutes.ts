import { Router } from 'express'
import { body } from 'express-validator'
import { login } from '../controllers/authController'
import { handleValidationErrors } from '../middleware/validationMiddleware'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User login and authentication
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthLoginInput'
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token and user info.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthLoginResponse'
 *       400:
 *         description: Bad Request (Validation Error)
 *       401:
 *         description: Unauthorized (Invalid credentials)
 *       500:
 *         description: Internal server error
 */
router.post(
    '/login',
    [
        // Validate phone: must be a string, potentially check length/format
        body('phone', 'Phone number is required and must be valid')
            .isString()
            .trim()
            .notEmpty()
            .isLength({ min: 10, max: 15 }), // Example length check
        // Validate password: must exist and be non-empty
        body('password', 'Password is required').exists().notEmpty()
    ],
    handleValidationErrors, // Apply the error handler middleware
    login // Proceed to controller if validation passes
)

// Add other auth routes later (e.g., /register, /logout)

export default router 