import { Router, Request, Response } from 'express';
import { User } from '../models/User';
// import { authMiddleware } from '../middleware/authMiddleware'; // Removed unused import

const router = Router();

// Apply authMiddleware to protect routes if needed, or apply selectively
// router.use(authMiddleware); // Apply to all routes in this file

// --- Find User by ID Route (Example - Keep if needed) ---
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id, 10);
        if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        // const userInstance = new User(); // User is an object with static methods
        const user = await User.findById(userId); // Call statically
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// --- GET All Users Route ---
router.get('/', async (req: Request, res: Response) => {
    try {
        // Optional: Add role filtering based on query param if needed later
        // const roleId = req.query.roleId ? parseInt(req.query.roleId as string, 10) : undefined;
        // const userInstance = new User(); // User is an object with static methods
        const users = await User.findAll(/* { roleId } */); // Call statically
        res.json(users);
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ message: 'Internal server error fetching users' });
    }
});

// --- Other User Routes (e.g., POST for create, PUT for update, DELETE) ---
// ... Add them here as needed ...

export default router; 