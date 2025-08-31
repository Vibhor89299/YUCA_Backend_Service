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
    price: {
      type: Number,
      required: [true, 'Please enter product price'],
      maxLength: [5, 'Product price cannot exceed 5 characters'],
      default: 0.0
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
          'Electronics',
          'Cameras',
          'Laptops',
          'Accessories',
          'Headphones',
          'Food',
          'Books',
          'Clothes/Shoes',
          'Beauty/Health',
          'Sports',
          'Outdoor',
          'Home'
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
productSchema.pre('remove', async function(next) {
  await this.model('Review').deleteMany({ product: this._id });
  next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;