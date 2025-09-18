import { body, param, query } from 'express-validator';
import mongoose from 'mongoose';

// Validation for creating payment order
export const validateCreatePaymentOrder = [
  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
    .isMongoId()
    .withMessage('Invalid order ID format')
    .custom(async (value) => {
      // Check if order exists
      const Order = (await import('../../models/Order.js')).default;
      const order = await Order.findById(value);
      if (!order) {
        throw new Error('Order not found');
      }
      return true;
    })
];

// Validation for verifying payment
export const validateVerifyPayment = [
  body('razorpayOrderId')
    .notEmpty()
    .withMessage('Razorpay order ID is required')
    .isString()
    .withMessage('Razorpay order ID must be a string'),
  
  body('razorpayPaymentId')
    .notEmpty()
    .withMessage('Razorpay payment ID is required')
    .isString()
    .withMessage('Razorpay payment ID must be a string'),
  
  body('razorpaySignature')
    .notEmpty()
    .withMessage('Razorpay signature is required')
    .isString()
    .withMessage('Razorpay signature must be a string')
];

// Validation for creating refund
export const validateCreateRefund = [
  body('paymentId')
    .notEmpty()
    .withMessage('Payment ID is required')
    .isMongoId()
    .withMessage('Invalid payment ID format')
    .custom(async (value) => {
      // Check if payment exists
      const Payment = (await import('../../models/Payment.js')).default;
      const payment = await Payment.findById(value);
      if (!payment) {
        throw new Error('Payment not found');
      }
      return true;
    }),
  
  body('amount')
    .optional()
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  
  body('reason')
    .optional()
    .isString()
    .withMessage('Reason must be a string')
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters')
];

// Validation for payment ID parameter
export const validatePaymentId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid payment ID format')
];

// Validation for Razorpay order ID parameter
export const validateRazorpayOrderId = [
  param('razorpayOrderId')
    .notEmpty()
    .withMessage('Razorpay order ID is required')
    .isString()
    .withMessage('Razorpay order ID must be a string')
];

// Validation for pagination query parameters
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Custom validation for payment amount
export const validatePaymentAmount = (req, res, next) => {
  const { amount } = req.body;
  
  if (amount && (amount < 1 || amount > 10000000)) {
    return res.status(400).json({
      message: 'Payment amount must be between ₹1 and ₹1,00,00,000'
    });
  }
  
  next();
};

// Custom validation for currency
export const validateCurrency = (req, res, next) => {
  const { currency } = req.body;
  const allowedCurrencies = ['INR', 'USD', 'EUR', 'GBP'];
  
  if (currency && !allowedCurrencies.includes(currency)) {
    return res.status(400).json({
      message: `Currency must be one of: ${allowedCurrencies.join(', ')}`
    });
  }
  
  next();
};

// Validation for payment method
export const validatePaymentMethod = [
  body('paymentMethod')
    .optional()
    .isIn(['card', 'netbanking', 'wallet', 'upi', 'emi'])
    .withMessage('Invalid payment method')
];
