import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { validationResult } from 'express-validator';

export const createOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id;

    // Validate products and check stock
    let orderItems = [];
    let totalPrice = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      
      if (!product) {
        await session.abortTransaction();
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }

      if (product.countInStock < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({ 
          message: `Insufficient stock for product: ${product.name}`,
          productId: product._id,
          available: product.countInStock,
          requested: item.quantity
        });
      }

      // Update product stock
      product.countInStock -= item.quantity;
      await product.save({ session });

      // Add to order items
      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        image: product.image
      });

      // Calculate total price
      totalPrice += product.price * item.quantity;
    }

    // Create order
    const order = new Order({
      user: userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      status: 'Processing'
    });

    await order.save({ session });
    await session.commitTransaction();
    
    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order._id,
        items: order.items,
        totalPrice: order.totalPrice,
        status: order.status,
        createdAt: order.createdAt
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  } finally {
    session.endSession();
  }
};

export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to view this order
    if (order.user._id.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
