import express from 'express';
import { trackVisit, getStats, getAnalyticsDashboard } from '../controllers/analyticsController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// @route   POST /api/analytics/visit
// @desc    Track page visit
// @access  Public
router.post('/visit', trackVisit);

// @route   GET /api/analytics/stats
// @desc    Get website statistics
// @access  Public
router.get('/stats', getStats);

// @route   GET /api/analytics/dashboard
// @desc    Get analytics dashboard (Admin only)
// @access  Private/Admin
router.get('/dashboard', protect, adminOnly, getAnalyticsDashboard);

export default router;
