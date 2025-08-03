import express from 'express';
import {
  getProducts,
  getProduct,
  getProductsByCategory,
  getFeaturedProducts,
  getNewArrivals,
  searchProducts,
} from '../controllers/productController.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProduct);

export default router;
