import express from "express";
import {
  subscribe,
  unsubscribe,
  getSubscribers,
  getSubscriptionStats,
} from "../controllers/emailSubscriptionController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/", subscribe); // POST /api/subscribe
router.post("/unsubscribe", unsubscribe); // POST /api/subscribe/unsubscribe

// Admin routes
router.get("/subscribers", protect, adminOnly, getSubscribers); // GET /api/subscribe/subscribers
router.get("/stats", protect, adminOnly, getSubscriptionStats); // GET /api/subscribe/stats

export default router;
