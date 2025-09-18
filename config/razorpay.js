import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// Initialize Razorpay instance (only if credentials are available)
let razorpay = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.warn('⚠️  Razorpay credentials not found in environment variables');
  console.warn('Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file');
}

export default razorpay;

// Razorpay utility functions
export const createRazorpayOrder = async (amount, currency = 'INR', receipt, notes = {}) => {
  if (!razorpay) {
    throw new Error('Razorpay not initialized. Please check your credentials.');
  }
  
  try {
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise (smallest currency unit)
      currency,
      receipt,
      notes
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new Error(`Failed to create Razorpay order: ${error.message}`);
  }
};

export const verifyPaymentSignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  try {
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === razorpaySignature;
  } catch (error) {
    console.error('Error verifying payment signature:', error);
    return false;
  }
};

export const createRefund = async (paymentId, amount) => {
  if (!razorpay) {
    throw new Error('Razorpay not initialized. Please check your credentials.');
  }
  
  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount * 100 // Convert to paise
    });
    return refund;
  } catch (error) {
    console.error('Error creating refund:', error);
    throw new Error(`Failed to create refund: ${error.message}`);
  }
};

export const getPaymentDetails = async (paymentId) => {
  if (!razorpay) {
    throw new Error('Razorpay not initialized. Please check your credentials.');
  }
  
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Error fetching payment details:', error);
    throw new Error(`Failed to fetch payment details: ${error.message}`);
  }
};
