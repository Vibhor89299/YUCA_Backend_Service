// backend/models/ComboOffer.js
import mongoose from 'mongoose';

const comboOfferSchema = new mongoose.Schema({
  baseProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  comboProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  discountType: {
    type: String,
    enum: ['flat', 'percent'],
    default: 'flat'
  },
  discountValue: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure no duplicate combos
comboOfferSchema.index({ baseProduct: 1, comboProduct: 1 }, { unique: true });

export default mongoose.model('ComboOffer', comboOfferSchema);