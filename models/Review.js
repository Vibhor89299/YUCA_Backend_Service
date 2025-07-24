import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    rating: { 
      type: Number, 
      required: true 
    },
    comment: { 
      type: String, 
      required: true 
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent user from submitting more than one review per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to get average rating and save
reviewSchema.statics.getAverageRating = async function (productId) {
  const obj = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    await this.model('Product').findByIdAndUpdate(productId, {
      rating: obj[0] ? obj[0].averageRating : 0,
      numReviews: obj[0] ? obj[0].numReviews : 0,
    });
  } catch (error) {
    console.error(error);
  }
};

// Call getAverageRating after save
reviewSchema.post('save', function () {
  this.constructor.getAverageRating(this.product);
});

// Call getAverageRating after remove
reviewSchema.post('remove', function () {
  this.constructor.getAverageRating(this.product);
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
