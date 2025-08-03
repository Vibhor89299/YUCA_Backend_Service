import mongoose from 'mongoose';

export const validateProductInput = (data) => {
  const errors = {};

  // Validate required fields
  if (!data.name || data.name.trim() === '') {
    errors.name = 'Product name is required';
  }

  if (!data.description || data.description.trim() === '') {
    errors.description = 'Product description is required';
  }

  if (!data.price || isNaN(data.price)) {
    errors.price = 'Valid price is required';
  } else if (data.price < 0) {
    errors.price = 'Price cannot be negative';
  }

  if (!data.category || data.category.trim() === '') {
    errors.category = 'Product category is required';
  }

  if (typeof data.countInStock === 'undefined' || isNaN(data.countInStock)) {
    errors.countInStock = 'Valid stock count is required';
  } else if (data.countInStock < 0) {
    errors.countInStock = 'Stock count cannot be negative';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

// Validate MongoDB ObjectId
export const validateMongoId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Validate pagination parameters
export const validatePaginationParams = (page, limit) => {
  const errors = {};
  
  if (isNaN(page) || page < 1) {
    errors.page = 'Page number must be a positive integer';
  }
  
  if (isNaN(limit) || limit < 1) {
    errors.limit = 'Limit must be a positive integer';
  }
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

// Validate price range
export const validatePriceRange = (minPrice, maxPrice) => {
  const errors = {};
  
  if (minPrice && isNaN(minPrice)) {
    errors.minPrice = 'Minimum price must be a number';
  }
  
  if (maxPrice && isNaN(maxPrice)) {
    errors.maxPrice = 'Maximum price must be a number';
  }
  
  if (minPrice && maxPrice && parseFloat(minPrice) > parseFloat(maxPrice)) {
    errors.priceRange = 'Minimum price cannot be greater than maximum price';
  }
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};
