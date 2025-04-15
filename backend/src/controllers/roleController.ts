import { Request, Response } from 'express';
import { Role, IRole } from '../models/Role';
import { AuthenticatedRequest } from '../middleware/authMiddleware'; // Assuming protected

export const getAllRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const roles = await Role.findAll();
    res.status(200).json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Failed to fetch roles', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getRoleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid role ID' });
      return;
    }
    const role = await Role.findById(id);
    if (role) {
      res.status(200).json(role);
    } else {
      res.status(404).json({ message: 'Role not found' });
    }
  } catch (error) {
    console.error('Error fetching role by ID:', error);
    res.status(500).json({ message: 'Failed to fetch role', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const createRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { rolename } = req.body;
  if (!rolename || typeof rolename !== 'string' || rolename.trim() === '') {
    res.status(400).json({ message: 'Missing or invalid required field: rolename (must be non-empty string)' });
    return;
  }

  try {
    const newId = await Role.create({ rolename: rolename.trim() });
    res.status(201).json({ message: 'Role created successfully', id: newId });
  } catch (error) {
    console.error('Error creating role:', error);
    if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ message: error.message }); // Conflict
    } else {
        res.status(500).json({ message: 'Failed to create role', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
};

export const updateRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid role ID' });
      return;
    }

    const { rolename, is_active } = req.body;
    const updateData: Partial<Pick<IRole, 'rolename' | 'is_active'> > = {};

    if (rolename !== undefined) {
      if (typeof rolename !== 'string' || rolename.trim() === '') {
         res.status(400).json({ message: 'Invalid rolename: must be non-empty string' });
         return;
      }
      updateData.rolename = rolename.trim();
    }
    if (is_active !== undefined) {
      if (![0, 1, '0', '1'].includes(is_active)) {
          res.status(400).json({ message: 'Invalid is_active value: must be 0 or 1' });
          return;
      }
      updateData.is_active = Number(is_active);
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ message: 'No update data provided (rolename, is_active)' });
      return;
    }

    const success = await Role.update(id, updateData);
    if (success) {
      res.status(200).json({ message: 'Role updated successfully' });
    } else {
      res.status(404).json({ message: 'Role not found or no changes made' });
    }
  } catch (error) {
    console.error('Error updating role:', error);
    if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ message: error.message }); // Conflict
    } else {
        res.status(500).json({ message: 'Failed to update role', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
};

export const deleteRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid role ID' });
      return;
    }

    const success = await Role.softDelete(id);
    if (success) {
      res.status(200).json({ message: 'Role deleted successfully' });
    } else {
      // This case might not be reachable if findById check is done first or due to the user check
      res.status(404).json({ message: 'Role not found' });
    }
  } catch (error) {
    console.error('Error deleting role:', error);
    if (error instanceof Error && error.message.includes('Cannot delete role')) {
        res.status(400).json({ message: error.message }); // Bad request (due to constraint)
    } else {
        res.status(500).json({ message: 'Failed to delete role', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
}; 