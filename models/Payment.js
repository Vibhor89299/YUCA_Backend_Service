import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false // Not required for guest payments
  },
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Guest",
    required: false // Not required for registered user payments
  },
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true
  },
  razorpayPaymentId: {
    type: String,
    unique: true,
    sparse: true // Allows null values but ensures uniqueness when present
  },
  razorpaySignature: {
    type: String,
    sparse: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: "INR"
  },
  status: {
    type: String,
    enum: ["created", "attempted", "paid", "failed", "cancelled", "refunded"],
    default: "created"
  },
  paymentMethod: {
    type: String,
    enum: ["card", "netbanking", "wallet", "upi", "emi"],
    default: "card"
  },
  receipt: {
    type: String,
    required: true
  },
  notes: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  refunds: [{
    razorpayRefundId: String,
    amount: Number,
    status: {
      type: String,
      enum: ["processed", "pending", "failed"]
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Payment type tracking
  paymentType: {
    type: String,
    enum: ['registered', 'guest'],
    default: 'registered'
  },
  
  // Guest-specific information
  guestInfo: {
    email: String,
    name: String,
    phone: String
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 });
paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ guest: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentType: 1 });

// Pre-save middleware to update updatedAt
paymentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
