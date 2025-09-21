import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import Guest from '../models/Guest.js';
import { 
  createRazorpayOrder, 
  verifyPaymentSignature, 
  createRefund, 
  getPaymentDetails 
} from '../config/razorpay.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Create a new payment order
export const createPaymentOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId, guestInfo } = req.body;
    const userId = req.user?.id; // Optional for guest payments
    const isGuestPayment = !userId && guestInfo;

    // Find the order
    const order = await Order.findById(orderId).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization based on order type
    if (order.orderType === 'registered') {
      // For registered user orders, check if user owns this order
      if (!userId || order.user.toString() !== userId) {
        await session.abortTransaction();
        return res.status(403).json({ message: 'Not authorized to pay for this order' });
      }
    } else if (order.orderType === 'guest') {
      // For guest orders, verify guest information
      if (!isGuestPayment || !guestInfo) {
        await session.abortTransaction();
        return res.status(400).json({ message: 'Guest information required for guest orders' });
      }
      
      // Verify guest info matches order
      if (order.guestInfo.email !== guestInfo.email || 
          order.guestInfo.phone !== guestInfo.phone) {
        await session.abortTransaction();
        return res.status(403).json({ message: 'Guest information does not match order' });
      }
    }

    // Check if order is already paid
    if (order.status === 'Paid') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Order is already paid' });
    }

    // Check if payment already exists for this order
    const existingPayment = await Payment.findOne({ order: orderId }).session(session);
    if (existingPayment && existingPayment.status === 'paid') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Payment already completed for this order' });
    }

    // Create receipt ID (max 40 characters for Razorpay)
    const receipt = `rcpt_${orderId.toString().slice(-8)}_${Date.now().toString().slice(-8)}`;

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder(
      order.totalPrice,
      'INR',
      receipt,
      {
        orderId: orderId,
        userId: userId
      }
    );

    // Create payment record
    const paymentData = {
      order: orderId,
      razorpayOrderId: razorpayOrder.id,
      amount: order.totalPrice,
      currency: 'INR',
      receipt: receipt,
      status: 'created',
      notes: {
        orderId: orderId
      }
    };

    if (isGuestPayment) {
      paymentData.guest = order.guest;
      paymentData.guestInfo = {
        email: guestInfo.email,
        name: guestInfo.name,
        phone: guestInfo.phone
      };
      paymentData.notes.guestId = order.guest.toString();
    } else {
      paymentData.user = userId;
      paymentData.notes.userId = userId;
    }

    const payment = new Payment(paymentData);

    await payment.save({ session });
    await session.commitTransaction();

    res.status(201).json({
      message: 'Payment order created successfully',
      payment: {
        id: payment._id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        status: payment.status
      },
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        status: razorpayOrder.status
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error creating payment order:', error);
    res.status(500).json({ 
      message: 'Error creating payment order', 
      error: error.message 
    });
  } finally {
    session.endSession();
  }
};

// Verify payment and update order status
export const verifyPayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { 
      razorpayOrderId, 
      razorpayPaymentId, 
      razorpaySignature,
      guestInfo 
    } = req.body;
    const userId = req.user?.id; // Optional for guest payments
    const isGuestPayment = !userId && guestInfo;

    // Find the payment record
    let payment;
    if (isGuestPayment) {
      // For guest payments, find by razorpay order ID and guest info
      payment = await Payment.findOne({ 
        razorpayOrderId: razorpayOrderId,
        guestInfo: {
          email: guestInfo.email,
          phone: guestInfo.phone
        }
      }).session(session);
    } else {
      // For registered user payments
      payment = await Payment.findOne({ 
        razorpayOrderId: razorpayOrderId,
        user: userId 
      }).session(session);
    }

    if (!payment) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Payment record not found' });
    }

    // Check if payment is already verified
    if (payment.status === 'paid') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Payment already verified' });
    }

    // Verify payment signature
    const isSignatureValid = verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isSignatureValid) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Get payment details from Razorpay
    const razorpayPayment = await getPaymentDetails(razorpayPaymentId);

    // Update payment record
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = 'paid';
    payment.paymentMethod = razorpayPayment.method;
    payment.updatedAt = new Date();

    await payment.save({ session });

    // Update order status
    const order = await Order.findById(payment.order).session(session);
    if (order) {
      order.status = 'Paid';
      order.paymentStatus = 'paid';
      order.paymentId = payment._id;
      await order.save({ session });
    }

    await session.commitTransaction();

    res.status(200).json({
      message: 'Payment verified successfully',
      payment: {
        id: payment._id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        razorpayPaymentId: payment.razorpayPaymentId
      },
      order: {
        id: order._id,
        status: order.status,
        paymentStatus: order.paymentStatus
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error verifying payment:', error);
    res.status(500).json({ 
      message: 'Error verifying payment', 
      error: error.message 
    });
  } finally {
    session.endSession();
  }
};

// Get payment details
export const getPayment = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const userId = req.user.id;

    const payment = await Payment.findById(paymentId)
      .populate('order', 'items totalPrice status')
      .populate('user', 'name email');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if user is authorized to view this payment
    if (payment.user._id.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this payment' });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all payments for a user
export const getUserPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const payments = await Payment.find({ user: userId })
      .populate('order', 'items totalPrice status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments({ user: userId });

    res.status(200).json({
      payments,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching user payments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create refund
export const createRefundPayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { paymentId, amount, reason } = req.body;
    const userId = req.user.id;

    // Find the payment
    const payment = await Payment.findById(paymentId).session(session);
    if (!payment) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if user is authorized (admin only for now)
    if (!req.user.isAdmin) {
      await session.abortTransaction();
      return res.status(403).json({ message: 'Not authorized to create refunds' });
    }

    // Check if payment is paid
    if (payment.status !== 'paid') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Payment is not completed' });
    }

    // Check if refund amount is valid
    const refundAmount = amount || payment.amount;
    if (refundAmount > payment.amount) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Refund amount cannot exceed payment amount' });
    }

    // Create refund with Razorpay
    const razorpayRefund = await createRefund(payment.razorpayPaymentId, refundAmount);

    // Update payment record
    payment.refunds.push({
      razorpayRefundId: razorpayRefund.id,
      amount: refundAmount,
      status: razorpayRefund.status,
      reason: reason || 'Refund requested'
    });

    // Update payment status if full refund
    if (refundAmount === payment.amount) {
      payment.status = 'refunded';
    }

    await payment.save({ session });

    // Update order status if full refund
    if (refundAmount === payment.amount) {
      const order = await Order.findById(payment.order).session(session);
      if (order) {
        order.status = 'Refunded';
        order.paymentStatus = 'refunded';
        await order.save({ session });
      }
    }

    await session.commitTransaction();

    res.status(200).json({
      message: 'Refund created successfully',
      refund: {
        id: razorpayRefund.id,
        amount: refundAmount,
        status: razorpayRefund.status,
        reason: reason || 'Refund requested'
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error creating refund:', error);
    res.status(500).json({ 
      message: 'Error creating refund', 
      error: error.message 
    });
  } finally {
    session.endSession();
  }
};

// Get payment status
export const getPaymentStatus = async (req, res) => {
  try {
    const { razorpayOrderId } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findOne({ 
      razorpayOrderId: razorpayOrderId,
      user: userId 
    }).populate('order', 'status totalPrice');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json({
      paymentId: payment._id,
      razorpayOrderId: payment.razorpayOrderId,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      order: {
        id: payment.order._id,
        status: payment.order.status,
        totalPrice: payment.order.totalPrice
      }
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
