import pool from '../config/db';
import { RowDataPacket } from 'mysql2/promise';

// Interface for tbl_order_status
export interface IOrderStatus {
  id?: number;
  status_title: string;
  status_priety: string; // Should this be number? Assuming string for now based on schema
  is_active?: number;
  is_deleted?: number;
  created_at?: Date;
  updated_at?: Date;
}

type OrderStatusQueryResult = IOrderStatus & RowDataPacket;

export const OrderStatus = {
  async findAll(): Promise<IOrderStatus[]> {
    try {
      const [rows] = await pool.query<OrderStatusQueryResult[]>(
        'SELECT * FROM tbl_order_status WHERE is_deleted = 0 AND is_active = 1 ORDER BY status_priety ASC, status_title ASC'
      );
      return rows;
    } catch (error) {
      console.error('[models/OrderStatus.findAll]', error);
      throw new Error('Error fetching all order statuses');
    }
  },

  async findById(id: number): Promise<IOrderStatus | null> {
    try {
      const [rows] = await pool.query<OrderStatusQueryResult[]>(
        'SELECT * FROM tbl_order_status WHERE id = ? AND is_deleted = 0 AND is_active = 1',
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('[models/OrderStatus.findById]', error);
      throw new Error('Error fetching order status by ID');
    }
  },

  async findByTitle(title: string): Promise<IOrderStatus | null> {
    try {
        const [rows] = await pool.query<OrderStatusQueryResult[]>(
            'SELECT * FROM tbl_order_status WHERE status_title = ? AND is_deleted = 0 AND is_active = 1',
            [title]
        );
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('[models/OrderStatus.findByTitle]', error);
        throw new Error('Error fetching order status by title');
    }
}

  // Basic Admin CRUD can be added later if needed (create, update, softDelete)
}; 