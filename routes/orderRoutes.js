import express from "express";
import Order from "../models/Order.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  const { items, totalPrice } = req.body;
  const order = await Order.create({ user: req.user._id, items, totalPrice });
  res.status(201).json(order);
});

router.get("/my", protect, async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate("items.product");
  res.json(orders);
});

router.get("/", protect, adminOnly, async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .populate("items.product");
  res.json(orders);
});

router.put("/:id", protect, adminOnly, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ msg: "Order not found" });

  order.status = req.body.status;
  await order.save();
  res.json(order);
});

export default router;
