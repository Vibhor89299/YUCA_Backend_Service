import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Verify configuration
const verifyCloudinaryConfig = () => {
  const { cloud_name, api_key, api_secret } = cloudinary.config();

  if (!cloud_name || !api_key || !api_secret) {
    console.warn('WARNING: Cloudinary credentials not fully configured');
    console.warn('Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env');
    return false;
  }

  console.log('Cloudinary configured for cloud:', cloud_name);
  return true;
};

// Image transformation presets
export const transformations = {
  // Product listing thumbnail (square crop)
  thumbnail: {
    width: 300,
    height: 300,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto',
  },

  // Product detail main image
  productMain: {
    width: 800,
    crop: 'limit',
    quality: 'auto',
    fetch_format: 'auto',
  },

  // Product zoom/full size
  productZoom: {
    width: 1200,
    crop: 'limit',
    quality: 'auto',
    fetch_format: 'auto',
  },

  // Cart/order thumbnail (small square)
  cartThumbnail: {
    width: 80,
    height: 80,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto',
  },

  // Blur placeholder for lazy loading
  placeholder: {
    width: 20,
    quality: 30,
    effect: 'blur:1000',
    fetch_format: 'auto',
  },
};

// Generate optimized URL with transformations
export const getOptimizedUrl = (publicId, preset = 'productMain') => {
  if (!publicId) return null;

  const transform = transformations[preset] || transformations.productMain;

  return cloudinary.url(publicId, {
    ...transform,
    secure: true,
  });
};

// Generate responsive srcset URLs
export const getResponsiveSrcSet = (publicId) => {
  if (!publicId) return '';

  const widths = [400, 600, 800, 1200];

  return widths.map(width => {
    const url = cloudinary.url(publicId, {
      width,
      crop: 'limit',
      quality: 'auto',
      fetch_format: 'auto',
      secure: true,
    });
    return `${url} ${width}w`;
  }).join(', ');
};

// Delete image from Cloudinary
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Delete multiple images
export const deleteImages = async (publicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    console.error('Error deleting images from Cloudinary:', error);
    throw error;
  }
};

export { cloudinary, verifyCloudinaryConfig };
export default cloudinary;
