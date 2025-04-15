import { Router, Request, Response } from 'express'
import { IMock } from '../models/Mock'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Mocks
 *   description: Mock endpoints for testing
 */

/**
 * @swagger
 * /mocks:
 *   get:
 *     summary: Get a list of mock items
 *     tags: [Mocks] 
 *     description: Returns a simple list containing one mock item.
 *     responses:
 *       200:
 *         description: A list of mock items.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Mock' # Reference the Mock schema
 *       400:
 *         description: Bad Request - Invalid parameters
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 */
router.get('/', (req: Request, res: Response) => {
  const mockData: IMock[] = [
    { id: 1, name: 'Test Mock Item' }
  ]
  res.json(mockData)
})

export default router 