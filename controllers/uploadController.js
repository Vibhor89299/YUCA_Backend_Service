import { deleteImage, deleteImages, getOptimizedUrl, getResponsiveSrcSet } from '../config/cloudinary.js';

// Upload single product image
export const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }

    // Cloudinary automatically processes the upload via multer-storage-cloudinary
    const { path: url, filename: publicId } = req.file;

    // Generate optimized URLs for different use cases
    const optimizedUrls = {
      original: url,
      thumbnail: getOptimizedUrl(publicId, 'thumbnail'),
      main: getOptimizedUrl(publicId, 'productMain'),
      zoom: getOptimizedUrl(publicId, 'productZoom'),
      cart: getOptimizedUrl(publicId, 'cartThumbnail'),
      placeholder: getOptimizedUrl(publicId, 'placeholder'),
      srcSet: getResponsiveSrcSet(publicId),
    };

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      image: {
        url,
        publicId,
        optimizedUrls,
      },
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message,
    });
  }
};

// Upload multiple product images
export const uploadProductImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided',
      });
    }

    // Process each uploaded file
    const images = req.files.map(file => {
      const { path: url, filename: publicId } = file;

      return {
        url,
        publicId,
        optimizedUrls: {
          original: url,
          thumbnail: getOptimizedUrl(publicId, 'thumbnail'),
          main: getOptimizedUrl(publicId, 'productMain'),
          zoom: getOptimizedUrl(publicId, 'productZoom'),
          cart: getOptimizedUrl(publicId, 'cartThumbnail'),
          placeholder: getOptimizedUrl(publicId, 'placeholder'),
          srcSet: getResponsiveSrcSet(publicId),
        },
      };
    });

    res.status(200).json({
      success: true,
      message: `${images.length} image(s) uploaded successfully`,
      images,
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading images',
      error: error.message,
    });
  }
};

// Delete single image from Cloudinary
export const deleteProductImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required',
      });
    }

    // Decode the publicId (it may be URL encoded)
    const decodedPublicId = decodeURIComponent(publicId);

    const result = await deleteImage(decodedPublicId);

    if (result.result === 'ok') {
      res.status(200).json({
        success: true,
        message: 'Image deleted successfully',
      });
    } else if (result.result === 'not found') {
      res.status(404).json({
        success: false,
        message: 'Image not found',
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to delete image',
        result,
      });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting image',
      error: error.message,
    });
  }
};

// Delete multiple images from Cloudinary
export const deleteProductImages = async (req, res) => {
  try {
    const { publicIds } = req.body;

    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Array of public IDs is required',
      });
    }

    const result = await deleteImages(publicIds);

    res.status(200).json({
      success: true,
      message: `${publicIds.length} image(s) deleted`,
      result,
    });
  } catch (error) {
    console.error('Error deleting images:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting images',
      error: error.message,
    });
  }
};

// Extract public ID from Cloudinary URL
export const extractPublicId = (url) => {
  if (!url) return null;

  try {
    // Cloudinary URL format: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{public_id}.{format}
    const regex = /\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};
