import pool from '../config/db';
import { RowDataPacket, OkPacket } from 'mysql2/promise';

// Import necessary interfaces
import { IOrder } from './Order';
import { IOrderDelivery } from './OrderDelivery';
import { IPaymentHistory } from './PaymentHistory';
import { IUser } from './User';

// Type for aggregated results
interface AggregationResult extends RowDataPacket {
    total: number | null;
    count: number | null;
}

// Type for query results that might be joined or specific subsets
type OrderQueryResult = IOrder & RowDataPacket;
type OrderDeliveryQueryResult = IOrderDelivery & RowDataPacket;
type PaymentHistoryQueryResult = IPaymentHistory & RowDataPacket;
type UserQueryResult = Omit<IUser, 'password'> & RowDataPacket;

// Interface for combined invoice data
interface InvoiceData {
    customerInfo: Omit<IUser, 'password'> | null;
    orders: IOrder[];
    deliveries: IOrderDelivery[];
    payments: IPaymentHistory[];
    previousDue: number;
    currentPeriodDue: number;
    currentPeriodPaid: number;
    totalDue: number;
}

export const Report = {

    // --- Dashboard Specific Queries --- 

    async getTotalActiveCustomers(): Promise<number> {
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                'SELECT COUNT(*) as count FROM tbl_users WHERE is_active = 1 AND is_deleted = 0' // Add role filter if needed
            );
            return rows[0].count || 0;
        } catch (error) {
            console.error('[models/Report.getTotalActiveCustomers]', error);
            throw new Error('Error fetching total active customers');
        }
    },

    async getTodaysSalesTotal(): Promise<number> {
        try {
            const [rows] = await pool.query<AggregationResult[]>(
                'SELECT SUM(grand_total) as total FROM tbl_orders WHERE DATE(created_at) = CURDATE()' // Add is_deleted check if column exists
            );
            return rows[0].total || 0;
        } catch (error) {
            console.error('[models/Report.getTodaysSalesTotal]', error);
            throw new Error('Error fetching today\'s sales total');
        }
    },

    async getTodaysDeliveriesCount(): Promise<number> {
        try {
            const [rows] = await pool.query<AggregationResult[]>(
                'SELECT COUNT(*) as count FROM tbl_order_delivery WHERE delivery_date = CURDATE()' 
            );
            return rows[0].count || 0;
        } catch (error) {
            console.error('[models/Report.getTodaysDeliveriesCount]', error);
            throw new Error('Error fetching today\'s deliveries count');
        }
    },

    async getTotalDueAmount(): Promise<number> {
        try {
            // Assuming due_amount in tbl_users represents the total due
            const [rows] = await pool.query<AggregationResult[]>(
                 'SELECT SUM(due_amount) as total FROM tbl_users WHERE is_active = 1 AND is_deleted = 0' 
            );
            return rows[0].total || 0;
        } catch (error) {
            console.error('[models/Report.getTotalDueAmount]', error);
            throw new Error('Error fetching total due amount');
        }
    },

    // --- General Reporting Queries --- 

    async getSalesTotalByDateRange(startDate: string, endDate: string): Promise<number> {
        try {
            const [rows] = await pool.query<AggregationResult[]>(
                 'SELECT SUM(grand_total) as total FROM tbl_orders WHERE created_at BETWEEN ? AND ?',
                [startDate, endDate + ' 23:59:59'] // Include end date
            );
            return rows[0].total || 0;
        } catch (error) {
            console.error('[models/Report.getSalesTotalByDateRange]', error);
            throw new Error('Error fetching sales total by date range');
        }
    },

    async getExpensesTotalByDateRange(startDate: string, endDate: string): Promise<number> {
        try {
            const [rows] = await pool.query<AggregationResult[]>(
                'SELECT SUM(amount) as total FROM tbl_expenses WHERE is_deleted = 0 AND expense_date BETWEEN ? AND ?',
                [startDate, endDate] // expense_date is DATE type
            );
            return rows[0].total || 0;
        } catch (error) {
            console.error('[models/Report.getExpensesTotalByDateRange]', error);
            throw new Error('Error fetching expenses total by date range');
        }
    },

    async getInvoiceData(userId: number, startDate: string, endDate: string): Promise<InvoiceData> {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Get Customer Info 
            const [userRows] = await connection.query<UserQueryResult[]>(
                'SELECT id, firstname, lastname, phone, email, address_1, address_2, city, state, deposit, due_amount FROM tbl_users WHERE id = ? AND is_deleted = 0',
                [userId]
            );
            const customerInfo = userRows.length > 0 ? userRows[0] as Omit<IUser, 'password'> : null;

            // 2. Get Orders within the date range
            const [orders] = await connection.query<OrderQueryResult[]>(
                'SELECT * FROM tbl_orders WHERE user_id = ? AND created_at BETWEEN ? AND ? ORDER BY created_at ASC', 
                [userId, startDate, endDate + ' 23:59:59']
            );

            // 3. Get Deliveries within the date range
            const [deliveries] = await connection.query<OrderDeliveryQueryResult[]>(
                'SELECT * FROM tbl_order_delivery WHERE order_id IN (SELECT id FROM tbl_orders WHERE user_id = ?) AND delivery_date BETWEEN ? AND ? ORDER BY delivery_date ASC', 
                [userId, startDate, endDate]
            );

            // 4. Get Payments within the date range - Corrected type
            const [payments] = await connection.query<PaymentHistoryQueryResult[]>(
                'SELECT * FROM tbl_payment_history WHERE buyer_id = ? AND created_at BETWEEN ? AND ? ORDER BY created_at ASC', 
                [userId, startDate, endDate + ' 23:59:59']
            );

            // 5. Calculate balances (Simplified example - needs precise logic)
            //    - Get due amount *before* startDate
            //    - Sum payments before startDate
            //    - Calculate previousDue = (initialDue + ordersBeforeStartDate) - paymentsBeforeStartDate
            //    This part is complex and requires careful historical calculation or relies heavily
            //    on an accurate running `due_amount` in `tbl_users`.
            //    Let's use a placeholder/simplified approach for now, assuming tbl_users.due_amount is current.

            const currentPeriodOrderTotal = orders.reduce((sum, order) => sum + order.grand_total, 0);
            const currentPeriodPaid = payments.reduce((sum, payment) => sum + payment.payment_received, 0);

            // Placeholder calculation - NEEDS REFINEMENT
            const previousDue = (customerInfo?.due_amount || 0) - currentPeriodOrderTotal + currentPeriodPaid;
            const currentPeriodDue = currentPeriodOrderTotal;
            const totalDue = previousDue + currentPeriodDue - currentPeriodPaid;

            await connection.commit();

            return {
                customerInfo,
                orders,
                deliveries,
                payments,
                previousDue: previousDue < 0 ? 0 : previousDue,
                currentPeriodDue,
                currentPeriodPaid,
                totalDue
            };

        } catch (error) {
            await connection.rollback();
            console.error('[models/Report.getInvoiceData]', error);
            throw new Error('Error fetching invoice data');
        } finally {
            connection.release();
        }
    }
}; 