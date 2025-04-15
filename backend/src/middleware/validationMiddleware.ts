import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

// Middleware to handle validation errors
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Example reusable validation chains (add more as needed)
// export const validateIdParam = (): ValidationChain => {
//     return param('id', 'Invalid ID parameter').isInt({ gt: 0 });
// };

// export const validateNonEmptyString = (fieldName: string): ValidationChain => {
//     return body(fieldName, `${fieldName} must be a non-empty string`).isString().trim().notEmpty();
// }; 