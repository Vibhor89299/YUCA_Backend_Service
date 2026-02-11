import mongoose from "mongoose";

const emailSubscriptionSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    status: {
      type: String,
      enum: ["subscribed", "unsubscribed", "bounced"],
      default: "subscribed",
    },
    source: {
      type: String,
      enum: ["coming_soon", "homepage", "footer", "checkout", "popup"],
      default: "coming_soon",
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
      default: null,
    },
    metadata: {
      userAgent: { type: String, default: "" },
      ip: { type: String, default: "" },
      referrer: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
emailSubscriptionSchema.index({ email: 1 });
emailSubscriptionSchema.index({ status: 1 });
emailSubscriptionSchema.index({ source: 1 });
emailSubscriptionSchema.index({ subscribedAt: -1 });

// Static method to find or create subscription
emailSubscriptionSchema.statics.findOrSubscribe = async function (
  email,
  source = "coming_soon",
  metadata = {}
) {
  let subscription = await this.findOne({ email: email.toLowerCase() });

  if (subscription) {
    // If already exists but unsubscribed, resubscribe
    if (subscription.status === "unsubscribed") {
      subscription.status = "subscribed";
      subscription.subscribedAt = new Date();
      subscription.unsubscribedAt = null;
      subscription.source = source;
      await subscription.save();
    }
    return { subscription, isNew: false };
  }

  // Create new subscription
  subscription = await this.create({
    email: email.toLowerCase(),
    source,
    metadata,
  });

  return { subscription, isNew: true };
};

const EmailSubscription = mongoose.model(
  "EmailSubscription",
  emailSubscriptionSchema
);

export default EmailSubscription;
