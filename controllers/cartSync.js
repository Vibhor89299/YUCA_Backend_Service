import Product from '../models/Product.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';

// @desc    Sync guest cart with user cart after login
// @route   POST /api/cart/sync
// @access  Private
export const syncGuestCart = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { items } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Items must be an array' });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Process each guest cart item
    for (const item of items) {
      const { id: productId, quantity } = item;
      
      // Verify product exists
      const product = await Product.findById(productId);
      if (!product) continue; // Skip invalid products
      
      // Check if item already exists in user's cart
      const existingCartItem = user.cart.find(
        cartItem => cartItem.productId.toString() === productId
      );

      if (existingCartItem) {
        // Update quantity (add guest cart quantity to existing)
        existingCartItem.quantity += quantity;
      } else {
        // Add new item to cart
        user.cart.push({ productId, quantity });
      }
    }

    await user.save();

    // Return updated cart with full product details
    const populatedUser = await User.findById(userId).populate('cart.productId');
    const cartItems = populatedUser.cart.map(item => ({
      id: item.productId._id,
      product: item.productId,
      quantity: item.quantity
    }));

    const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    res.status(200).json({
      message: 'Cart synced successfully',
      items: cartItems,
      total,
      itemCount
    });

  } catch (error) {
    console.error('Error syncing cart:', error);
    res.status(500).json({ message: 'Server error while syncing cart' });
  }
};
