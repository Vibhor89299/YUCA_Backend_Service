import express from 'express';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { uploadSingle, uploadMultiple, handleUploadError } from '../middlewares/cloudinaryUpload.js';
import {
  uploadProductImage,
  uploadProductImages,
  deleteProductImage,
  deleteProductImages,
} from '../controllers/uploadController.js';

const router = express.Router();

// @desc    Upload single product image
// @route   POST /api/upload/product
// @access  Private/Admin
router.post(
  '/product',
  protect,
  adminOnly,
  uploadSingle,
  handleUploadError,
  uploadProductImage
);

// @desc    Upload multiple product images (up to 5)
// @route   POST /api/upload/products
// @access  Private/Admin
router.post(
  '/products',
  protect,
  adminOnly,
  uploadMultiple,
  handleUploadError,
  uploadProductImages
);

// @desc    Delete single image from Cloudinary
// @route   DELETE /api/upload/:publicId
// @access  Private/Admin
router.delete(
  '/:publicId(*)',  // (*) allows slashes in the publicId
  protect,
  adminOnly,
  deleteProductImage
);

// @desc    Delete multiple images from Cloudinary
// @route   POST /api/upload/delete-multiple
// @access  Private/Admin
router.post(
  '/delete-multiple',
  protect,
  adminOnly,
  deleteProductImages
);

export default router;
