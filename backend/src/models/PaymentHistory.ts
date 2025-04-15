import { RowDataPacket, OkPacket } from 'mysql2/promise'
import pool from '../config/db'

/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentHistory:
 *       type: object
 *       properties:
 *         id: { type: integer, readOnly: true }
 *         buyer_id: { type: integer }
 *         payment_mode: { type: string, enum: [cash, cheque, paytm, gpay, phonepe, netbanking] }
 *         payment_received_by: { type: integer, description: "User ID of employee/admin who received payment" }
 *         payment_received: { type: number, format: double }
 *         payment_due: { type: number, format: double, description: "Due amount *at the time of this payment* (may need clarification)" }
 *         notes: { type: string, nullable: true }
 *         created_at: { type: string, format: date-time, readOnly: true }
 *     PaymentHistoryInput:
 *       type: object
 *       required:
 *         - buyer_id
 *         - payment_mode
 *         - payment_received
 *       properties:
 *         buyer_id: { type: integer }
 *         payment_mode: { type: string, enum: [cash, cheque, paytm, gpay, phonepe, netbanking] }
 *         payment_received: { type: number, format: double }
 *         notes: { type: string }
 *         # payment_due is usually calculated or read-only
 */

// Define allowed payment modes based on ENUM in schema
type PaymentMode = 'cash' | 'cheque' | 'paytm' | 'gpay' | 'phonepe' | 'netbanking'

// Interface matching the tbl_payment_history structure
export interface IPaymentHistory {
  id?: number
  buyer_id: number // Foreign key to tbl_users (customer)
  payment_mode: PaymentMode
  payment_received_by: number // Foreign key to tbl_users (employee/admin who collected)
  payment_received: number // Assuming this is the amount received in this transaction
  payment_due: number // Represents the due amount *after* this payment? Needs clarification.
  notes?: string | null
  created_at?: Date
  // Consider joining with users (buyer, receiver) if needed frequently
}

// Type for query results
type PaymentHistoryQueryResult = IPaymentHistory & RowDataPacket

export const PaymentHistory = {
  async findById (id: number): Promise<IPaymentHistory | null> {
    try {
      const [rows] = await pool.query<PaymentHistoryQueryResult[]>(
        'SELECT * FROM tbl_payment_history WHERE id = ?',
        [id]
      )
      return rows.length > 0 ? rows[0] : null
    } catch (error) {
      console.error('[models/PaymentHistory.findById]', error)
      throw new Error('Error fetching payment history by ID')
    }
  },

  // Find all payment records - add filters (buyer_id, date range) later
  async findAll (): Promise<IPaymentHistory[]> {
    try {
      const [rows] = await pool.query<PaymentHistoryQueryResult[]>(
        'SELECT * FROM tbl_payment_history ORDER BY created_at DESC'
      )
      return rows
    } catch (error) {
      console.error('[models/PaymentHistory.findAll]', error)
      throw new Error('Error fetching all payment history')
    }
  },

  // Find payment records by Buyer (Customer) ID
  async findByBuyerId (buyerId: number): Promise<IPaymentHistory[]> {
    try {
      const [rows] = await pool.query<PaymentHistoryQueryResult[]>(
        'SELECT * FROM tbl_payment_history WHERE buyer_id = ? ORDER BY created_at DESC',
        [buyerId]
      )
      return rows
    } catch (error) {
      console.error('[models/PaymentHistory.findByBuyerId]', error)
      throw new Error('Error fetching payment history by Buyer ID')
    }
  },

  // Add function for creating payment records later
  async create(paymentData: Omit<IPaymentHistory, 'id' | 'created_at'>): Promise<number> {
    const { buyer_id, payment_mode, payment_received_by, payment_received, payment_due, notes } = paymentData
    try {
      const [result] = await pool.query<OkPacket>(
        'INSERT INTO tbl_payment_history (buyer_id, payment_mode, payment_received_by, payment_received, payment_due, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [buyer_id, payment_mode, payment_received_by, payment_received, payment_due, notes]
      )
      return result.insertId
    } catch (error) {
      console.error('[models/PaymentHistory.create]', error)
      // Consider more specific error handling (e.g., foreign key constraint fails)
      throw new Error('Error creating payment history record')
    }
  }
} 