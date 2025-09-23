import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Guest from '../models/Guest.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { generateOrderNumber, generateOrderUUID, isValidOrderNumber } from '../utils/orderIdGenerator.js';

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

    // Generate unique order identifiers
    const orderNumber = await generateOrderNumber();
    const orderUUID = generateOrderUUID();

    console.log('Generated order identifiers:', { orderNumber, orderUUID });

    // Create order
    const orderData = {
      orderNumber,
      orderUUID,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      status: 'Processing'
    };

    console.log('Order data before save:', orderData);

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
    console.log('Order after save:', {
      id: order._id,
      orderNumber: order.orderNumber,
      orderUUID: order.orderUUID,
      status: order.status
    });
    
    await session.commitTransaction();
    
    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        orderUUID: order.orderUUID,
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
    const { id } = req.params;
    let order;

    // Check if the ID is a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id)
        .populate('user', 'name email')
        .populate('guest', 'guestId email name')
        .populate('items.product', 'name price image');
    } 
    // Check if it's a valid order number format
    else if (isValidOrderNumber(id)) {
      order = await Order.findOne({ orderNumber: id })
        .populate('user', 'name email')
        .populate('guest', 'guestId email name')
        .populate('items.product', 'name price image');
    }
    // Check if it's a UUID
    else if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      order = await Order.findOne({ orderUUID: id })
        .populate('user', 'name email')
        .populate('guest', 'guestId email name')
        .populate('items.product', 'name price image');
    }
    else {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }
    
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

    res.status(200).json({
      success: true,
      order: {
        id: order._id,
        orderNumber: order.orderNumber || `#ORD-${order._id.slice(-6).toUpperCase()}`,
        orderUUID: order.orderUUID || null,
        items: order.items,
        shippingAddress: order.shippingAddress,
        guestInfo: order.guestInfo,
        totalPrice: order.totalPrice,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        orderType: order.orderType,
        deliveredAt: order.deliveredAt,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        user: order.user,
        guest: order.guest
      }
    });
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

    // Find order by different ID types
    let order;
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      order = await Order.findOne({ 
        _id: orderId,
        guest: guest._id 
      }).populate('items.product', 'name price image');
    } else if (isValidOrderNumber(orderId)) {
      order = await Order.findOne({ 
        orderNumber: orderId,
        guest: guest._id 
      }).populate('items.product', 'name price image');
    } else if (orderId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      order = await Order.findOne({ 
        orderUUID: orderId,
        guest: guest._id 
      }).populate('items.product', 'name price image');
    } else {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      order: {
        id: order._id,
        orderNumber: order.orderNumber || `#ORD-${order._id.slice(-6).toUpperCase()}`,
        orderUUID: order.orderUUID || null,
        items: order.items,
        shippingAddress: order.shippingAddress,
        guestInfo: order.guestInfo,
        totalPrice: order.totalPrice,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        orderType: order.orderType,
        deliveredAt: order.deliveredAt,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      },
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
