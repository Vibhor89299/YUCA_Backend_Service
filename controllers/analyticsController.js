import Analytics from '../models/Analytics.js';
import Order from '../models/Order.js';
import { v4 as uuidv4 } from 'uuid';

// @desc    Track page visit
// @route   POST /api/analytics/visit
// @access  Public
export const trackVisit = async (req, res) => {
  try {
    let sessionId = req.cookies.sessionId;
    
    // Create new session if doesn't exist
    if (!sessionId) {
      sessionId = uuidv4();
      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        maxAge: 30 * 60 * 1000, // 30 minutes
        sameSite: 'lax'
      });
    }
    
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';
    
    const analytics = await Analytics.getTodayStats();
    await analytics.incrementVisit(sessionId, userAgent, ipAddress);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking visit:', error);
    res.status(500).json({ message: 'Error tracking visit' });
  }
};

// @desc    Get website statistics
// @route   GET /api/analytics/stats
// @access  Public
export const getStats = async (req, res) => {
  try {
    const analytics = await Analytics.getTodayStats();
    
    // Get total orders count
    const totalOrders = await Order.countDocuments();
    
    // Calculate growth rate (compare with yesterday)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const yesterdayAnalytics = await Analytics.findOne({
      date: { $gte: yesterday, $lt: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000) }
    });
    
    let growthRate = 0;
    if (yesterdayAnalytics && yesterdayAnalytics.totalVisits > 0) {
      growthRate = ((analytics.totalVisits - yesterdayAnalytics.totalVisits) / yesterdayAnalytics.totalVisits * 100).toFixed(1);
    }
    
    // Get all-time stats
    const allTimeStats = await Analytics.aggregate([
      {
        $group: {
          _id: null,
          totalVisits: { $sum: '$totalVisits' },
          totalUniqueVisitors: { $sum: '$uniqueVisitors' },
          totalPageViews: { $sum: '$pageViews' }
        }
      }
    ]);
    
    const stats = {
      today: {
        totalVisits: analytics.totalVisits,
        uniqueVisitors: analytics.uniqueVisitors,
        pageViews: analytics.pageViews,
        activeUsers: analytics.activeUsers
      },
      allTime: {
        totalVisits: allTimeStats[0]?.totalVisits || 0,
        uniqueVisitors: allTimeStats[0]?.totalUniqueVisitors || 0,
        pageViews: allTimeStats[0]?.totalPageViews || 0
      },
      orders: {
        total: totalOrders
      },
      growth: {
        rate: parseFloat(growthRate)
      }
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
};

// @desc    Get analytics dashboard (Admin only)
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
export const getAnalyticsDashboard = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    
    const analyticsData = await Analytics.find({
      date: { $gte: startDate }
    }).sort({ date: 1 });
    
    const totalOrders = await Order.countDocuments();
    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: startDate }
    });
    
    res.json({
      analytics: analyticsData,
      orders: {
        total: totalOrders,
        recent: recentOrders
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ message: 'Error fetching analytics dashboard' });
  }
};
