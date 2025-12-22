import Product from '../models/Product.js';
import mongoose from 'mongoose';
import User from '../models/User.js';

// @desc    Get single product by ID
// @route   GET /api/admin/products/:id
// @access  Private/Admin
export const getProductById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      message: 'Error fetching product',
      error: error.message
    });
  }
};

// @desc    Create a new product
// @route   POST /api/admin/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, countInStock, image, images, category } = req.body;
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: `Product "${name}" already exists`
      });
    }
    const product = new Product({
      name,
      description,
      price,
      countInStock: countInStock || 0,
      image: image || '/images/sample.jpg',
      images: images || [],
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

export const createProductsBulk = async (req, res) => {
  try {
    const productsData = req.body;

    const incomingNames = productsData.map(p => p.name);

    // Find existing products with these names
    const existingProducts = await Product.find({ name: { $in: incomingNames } });
    const existingNames = existingProducts.map(p => p.name);

    const productsToInsert = productsData
    .filter(prod => !existingNames.includes(prod.name))
    .map(prod => ({
      name: prod.name,
      description: prod.description,
      price: prod.price,
      countInStock: prod.countInStock || 0,
      image: prod.image || '/images/sample.jpg',
      category: prod.category,
      user: req.user._id
    }));

    const createdProducts = await Product.insertMany(productsToInsert);

    res.status(200).json({
      success: true,
      message: `${createdProducts.length} products created successfully`,
      data: createdProducts
    });
  } catch (error) {
    console.error('Error creating products:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating products',
      error: error.message 
    });
  }
};



export const updateRole = async(req,res)=>{
  try {
    const {userId} = req.params;
    const {role} = req.body;
    if(!role){
      return res.status(400).json({message:"Role is required"});
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({message:"User not found"});
    }

    user.role = role;
    await user.save();
    res.status(200).json({
      message: `User role updated to '${role}' successfully`
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({
      message: "Error updating user role",
      error: error.message,
    });
  }
}


export const deleteUser = async(req,res) =>{
  try {
    const {userId} = req.params;
    console.log("USerId is ",userId);
    const user  = await User.findById(userId);
    if(!user){
      return res.status(404).json({message:"User not found"});
    }
    await user.deleteOne();
    res.status(200).json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error in deleting the user',
      error: error.message 
    });
  }
}

// @desc    Update a product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const { name, description, price, image, images, category, countInStock } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update product fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price ?? product.price;
    product.image = image || product.image;
    product.images = images || product.images;
    product.category = category || product.category;
    product.countInStock = countInStock ?? product.countInStock;

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
    
    await product.deleteOne();
    
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
