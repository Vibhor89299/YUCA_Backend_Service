import express from 'express';
import { body } from 'express-validator';
import { addToCart, getCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cartController.js';
import { syncGuestCart } from '../controllers/cartSync.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private
router.post(
  '/',
  protect,
  [
    body('productId', 'Product ID is required').notEmpty(),
    body('quantity', 'Quantity must be at least 1').isInt({ min: 1 })
  ],
  addToCart
);

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', protect, getCart);

// @route   PUT /api/cart/:productId
// @desc    Update cart item quantity
// @access  Private
router.put(
  '/:productId',
  protect,
  [
    body('quantity', 'Quantity must be at least 1').isInt({ min: 1 })
  ],
  updateCartItem
);

// @route   DELETE /api/cart/:productId
// @desc    Remove item from cart
// @access  Private
router.delete('/:productId', protect, removeFromCart);

// @route   DELETE /api/cart
// @desc    Clear entire cart
// @access  Private
router.delete('/', protect, clearCart);

// @route   POST /api/cart/sync
// @desc    Sync guest cart with user cart after login
// @access  Private
router.post(
  '/sync',
  protect,
  [
    body('items').isArray().withMessage('Items must be an array'),
    body('items.*.id').notEmpty().withMessage('Each item must have a product ID'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Each item must have a valid quantity')
  ],
  syncGuestCart
);

export default router;
