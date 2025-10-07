import express from 'express';
import { body } from 'express-validator';
import {
  sendInvoiceEmail,
  sendOrderConfirmationEmail,
  sendOrderUpdateEmail,
  sendCustomEmail,
  testEmail,
  getEmailStatus
} from '../controllers/emailController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Validation middleware
const orderUpdateValidation = [
  body('updateMessage')
    .notEmpty()
    .withMessage('Update message is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Update message must be between 10 and 1000 characters')
];

const customEmailValidation = [
  body('to')
    .isEmail()
    .withMessage('Valid email address is required'),
  body('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Message must be between 10 and 5000 characters')
];

const testEmailValidation = [
  body('email')
    .optional()
    .isEmail()
    .withMessage('Valid email address is required')
];

// @route   POST /api/email/invoice/:orderId
// @desc    Send invoice email for a specific order
// @access  Private/Admin
router.post('/invoice/:orderId', protect, adminOnly, sendInvoiceEmail);

// @route   POST /api/email/confirmation/:orderId
// @desc    Send order confirmation email
// @access  Private/Admin
router.post('/confirmation/:orderId', protect, adminOnly, sendOrderConfirmationEmail);

// @route   POST /api/email/update/:orderId
// @desc    Send order update email
// @access  Private/Admin
router.post('/update/:orderId', protect, adminOnly, orderUpdateValidation, sendOrderUpdateEmail);

// @route   POST /api/email/custom
// @desc    Send custom email (admin only)
// @access  Private/Admin
router.post('/custom', protect, adminOnly, customEmailValidation, sendCustomEmail);

// @route   POST /api/email/test
// @desc    Send test email to verify email service
// @access  Private/Admin
router.post('/test', protect, adminOnly, testEmailValidation, testEmail);

// @route   GET /api/email/status
// @desc    Get email service status
// @access  Private/Admin
router.get('/status', protect, adminOnly, getEmailStatus);

export default router;
