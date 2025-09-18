# Payment API Documentation

This document describes the Razorpay payment integration API for the Yuca Lifestyle backend.

## Overview

The payment system integrates with Razorpay to handle online payments for orders. It supports:
- Creating payment orders
- Verifying payments
- Processing refunds
- Tracking payment status

## Environment Variables

Add these to your `.env` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

## API Endpoints

### 1. Create Payment Order

**POST** `/api/payments/create-order`

Creates a new Razorpay order for payment processing.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "orderId": "64f1a2b3c4d5e6f7g8h9i0j1"
}
```

**Response:**
```json
{
  "message": "Payment order created successfully",
  "payment": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j2",
    "razorpayOrderId": "order_ABC123XYZ",
    "amount": 2500,
    "currency": "INR",
    "receipt": "receipt_64f1a2b3c4d5e6f7g8h9i0j1_1699123456789",
    "status": "created"
  },
  "razorpayOrder": {
    "id": "order_ABC123XYZ",
    "amount": 250000,
    "currency": "INR",
    "receipt": "receipt_64f1a2b3c4d5e6f7g8h9i0j1_1699123456789",
    "status": "created"
  }
}
```

### 2. Verify Payment

**POST** `/api/payments/verify`

Verifies the payment signature and updates order status.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "razorpayOrderId": "order_ABC123XYZ",
  "razorpayPaymentId": "pay_ABC123XYZ",
  "razorpaySignature": "signature_hash_here"
}
```

**Response:**
```json
{
  "message": "Payment verified successfully",
  "payment": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j2",
    "status": "paid",
    "amount": 2500,
    "currency": "INR",
    "paymentMethod": "card",
    "razorpayPaymentId": "pay_ABC123XYZ"
  },
  "order": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "status": "Paid",
    "paymentStatus": "paid"
  }
}
```

### 3. Get Payment Details

**GET** `/api/payments/:id`

Retrieves payment details by payment ID.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
  "order": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "items": [...],
    "totalPrice": 2500,
    "status": "Paid"
  },
  "user": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j0",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "razorpayOrderId": "order_ABC123XYZ",
  "razorpayPaymentId": "pay_ABC123XYZ",
  "razorpaySignature": "signature_hash_here",
  "amount": 2500,
  "currency": "INR",
  "status": "paid",
  "paymentMethod": "card",
  "receipt": "receipt_64f1a2b3c4d5e6f7g8h9i0j1_1699123456789",
  "createdAt": "2023-11-04T10:30:00.000Z",
  "updatedAt": "2023-11-04T10:35:00.000Z"
}
```

### 4. Get User Payments

**GET** `/api/payments/user/payments`

Retrieves all payments for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Response:**
```json
{
  "payments": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "order": {...},
      "amount": 2500,
      "status": "paid",
      "createdAt": "2023-11-04T10:30:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 1,
    "total": 1
  }
}
```

### 5. Get Payment Status

**GET** `/api/payments/status/:razorpayOrderId`

Gets payment status by Razorpay order ID.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "paymentId": "64f1a2b3c4d5e6f7g8h9i0j2",
  "razorpayOrderId": "order_ABC123XYZ",
  "status": "paid",
  "amount": 2500,
  "currency": "INR",
  "order": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "status": "Paid",
    "totalPrice": 2500
  }
}
```

### 6. Create Refund (Admin Only)

**POST** `/api/payments/refund`

Creates a refund for a payment (Admin only).

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "paymentId": "64f1a2b3c4d5e6f7g8h9i0j2",
  "amount": 2500,
  "reason": "Customer requested refund"
}
```

**Response:**
```json
{
  "message": "Refund created successfully",
  "refund": {
    "id": "rfnd_ABC123XYZ",
    "amount": 2500,
    "status": "processed",
    "reason": "Customer requested refund"
  }
}
```

## Payment Flow

1. **Create Order**: User creates an order through the order API
2. **Create Payment**: Call `/api/payments/create-order` with the order ID
3. **Frontend Integration**: Use the returned `razorpayOrder` data to initialize Razorpay checkout
4. **Payment Processing**: User completes payment on Razorpay
5. **Verify Payment**: Call `/api/payments/verify` with payment details
6. **Order Update**: Order status is automatically updated to "Paid"

## Frontend Integration Example

```javascript
// 1. Create payment order
const createPaymentOrder = async (orderId) => {
  const response = await fetch('/api/payments/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ orderId })
  });
  return response.json();
};

// 2. Initialize Razorpay checkout
const initializeRazorpay = (paymentData) => {
  const options = {
    key: process.env.REACT_APP_RAZORPAY_KEY_ID,
    amount: paymentData.razorpayOrder.amount,
    currency: paymentData.razorpayOrder.currency,
    name: "Yuca Lifestyle",
    description: "Order Payment",
    order_id: paymentData.razorpayOrder.id,
    handler: async (response) => {
      // 3. Verify payment
      await verifyPayment(response);
    },
    prefill: {
      name: user.name,
      email: user.email,
    },
    theme: {
      color: "#3399cc"
    }
  };
  
  const razorpay = new window.Razorpay(options);
  razorpay.open();
};

// 3. Verify payment
const verifyPayment = async (razorpayResponse) => {
  const response = await fetch('/api/payments/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      razorpayOrderId: razorpayResponse.razorpay_order_id,
      razorpayPaymentId: razorpayResponse.razorpay_payment_id,
      razorpaySignature: razorpayResponse.razorpay_signature
    })
  });
  
  const result = await response.json();
  if (result.message === 'Payment verified successfully') {
    // Payment successful
    console.log('Payment successful!');
  }
};
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400`: Bad Request (validation errors, invalid data)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (payment/order not found)
- `500`: Internal Server Error (server-side errors)

## Security Features

1. **JWT Authentication**: All endpoints require valid JWT tokens
2. **Signature Verification**: Payment signatures are verified using Razorpay's algorithm
3. **User Authorization**: Users can only access their own payments
4. **Admin Protection**: Refund operations require admin privileges
5. **Input Validation**: All inputs are validated using express-validator

## Database Models

### Payment Model
- Stores payment information including Razorpay IDs
- Tracks payment status and refunds
- Links to orders and users

### Order Model (Updated)
- Added payment-related fields
- Tracks payment status and method
- Links to payment records

## Testing

Use the provided Postman collection or test the endpoints using curl:

```bash
# Create payment order
curl -X POST http://localhost:5001/api/payments/create-order \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderId": "ORDER_ID_HERE"}'
```

## Notes

- All amounts are stored in the smallest currency unit (paise for INR)
- Payment verification is mandatory for security
- Refunds can only be created by admin users
- The system supports partial and full refunds
- All payment operations are logged for audit purposes
