import mongoose from "mongoose";

const guestSchema = new mongoose.Schema({
  // Guest identification
  guestId: {
    type: String,
    required: true,
    unique: true,
    default: () => `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  
  // Contact information
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  phone: {
    type: String,
    required: true,
    trim: true
  },
  
  // Optional: Allow guest to create account later
  accountCreated: {
    type: Boolean,
    default: false
  },
  
  // Link to user account if created later
  linkedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Guest session tracking
  sessionId: {
    type: String,
    default: null
  },
  
  // IP address for security
  ipAddress: {
    type: String,
    default: null
  },
  
  // Guest preferences
  preferences: {
    newsletter: {
      type: Boolean,
      default: false
    },
    marketing: {
      type: Boolean,
      default: false
    }
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  lastActivity: {
    type: Date,
    default: Date.now
  },
  
  // Cleanup flag for old guest records
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
guestSchema.index({ guestId: 1 });
guestSchema.index({ email: 1 });
guestSchema.index({ sessionId: 1 });
guestSchema.index({ createdAt: 1 });
guestSchema.index({ isActive: 1 });

// Pre-save middleware to update lastActivity
guestSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

// Static method to find or create guest
guestSchema.statics.findOrCreateGuest = async function(guestData) {
  try {
    // Try to find existing guest by email
    let guest = await this.findOne({ 
      email: guestData.email,
      isActive: true 
    });
    
    if (guest) {
      // Update last activity
      guest.lastActivity = new Date();
      await guest.save();
      return guest;
    }
    
    // Create new guest
    guest = new this(guestData);
    await guest.save();
    return guest;
  } catch (error) {
    throw new Error(`Failed to find or create guest: ${error.message}`);
  }
};

// Method to link guest to user account
guestSchema.methods.linkToUser = async function(userId) {
  this.linkedUserId = userId;
  this.accountCreated = true;
  this.isActive = false; // Deactivate guest record
  await this.save();
  return this;
};

// Method to get guest orders
guestSchema.methods.getOrders = async function() {
  const Order = mongoose.model('Order');
  return await Order.find({ guest: this._id })
    .populate('items.product', 'name price image')
    .sort({ createdAt: -1 });
};

// Method to check if guest can be converted to user
guestSchema.methods.canConvertToUser = function() {
  return !this.accountCreated && this.isActive;
};

const Guest = mongoose.model("Guest", guestSchema);

export default Guest;
