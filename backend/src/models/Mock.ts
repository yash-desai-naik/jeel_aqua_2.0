/**
 * @openapi
 * components:
 *   schemas:
 *     Mock:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The mock ID.
 *           example: 1
 *         name:
 *           type: string
 *           description: The name of the mock item.
 *           example: Test Mock Item
 *       required:
 *         - id
 *         - name
 */
export interface IMock {
  id: number;
  name: string;
} 