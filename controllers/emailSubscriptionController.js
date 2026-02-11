import EmailSubscription from "../models/EmailSubscription.js";
import EmailService from "../config/email.js";

// Initialize email service
const emailService = new EmailService();

/**
 * Subscribe to newsletter/coming soon notifications
 * POST /api/subscribe
 */
export const subscribe = async (req, res) => {
  try {
    const { email, source = "coming_soon" } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Get metadata from request
    const metadata = {
      userAgent: req.headers["user-agent"] || "",
      ip: req.ip || req.connection?.remoteAddress || "",
      referrer: req.headers.referer || req.headers.referrer || "",
    };

    // Find or create subscription
    const { subscription, isNew } = await EmailSubscription.findOrSubscribe(
      email,
      source,
      metadata
    );

    if (isNew) {
      // Send welcome email asynchronously (don't block the response)
      emailService.sendWelcomeEmail(subscription.email, source).catch((err) => {
        console.error("Failed to send welcome email:", err);
      });

      return res.status(201).json({
        success: true,
        message: "Thank you for subscribing! Check your inbox for a welcome email.",
        data: {
          email: subscription.email,
          subscribedAt: subscription.subscribedAt,
        },
      });
    } else if (subscription.status === "subscribed") {
      return res.status(200).json({
        success: true,
        message: "You're already subscribed. We'll keep you updated!",
        data: {
          email: subscription.email,
          subscribedAt: subscription.subscribedAt,
        },
      });
    } else {
      // Send welcome back email asynchronously
      emailService.sendWelcomeEmail(subscription.email, source).catch((err) => {
        console.error("Failed to send welcome back email:", err);
      });

      return res.status(200).json({
        success: true,
        message: "Welcome back! Check your inbox for a confirmation email.",
        data: {
          email: subscription.email,
          subscribedAt: subscription.subscribedAt,
        },
      });
    }
  } catch (error) {
    console.error("Subscription error:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: "You're already subscribed!",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Unsubscribe from newsletter
 * POST /api/subscribe/unsubscribe
 */
export const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const subscription = await EmailSubscription.findOne({
      email: email.toLowerCase(),
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Email not found in our subscription list",
      });
    }

    if (subscription.status === "unsubscribed") {
      return res.status(200).json({
        success: true,
        message: "You're already unsubscribed",
      });
    }

    subscription.status = "unsubscribed";
    subscription.unsubscribedAt = new Date();
    await subscription.save();

    return res.status(200).json({
      success: true,
      message: "You've been successfully unsubscribed",
    });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

/**
 * Get all subscribers (Admin only)
 * GET /api/subscribe/subscribers
 */
export const getSubscribers = async (req, res) => {
  try {
    const { status, source, page = 1, limit = 50 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (source) query.source = source;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [subscribers, total] = await Promise.all([
      EmailSubscription.find(query)
        .sort({ subscribedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select("-__v"),
      EmailSubscription.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        subscribers,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get subscribers error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscribers",
    });
  }
};

/**
 * Get subscription stats (Admin only)
 * GET /api/subscribe/stats
 */
export const getSubscriptionStats = async (req, res) => {
  try {
    const [totalSubscribed, totalUnsubscribed, bySource] = await Promise.all([
      EmailSubscription.countDocuments({ status: "subscribed" }),
      EmailSubscription.countDocuments({ status: "unsubscribed" }),
      EmailSubscription.aggregate([
        { $match: { status: "subscribed" } },
        { $group: { _id: "$source", count: { $sum: 1 } } },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalSubscribed,
        totalUnsubscribed,
        bySource: bySource.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscription stats",
    });
  }
};
