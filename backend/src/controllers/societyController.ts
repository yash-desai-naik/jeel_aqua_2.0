import { Request, Response } from 'express'
import { Society } from '../models/Society'
import { ISociety } from '../models/Society'
import { AuthenticatedRequest } from '../middleware/authMiddleware'

export const getAllSocieties = async (req: Request, res: Response): Promise<void> => {
  try {
    const zoneIdQuery = req.query.zoneId; // Get the query parameter
    let societies: ISociety[];

    if (zoneIdQuery) {
      // If zoneId exists, parse it and use findByZoneId
      const zoneId = parseInt(zoneIdQuery as string, 10);
      if (isNaN(zoneId) || zoneId <= 0) {
        res.status(400).json({ message: 'Invalid zoneId query parameter' });
        return;
      }
      console.log(`[societyController:getAllSocieties] Filtering by zoneId: ${zoneId}`); // Optional Log
      societies = await Society.findByZoneId(zoneId);
    } else {
      // If no zoneId, get all societies
      console.log(`[societyController:getAllSocieties] Fetching all societies.`); // Optional Log
      societies = await Society.findAll();
    }

    res.status(200).json(societies);

  } catch (error) {
    console.error('Error fetching societies:', error);
    res.status(500).json({ message: 'Failed to fetch societies', error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

export const getSocietyById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid society ID' })
      return
    }
    const society = await Society.findById(id)
    if (society) {
      res.status(200).json(society)
    } else {
      res.status(404).json({ message: 'Society not found' })
    }
  } catch (error) {
    console.error('Error fetching society by ID:', error)
    res.status(500).json({ message: 'Failed to fetch society', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}

export const getSocietiesByZoneId = async (req: Request, res: Response): Promise<void> => {
  try {
    const zoneId = parseInt(req.params.zoneId, 10)
    if (isNaN(zoneId)) {
      res.status(400).json({ message: 'Invalid zone ID' })
      return
    }
    const societies = await Society.findByZoneId(zoneId)
    res.status(200).json(societies) // Return empty array if none found, which is fine
  } catch (error) {
    console.error('Error fetching societies by Zone ID:', error)
    res.status(500).json({ message: 'Failed to fetch societies for the zone', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}

// Create a new society
export const createSociety = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  // Basic input validation
  const { name, zone_id } = req.body

  if (!name || zone_id === undefined) {
    res.status(400).json({ message: 'Missing required fields: name and zone_id' })
    return
  }

  // Optional: Add role check - only allow admins/owners
  // if (req.user?.roleId !== ADMIN_ROLE_ID && req.user?.roleId !== OWNER_ROLE_ID) { ... }

  try {
    const newSocietyData: Omit<ISociety, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'is_deleted' | 'is_active'> = {
      name,
      zone_id: Number(zone_id)
    }

    const newSocietyId = await Society.create(newSocietyData)
    res.status(201).json({ message: 'Society created successfully', id: newSocietyId })

  } catch (error) {
    console.error('Error creating society:', error)
    // Check if it's the specific foreign key error from the model
    if (error instanceof Error && error.message.includes('Zone with ID')) {
      res.status(400).json({ message: error.message }) // Bad request because zone doesn't exist
    } else {
      res.status(500).json({ message: 'Failed to create society', error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }
}

// Update an existing society (partial updates allowed)
export const updateSociety = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid society ID' })
      return
    }

    const updateData: Partial<Omit<ISociety, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'is_deleted'> > = req.body

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ message: 'No update data provided' })
      return
    }

    // Optional: Add role check - only allow admins/owners
    // if (req.user?.roleId !== ADMIN_ROLE_ID && req.user?.roleId !== OWNER_ROLE_ID) { ... }

    // Basic validation if certain fields are provided
    if (updateData.name === '') {
      res.status(400).json({ message: 'Name cannot be empty' })
      return
    }
    if ('zone_id' in updateData && (typeof updateData.zone_id !== 'number' || updateData.zone_id <= 0)) {
        res.status(400).json({ message: 'Invalid value for zone_id' });
        return;
    }
    if ('is_active' in updateData && typeof updateData.is_active !== 'number') {
        res.status(400).json({ message: 'Invalid value for is_active' });
        return;
    }

    const success = await Society.update(id, updateData)

    if (success) {
      res.status(200).json({ message: 'Society updated successfully' })
    } else {
      res.status(404).json({ message: 'Society not found or no changes made' })
    }

  } catch (error) {
    console.error('Error updating society:', error)
    // Check for specific errors like invalid zone_id
    if (error instanceof Error && error.message.includes('Zone with ID')) {
      res.status(400).json({ message: error.message })
    } else {
      res.status(500).json({ message: 'Failed to update society', error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }
}

// Soft delete a society
export const deleteSociety = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid society ID' })
      return
    }

    // Optional: Add role check - only allow admins/owners
    // if (req.user?.roleId !== ADMIN_ROLE_ID && req.user?.roleId !== OWNER_ROLE_ID) { ... }

    // TODO: Check if any active users are linked to this society before deleting?

    const success = await Society.softDelete(id)

    if (success) {
      res.status(200).json({ message: 'Society deleted successfully' }) // Or 204 No Content
    } else {
      res.status(404).json({ message: 'Society not found' })
    }
  } catch (error) {
    console.error('Error deleting society:', error)
    res.status(500).json({ message: 'Failed to delete society', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}

// Add other controller functions for CRUD operations later (delete) 