import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  // UUID for better ID management and relations
  orderUUID: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      const { v4: uuidv4 } = require('uuid');
      return uuidv4();
    }
  },
  // Systematic order number for customer-facing reference
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: false // Not required for guest orders
  },
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Guest",
    required: false // Not required for registered user orders
  },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String, // Product name for reference
      quantity: Number,
      price: Number, // Price at time of order
      image: String // Product image for reference
    },
  ],
  shippingAddress: {
    firstName: String,
    lastName: String,
    address: String,
    city: String,
    state: String,
    zip: String
  },
  guestInfo: {
    email: String,
    name: String,
    phone: String
  },
  totalPrice: Number,
  status: { 
    type: String, 
    default: "Processing",
    enum: ["Processing", "Paid", "Shipped", "Delivered", "Cancelled", "Refunded"]
  },
  paymentStatus: {
    type: String,
    default: "pending",
    enum: ["pending", "paid", "failed", "refunded"]
  },
  paymentMethod: {
    type: String,
    default: "razorpay"
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment"
  },
  orderType: {
    type: String,
    enum: ['registered', 'guest'],
    required: true
  },
  deliveredAt: {
    type: Date
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
orderSchema.index({ user: 1 });
orderSchema.index({ guest: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderType: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderUUID: 1 });
orderSchema.index({ orderNumber: 1 });

const Order = mongoose.model("Order", orderSchema);
export default Order;