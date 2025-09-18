import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Guest from '../models/Guest.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

export const createOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, shippingAddress, paymentMethod, guestInfo } = req.body;
    const userId = req.user?.id; // Optional for guest orders
    const isGuestOrder = !userId && guestInfo;

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

    // Handle guest order creation
    let guestId = null;
    if (isGuestOrder) {
      // Create or find guest
      const guest = await Guest.findOrCreateGuest({
        email: guestInfo.email,
        name: guestInfo.name,
        phone: guestInfo.phone,
        sessionId: req.sessionID || null,
        ipAddress: req.ip || req.connection.remoteAddress
      });
      guestId = guest._id;
    }

    // Create order
    const orderData = {
      items: orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      status: 'Processing'
    };

    if (isGuestOrder) {
      orderData.guest = guestId;
      orderData.guestInfo = {
        email: guestInfo.email,
        name: guestInfo.name,
        phone: guestInfo.phone
      };
    } else {
      orderData.user = userId;
    }

    const order = new Order(orderData);

    await order.save({ session });
    await session.commitTransaction();
    
    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order._id,
        items: order.items,
        totalPrice: order.totalPrice,
        status: order.status,
        orderType: order.orderType,
        createdAt: order.createdAt,
        ...(isGuestOrder && { guestInfo: order.guestInfo })
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
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('guest', 'guestId email name');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization based on order type
    if (order.orderType === 'registered') {
      // For registered user orders, check if user is authorized
      if (!req.user || (order.user._id.toString() !== req.user.id && !req.user.isAdmin)) {
        return res.status(403).json({ message: 'Not authorized to view this order' });
      }
    } else if (order.orderType === 'guest') {
      // For guest orders, only admin can view or provide guest tracking info
      if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ 
          message: 'Guest orders can only be viewed by admins or through guest tracking' 
        });
      }
    }

    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get guest order by email and phone (for order tracking)
export const getGuestOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, phone, orderId } = req.body;

    // Find guest by email and phone
    const guest = await Guest.findOne({ 
      email: email.toLowerCase(),
      phone: phone,
      isActive: true 
    });

    if (!guest) {
      return res.status(404).json({ message: 'No orders found with this email and phone' });
    }

    // Find order
    const order = await Order.findOne({ 
      _id: orderId,
      guest: guest._id 
    }).populate('items.product', 'name price image');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({
      order,
      guest: {
        id: guest._id,
        guestId: guest.guestId,
        email: guest.email,
        name: guest.name
      }
    });

  } catch (error) {
    console.error('Error fetching guest order:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
