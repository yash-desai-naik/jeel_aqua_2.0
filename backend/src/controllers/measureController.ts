import { Request, Response } from 'express'
import { Measure, IMeasure } from '../models/Measure'
import { AuthenticatedRequest } from '../middleware/authMiddleware'

// --- Read Operations ---
export const getAllMeasures = async (req: Request, res: Response): Promise<void> => {
  try {
    const measures = await Measure.findAll()
    res.status(200).json(measures)
  } catch (error) {
    console.error('Error fetching all measures:', error)
    res.status(500).json({ message: 'Failed to fetch measures', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}

export const getMeasureById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid measure ID' })
      return
    }
    const measure = await Measure.findById(id)
    if (measure) {
      res.status(200).json(measure)
    } else {
      res.status(404).json({ message: 'Measure not found' })
    }
  } catch (error) {
    console.error('Error fetching measure by ID:', error)
    res.status(500).json({ message: 'Failed to fetch measure', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}

// --- Create Operation ---
export const createMeasure = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { title, notes } = req.body
  if (!title) {
    res.status(400).json({ message: 'Missing required field: title' })
    return
  }

  // Optional: Role check (Admin/Owner only?)

  try {
    const newMeasureData: Pick<IMeasure, 'title' | 'notes'> = {
      title,
      notes: notes || null,
    }
    const newId = await Measure.create(newMeasureData)
    res.status(201).json({ message: 'Measure created successfully', id: newId })
  } catch (error) {
    console.error('Error creating measure:', error)
    res.status(500).json({ message: 'Failed to create measure', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}

// --- Update Operation ---
export const updateMeasure = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid measure ID' })
      return
    }

    const updateData: Partial<Pick<IMeasure, 'title' | 'notes' | 'is_active'> > = req.body
    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ message: 'No update data provided' })
      return
    }
    // Add validation for title if provided
    if (updateData.title === '') {
        res.status(400).json({ message: 'Title cannot be empty' });
        return;
    }

     // Optional: Role check (Admin/Owner only?)

    const success = await Measure.update(id, updateData)
    if (success) {
      res.status(200).json({ message: 'Measure updated successfully' })
    } else {
      res.status(404).json({ message: 'Measure not found or no changes made' })
    }
  } catch (error) {
    console.error('Error updating measure:', error)
    res.status(500).json({ message: 'Failed to update measure', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}

// --- Delete Operation ---
export const deleteMeasure = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid measure ID' })
      return
    }

    // Optional: Role check (Admin/Owner only?)
    // TODO: Check if measure is in use by active services?

    const success = await Measure.softDelete(id)
    if (success) {
      res.status(200).json({ message: 'Measure deleted successfully' })
    } else {
      res.status(404).json({ message: 'Measure not found' })
    }
  } catch (error) {
    console.error('Error deleting measure:', error)
    res.status(500).json({ message: 'Failed to delete measure', error: error instanceof Error ? error.message : 'Unknown error' })
  }
} 