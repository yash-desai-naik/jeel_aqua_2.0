import pool from '../config/db';
import { RowDataPacket, OkPacket } from 'mysql2/promise';

/**
 * @swagger
 * components:
 *   schemas:
 *     Expense:
 *       type: object
 *       properties:
 *         id: { type: integer, readOnly: true }
 *         expense_type: { type: string, description: "Category of expense" }
 *         expense_date: { type: string, format: date }
 *         amount: { type: number, format: double }
 *         source: { type: string, enum: [Cash, Bank] }
 *         remarks: { type: string, nullable: true }
 *         note: { type: string, nullable: true }
 *         approved_by: { type: integer, nullable: true, description: "User ID of approver" }
 *         created_by: { type: integer, readOnly: true, description: "User ID of creator" }
 *         created_at: { type: string, format: date-time, readOnly: true }
 *         updated_at: { type: string, format: date-time, readOnly: true }
 *         is_deleted: { type: integer, readOnly: true }
 *     ExpenseInput:
 *       type: object
 *       required:
 *         - expense_type
 *         - expense_date
 *         - amount
 *         - source
 *       properties:
 *         expense_type: { type: string }
 *         expense_date: { type: string, format: date, description: "YYYY-MM-DD" }
 *         amount: { type: number, format: double }
 *         source: { type: string, enum: [Cash, Bank] }
 *         remarks: { type: string }
 *         note: { type: string }
 *         approved_by: { type: integer }
 */
export interface IExpense {
  id?: number;
  expense_type: string;
  expense_date: Date | string; // Allow string for input, convert to Date
  amount: number;
  source: 'Cash' | 'Bank';
  remarks?: string | null;
  note?: string | null;
  approved_by?: number | null;
  created_by: number;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: number;
}

type ExpenseQueryResult = IExpense & RowDataPacket;

export const Expense = {
  async findAll(options: { startDate?: string; endDate?: string } = {}): Promise<IExpense[]> {
    let query = 'SELECT * FROM tbl_expenses WHERE is_deleted = 0';
    const params: (string | number)[] = [];

    if (options.startDate) {
        query += ' AND expense_date >= ?';
        params.push(options.startDate);
    }
    if (options.endDate) {
        query += ' AND expense_date <= ?';
        params.push(options.endDate);
    }
    query += ' ORDER BY expense_date DESC, id DESC';

    try {
      const [rows] = await pool.query<ExpenseQueryResult[]>(query, params);
      return rows;
    } catch (error) {
      console.error('[models/Expense.findAll]', error);
      throw new Error('Error fetching expenses');
    }
  },

  async findById(id: number): Promise<IExpense | null> {
    try {
      const [rows] = await pool.query<ExpenseQueryResult[]>(
        'SELECT * FROM tbl_expenses WHERE id = ? AND is_deleted = 0',
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('[models/Expense.findById]', error);
      throw new Error('Error fetching expense by ID');
    }
  },

  async create(expenseData: Omit<IExpense, 'id' | 'created_at' | 'updated_at' | 'is_deleted'>): Promise<number> {
    const { expense_type, expense_date, amount, source, created_by, remarks, note, approved_by } = expenseData;
    
    // Ensure date is handled correctly (assuming input might be string YYYY-MM-DD)
    const finalExpenseDate = typeof expense_date === 'string' ? new Date(expense_date) : expense_date;

    try {
      const [result] = await pool.query<OkPacket>(
        'INSERT INTO tbl_expenses (expense_type, expense_date, amount, source, remarks, note, approved_by, created_by, is_deleted, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())',
        [expense_type, finalExpenseDate, amount, source, remarks, note, approved_by, created_by]
      );
      return result.insertId;
    } catch (error) {
      console.error('[models/Expense.create]', error);
      throw new Error('Error creating expense record');
    }
  },

  async update(id: number, expenseData: Partial<Omit<IExpense, 'id' | 'created_by' | 'created_at' | 'updated_at' | 'is_deleted'>>): Promise<boolean> {
      const fields = Object.keys(expenseData) as Array<keyof typeof expenseData>;
      if (fields.length === 0) return false;

      // Handle date conversion if present
      if (expenseData.expense_date) {
           expenseData.expense_date = typeof expenseData.expense_date === 'string' 
              ? new Date(expenseData.expense_date) 
              : expenseData.expense_date;
      }

      const setClauses = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => expenseData[field as keyof typeof expenseData]);
      values.push(id);

      try {
          const [result] = await pool.query<OkPacket>(
              `UPDATE tbl_expenses SET ${setClauses}, updated_at = NOW() WHERE id = ? AND is_deleted = 0`,
              values
          );
          return result.affectedRows > 0;
      } catch (error) {
          console.error('[models/Expense.update]', error);
          throw new Error('Error updating expense record');
      }
  },

  async softDelete(id: number): Promise<boolean> {
    try {
      const [result] = await pool.query<OkPacket>(
        'UPDATE tbl_expenses SET is_deleted = 1, updated_at = NOW() WHERE id = ? AND is_deleted = 0',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('[models/Expense.softDelete]', error);
      throw new Error('Error deleting expense record');
    }
  }
}; 