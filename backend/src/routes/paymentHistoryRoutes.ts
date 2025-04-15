import { Router } from 'express'
import { body, param } from 'express-validator'
import {
  getAllPaymentHistory,
  getPaymentHistoryById,
  getPaymentHistoryByBuyerId,
  createPayment
} from '../controllers/paymentHistoryController'
import { authenticateToken } from '../middleware/authMiddleware'
import { handleValidationErrors } from '../middleware/validationMiddleware'

const router = Router()

// Protect all payment history routes
router.use(authenticateToken)

// GET /api/payments
router.get('/', getAllPaymentHistory)

// GET /api/payments/:id
router.get(
  '/:id',
  [param('id', 'Invalid Payment ID').isInt({ gt: 0 })],
  handleValidationErrors,
  getPaymentHistoryById
)

// GET /api/payments/by-buyer/:buyerId
router.get(
  '/by-buyer/:buyerId',
  [param('buyerId', 'Invalid Buyer ID').isInt({ gt: 0 })],
  handleValidationErrors,
  getPaymentHistoryByBuyerId
)

// POST /api/payments
router.post(
  '/',
  [
    body('buyer_id').isInt({ gt: 0 }).withMessage('Valid buyer_id is required.'),
    body('payment_mode')
      .isIn(['cash', 'cheque', 'paytm', 'gpay', 'phonepe', 'netbanking'])
      .withMessage('Invalid payment_mode.'),
    body('payment_received').isFloat({ gt: 0 }).withMessage('Payment received must be a positive number.'),
    body('notes').optional({ checkFalsy: true }).isString()
  ],
  handleValidationErrors,
  createPayment
)

// Add other routes for CRUD operations later (POST to create payment record)

export default router 