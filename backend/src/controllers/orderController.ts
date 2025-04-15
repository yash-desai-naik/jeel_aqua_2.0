import { Request, Response } from 'express'
import { Order } from '../models/Order'
import { AuthenticatedRequest } from '../middleware/authMiddleware' // Import for user info
import { IOrder } from '../models/Order' // Import interface if needed for typing

// Get all orders (potentially add filters/pagination later)
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    // TODO: Add filtering (e.g., by date range, status) and pagination
    const orders = await Order.findAll()
    res.status(200).json(orders)
  } catch (error) {
    console.error('Error fetching all orders:', error)
    res.status(500).json({ message: 'Failed to fetch orders', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}

// Get order by ID
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid order ID' })
      return
    }
    const order = await Order.findById(id)
    if (order) {
      res.status(200).json(order)
    } else {
      res.status(404).json({ message: 'Order not found' })
    }
  } catch (error) {
    console.error('Error fetching order by ID:', error)
    res.status(500).json({ message: 'Failed to fetch order', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}

// Get orders for a specific customer (user)
export const getOrdersByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId, 10)
    if (isNaN(userId)) {
      res.status(400).json({ message: 'Invalid user ID' })
      return
    }
    // Optional: Check if the requesting user is the owner or an admin
    // const requestingUser = (req as AuthenticatedRequest).user;
    // if (requestingUser?.userId !== userId && requestingUser?.roleId !== ADMIN_ROLE_ID) {
    //   return res.status(403).json({ message: 'Forbidden' });
    // }

    const orders = await Order.findByUserId(userId)
    res.status(200).json(orders)
  } catch (error) {
    console.error('Error fetching orders by User ID:', error)
    res.status(500).json({ message: 'Failed to fetch user orders', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}

// Create a new order
export const createOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  // Basic input validation
  const { user_id, service_id, quantity, discount, notes } = req.body

  if (user_id === undefined || service_id === undefined || quantity === undefined) {
    res.status(400).json({ message: 'Missing required fields: user_id, service_id, quantity' })
    return
  }

  // Validate quantity
  if (Number(quantity) <= 0) {
     res.status(400).json({ message: 'Quantity must be a positive number' })
     return
  }
  // Validate discount if provided
   if (discount !== undefined && Number(discount) < 0) {
       res.status(400).json({ message: 'Discount cannot be negative' });
       return;
   }

  // Optional: Add role check? Can customers create their own orders? Or only staff?
  // const requestingUser = req.user;
  // if (requestingUser.roleId === CUSTOMER_ROLE_ID && requestingUser.userId !== Number(user_id)) {
  //     return res.status(403).json({ message: 'Forbidden: Cannot create orders for other users.' });
  // }

  try {
    const newOrderData: Pick<IOrder, 'user_id' | 'service_id' | 'quantity' | 'discount' | 'notes'> = {
      user_id: Number(user_id),
      service_id: Number(service_id),
      quantity: Number(quantity),
      discount: discount !== undefined ? Number(discount) : 0, // Default discount to 0 if not provided
      notes: notes || null
    }

    const newOrderId = await Order.create(newOrderData)
    res.status(201).json({ message: 'Order created successfully', id: newOrderId })

  } catch (error) {
    console.error('Error creating order:', error)
    // Check for specific errors from the model
    if (error instanceof Error && (error.message.includes('not found or is inactive') || error.message.includes('Invalid user_id') || error.message.includes('Quantity must be positive'))) {
      res.status(400).json({ message: error.message }) // Bad request due to invalid input/reference
    } else {
      res.status(500).json({ message: 'Failed to create order', error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }
}

// Update an existing order
export const updateOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const orderId = parseInt(req.params.id, 10);
        if (isNaN(orderId)) {
            res.status(400).json({ message: 'Invalid order ID' });
            return;
        }

        // TODO: Add role checks (Admin? Or user who placed order?)

        const updateData: Partial<Pick<IOrder, 'quantity' | 'discount' | 'notes'> > = req.body;

        // Basic validation
        if (Object.keys(updateData).length === 0) {
            res.status(400).json({ message: 'No update data provided' });
            return;
        }
        if (updateData.quantity !== undefined && (typeof updateData.quantity !== 'number' || updateData.quantity <= 0)) {
            res.status(400).json({ message: 'Invalid quantity' });
            return;
        }
        if (updateData.discount !== undefined && (typeof updateData.discount !== 'number' || updateData.discount < 0)) {
            res.status(400).json({ message: 'Invalid discount' });
            return;
        }
        // Note: Price/total updates usually shouldn't happen directly here, recalculate if needed.

        const success = await Order.update(orderId, updateData);
        if (success) {
            res.status(200).json({ message: 'Order updated successfully' });
        } else {
            res.status(404).json({ message: 'Order not found or no changes made' });
        }
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Failed to update order' });
    }
};

// Delete an order (Soft delete?)
export const deleteOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const orderId = parseInt(req.params.id, 10);
        if (isNaN(orderId)) {
            res.status(400).json({ message: 'Invalid order ID' });
            return;
        }

        // TODO: Add role checks (Admin only?)
        // TODO: Consider implications - delete related deliveries/payments? Usually soft delete is better.

        const success = await Order.softDelete(orderId); // Assumes softDelete exists in model
        if (success) {
            res.status(200).json({ message: 'Order deleted successfully' });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error('Error deleting order:', error);
        // Handle specific soft delete error
        if (error instanceof Error && error.message.includes('Soft delete for orders is not supported')) {
           res.status(400).json({ message: error.message });
        } else {
           res.status(500).json({ message: 'Failed to delete order' });
        }
    }
};

// Add other controller functions for CRUD operations later (update) 