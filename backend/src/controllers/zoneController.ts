import { Request, Response } from 'express'
import { Zone } from '../models/Zone'
import { IZone } from '../models/Zone'
import { AuthenticatedRequest } from '../middleware/authMiddleware'

export const getAllZones = async (req: Request, res: Response): Promise<void> => {
  try {
    const zones = await Zone.findAll()
    res.status(200).json(zones)
  } catch (error) {
    console.error('Error fetching all zones:', error)
    res.status(500).json({ message: 'Failed to fetch zones', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}

export const getZoneById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid zone ID' })
      return
    }
    const zone = await Zone.findById(id)
    if (zone) {
      res.status(200).json(zone)
    } else {
      res.status(404).json({ message: 'Zone not found' })
    }
  } catch (error) {
    console.error('Error fetching zone by ID:', error)
    res.status(500).json({ message: 'Failed to fetch zone', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}

// Create a new zone
export const createZone = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  // Basic input validation
  const { title, from_area, to_area } = req.body

  if (!title) {
    res.status(400).json({ message: 'Missing required field: title' })
    return
  }

  // Optional: Add role check - only allow admins/owners to create zones
  // if (req.user?.roleId !== ADMIN_ROLE_ID && req.user?.roleId !== OWNER_ROLE_ID) {
  //   res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
  //   return;
  // }

  try {
    const newZoneData: Omit<IZone, 'id' | 'created_at' | 'updated_at' | 'is_deleted' | 'is_active'> = {
      title,
      from_area: from_area || null,
      to_area: to_area || null
    }

    const newZoneId = await Zone.create(newZoneData)
    res.status(201).json({ message: 'Zone created successfully', id: newZoneId })
  } catch (error) {
    console.error('Error creating zone:', error)
    res.status(500).json({ message: 'Failed to create zone', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}

// Update an existing zone (partial updates allowed)
export const updateZone = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid zone ID' })
      return
    }

    const updateData: Partial<Omit<IZone, 'id' | 'created_at' | 'updated_at' | 'is_deleted'> > = req.body

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ message: 'No update data provided' })
      return
    }

    // Optional: Add role check - only allow admins/owners
    // if (req.user?.roleId !== ADMIN_ROLE_ID && req.user?.roleId !== OWNER_ROLE_ID) { ... }

    // Basic validation if certain fields are provided
    if (updateData.title === '') {
      res.status(400).json({ message: 'Title cannot be empty' })
      return
    }
    if ('is_active' in updateData && typeof updateData.is_active !== 'number') {
        // Or check if it's 0 or 1
        res.status(400).json({ message: 'Invalid value for is_active' });
        return;
    }

    const success = await Zone.update(id, updateData)

    if (success) {
      res.status(200).json({ message: 'Zone updated successfully' })
    } else {
      res.status(404).json({ message: 'Zone not found or no changes made' })
    }

  } catch (error) {
    console.error('Error updating zone:', error)
    res.status(500).json({ message: 'Failed to update zone', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}

// Soft delete a zone
export const deleteZone = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid zone ID' })
      return
    }

    // Optional: Add role check - only allow admins/owners
    // if (req.user?.roleId !== ADMIN_ROLE_ID && req.user?.roleId !== OWNER_ROLE_ID) { ... }

    // TODO: Check if any active societies are linked to this zone before deleting?

    const success = await Zone.softDelete(id)

    if (success) {
      res.status(200).json({ message: 'Zone deleted successfully' }) // Or 204 No Content
    } else {
      res.status(404).json({ message: 'Zone not found' })
    }
  } catch (error) {
    console.error('Error deleting zone:', error)
    res.status(500).json({ message: 'Failed to delete zone', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}

// Add other controller functions for CRUD operations later (delete) 