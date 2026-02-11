import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter product name'],
      trim: true,
      maxLength: [100, 'Product name cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please enter product description']
    },
    retailPrice: {
      type: Number,
      required: [true, 'Please enter retail price'],
      maxLength: [5, 'Retail price cannot exceed 5 characters'],
      default: 0.0
    },
    mrp: {
      type: Number,
      required: [true, 'Please enter MRP'],
      maxLength: [5, 'MRP cannot exceed 5 characters'],
      default: 0.0
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true
    },
    countInStock: {
      type: Number,
      required: [true, 'Please enter product stock'],
      maxLength: [5, 'Product stock cannot exceed 5 characters'],
      default: 0
    },
    category: {
      type: String,
      required: [true, 'Please select category for this product'],
      enum: {
        values: [
          'kosha',
          'home',
          'lifestyle',
          'wellness',
          'sustainable',
          'bowls',
          'candles',
          'glassware',
          'cutlery'
        ],
        message: 'Please select correct category for product'
      }
    },
    image: {
      type: String,
      default: '/images/sample.jpg'
    },
    images: [{
      type: String
    }],
    rating: {
      type: Number,
      default: 0
    },
    numReviews: {
      type: Number,
      default: 0
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true
    },
    isNewArrival: {
      type: Boolean,
      default: false,
      index: true
    },
    newArrivalOrder: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create index for search
productSchema.index({ name: 'text', description: 'text' });

// Virtual for reviews
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
  justOne: false
});

// Cascade delete reviews when a product is deleted
productSchema.pre('remove', async function (next) {
  await this.model('Review').deleteMany({ product: this._id });
  next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;