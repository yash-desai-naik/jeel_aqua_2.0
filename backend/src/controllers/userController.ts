import { Request, Response } from 'express'
import { User, IUser } from '../models/User'
import bcrypt from 'bcrypt'
import { AuthenticatedRequest } from '../middleware/authMiddleware'

// --- Read Operations ---

// Get user profile for the logged-in user
export const getMyProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }
    const user = await User.findById(userId) // findById already excludes password
    if (user) {
      res.status(200).json(user)
    } else {
      res.status(404).json({ message: 'User profile not found' })
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    res.status(500).json({ message: 'Failed to fetch user profile', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}

// Get user by ID (Admin/Owner access potentially)
export const getUserById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const targetUserId = parseInt(req.params.id, 10)
    if (isNaN(targetUserId)) {
      res.status(400).json({ message: 'Invalid user ID' })
      return
    }

    // Optional: Add role check - Allow only admins/owners to fetch arbitrary user IDs
    // const requestingUser = req.user;
    // if (requestingUser?.roleId !== ADMIN_ROLE_ID && requestingUser?.roleId !== OWNER_ROLE_ID) {
    //   return res.status(403).json({ message: 'Forbidden' });
    // }

    const user = await User.findById(targetUserId) // findById already excludes password
    if (user) {
      res.status(200).json(user)
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    console.error('Error fetching user by ID:', error)
    res.status(500).json({ message: 'Failed to fetch user', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}

// Get all users (potentially filtered, e.g., by role - requires model changes)
export const getAllUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const roleIdQuery = req.query.roleId;
        const roleId = typeof roleIdQuery === 'string' ? parseInt(roleIdQuery, 10) : undefined;

        if (roleIdQuery !== undefined && (isNaN(roleId!) || roleId! <= 0)) {
             res.status(400).json({ message: 'Invalid roleId query parameter' });
             return;
        }

        const users = await User.findAll({ roleId });
        res.json(users);
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ message: 'Internal server error fetching users' });
    }
};

// Get current user profile
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'User not authenticated or token invalid' });
    return;
  }
  try {
    // Assuming findById excludes password
    const user = await User.findById(req.user.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User profile not found' });
    }
  } catch (error) {
    console.error('Error fetching current user profile:', error);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
};

// --- Update Operations ---

// Update user profile for the logged-in user
export const updateMyProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const updateData: Partial<Omit<IUser, 'id' | 'password' | 'created_at' | 'updated_at' | 'is_deleted' | 'role_id' | 'referral_code' | 'referral_points' | 'token' >> = req.body

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ message: 'No update data provided' })
      return
    }

    // Add validation for fields being updated (e.g., email format)

    const success = await User.update(userId, updateData)

    if (success) {
      res.status(200).json({ message: 'Profile updated successfully' })
    } else {
      // This usually means the user wasn't found, which shouldn't happen if they are authenticated
      res.status(404).json({ message: 'User not found or no changes made' })
    }
  } catch (error) {
    console.error('Error updating user profile:', error)
    res.status(500).json({ message: 'Failed to update profile', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}

// Change password for the logged-in user
export const changeMyPassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    if (!currentPassword || !newPassword) {
        res.status(400).json({ message: 'Current password and new password are required' });
        return;
    }
    if (newPassword.length < 6) { // Example validation
        res.status(400).json({ message: 'New password must be at least 6 characters long' });
        return;
    }

    try {
        // Fetch user with password to verify current password
        const user = await User.findByPhone(req.user?.phone || ''); // Assumes phone is unique and in token
        if (!user || !user.password) {
            res.status(404).json({ message: 'User not found' }); // Should not happen
            return;
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            res.status(400).json({ message: 'Incorrect current password' });
            return;
        }

        // Hash the new password
        const saltRounds = 10;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

        // Update password in the database
        const success = await User.changePassword(userId, newPasswordHash);

        if (success) {
            res.status(200).json({ message: 'Password changed successfully' });
        } else {
            res.status(404).json({ message: 'User not found or password could not be updated' });
        }
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Failed to change password', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};

// Create a new user (Admin?)
export const createUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  // TODO: Add input validation (express-validator)
  const { password, ...userData } = req.body;

  // Basic required field check (more detailed validation needed)
  if (!userData.firstname || !userData.lastname || !userData.phone || !password || !userData.role_id || !userData.city || !userData.state) {
    res.status(400).json({ message: 'Missing required fields (firstname, lastname, phone, password, role_id, city, state are required)' });
    return;
  }

  try {
    // Construct user object, ensuring password is included for the model
    const newUserInput: Omit<IUser, 'id' | 'created_at' | 'updated_at' | 'is_deleted' | 'token'> = {
        ...userData,
        password: password // Pass plain password to model for hashing
    };

    const newId = await User.create(newUserInput);
    res.status(201).json({ message: 'User created successfully', id: newId });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error instanceof Error && (error.message.includes('already registered') || error.message.includes('Invalid role_id'))) {
        res.status(400).json({ message: error.message });
    } else {
        res.status(500).json({ message: 'Failed to create user', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
};

// Update an existing user (Admin? or Self?)
export const updateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const idToUpdate = parseInt(req.params.id, 10);
    if (isNaN(idToUpdate)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }

    // TODO: Add role check - is user admin OR is user updating their own profile (req.user.id === idToUpdate)?

    // Exclude password and role_id from direct update via this route
    const { password, role_id, ...updateData } = req.body;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ message: 'No update data provided' });
      return;
    }

    // TODO: Add input validation (express-validator)

    const success = await User.update(idToUpdate, updateData);
    if (success) {
      res.status(200).json({ message: 'User updated successfully' });
    } else {
      res.status(404).json({ message: 'User not found or no changes applicable' });
    }
  } catch (error) {
    console.error('Error updating user:', error);
     if (error instanceof Error && (error.message.includes('already registered') || error.message.includes('Invalid value') || error.message.includes('Invalid zone_id'))) {
        res.status(400).json({ message: error.message });
    } else {
        res.status(500).json({ message: 'Failed to update user', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
};

// --- Delete Operation ---

// Soft delete a user (Admin/Owner access likely required)
export const deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const targetUserId = parseInt(req.params.id, 10)
    if (isNaN(targetUserId)) {
      res.status(400).json({ message: 'Invalid user ID' })
      return
    }

    // Optional: Add role check - Allow only admins/owners
    // const requestingUser = req.user;
    // if (requestingUser?.roleId !== ADMIN_ROLE_ID && requestingUser?.roleId !== OWNER_ROLE_ID) {
    //   return res.status(403).json({ message: 'Forbidden' });
    // }
    // Prevent self-deletion via this route?
    // if (requestingUser?.userId === targetUserId) {
    //    return res.status(400).json({ message: 'Cannot delete own account via this route' });
    // }

    const success = await User.softDelete(targetUserId)

    if (success) {
      res.status(200).json({ message: 'User deleted successfully' })
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    res.status(500).json({ message: 'Failed to delete user', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}
