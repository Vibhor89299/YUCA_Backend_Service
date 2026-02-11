import { body } from 'express-validator';

export const productValidationRules = () => {
  return [
    body('name', 'Name is required').notEmpty().trim(),
    body('description', 'Description is required').notEmpty().trim(),
    body('retailPrice', 'Retail price must be a positive number').isFloat({ min: 0 }),
    body('mrp', 'MRP must be a positive number').isFloat({ min: 0 }),
    body('countInStock', 'Stock count must be 0 or greater').isInt({ min: 0 }),
    body('category', 'Category is required').notEmpty().trim(),
    body('image', 'Image URL is required').optional().isURL()
  ];
};

export const updateProductValidationRules = () => {
  return [
    body('name', 'Name cannot be empty').optional().notEmpty().trim(),
    body('description', 'Description cannot be empty').optional().notEmpty().trim(),
    body('retailPrice', 'Retail price must be a positive number').optional().isFloat({ min: 0 }),
    body('mrp', 'MRP must be a positive number').optional().isFloat({ min: 0 }),
    body('countInStock', 'Stock count must be 0 or greater').optional().isInt({ min: 0 }),
    body('category', 'Category cannot be empty').optional().notEmpty().trim()
    // image validation removed - allows relative paths like '/images/sample.jpg'
  ];
};

export const bulkProductValidationRules = () => {
  return [
    body().isArray({ min: 1 }).withMessage('Request body must be an array of products'),
    body('*.name', 'Name is required').notEmpty().trim(),
    body('*.description', 'Description is required').notEmpty().trim(),
    body('*.retailPrice', 'Retail price must be a positive number').isFloat({ min: 0 }),
    body('*.mrp', 'MRP must be a positive number').isFloat({ min: 0 }),
    body('*.countInStock', 'Stock count must be 0 or greater').isInt({ min: 0 }),
    body('*.category', 'Category is required').notEmpty().trim(),
    body('*.image', 'Image URL must be valid').optional().isURL()
  ];
};


export const inventoryValidationRules = () => {
  return [
    body('countInStock', 'Stock count must be 0 or greater').isInt({ min: 0 })
  ];
};
