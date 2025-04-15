import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserJWTPayload } from './authMiddleware'; // Import updated types
import { Role, IRole } from '../models/Role'; // Import Role model and IRole interface

// Define role names or IDs (consider using an enum or fetching from DB)
const ADMIN_ROLE_NAME = 'Admin';
const OWNER_ROLE_NAME = 'Owner'; // Example if Owner is separate
// Add other roles as needed
// const EMPLOYEE_ROLE_NAME = 'Employee';
// const DELIVERY_BOY_ROLE_NAME = 'Delivery Boy';

// Caching fetched Role IDs to avoid repeated DB calls
let roleIdCache: Record<string, number> = {};

async function getRoleIdByName(roleName: string): Promise<number | null> {
    if (roleIdCache[roleName]) {
        return roleIdCache[roleName];
    }
    try {
        // Await the result of findAll before using reduce
        const roles: IRole[] = await Role.findAll(); 
        // Explicitly type the accumulator and role
        const roleMap = roles.reduce((acc: Record<string, number>, role: IRole) => {
            if (role.id) { // Ensure role.id is not undefined
                 acc[role.rolename] = role.id;
            }
            return acc;
        }, {} as Record<string, number>);

        roleIdCache = roleMap; // Update cache
        return roleMap[roleName] || null;

    } catch (error) {
        console.error(`Error fetching role ID for ${roleName}:`, error);
        return null; // Fail safe
    }
}

// Middleware to check if user has Admin role
export const checkAdminRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const userRoleId = req.user?.roleId;
    if (!userRoleId) {
        res.status(401).json({ message: 'Unauthorized: User role not found in token' });
        return;
    }

    const adminRoleId = await getRoleIdByName(ADMIN_ROLE_NAME);
    // Optionally check for Owner role as well
    // const ownerRoleId = await getRoleIdByName(OWNER_ROLE_NAME);

    if (!adminRoleId /* && userRoleId !== ownerRoleId */) {
        console.error('Admin Role ID could not be determined or does not exist in DB.');
        res.status(500).json({ message: 'Internal server configuration error (Role setup)'});
        return;
    }

    if (userRoleId === adminRoleId /* || userRoleId === ownerRoleId */) {
        next(); // User is an Admin (or Owner)
    } else {
        res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
};

// Example for checking multiple roles (e.g., Admin or Employee)
// export const checkRoles = (allowedRoles: string[]) => {
//     return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
//         const userRoleId = req.user?.roleId;
//         if (!userRoleId) { return res.status(401).json({ message: 'Unauthorized' }); }

//         const allowedRoleIds = (await Promise.all(allowedRoles.map(getRoleIdByName))).filter(id => id !== null) as number[];

//         if (allowedRoleIds.includes(userRoleId)) {
//             next();
//         } else {
//             res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
//         }
//     };
// }; 