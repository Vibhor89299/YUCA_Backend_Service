import express from "express";
import Product from "../models/Product.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create product
router.post("/products", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ msg: "Failed to create product", error: err.message });
  }
});

// Get all products
router.get("/products", protect, adminOnly, async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch products", error: err.message });
  }
});

// Update product
router.put("/products/:id", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ msg: "Failed to update product", error: err.message });
  }
});

// Low-stock alert
router.get("/low-stock", protect, adminOnly, async (req, res) => {
  try {
    const lowStockProducts = await Product.find({ countInStock: { $lt: 5 } });
    res.json(lowStockProducts);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch low stock", error: err.message });
  }
});

export default router;
