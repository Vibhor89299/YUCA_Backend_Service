import Product from '../models/Product.js';
import { validationResult } from 'express-validator';

export const addToCart = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    // Check if product exists and has sufficient stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.countInStock < quantity) {
      return res.status(400).json({ 
        message: 'Insufficient stock',
        available: product.countInStock
      });
    }

    // Here you would typically add to user's cart in the database
    // For now, we'll just return success
    res.status(200).json({
      message: 'Product added to cart',
      product: {
        id: product._id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCart = async (req, res) => {
  try {
    // Here you would typically fetch the user's cart from the database
    // For now, returning an empty cart
    res.status(200).json({ items: [], total: 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
