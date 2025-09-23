import express from 'express';
import { body } from 'express-validator';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import {
  createPaymentOrder,
  verifyPayment,
  getPayment,
  getUserPayments,
  createRefundPayment,
  getPaymentStatus,
  handleWebhook
} from '../controllers/paymentController.js';
import {
  validateCreatePaymentOrder,
  validateVerifyPayment,
  validateCreateRefund,
  validatePaymentId,
  validateRazorpayOrderId,
  validatePagination
} from '../middleware/validators/paymentValidator.js';

const router = express.Router();

// @desc    Create a new payment order (supports both registered users and guests)
// @route   POST /api/payments/create-order
// @access  Private (for registered users) / Public (for guests)
router.post(
  '/create-order',
  [
    ...validateCreatePaymentOrder,
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
  createPaymentOrder
);

// @desc    Verify payment and update order status (supports both registered users and guests)
// @route   POST /api/payments/verify
// @access  Private (for registered users) / Public (for guests)
router.post(
  '/verify',
  [
    ...validateVerifyPayment,
    // Guest-specific validation
    body('guestInfo.email').optional().isEmail().normalizeEmail(),
    body('guestInfo.phone').optional().isMobilePhone('en-IN')
  ],
  // Conditional middleware: protect only if no guest info provided
  (req, res, next) => {
    if (!req.body.guestInfo) {
      return protect(req, res, next);
    }
    next();
  },
  verifyPayment
);

// @desc    Get payment details by ID
// @route   GET /api/payments/:id
// @access  Private
router.get(
  '/:id',
  protect,
  validatePaymentId,
  getPayment
);

// @desc    Get all payments for authenticated user
// @route   GET /api/payments/user/payments
// @access  Private
router.get(
  '/user/payments',
  protect,
  validatePagination,
  getUserPayments
);

// @desc    Get payment status by Razorpay order ID
// @route   GET /api/payments/status/:razorpayOrderId
// @access  Private
router.get(
  '/status/:razorpayOrderId',
  protect,
  validateRazorpayOrderId,
  getPaymentStatus
);

// @desc    Create refund for a payment
// @route   POST /api/payments/refund
// @access  Private/Admin
router.post(
  '/refund',
  protect,
  adminOnly,
  validateCreateRefund,
  createRefundPayment
);

// @desc    Handle Razorpay webhook
// @route   POST /api/payments/webhook
// @access  Public (Razorpay only)
router.post(
  '/webhook',
  // Raw body parser for webhook signature verification
  express.raw({ type: 'application/json' }),
  handleWebhook
);

export default router;
