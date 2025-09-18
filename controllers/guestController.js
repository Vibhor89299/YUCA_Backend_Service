import Guest from '../models/Guest.js';
import Order from '../models/Order.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Create or find guest
export const createOrFindGuest = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, name, phone, preferences = {} } = req.body;
    
    // Create guest data
    const guestData = {
      email,
      name,
      phone,
      preferences,
      sessionId: req.sessionID || null,
      ipAddress: req.ip || req.connection.remoteAddress
    };

    // Find or create guest
    const guest = await Guest.findOrCreateGuest(guestData);

    res.status(200).json({
      message: 'Guest created/found successfully',
      guest: {
        id: guest._id,
        guestId: guest.guestId,
        email: guest.email,
        name: guest.name,
        phone: guest.phone,
        preferences: guest.preferences
      }
    });

  } catch (error) {
    console.error('Error creating/finding guest:', error);
    res.status(500).json({ 
      message: 'Error creating/finding guest', 
      error: error.message 
    });
  }
};

// Get guest by ID
export const getGuest = async (req, res) => {
  try {
    const { guestId } = req.params;
    
    const guest = await Guest.findOne({ 
      guestId: guestId,
      isActive: true 
    });

    if (!guest) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    res.status(200).json({
      guest: {
        id: guest._id,
        guestId: guest.guestId,
        email: guest.email,
        name: guest.name,
        phone: guest.phone,
        preferences: guest.preferences,
        createdAt: guest.createdAt
      }
    });

  } catch (error) {
    console.error('Error fetching guest:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get guest orders
export const getGuestOrders = async (req, res) => {
  try {
    const { guestId } = req.params;
    
    const guest = await Guest.findOne({ 
      guestId: guestId,
      isActive: true 
    });

    if (!guest) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    const orders = await Order.find({ guest: guest._id })
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 });

    res.status(200).json({
      guest: {
        id: guest._id,
        guestId: guest.guestId,
        email: guest.email,
        name: guest.name
      },
      orders
    });

  } catch (error) {
    console.error('Error fetching guest orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Track guest order by email and phone
export const trackGuestOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, phone, orderId } = req.body;

    // Find guest by email and phone
    const guest = await Guest.findOne({ 
      email: email.toLowerCase(),
      phone: phone,
      isActive: true 
    });

    if (!guest) {
      return res.status(404).json({ message: 'No orders found with this email and phone' });
    }

    // Find orders for this guest
    let orders;
    if (orderId) {
      // Find specific order
      orders = await Order.findOne({ 
        _id: orderId,
        guest: guest._id 
      }).populate('items.product', 'name price image');
      
      if (!orders) {
        return res.status(404).json({ message: 'Order not found' });
      }
    } else {
      // Find all orders
      orders = await Order.find({ guest: guest._id })
        .populate('items.product', 'name price image')
        .sort({ createdAt: -1 });
    }

    res.status(200).json({
      guest: {
        id: guest._id,
        guestId: guest.guestId,
        email: guest.email,
        name: guest.name
      },
      orders: Array.isArray(orders) ? orders : [orders]
    });

  } catch (error) {
    console.error('Error tracking guest order:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Convert guest to registered user
export const convertGuestToUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { guestId, userId } = req.body;

    const guest = await Guest.findOne({ 
      guestId: guestId,
      isActive: true 
    });

    if (!guest) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    if (!guest.canConvertToUser()) {
      return res.status(400).json({ message: 'Guest cannot be converted to user' });
    }

    // Link guest to user
    await guest.linkToUser(userId);

    // Update all guest orders to link to user
    await Order.updateMany(
      { guest: guest._id },
      { 
        user: userId,
        guest: null,
        orderType: 'registered'
      }
    );

    // Update all guest payments to link to user
    const Payment = mongoose.model('Payment');
    await Payment.updateMany(
      { guest: guest._id },
      { 
        user: userId,
        guest: null,
        paymentType: 'registered'
      }
    );

    res.status(200).json({
      message: 'Guest successfully converted to user',
      guest: {
        id: guest._id,
        guestId: guest.guestId,
        linkedUserId: guest.linkedUserId
      }
    });

  } catch (error) {
    console.error('Error converting guest to user:', error);
    res.status(500).json({ 
      message: 'Error converting guest to user', 
      error: error.message 
    });
  }
};

// Update guest preferences
export const updateGuestPreferences = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { guestId } = req.params;
    const { preferences } = req.body;

    const guest = await Guest.findOne({ 
      guestId: guestId,
      isActive: true 
    });

    if (!guest) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    // Update preferences
    guest.preferences = { ...guest.preferences, ...preferences };
    await guest.save();

    res.status(200).json({
      message: 'Guest preferences updated successfully',
      guest: {
        id: guest._id,
        guestId: guest.guestId,
        preferences: guest.preferences
      }
    });

  } catch (error) {
    console.error('Error updating guest preferences:', error);
    res.status(500).json({ 
      message: 'Error updating guest preferences', 
      error: error.message 
    });
  }
};

// Clean up old guest records (Admin only)
export const cleanupOldGuests = async (req, res) => {
  try {
    // Delete guest records older than 90 days that haven't been converted
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);

    const result = await Guest.deleteMany({
      createdAt: { $lt: cutoffDate },
      accountCreated: false,
      isActive: true
    });

    res.status(200).json({
      message: 'Old guest records cleaned up successfully',
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error cleaning up old guests:', error);
    res.status(500).json({ 
      message: 'Error cleaning up old guests', 
      error: error.message 
    });
  }
};

