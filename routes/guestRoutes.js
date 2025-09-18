import express from 'express';
import { body, param } from 'express-validator';
import {
  createOrFindGuest,
  getGuest,
  getGuestOrders,
  trackGuestOrder,
  convertGuestToUser,
  updateGuestPreferences,
  cleanupOldGuests
} from '../controllers/guestController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// @desc    Create or find guest
// @route   POST /api/guests
// @access  Public
router.post(
  '/',
  [
    body('email', 'Valid email is required').isEmail().normalizeEmail(),
    body('name', 'Name is required').trim().isLength({ min: 2, max: 50 }),
    body('phone', 'Valid phone number is required').isMobilePhone('en-IN'),
    body('preferences.newsletter').optional().isBoolean(),
    body('preferences.marketing').optional().isBoolean()
  ],
  createOrFindGuest
);

// @desc    Get guest by ID
// @route   GET /api/guests/:guestId
// @access  Public
router.get(
  '/:guestId',
  [
    param('guestId', 'Valid guest ID is required').isLength({ min: 10 })
  ],
  getGuest
);

// @desc    Get guest orders
// @route   GET /api/guests/:guestId/orders
// @access  Public
router.get(
  '/:guestId/orders',
  [
    param('guestId', 'Valid guest ID is required').isLength({ min: 10 })
  ],
  getGuestOrders
);

// @desc    Track guest order by email and phone
// @route   POST /api/guests/track-order
// @access  Public
router.post(
  '/track-order',
  [
    body('email', 'Valid email is required').isEmail().normalizeEmail(),
    body('phone', 'Valid phone number is required').isMobilePhone('en-IN'),
    body('orderId', 'Order ID is required').isMongoId()
  ],
  trackGuestOrder
);

// @desc    Convert guest to registered user
// @route   POST /api/guests/convert-to-user
// @access  Private
router.post(
  '/convert-to-user',
  protect,
  [
    body('guestId', 'Guest ID is required').isLength({ min: 10 }),
    body('userId', 'User ID is required').isMongoId()
  ],
  convertGuestToUser
);

// @desc    Update guest preferences
// @route   PUT /api/guests/:guestId/preferences
// @access  Public
router.put(
  '/:guestId/preferences',
  [
    param('guestId', 'Valid guest ID is required').isLength({ min: 10 }),
    body('preferences.newsletter').optional().isBoolean(),
    body('preferences.marketing').optional().isBoolean()
  ],
  updateGuestPreferences
);

// @desc    Clean up old guest records
// @route   DELETE /api/guests/cleanup
// @access  Private/Admin
router.delete(
  '/cleanup',
  protect,
  adminOnly,
  cleanupOldGuests
);

export default router;

