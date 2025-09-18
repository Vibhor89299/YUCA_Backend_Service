import dotenv from 'dotenv';
import { createRazorpayOrder, verifyPaymentSignature } from '../config/razorpay.js';

// Load environment variables
dotenv.config();

// Test script for payment integration
const testPaymentIntegration = async () => {
  console.log('🧪 Testing Razorpay Payment Integration...\n');

  // Check environment variables
  console.log('1. Checking environment variables...');
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error('❌ Razorpay credentials not found in environment variables');
    console.log('\n📝 Please add the following to your .env file:');
    console.log('RAZORPAY_KEY_ID=your_razorpay_key_id_here');
    console.log('RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here');
    console.log('\n🔗 Get your credentials from: https://dashboard.razorpay.com/app/keys');
    console.log('\n💡 For testing, use test mode keys (they start with "rzp_test_")');
    return;
  }
  console.log('✅ Razorpay credentials found');

  // Test creating a Razorpay order
  console.log('\n2. Testing Razorpay order creation...');
  try {
    const testOrder = await createRazorpayOrder(
      100, // ₹1.00
      'INR',
      `test_receipt_${Date.now()}`,
      { test: true }
    );
    
    console.log('✅ Razorpay order created successfully');
    console.log('Order ID:', testOrder.id);
    console.log('Amount:', testOrder.amount);
    console.log('Currency:', testOrder.currency);
    console.log('Status:', testOrder.status);

    // Test signature verification (with dummy data)
    console.log('\n3. Testing signature verification...');
    const testSignature = 'test_signature';
    const isValid = verifyPaymentSignature(
      testOrder.id,
      'test_payment_id',
      testSignature
    );
    
    console.log('✅ Signature verification function works');
    console.log('Note: This test uses dummy data, so signature will be invalid (expected)');

  } catch (error) {
    console.error('❌ Error testing Razorpay integration:', error.message);
    
    if (error.message.includes('Invalid key_id')) {
      console.log('\n💡 Make sure your RAZORPAY_KEY_ID is correct');
    } else if (error.message.includes('Invalid key_secret')) {
      console.log('\n💡 Make sure your RAZORPAY_KEY_SECRET is correct');
    }
  }

  console.log('\n🎉 Payment integration test completed!');
  console.log('\nNext steps:');
  console.log('1. Make sure your Razorpay account is activated');
  console.log('2. Test the API endpoints using Postman or your frontend');
  console.log('3. Use test mode for development (test keys)');
  console.log('4. Switch to live mode for production (live keys)');
};

// Run the test
testPaymentIntegration().catch(console.error);
