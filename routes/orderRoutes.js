import express from "express";
import { body } from 'express-validator';
import { createOrder, getOrder, getGuestOrder } from "../controllers/orderController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import Order from "../models/Order.js";
import mongoose from 'mongoose';
import { isValidOrderNumber } from '../utils/orderIdGenerator.js';
import { createRetailOrder } from '../controllers/orderController.js';
const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order with inventory validation (supports both registered users and guests)
// @access  Private (for registered users) / Public (for guests)
router.post(
  "/",
  [
    body('items', 'Order items are required').isArray({ min: 1 }),
    body('items.*.productId', 'Product ID is required').notEmpty(),
    body('items.*.quantity', 'Quantity must be at least 1').isInt({ min: 1 }),
    body('shippingAddress', 'Shipping address is required').notEmpty(),
    body('paymentMethod', 'Payment method is required').notEmpty(),
    // Guest-specific validation
    body('guestInfo.email').optional().isEmail().normalizeEmail(),
    body('guestInfo.name').optional().trim().isLength({ min: 2, max: 50 }),
    body('guestInfo.phone').optional().isMobilePhone('en-IN')
  ],
  // Conditional middleware: protect only if no guest info provided
  (req, res, next) => {
    if (!req.body.guestInfo) {
      return protect(req, res, next);
    }
    next();
  },
  createOrder
);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private


// @route   GET /api/orders/my
// @desc    Get logged in user orders
// @access  Private
router.get("/my", protect, async (req, res) => {
  try {
    console.log('User from auth middleware:', req.user);
    console.log('User ID:', req.user?._id || req.user?.id);
    
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in request' });
    }
    
    const orders = await Order.find({ user: userId })
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 });
    
    const formattedOrders = orders.map(order => ({
      id: order._id,
      orderNumber: order.orderNumber || `#ORD-${order._id.toString().slice(-6).toUpperCase()}`,
      orderUUID: order.orderUUID || null,
      items: order.items,
      shippingAddress: order.shippingAddress,
      totalPrice: order.totalPrice,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      orderType: order.orderType,
      deliveredAt: order.deliveredAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));
    
    res.json({
      success: true,
      orders: formattedOrders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID (for registered users)
// @access  Private
router.get("/:id", protect, getOrder);

// @route   POST /api/orders/guest/track
// @desc    Track guest order by email and phone
// @access  Public
router.post(
  "/guest/track",
  [
    body('email', 'Valid email is required').isEmail().normalizeEmail(),
    body('phone', 'Valid phone number is required').isMobilePhone('en-IN'),
    body('orderId', 'Order ID is required').isMongoId()
  ],
  getGuestOrder
);

// @route   GET /api/orders
// @desc    Get all orders (Admin only)
// @access  Private/Admin
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'id name email')
      .populate('guest', 'guestId email name')
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 });
    
    const formattedOrders = orders.map(order => ({
      id: order._id,
      orderNumber: order.orderNumber || `#ORD-${order._id.toString().slice(-6).toUpperCase()}`,
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
    }));
    
    res.json({
      success: true,
      orders: formattedOrders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/orders/:id
// @desc    Update order status (Admin only)
// @access  Private/Admin
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    let order;

    // Find order by different ID types
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id);
    } else if (isValidOrderNumber(id)) {
      order = await Order.findOne({ orderNumber: id });
    } else if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      order = await Order.findOne({ orderUUID: id });
    } else {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();
    
    res.json({
      success: true,
      order: {
        id: order._id,
        orderNumber: order.orderNumber || `#ORD-${order._id.toString().slice(-6).toUpperCase()}`,
        orderUUID: order.orderUUID || null,
        status: order.status,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// NEW: Retail POS checkout route
// @route   POST /api/orders/retail
// @desc    Create retail order (Admin only)
// @access  Private/Admin
router.post(
  "/retail",
  protect,
  adminOnly, // Only admins can create retail orders
  [
    body('items', 'Order items are required').isArray({ min: 1 }),
    body('items.*.productId', 'Product ID is required').notEmpty(),
    body('items.*.quantity', 'Quantity must be at least 1').isInt({ min: 1 }),
    body('paymentMethod', 'Payment method is required').notEmpty(),
    // Retail customer info (optional)
    body('retailCustomerInfo.name').optional().trim().isLength({ min: 2, max: 50 }),
    body('retailCustomerInfo.email').optional().isEmail().normalizeEmail(),
    body('retailCustomerInfo.phone').optional().isMobilePhone('en-IN'),
    body('retailCustomerInfo.address').optional().trim(),
    // Total price validation
    body('totalPrice').optional().isNumeric()
  ],
  createRetailOrder
);

export default router;
