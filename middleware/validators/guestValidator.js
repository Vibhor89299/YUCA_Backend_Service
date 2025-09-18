import { body, param, query } from 'express-validator';
import mongoose from 'mongoose';

// Validation for guest creation
export const validateGuestCreation = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email cannot exceed 100 characters'),
  
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('phone')
    .isMobilePhone('en-IN')
    .withMessage('Valid Indian mobile number is required')
    .isLength({ min: 10, max: 10 })
    .withMessage('Phone number must be exactly 10 digits'),
  
  body('preferences.newsletter')
    .optional()
    .isBoolean()
    .withMessage('Newsletter preference must be a boolean'),
  
  body('preferences.marketing')
    .optional()
    .isBoolean()
    .withMessage('Marketing preference must be a boolean')
];

// Validation for guest order tracking
export const validateGuestOrderTracking = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('phone')
    .isMobilePhone('en-IN')
    .withMessage('Valid Indian mobile number is required'),
  
  body('orderId')
    .isMongoId()
    .withMessage('Valid order ID is required')
    .custom(async (value) => {
      const Order = mongoose.model('Order');
      const order = await Order.findById(value);
      if (!order) {
        throw new Error('Order not found');
      }
      return true;
    })
];

// Validation for guest ID parameter
export const validateGuestId = [
  param('guestId')
    .isLength({ min: 10, max: 50 })
    .withMessage('Valid guest ID is required')
    .matches(/^guest_[a-zA-Z0-9_]+$/)
    .withMessage('Invalid guest ID format')
];

// Validation for guest order creation
export const validateGuestOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  
  body('items.*.productId')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  
  body('items.*.quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
  
  body('shippingAddress.name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Shipping name must be between 2 and 50 characters'),
  
  body('shippingAddress.address')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Shipping address must be between 10 and 200 characters'),
  
  body('shippingAddress.city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Valid city name is required'),
  
  body('shippingAddress.state')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Valid state name is required'),
  
  body('shippingAddress.pincode')
    .isPostalCode('IN')
    .withMessage('Valid Indian pincode is required'),
  
  body('shippingAddress.phone')
    .isMobilePhone('en-IN')
    .withMessage('Valid Indian mobile number is required'),
  
  body('paymentMethod')
    .isIn(['razorpay', 'cod'])
    .withMessage('Payment method must be either razorpay or cod'),
  
  // Guest-specific validation
  body('guestInfo.email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('guestInfo.name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('guestInfo.phone')
    .isMobilePhone('en-IN')
    .withMessage('Valid Indian mobile number is required')
];

// Validation for guest payment
export const validateGuestPayment = [
  body('orderId')
    .isMongoId()
    .withMessage('Valid order ID is required')
    .custom(async (value) => {
      const Order = mongoose.model('Order');
      const order = await Order.findById(value);
      if (!order) {
        throw new Error('Order not found');
      }
      if (order.orderType !== 'guest') {
        throw new Error('Order is not a guest order');
      }
      return true;
    }),
  
  body('guestInfo.email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('guestInfo.phone')
    .isMobilePhone('en-IN')
    .withMessage('Valid Indian mobile number is required')
];

// Validation for guest payment verification
export const validateGuestPaymentVerification = [
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
    .withMessage('Razorpay signature must be a string'),
  
  body('guestInfo.email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('guestInfo.phone')
    .isMobilePhone('en-IN')
    .withMessage('Valid Indian mobile number is required')
];

// Validation for converting guest to user
export const validateGuestToUserConversion = [
  body('guestId')
    .isLength({ min: 10, max: 50 })
    .withMessage('Valid guest ID is required')
    .matches(/^guest_[a-zA-Z0-9_]+$/)
    .withMessage('Invalid guest ID format'),
  
  body('userId')
    .isMongoId()
    .withMessage('Valid user ID is required')
    .custom(async (value) => {
      const User = mongoose.model('User');
      const user = await User.findById(value);
      if (!user) {
        throw new Error('User not found');
      }
      return true;
    })
];

// Validation for guest preferences update
export const validateGuestPreferences = [
  body('preferences.newsletter')
    .optional()
    .isBoolean()
    .withMessage('Newsletter preference must be a boolean'),
  
  body('preferences.marketing')
    .optional()
    .isBoolean()
    .withMessage('Marketing preference must be a boolean')
];

// Custom validation for guest checkout flow
export const validateGuestCheckoutFlow = (req, res, next) => {
  const { guestInfo } = req.body;
  
  if (!guestInfo) {
    return res.status(400).json({
      message: 'Guest information is required for guest checkout'
    });
  }
  
  const { email, name, phone } = guestInfo;
  
  if (!email || !name || !phone) {
    return res.status(400).json({
      message: 'Email, name, and phone are required for guest checkout'
    });
  }
  
  next();
};

// Custom validation for order type
export const validateOrderType = (req, res, next) => {
  const { guestInfo } = req.body;
  const hasAuth = req.headers.authorization;
  
  if (!guestInfo && !hasAuth) {
    return res.status(400).json({
      message: 'Either authentication token or guest information is required'
    });
  }
  
  if (guestInfo && hasAuth) {
    return res.status(400).json({
      message: 'Cannot provide both authentication and guest information'
    });
  }
  
  next();
};

