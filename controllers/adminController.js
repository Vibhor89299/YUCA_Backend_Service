import Product from '../models/Product.js';
import mongoose from 'mongoose';

// @desc    Create a new product
// @route   POST /api/admin/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, countInStock, image, category } = req.body;
    
    const product = new Product({
      name,
      description,
      price,
      countInStock: countInStock || 0,
      image: image || '/images/sample.jpg',
      category,
      user: req.user._id
    });
    
    const createdProduct = await product.save();
    
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ 
      message: 'Error creating product',
      error: error.message 
    });
  }
};

// @desc    Update a product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const { name, description, price, image, category } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Update product fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.image = image || product.image;
    product.category = category || product.category;
    
    const updatedProduct = await product.save();
    
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ 
      message: 'Error updating product',
      error: error.message 
    });
  }
};

// @desc    Update product inventory
// @route   PUT /api/admin/products/:id/inventory
// @access  Private/Admin
export const updateInventory = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const { countInStock } = req.body;
    
    if (typeof countInStock === 'undefined') {
      return res.status(400).json({ message: 'countInStock is required' });
    }
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    product.countInStock = countInStock;
    await product.save();
    
    res.json({ 
      message: 'Inventory updated successfully',
      product: {
        _id: product._id,
        name: product.name,
        countInStock: product.countInStock
      }
    });
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({ 
      message: 'Error updating inventory',
      error: error.message 
    });
  }
};

// @desc    Delete a product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    await product.remove();
    
    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ 
      message: 'Error deleting product',
      error: error.message 
    });
  }
};

// @desc    Get all products (Admin)
// @route   GET /api/admin/products
// @access  Private/Admin
export const getProductsAdmin = async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;
    
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    const count = await Product.countDocuments({ ...keyword });
    const products = await Product.find({ ...keyword })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ 
      message: 'Error getting products',
      error: error.message 
    });
  }
};
