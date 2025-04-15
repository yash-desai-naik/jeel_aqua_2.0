import { Router } from 'express';
import { query, body, param } from 'express-validator';
import {
    getAllExpenses,
    getExpenseById,
    createExpense,
    updateExpense,
    deleteExpense
} from '../controllers/expenseController';
import { authenticateToken } from '../middleware/authMiddleware';
import { handleValidationErrors } from '../middleware/validationMiddleware';
// TODO: Import role check middleware if needed

const router = Router();

// Protect all expense routes
router.use(authenticateToken);
// TODO: Add role checks (e.g., router.use(checkAdminOrEmployeeRole))

// GET /?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get(
    '/',
    [
        query('startDate').optional().isISO8601().toDate().withMessage('Invalid start date format (YYYY-MM-DD)'),
        query('endDate').optional().isISO8601().toDate().withMessage('Invalid end date format (YYYY-MM-DD)')
    ],
    handleValidationErrors,
    getAllExpenses
);

// POST /
router.post(
    '/',
    [
        body('expense_type').isString().trim().notEmpty().withMessage('Expense type is required'),
        body('expense_date').isISO8601().toDate().withMessage('Valid expense date (YYYY-MM-DD) is required'),
        body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
        body('source').isIn(['Cash', 'Bank']).withMessage('Source must be Cash or Bank'),
        body('remarks').optional({ checkFalsy: true }).isString(),
        body('note').optional({ checkFalsy: true }).isString(),
        body('approved_by').optional({ checkFalsy: true }).isInt({ gt: 0 }).withMessage('Invalid approved_by ID')
    ],
    handleValidationErrors,
    createExpense
);

// GET /:id
router.get(
    '/:id',
    [
        param('id').isInt({ gt: 0 }).withMessage('Invalid Expense ID')
    ],
    handleValidationErrors,
    getExpenseById
);

// PATCH /:id
router.patch(
    '/:id',
    [
        param('id').isInt({ gt: 0 }).withMessage('Invalid Expense ID'),
        body('expense_type').optional().isString().trim().notEmpty().withMessage('Expense type cannot be empty'),
        body('expense_date').optional().isISO8601().toDate().withMessage('Invalid expense date format'),
        body('amount').optional().isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
        body('source').optional().isIn(['Cash', 'Bank']).withMessage('Source must be Cash or Bank'),
        body('remarks').optional({ checkFalsy: true }).isString(),
        body('note').optional({ checkFalsy: true }).isString(),
        body('approved_by').optional({ checkFalsy: true }).isInt({ gt: 0 }).withMessage('Invalid approved_by ID')
    ],
    handleValidationErrors,
    updateExpense
);

// DELETE /:id
router.delete(
    '/:id',
    [
        param('id').isInt({ gt: 0 }).withMessage('Invalid Expense ID')
    ],
    handleValidationErrors,
    deleteExpense
);

export default router; 