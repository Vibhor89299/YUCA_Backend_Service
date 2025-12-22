import express from "express";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import {
  createProduct,
  createProductsBulk,
  updateProduct,
  deleteProduct,
  updateInventory,
  getProductsAdmin,
  getProductById,
  deleteUser,
  updateRole
} from "../controllers/adminController.js";
import { 
  productValidationRules, 
  bulkProductValidationRules,
  inventoryValidationRules 
} from "../middleware/validators/productValidator.js";
import { validate } from "../middleware/validationMiddleware.js";
import Product from "../models/Product.js"
const router = express.Router();

// @desc    Create a new product
// @route   POST /api/admin/products
// @access  Private/Admin
router.post(
  "/products",
  protect,
  adminOnly,
  productValidationRules(),
  validate,
  createProduct
);

router.post(
  "/bulk/createProducts",
  protect,
  adminOnly,
  bulkProductValidationRules(),
  validate,
  createProductsBulk
);


router.patch("/users/:userId/role",
  protect,
  adminOnly,
  updateRole,
);


router.delete("/users/:userId/",
  protect,
  adminOnly,
  deleteUser,
)


// @desc    Get all products with pagination
// @route   GET /api/admin/products
// @access  Private/Admin
router.get("/products", protect, adminOnly, getProductsAdmin);

// @desc    Get single product by ID
// @route   GET /api/admin/products/:id
// @access  Private/Admin
router.get("/products/:id", protect, adminOnly, getProductById);

// @desc    Update a product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
router.put(
  "/products/:id",
  protect,
  adminOnly,
  productValidationRules(),
  validate,
  updateProduct
);

// @desc    Update product inventory
// @route   PUT /api/admin/products/:id/inventory
// @access  Private/Admin
router.put(
  "/products/:id/inventory",
  protect,
  adminOnly,
  inventoryValidationRules(),
  validate,
  updateInventory
);

// @desc    Delete a product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
router.delete("/products/:id", protect, adminOnly, deleteProduct);

// @desc    Get low stock products
// @route   GET /api/admin/low-stock
// @access  Private/Admin
router.get("/low-stock", protect, adminOnly, async (req, res) => {
  try {
    const lowStockProducts = await Product.find({ 
      countInStock: { $lt: 5 } 
    }).sort({ countInStock: 1 });
    
    res.json({
      count: lowStockProducts.length,
      products: lowStockProducts
    });
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({ 
      message: 'Error fetching low stock products',
      error: error.message 
    });
  }
});

export default router;
