import { Request, Response } from 'express';
import { Expense, IExpense } from '../models/Expense';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getAllExpenses = async (req: Request, res: Response): Promise<void> => {
    try {
        // TODO: Add validation for date query params
        const { startDate, endDate } = req.query;
        const options = {
            startDate: startDate as string | undefined,
            endDate: endDate as string | undefined
        };
        const expenses = await Expense.findAll(options);
        res.status(200).json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ message: 'Failed to fetch expenses' });
    }
};

export const getExpenseById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ message: 'Invalid expense ID' });
            return;
        }
        const expense = await Expense.findById(id);
        if (expense) {
            res.status(200).json(expense);
        } else {
            res.status(404).json({ message: 'Expense not found' });
        }
    } catch (error) {
        console.error('Error fetching expense by ID:', error);
        res.status(500).json({ message: 'Failed to fetch expense' });
    }
};

export const createExpense = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // TODO: Add express-validator validation
    const { expense_type, expense_date, amount, source, remarks, note, approved_by } = req.body;
    const created_by = req.user?.id;

    if (!expense_type || !expense_date || amount === undefined || !source || !created_by) {
        res.status(400).json({ message: 'Missing required fields (expense_type, expense_date, amount, source)' });
        return;
    }
    if (!['Cash', 'Bank'].includes(source)) {
         res.status(400).json({ message: 'Invalid source value (must be Cash or Bank)' });
        return;
    }
    if (typeof amount !== 'number' || amount <= 0) {
         res.status(400).json({ message: 'Invalid amount (must be positive number)' });
        return;
    }
    // Add date validation if needed

    try {
        const newExpenseData: Omit<IExpense, 'id' | 'created_at' | 'updated_at' | 'is_deleted'> = {
            expense_type,
            expense_date,
            amount,
            source,
            created_by,
            remarks,
            note,
            approved_by
        };
        const newId = await Expense.create(newExpenseData);
        res.status(201).json({ message: 'Expense created successfully', id: newId });
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ message: 'Failed to create expense' });
    }
};

export const updateExpense = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ message: 'Invalid expense ID' });
            return;
        }

        const updateData: Partial<Omit<IExpense, 'id' | 'created_by' | 'created_at' | 'updated_at' | 'is_deleted'>> = req.body;
        if (Object.keys(updateData).length === 0) {
            res.status(400).json({ message: 'No update data provided' });
            return;
        }

        // Add validation for fields (e.g., source, amount, date format)
        if (updateData.source && !['Cash', 'Bank'].includes(updateData.source)) {
            res.status(400).json({ message: 'Invalid source value (must be Cash or Bank)' });
            return;
        }
         if (updateData.amount !== undefined && (typeof updateData.amount !== 'number' || updateData.amount <= 0)) {
             res.status(400).json({ message: 'Invalid amount (must be positive number)' });
            return;
        }

        const success = await Expense.update(id, updateData);
        if (success) {
            res.status(200).json({ message: 'Expense updated successfully' });
        } else {
            res.status(404).json({ message: 'Expense not found or no changes made' });
        }
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ message: 'Failed to update expense' });
    }
};

export const deleteExpense = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ message: 'Invalid expense ID' });
            return;
        }

        // TODO: Add role check? Who can delete expenses?

        const success = await Expense.softDelete(id);
        if (success) {
            res.status(200).json({ message: 'Expense deleted successfully' });
        } else {
            res.status(404).json({ message: 'Expense not found' });
        }
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ message: 'Failed to delete expense' });
    }
}; 