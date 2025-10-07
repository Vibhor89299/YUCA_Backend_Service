import Order from '../models/Order.js';
import { cancelOrderWithInventoryRestore } from './paymentController.js';
import mongoose from 'mongoose';

// @desc    Get all orders (Admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find()
        .populate('user', 'name email')
        .populate('items.product', 'name price image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments()
    ]);

    res.json({
      orders,
      page,
      totalPages: Math.ceil(total / limit),
      totalOrders: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/admin/orders/:id
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { status } = req.body;
    
    if (!status) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Status is required' });
    }

    const order = await Order.findById(req.params.id).session(session);
    
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Order not found' });
    }

    // Handle cancellation with inventory restoration
    if (status === 'Cancelled') {
      const updatedOrder = await cancelOrderWithInventoryRestore(req.params.id, session);
      await session.commitTransaction();
      return res.json({
        message: 'Order cancelled successfully with inventory restored',
        order: updatedOrder
      });
    }

    // Handle other status updates
    order.status = status;
    if (status === 'Delivered') {
      order.deliveredAt = new Date();
    }

    const updatedOrder = await order.save({ session });
    await session.commitTransaction();
    
    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error updating order status:', error);
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};
