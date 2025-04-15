import pool from '../config/db';
import { OkPacket, RowDataPacket } from 'mysql2/promise';

// Interface for tbl_order_status_history
export interface IOrderStatusHistory {
  id?: number;
  order_delivery_id: number;
  status_id: number;
  updated_by: number; // User ID of the person making the change
  created_at?: Date;
}

type OrderStatusHistoryQueryResult = IOrderStatusHistory & RowDataPacket;

export const OrderStatusHistory = {
  async create(historyData: Omit<IOrderStatusHistory, 'id' | 'created_at'>): Promise<number> {
    const { order_delivery_id, status_id, updated_by } = historyData;
    try {
      const [result] = await pool.query<OkPacket>(
        'INSERT INTO tbl_order_status_history (order_delivery_id, status_id, updated_by, created_at) VALUES (?, ?, ?, NOW())',
        [order_delivery_id, status_id, updated_by]
      );
      return result.insertId;
    } catch (error) {
      console.error('[models/OrderStatusHistory.create]', error);
      // Handle potential foreign key errors (order_delivery_id, status_id, updated_by)
      if (error instanceof Error && 'code' in error && error.code === 'ER_NO_REFERENCED_ROW_2') {
          throw new Error('Invalid reference ID (order_delivery_id, status_id, or updated_by).');
      }
      throw new Error('Error creating order status history record');
    }
  },

  async findByDeliveryId(orderDeliveryId: number): Promise<IOrderStatusHistory[]> {
      try {
          const [rows] = await pool.query<OrderStatusHistoryQueryResult[]>(
              'SELECT * FROM tbl_order_status_history WHERE order_delivery_id = ? ORDER BY created_at DESC, id DESC',
              [orderDeliveryId]
          );
          return rows;
      } catch (error) {
          console.error('[models/OrderStatusHistory.findByDeliveryId]', error);
          throw new Error('Error fetching status history by delivery ID');
      }
  }

  // Other find methods can be added if needed (e.g., find latest status for a delivery)
}; 