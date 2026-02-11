import Product from '../models/Product.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';

export const addToCart = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find user and update cart
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if item already exists in cart
    const existingCartItem = user.cart.find(item =>
      item.productId.toString() === productId
    );

    if (existingCartItem) {
      // Update quantity
      existingCartItem.quantity += quantity;
    } else {
      // Add new item to cart
      user.cart.push({ productId, quantity });
    }

    await user.save();

    // Get updated cart
    const updatedUser = await User.findById(userId).populate({
      path: 'cart.productId',
      model: 'Product'
    });

    // Transform cart data
    // Filter out items where product no longer exists (stale data)
    const validCartItems = updatedUser.cart.filter(item => item.productId);

    // If we found stale items, update the user's cart to remove them
    if (validCartItems.length < updatedUser.cart.length) {
      updatedUser.cart = validCartItems;
      await updatedUser.save();
    }

    // Transform cart data
    const cartItems = validCartItems.map(item => ({
      id: item.productId._id,
      quantity: item.quantity,
      product: {
        id: item.productId._id,
        name: item.productId.name,
        retailPrice: item.productId.retailPrice,
        mrp: item.productId.mrp,
        image: item.productId.image,
        countInStock: item.productId.countInStock,
        brand: item.productId.brand || 'YUCA'
      }
    }));

    const total = cartItems.reduce((sum, item) => sum + (item.product.retailPrice * item.quantity), 0);

    res.status(200).json({
      message: 'Product added to cart',
      items: cartItems,
      total,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user and populate cart with product details
    const user = await User.findById(userId).populate({
      path: 'cart.productId',
      model: 'Product'
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter out items where product no longer exists (stale data)
    const validCartItems = user.cart.filter(item => item.productId);

    // If we found stale items, just return the valid ones.
    // We avoid saving here to prevent concurrency/VersionErrors on read.
    // Cleanup will happen on next write operation (add/update/remove).
    if (validCartItems.length < user.cart.length) {
      // user.cart = validCartItems;
      // await user.save();
    }

    // Transform cart data to match frontend structure
    const cartItems = validCartItems.map(item => ({
      id: item.productId._id,
      quantity: item.quantity,
      product: {
        id: item.productId._id,
        name: item.productId.name,
        retailPrice: item.productId.retailPrice,
        mrp: item.productId.mrp,
        image: item.productId.image,
        countInStock: item.productId.countInStock,
        brand: item.productId.brand || 'YUCA'
      }
    }));

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + (item.product.retailPrice * item.quantity), 0);

    res.status(200).json({
      items: cartItems,
      total,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateCartItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const cartItem = user.cart.find(item =>
      item.productId.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    cartItem.quantity = quantity;
    await user.save();

    // Get updated cart with product details
    const updatedUser = await User.findById(userId).populate({
      path: 'cart.productId',
      model: 'Product'
    });

    // Transform cart data
    // Filter out items where product no longer exists
    const validCartItems = updatedUser.cart.filter(item => item.productId);

    if (validCartItems.length < updatedUser.cart.length) {
      updatedUser.cart = validCartItems;
      await updatedUser.save();
    }

    // Transform cart data
    const cartItems = validCartItems.map(item => ({
      id: item.productId._id,
      quantity: item.quantity,
      product: {
        id: item.productId._id,
        name: item.productId.name,
        retailPrice: item.productId.retailPrice,
        mrp: item.productId.mrp,
        image: item.productId.image,
        countInStock: item.productId.countInStock,
        brand: item.productId.brand || 'YUCA'
      }
    }));

    const total = cartItems.reduce((sum, item) => sum + (item.product.retailPrice * item.quantity), 0);

    res.status(200).json({
      message: 'Cart item updated successfully',
      items: cartItems,
      total,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.cart = user.cart.filter(item =>
      item.productId.toString() !== productId
    );

    await user.save();

    // Get updated cart with product details
    const updatedUser = await User.findById(userId).populate({
      path: 'cart.productId',
      model: 'Product'
    });

    // Transform cart data
    // Filter out items where product no longer exists
    const validCartItems = updatedUser.cart.filter(item => item.productId);

    if (validCartItems.length < updatedUser.cart.length) {
      updatedUser.cart = validCartItems;
      await updatedUser.save();
    }

    // Transform cart data
    const cartItems = validCartItems.map(item => ({
      id: item.productId._id,
      quantity: item.quantity,
      product: {
        id: item.productId._id,
        name: item.productId.name,
        retailPrice: item.productId.retailPrice,
        mrp: item.productId.mrp,
        image: item.productId.image,
        countInStock: item.productId.countInStock,
        brand: item.productId.brand || 'YUCA'
      }
    }));

    const total = cartItems.reduce((sum, item) => sum + (item.product.retailPrice * item.quantity), 0);

    res.status(200).json({
      message: 'Item removed from cart',
      items: cartItems,
      total,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.cart = [];
    await user.save();

    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
