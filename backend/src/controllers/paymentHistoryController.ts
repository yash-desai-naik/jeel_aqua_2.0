import { Request, Response } from 'express'
import { PaymentHistory } from '../models/PaymentHistory'
import { AuthenticatedRequest } from '../middleware/authMiddleware'
import { IPaymentHistory } from '../models/PaymentHistory'

// Get all payment records (add filters/pagination later)
export const getAllPaymentHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    // TODO: Add filtering (date, buyer) & pagination
    const history = await PaymentHistory.findAll()
    res.status(200).json(history)
  } catch (error) {
    console.error('Error fetching all payment history:', error)
    res.status(500).json({ message: 'Failed to fetch payment history', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}

// Get payment record by ID
export const getPaymentHistoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid payment history ID' })
      return
    }
    const record = await PaymentHistory.findById(id)
    if (record) {
      res.status(200).json(record)
    } else {
      res.status(404).json({ message: 'Payment record not found' })
    }
  } catch (error) {
    console.error('Error fetching payment history by ID:', error)
    res.status(500).json({ message: 'Failed to fetch payment record', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}

// Get payment history for a specific buyer (customer)
export const getPaymentHistoryByBuyerId = async (req: Request, res: Response): Promise<void> => {
  try {
    const buyerId = parseInt(req.params.buyerId, 10)
    if (isNaN(buyerId)) {
      res.status(400).json({ message: 'Invalid buyer ID' })
      return
    }

    // Optional: Check if the requesting user is the buyer or an admin
    // const requestingUser = (req as AuthenticatedRequest).user;
    // if (requestingUser?.userId !== buyerId && requestingUser?.roleId !== ADMIN_ROLE_ID) { ... }

    const history = await PaymentHistory.findByBuyerId(buyerId)
    res.status(200).json(history)
  } catch (error) {
    console.error('Error fetching payment history by Buyer ID:', error)
    res.status(500).json({ message: 'Failed to fetch buyer payment history', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}

// Create a new payment record
export const createPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  // Input validation (add more robust validation later, e.g., using Joi or Zod)
  const { buyer_id, payment_mode, payment_received, payment_due, notes } = req.body

  if (buyer_id === undefined || !payment_mode || payment_received === undefined || payment_due === undefined) {
    res.status(400).json({ message: 'Missing required payment fields (buyer_id, payment_mode, payment_received, payment_due)' })
    return
  }

  // Get the ID of the user recording the payment from the authenticated token
  const payment_received_by = req.user?.userId // Assuming userId in token corresponds to tbl_users.id

  if (!payment_received_by) {
    // This shouldn't happen if authenticateToken middleware is working correctly
    res.status(401).json({ message: 'Unauthorized: Could not identify user recording payment.' })
    return
  }

  try {
    const newPaymentData: Omit<IPaymentHistory, 'id' | 'created_at'> = {
      buyer_id: Number(buyer_id),
      payment_mode,
      payment_received_by: Number(payment_received_by),
      payment_received: Number(payment_received),
      payment_due: Number(payment_due),
      notes: notes || null
    }

    const newPaymentId = await PaymentHistory.create(newPaymentData)
    res.status(201).json({ message: 'Payment recorded successfully', id: newPaymentId })
  } catch (error) {
    console.error('Error creating payment record:', error)
    res.status(500).json({ message: 'Failed to record payment', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}

// Add functions for CRUD operations later (create) 