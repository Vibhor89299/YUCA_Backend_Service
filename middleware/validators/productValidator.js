import { body } from 'express-validator';

export const productValidationRules = () => {
  return [
    body('name', 'Name is required').notEmpty().trim(),
    body('description', 'Description is required').notEmpty().trim(),
    body('price', 'Price must be a positive number').isFloat({ min: 0 }),
    body('countInStock', 'Stock count must be 0 or greater').isInt({ min: 0 }),
    body('category', 'Category is required').notEmpty().trim(),
    body('image', 'Image URL is required').optional().isURL()
  ];
};

export const inventoryValidationRules = () => {
  return [
    body('countInStock', 'Stock count must be 0 or greater').isInt({ min: 0 })
  ];
};
