import express from 'express';
import { body } from 'express-validator';
import { addToCart, getCart } from '../controllers/cartController.js';
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

export default router;
