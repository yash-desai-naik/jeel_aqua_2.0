import { Router } from 'express';
import { query, param } from 'express-validator';
import {
    getDashboardSummary,
    getSalesReport,
    getExpenseReport,
    getInvoiceDataForCustomer
} from '../controllers/reportController';
import { authenticateToken } from '../middleware/authMiddleware';
import { handleValidationErrors } from '../middleware/validationMiddleware';
// TODO: Add role checks (e.g., only Admin/Owner can see reports?)

const router = Router();

router.use(authenticateToken);
// TODO: Apply role checks if needed: router.use(checkAdminRole);

// GET /summary - For dashboard widgets
router.get(
    '/summary',
    getDashboardSummary
);

// GET /sales?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get(
    '/sales',
    [
        query('startDate').isISO8601().toDate().withMessage('Valid startDate (YYYY-MM-DD) is required'),
        query('endDate').isISO8601().toDate().withMessage('Valid endDate (YYYY-MM-DD) is required')
        // TODO: Add check that endDate is after startDate
    ],
    handleValidationErrors,
    getSalesReport
);

// GET /expenses?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get(
    '/expenses',
    [
        query('startDate').isISO8601().toDate().withMessage('Valid startDate (YYYY-MM-DD) is required'),
        query('endDate').isISO8601().toDate().withMessage('Valid endDate (YYYY-MM-DD) is required')
    ],
    handleValidationErrors,
    getExpenseReport
);

// GET /invoice/:userId?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get(
    '/invoice/:userId',
    [
        param('userId').isInt({ gt: 0 }).withMessage('Valid userId parameter is required'),
        query('startDate').isISO8601().toDate().withMessage('Valid startDate (YYYY-MM-DD) is required'),
        query('endDate').isISO8601().toDate().withMessage('Valid endDate (YYYY-MM-DD) is required')
        // TODO: Check if requesting user is Admin or the user specified in :userId
    ],
    handleValidationErrors,
    getInvoiceDataForCustomer
);

export default router; 