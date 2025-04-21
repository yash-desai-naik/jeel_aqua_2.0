import { Request, Response } from 'express'
import { OrderDelivery } from '../models/OrderDelivery'
import { AuthenticatedRequest } from '../middleware/authMiddleware'
import { IOrderDelivery } from '../models/OrderDelivery'

// Get all deliveries (add filters/pagination later)
export const getAllDeliveries = async (req: Request, res: Response): Promise<void> => {
  try {
    // TODO: Add filtering (date, delivery boy) & pagination
    const deliveries = await OrderDelivery.findAll()
    res.status(200).json(deliveries)
  } catch (error) {
    console.error('Error fetching all deliveries:', error)
    res.status(500).json({ message: 'Failed to fetch deliveries', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}

// Get delivery by ID
export const getDeliveryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid delivery ID' })
      return
    }
    const delivery = await OrderDelivery.findById(id)
    if (delivery) {
      res.status(200).json(delivery)
    } else {
      res.status(404).json({ message: 'Delivery not found' })
    }
  } catch (error) {
    console.error('Error fetching delivery by ID:', error)
    res.status(500).json({ message: 'Failed to fetch delivery', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}

// Get deliveries for a specific order
export const getDeliveriesByOrderId = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = parseInt(req.params.orderId, 10)
    if (isNaN(orderId)) {
      res.status(400).json({ message: 'Invalid order ID' })
      return
    }
    const deliveries = await OrderDelivery.findByOrderId(orderId)
    res.status(200).json(deliveries)
  } catch (error) {
    console.error('Error fetching deliveries by Order ID:', error)
    res.status(500).json({ message: 'Failed to fetch order deliveries', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}

// Get deliveries assigned to a specific delivery boy
export const getDeliveriesByDeliveryBoyId = async (req: Request, res: Response): Promise<void> => {
  try {
    const deliveryBoyId = parseInt(req.params.deliveryBoyId, 10)
    if (isNaN(deliveryBoyId)) {
      res.status(400).json({ message: 'Invalid delivery boy ID' })
      return
    }

    // Optional: Check if the requesting user is the delivery boy themselves or an admin
    // const requestingUser = (req as AuthenticatedRequest).user;
    // if (requestingUser?.userId !== deliveryBoyId && requestingUser?.roleId !== ADMIN_ROLE_ID) {
    //   return res.status(403).json({ message: 'Forbidden' });
    // }

    const deliveries = await OrderDelivery.findByDeliveryBoyId(deliveryBoyId)
    res.status(200).json(deliveries)
  } catch (error) {
    console.error('Error fetching deliveries by Delivery Boy ID:', error)
    res.status(500).json({ message: 'Failed to fetch delivery boy deliveries', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}

// Create a new delivery record
export const createDelivery = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  // Basic input validation
  const { order_id, delivery_boy_id, delivery_date, qty_ordered, total_amount, notes } = req.body
  const loggedInUserId = req.user?.userId; // Get correct ID from token

  if (!loggedInUserId) {
    res.status(401).json({ message: 'Unauthorized: User ID not found in token' });
    return;
  }

  if (order_id === undefined || delivery_boy_id === undefined || !delivery_date || qty_ordered === undefined || total_amount === undefined) {
    res.status(400).json({ message: 'Missing required fields: order_id, delivery_boy_id, delivery_date, qty_ordered, total_amount' })
    return
  }

  // Validate numbers
  if (Number(qty_ordered) <= 0) {
     res.status(400).json({ message: 'Quantity ordered must be a positive number' })
     return
  }
  if (Number(total_amount) < 0) {
      res.status(400).json({ message: 'Total amount cannot be negative' });
      return;
  }
  // Validate date format (basic check, consider using a library like date-fns or moment)
  if (isNaN(Date.parse(delivery_date))) {
      res.status(400).json({ message: 'Invalid delivery date format' });
      return;
  }

  // Optional: Add role check? Only admins/staff can schedule deliveries?
  // if (req.user?.roleId === CUSTOMER_ROLE_ID) { ... }

  try {
    const newDeliveryData: Pick<IOrderDelivery, 'order_id' | 'delivery_boy_id' | 'delivery_date' | 'qty_ordered' | 'total_amount' | 'notes'> = {
      order_id: Number(order_id),
      delivery_boy_id: Number(delivery_boy_id),
      delivery_date: new Date(delivery_date),
      qty_ordered: Number(qty_ordered),
      total_amount: Number(total_amount),
      notes: notes || null
    }

    const newDeliveryId = await OrderDelivery.create(newDeliveryData, loggedInUserId)
    res.status(201).json({ message: 'Delivery record created successfully', id: newDeliveryId })

  } catch (error) {
    console.error('Error creating delivery record:', error)
    // Check for specific errors from the model
    if (error instanceof Error && (error.message.includes('Invalid order_id or delivery_boy_id') || error.message.includes('Quantity ordered must be positive') || error.message.includes('Total amount cannot be negative') || error.message.includes('Default order status'))) {
      res.status(400).json({ message: error.message }) // Bad request due to invalid input/reference
    } else {
      res.status(500).json({ message: 'Failed to create delivery record', error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }
}

// Update an existing delivery record (partial updates allowed)
export const updateDelivery = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid delivery ID' })
      return
    }

    // Explicitly pick allowed fields from body
    const { delivery_boy_id, delivery_date, qty_return, total_amount, notes } = req.body
    // Define the type for updateData explicitly to match the expected model input
    const updateData: Partial<Pick<IOrderDelivery, 'delivery_boy_id' | 'delivery_date' | 'qty_return' | 'total_amount' | 'notes'> > = {}

    // Populate updateData only with fields present in the request
    if (delivery_boy_id !== undefined) updateData.delivery_boy_id = Number(delivery_boy_id)
    if (delivery_date !== undefined) updateData.delivery_date = delivery_date // Keep as string for model validation
    if (qty_return !== undefined) updateData.qty_return = Number(qty_return)
    if (total_amount !== undefined) updateData.total_amount = Number(total_amount)
    if (notes !== undefined) updateData.notes = notes

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ message: 'No update data provided (allowed fields: delivery_boy_id, delivery_date, qty_return, total_amount, notes)' })
      return
    }

    // Optional: Add role check here...

    const success = await OrderDelivery.update(id, updateData)

    if (success) {
      res.status(200).json({ message: 'Delivery record updated successfully' })
    } else {
      res.status(404).json({ message: 'Delivery record not found or no changes made' })
    }

  } catch (error) {
    console.error('Error updating delivery record:', error)
    // Check for specific validation errors from model
    if (error instanceof Error && (error.message.includes('cannot be negative') || error.message.includes('Invalid'))) {
         res.status(400).json({ message: error.message });
     } else {
        res.status(500).json({ message: 'Failed to update delivery record', error: error instanceof Error ? error.message : 'Unknown error' })
     }
  }
}

// Add functions for CRUD operations later (create, update delivery status) 