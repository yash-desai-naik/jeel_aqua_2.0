import { RowDataPacket, OkPacket } from 'mysql2/promise'
import pool from '../config/db'
import { Service } from './Service' // Import Service model to get current price

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id: { type: integer, readOnly: true }
 *         service_id: { type: integer }
 *         user_id: { type: integer, readOnly: true }
 *         quantity: { type: integer }
 *         price: { type: number, format: double, readOnly: true, description: "Price per unit at time of order" }
 *         sub_total: { type: number, format: double, readOnly: true }
 *         discount: { type: number, format: double, default: 0 }
 *         grand_total: { type: number, format: double, readOnly: true }
 *         created_at: { type: string, format: date-time, readOnly: true }
 *         notes: { type: string, nullable: true }
 *         # is_deleted: { type: integer, readOnly: true } # Add if schema is updated
 *     OrderInput:
 *       type: object
 *       required:
 *         - user_id
 *         - service_id
 *         - quantity
 *       properties:
 *         user_id: { type: integer, description: "The ID of the customer placing the order" }
 *         service_id: { type: integer }
 *         quantity: { type: integer }
 *         discount: { type: number, format: double }
 *         notes: { type: string }
 *     OrderUpdateInput:
 *       type: object
 *       properties:
 *         quantity: { type: integer }
 *         discount: { type: number, format: double }
 *         notes: { type: string }
 */

// Interface matching the tbl_orders structure
export interface IOrder {
  id?: number
  service_id: number // Foreign key to tbl_services
  user_id: number // Foreign key to tbl_users (customer)
  quantity: number
  price: number // Price per unit at the time of order?
  sub_total: number
  discount?: number
  grand_total: number
  created_at?: Date
  notes?: string | null
  // Consider adding fields from joined tables if needed often, e.g., user name, service title
}

// Type for query results
type OrderQueryResult = IOrder & RowDataPacket

export const Order = {
  async findById (id: number): Promise<IOrder | null> {
    try {
      // Consider joining with users/services if needed frequently
      const [rows] = await pool.query<OrderQueryResult[]>(
        'SELECT * FROM tbl_orders WHERE id = ?',
        [id]
      )
      return rows.length > 0 ? rows[0] : null
    } catch (error) {
      console.error('[models/Order.findById]', error)
      throw new Error('Error fetching order by ID')
    }
  },

  // Find all orders - potentially add filters (userId, date range)
  async findAll (options: { userId?: number, startDate?: string, endDate?: string } = {}): Promise<IOrder[]> {
    const { userId, startDate, endDate } = options;
    let query = 'SELECT * FROM tbl_orders'; // Base query
    const conditions: string[] = [];
    const queryParams: (string | number)[] = [];

    // --- Dynamic WHERE clauses --- 
    // Always filter non-deleted orders if schema supports it
    // if (schemaHasIsDeleted) {
    //    conditions.push('is_deleted = 0');
    // }

    if (userId !== undefined) {
        conditions.push('user_id = ?');
        queryParams.push(userId);
    }
    if (startDate) {
        // Add condition for start date (inclusive)
        conditions.push('DATE(created_at) >= ?'); 
        queryParams.push(startDate);
    }
    if (endDate) {
        // Add condition for end date (inclusive)
        conditions.push('DATE(created_at) <= ?');
        queryParams.push(endDate);
    }

    // Append WHERE clause if conditions exist
    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC'; // Keep ordering

    console.log('[Order.findAll] Executing Query:', query, queryParams); // Optional: Log the generated query

    try {
      const [rows] = await pool.query<OrderQueryResult[]>(query, queryParams);
      return rows
    } catch (error) {
      console.error('[models/Order.findAll]', error)
      throw new Error('Error fetching all orders')
    }
  },

  // Find orders by user ID
  async findByUserId (userId: number): Promise<IOrder[]> {
    try {
      const [rows] = await pool.query<OrderQueryResult[]>(
        'SELECT * FROM tbl_orders WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      )
      return rows
    } catch (error) {
      console.error('[models/Order.findByUserId]', error)
      throw new Error('Error fetching orders by user ID')
    }
  },

  // Add function for creating order records
  async create(orderData: Pick<IOrder, 'user_id' | 'service_id' | 'quantity' | 'discount' | 'notes'>): Promise<number> {
    const { user_id, service_id, quantity, discount = 0, notes } = orderData

    if (quantity <= 0) {
        throw new Error('Quantity must be positive.');
    }

    let connection; // Declare connection outside try block for use in finally
    try {
        connection = await pool.getConnection(); // Get a connection for transaction
        await connection.beginTransaction(); // Start transaction

        // 1. Get the current price for the service
        const service = await Service.findById(service_id); // Use existing findById
        if (!service) {
            throw new Error(`Service with ID ${service_id} not found or is inactive.`);
        }
        const currentPrice = service.price;

        // 2. Calculate totals
        const sub_total = currentPrice * quantity;
        const grand_total = sub_total - discount; // Ensure discount is non-negative if needed

        // 3. Insert the order
        const [result] = await connection.query<OkPacket>(
            'INSERT INTO tbl_orders (user_id, service_id, quantity, price, sub_total, discount, grand_total, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
            [user_id, service_id, quantity, currentPrice, sub_total, discount, grand_total, notes]
        );

        // TODO: Potentially update user's total_amount/due_amount here within the transaction?
        // Requires fetching the user and updating tbl_users. Be careful with consistency.
        // Example: await connection.query('UPDATE tbl_users SET due_amount = due_amount + ? WHERE id = ?', [grand_total, user_id]);

        await connection.commit(); // Commit transaction
        return result.insertId;

    } catch (error) {
        if (connection) {
            await connection.rollback(); // Rollback transaction on error
        }
        console.error('[models/Order.create]', error);
        // Handle potential foreign key constraint errors (user_id, service_id)
        if (error instanceof Error && error.message.includes('not found or is inactive')) {
             throw error; // Re-throw specific service not found error
        }
        if (error instanceof Error && 'code' in error && error.code === 'ER_NO_REFERENCED_ROW_2') {
            // Determine if it was user_id or service_id
            // This requires more specific checks or assuming service_id was already checked
            throw new Error(`Error creating order: Invalid user_id or service_id.`);
        }
        throw new Error('Error creating order record');
    } finally {
        if (connection) {
            connection.release(); // Always release connection
        }
    }
  },

  async update(id: number, orderData: Partial<Pick<IOrder, 'quantity' | 'discount' | 'notes'> >): Promise<boolean> {
    const fields = Object.keys(orderData) as Array<keyof typeof orderData>;
    if (fields.length === 0) return false;

    // We MIGHT need to recalculate totals if quantity/discount change. Fetch original order.
    const originalOrder = await this.findById(id);
    if (!originalOrder) return false; // Order not found

    const service = await Service.findById(originalOrder.service_id);
    if (!service) {
        throw new Error('Associated service not found, cannot update order totals.');
    }

    const updatedData = { ...originalOrder, ...orderData };

    // Recalculate totals
    const sub_total = (updatedData.quantity * service.price);
    const grand_total = sub_total - (updatedData.discount || 0);

    // Prepare fields for DB update
    const dbUpdateData: Partial<IOrder> = {
        ...orderData,
        sub_total,
        grand_total
    };

    const allowedFields: Array<keyof typeof dbUpdateData> = ['quantity', 'discount', 'notes', 'sub_total', 'grand_total'];
    const finalFieldsToUpdate = Object.keys(dbUpdateData).filter(
        (key) => allowedFields.includes(key as keyof typeof dbUpdateData)
    ) as Array<keyof typeof dbUpdateData>;

    if (finalFieldsToUpdate.length === 0) return false;

    const setClauses = finalFieldsToUpdate.map(field => `${field} = ?`).join(', ');
    const values = finalFieldsToUpdate.map(field => dbUpdateData[field as keyof typeof dbUpdateData]);
    values.push(id);

    try {
        const [result] = await pool.query<OkPacket>(
            `UPDATE tbl_orders SET ${setClauses} WHERE id = ?`,
            values
        );
        return result.affectedRows > 0;
    } catch (error) {
        console.error('[models/Order.update]', error);
        throw new Error('Error updating order record');
    }
  },

  async softDelete(id: number): Promise<boolean> {
    // Assumes `is_deleted` column has been added to tbl_orders
    try {
        // TODO: Check for related active deliveries first?
        const [result] = await pool.query<OkPacket>(
            'UPDATE tbl_orders SET is_deleted = 1 WHERE id = ? AND is_deleted = 0',
            [id]
        );
        return result.affectedRows > 0;
    } catch (error) {
        console.error('[models/Order.softDelete]', error);
        throw new Error('Error soft deleting order record');
    }
  }
} 