import express from "express";
import { body } from 'express-validator';
import { createOrder, getOrder, getGuestOrder } from "../controllers/orderController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import Order from "../models/Order.js";

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
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 });
    res.json(orders);
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
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 });
    res.json(orders);
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
    console.log('Data is',req.params.id);
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();
    
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
