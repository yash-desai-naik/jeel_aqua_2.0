import { Request, Response } from 'express'
import { Service } from '../models/Service'
import { IService } from '../models/Service'
import { AuthenticatedRequest } from '../middleware/authMiddleware'

export const getAllServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const services = await Service.findAll()
    res.status(200).json(services)
  } catch (error) {
    console.error('Error fetching all services:', error)
    res.status(500).json({ message: 'Failed to fetch services', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}

export const getServiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid service ID' })
      return
    }
    const service = await Service.findById(id)
    if (service) {
      res.status(200).json(service)
    } else {
      res.status(404).json({ message: 'Service not found' })
    }
  } catch (error) {
    console.error('Error fetching service by ID:', error)
    res.status(500).json({ message: 'Failed to fetch service', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}

// Create a new service (product)
export const createService = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  // Basic input validation
  const { title, qty, measure_id, price, notes, service_img } = req.body

  if (!title || qty === undefined || measure_id === undefined || price === undefined) {
    res.status(400).json({ message: 'Missing required fields: title, qty, measure_id, price' })
    return
  }

  // Optional: Add role check - only allow admins/owners
  // if (req.user?.roleId !== ADMIN_ROLE_ID && req.user?.roleId !== OWNER_ROLE_ID) { ... }

  try {
    const newServiceData: Omit<IService, 'id' | 'created_at' | 'updated_at' | 'is_deleted' | 'is_active'> = {
      title,
      qty: Number(qty),
      measure_id: Number(measure_id),
      price: Number(price),
      notes: notes || null,
      service_img: service_img || null
    }

    const newServiceId = await Service.create(newServiceData)
    res.status(201).json({ message: 'Service created successfully', id: newServiceId })

  } catch (error) {
    console.error('Error creating service:', error)
    // Check if it's the specific foreign key error from the model
    if (error instanceof Error && error.message.includes('Measure with ID')) {
      res.status(400).json({ message: error.message }) // Bad request because measure doesn't exist
    } else {
      res.status(500).json({ message: 'Failed to create service', error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }
}

// Update an existing service (partial updates allowed)
export const updateService = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid service ID' })
      return
    }

    const updateData: Partial<Omit<IService, 'id' | 'created_at' | 'updated_at' | 'is_deleted'> > = req.body

    if (Object.keys(updateData).length === 0) {
        res.status(400).json({ message: 'No update data provided' });
        return;
    }

    // Optional: Add role check - only allow admins/owners
    // if (req.user?.roleId !== ADMIN_ROLE_ID && req.user?.roleId !== OWNER_ROLE_ID) { ... }

    const success = await Service.update(id, updateData)

    if (success) {
      res.status(200).json({ message: 'Service updated successfully' })
    } else {
      // This could be because the service ID doesn't exist or wasn't updated
      res.status(404).json({ message: 'Service not found or no changes made' })
    }

  } catch (error) {
    console.error('Error updating service:', error)
    // Check for specific errors like invalid measure_id
    if (error instanceof Error && error.message.includes('Measure with ID')) {
      res.status(400).json({ message: error.message })
    } else {
      res.status(500).json({ message: 'Failed to update service', error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }
}

// Soft delete a service
export const deleteService = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid service ID' })
      return
    }

    // Optional: Add role check - only allow admins/owners
    // if (req.user?.roleId !== ADMIN_ROLE_ID && req.user?.roleId !== OWNER_ROLE_ID) { ... }

    const success = await Service.softDelete(id)

    if (success) {
      res.status(200).json({ message: 'Service deleted successfully' }) // Or 204 No Content
    } else {
      // This means the service ID was not found or already deleted
      res.status(404).json({ message: 'Service not found' })
    }
  } catch (error) {
    console.error('Error deleting service:', error)
    res.status(500).json({ message: 'Failed to delete service', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}

// Add other controller functions for CRUD operations later (delete) 