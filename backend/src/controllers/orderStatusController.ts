import { Request, Response } from 'express';
import { OrderStatus } from '../models/OrderStatus';

export const getAllOrderStatuses = async (req: Request, res: Response): Promise<void> => {
    try {
        const statuses = await OrderStatus.findAll();
        res.status(200).json(statuses);
    } catch (error) {
        console.error('Error fetching order statuses:', error);
        res.status(500).json({ message: 'Failed to fetch order statuses' });
    }
};

// Add other controllers later if needed (e.g., get by ID) 