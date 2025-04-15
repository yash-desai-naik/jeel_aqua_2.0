/**
 * @swagger
 * components:
 *   schemas:
 *     AuthLoginInput:
 *       type: object
 *       required:
 *         - phone
 *         - password
 *       properties:
 *         phone:
 *           type: string
 *           description: User's registered phone number.
 *           example: "0000000000"
 *         password:
 *           type: string
 *           format: password
 *           description: User's password.
 *           example: admin123
 *     AuthLoginResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Login successful
 *         token:
 *           type: string
 *           description: JWT token for subsequent requests.
 *         user:
 *           $ref: '#/components/schemas/User' # Reference the User schema
 */
// No specific interface needed here as login logic is in the controller 