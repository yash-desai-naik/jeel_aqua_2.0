import { RowDataPacket, OkPacket } from 'mysql2/promise'
import pool from '../config/db'
import { OrderStatus } from './OrderStatus'
import { OrderStatusHistory } from './OrderStatusHistory'

// Interface matching the tbl_order_delivery structure
export interface IOrderDelivery {
  id?: number
  order_id: number // Foreign key to tbl_orders
  delivery_boy_id: number // Foreign key to tbl_users (delivery personnel)
  delivery_date: Date
  qty_ordered: number // Might be redundant if derivable from order_id?
  qty_return?: number
  total_amount: number // Amount for this specific delivery?
  created_at?: Date
  updated_at?: Date
  notes?: string | null
  // Consider adding status (e.g., pending, completed, cancelled) based on tbl_order_status_history if needed
  // Consider joining with user (delivery boy) or order details
}

// Type for query results
type OrderDeliveryQueryResult = IOrderDelivery & RowDataPacket

export const OrderDelivery = {
  async findById (id: number): Promise<IOrderDelivery | null> {
    try {
      const [rows] = await pool.query<OrderDeliveryQueryResult[]>(
        'SELECT * FROM tbl_order_delivery WHERE id = ?',
        [id]
      )
      return rows.length > 0 ? rows[0] : null
    } catch (error) {
      console.error('[models/OrderDelivery.findById]', error)
      throw new Error('Error fetching order delivery by ID')
    }
  },

  // Find all deliveries - add filters (date range, delivery_boy_id) later
  async findAll (): Promise<IOrderDelivery[]> {
    try {
      const [rows] = await pool.query<OrderDeliveryQueryResult[]>(
        'SELECT * FROM tbl_order_delivery ORDER BY delivery_date DESC, created_at DESC'
      )
      return rows
    } catch (error) {
      console.error('[models/OrderDelivery.findAll]', error)
      throw new Error('Error fetching all order deliveries')
    }
  },

  // Find deliveries by Order ID
  async findByOrderId (orderId: number): Promise<IOrderDelivery[]> {
    try {
      const [rows] = await pool.query<OrderDeliveryQueryResult[]>(
        'SELECT * FROM tbl_order_delivery WHERE order_id = ? ORDER BY delivery_date DESC, created_at DESC',
        [orderId]
      )
      return rows
    } catch (error) {
      console.error('[models/OrderDelivery.findByOrderId]', error)
      throw new Error('Error fetching order deliveries by Order ID')
    }
  },

  // Find deliveries by Delivery Boy ID
  async findByDeliveryBoyId (deliveryBoyId: number): Promise<IOrderDelivery[]> {
    try {
      const [rows] = await pool.query<OrderDeliveryQueryResult[]>(
        'SELECT * FROM tbl_order_delivery WHERE delivery_boy_id = ? ORDER BY delivery_date DESC, created_at DESC',
        [deliveryBoyId]
      )
      return rows
    } catch (error) {
      console.error('[models/OrderDelivery.findByDeliveryBoyId]', error)
      throw new Error('Error fetching order deliveries by Delivery Boy ID')
    }
  },

  // Add function for creating order delivery records
  async create(deliveryData: Pick<IOrderDelivery, 'order_id' | 'delivery_boy_id' | 'delivery_date' | 'qty_ordered' | 'total_amount' | 'notes'>, createdById: number): Promise<number> {
    const { order_id, delivery_boy_id, delivery_date, qty_ordered, total_amount, notes } = deliveryData

    // Basic validation
    if (qty_ordered <= 0) {
        throw new Error('Quantity ordered must be positive.');
    }
     if (total_amount < 0) { // Allow 0 amount?
         throw new Error('Total amount cannot be negative.');
     }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Insert delivery record
        const [result] = await connection.query<OkPacket>(
            'INSERT INTO tbl_order_delivery (order_id, delivery_boy_id, delivery_date, qty_ordered, qty_return, total_amount, notes, created_at, updated_at) VALUES (?, ?, ?, ?, 0, ?, ?, NOW(), NOW())',
            [order_id, delivery_boy_id, delivery_date, qty_ordered, total_amount, notes]
        );
        const newDeliveryId = result.insertId;

        // Find the ID for the 'Pending' status (or a default initial status)
        const pendingStatus = await OrderStatus.findByTitle('Pending'); // Assuming 'Pending' exists
        const initialStatusId = pendingStatus ? pendingStatus.id : 1; // Fallback to ID 1 if 'Pending' not found

        if (!initialStatusId) {
            throw new Error('Default order status (e.g., Pending) not found.');
        }

        // Insert initial status history
        await OrderStatusHistory.create({ 
            order_delivery_id: newDeliveryId,
            status_id: initialStatusId, 
            updated_by: createdById 
        });

        await connection.commit(); // Commit transaction
        return newDeliveryId;

    } catch (error) {
        await connection.rollback(); // Rollback on error
        console.error('[models/OrderDelivery.create]', error);
        if (error instanceof Error && 'code' in error && error.code === 'ER_NO_REFERENCED_ROW_2') {
            throw new Error(`Error creating delivery: Invalid order_id or delivery_boy_id.`);
        }
         if (error instanceof Error && error.message.includes('Default order status')) {
            throw error;
        }
        throw new Error('Error creating order delivery record with status');
    } finally {
        connection.release();
    }
  },

  async update(id: number, deliveryData: Partial<Pick<IOrderDelivery, 'qty_return' | 'total_amount' | 'notes'>>): Promise<boolean> {
    // Define allowed fields for update
    const allowedFields: Array<keyof typeof deliveryData> = [
        'qty_return', 'total_amount', 'notes'
    ];

    const fieldsToUpdate = Object.keys(deliveryData).filter(
        (key) => allowedFields.includes(key as keyof typeof deliveryData) && deliveryData[key as keyof typeof deliveryData] !== undefined
    ) as Array<keyof typeof deliveryData>;

    if (fieldsToUpdate.length === 0) {
      return false; // Nothing to update
    }

    // Validate input values
    if (deliveryData.qty_return !== undefined && deliveryData.qty_return < 0) {
        throw new Error('Returned quantity cannot be negative.');
    }
    if (deliveryData.total_amount !== undefined && deliveryData.total_amount < 0) {
        throw new Error('Total amount cannot be negative.');
    }

    const setClauses = fieldsToUpdate.map(field => `${field} = ?`).join(', ');
    const values = fieldsToUpdate.map(field => deliveryData[field]);
    values.push(id); // Add the id for the WHERE clause

    try {
      const [result] = await pool.query<OkPacket>(
        `UPDATE tbl_order_delivery SET ${setClauses}, updated_at = NOW() WHERE id = ?`,
        values
      );

      // TODO: Consider updating tbl_order_status_history here (e.g., status 'Completed')?

      return result.affectedRows > 0;
    } catch (error) {
      console.error('[models/OrderDelivery.update]', error);
      throw new Error('Error updating order delivery record');
    }
  },

  // Add functions for creating/updating deliveries later
  // Need to consider how status updates (tbl_order_status_history) integrate
} 