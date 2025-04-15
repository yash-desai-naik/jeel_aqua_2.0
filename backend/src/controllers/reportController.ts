import { Request, Response } from 'express';
import { Report } from '../models/Report';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getDashboardSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const [customerCount, salesToday, deliveriesToday, totalDue] = await Promise.all([
            Report.getTotalActiveCustomers(),
            Report.getTodaysSalesTotal(),
            Report.getTodaysDeliveriesCount(),
            Report.getTotalDueAmount()
        ]);

        res.status(200).json({
            totalActiveCustomers: customerCount,
            todaysSalesTotal: salesToday,
            todaysDeliveriesCount: deliveriesToday,
            totalDueAmount: totalDue
        });
    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard summary' });
    }
};

export const getSalesReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate || typeof startDate !== 'string' || typeof endDate !== 'string') {
            res.status(400).json({ message: 'Missing or invalid startDate or endDate query parameters (YYYY-MM-DD)' });
            return;
        }
        // Add further date validation if needed

        const salesTotal = await Report.getSalesTotalByDateRange(startDate, endDate);
        res.status(200).json({ startDate, endDate, salesTotal });
    } catch (error) {
        console.error('Error fetching sales report:', error);
        res.status(500).json({ message: 'Failed to fetch sales report' });
    }
};

export const getExpenseReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate || typeof startDate !== 'string' || typeof endDate !== 'string') {
            res.status(400).json({ message: 'Missing or invalid startDate or endDate query parameters (YYYY-MM-DD)' });
            return;
        }
        // Add further date validation if needed

        const expensesTotal = await Report.getExpensesTotalByDateRange(startDate, endDate);
        res.status(200).json({ startDate, endDate, expensesTotal });
    } catch (error) {
        console.error('Error fetching expense report:', error);
        res.status(500).json({ message: 'Failed to fetch expense report' });
    }
};

export const getInvoiceDataForCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const { startDate, endDate } = req.query;

        if (isNaN(userId)) {
            res.status(400).json({ message: 'Invalid userId parameter' });
            return;
        }
        if (!startDate || !endDate || typeof startDate !== 'string' || typeof endDate !== 'string') {
            res.status(400).json({ message: 'Missing or invalid startDate or endDate query parameters (YYYY-MM-DD)' });
            return;
        }
        // Add date validation

        const invoiceData = await Report.getInvoiceData(userId, startDate, endDate);
        res.status(200).json(invoiceData);

    } catch (error) {
        console.error('Error fetching invoice data:', error);
        res.status(500).json({ message: 'Failed to fetch invoice data' });
    }
}; 