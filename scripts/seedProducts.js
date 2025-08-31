import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import Product from '../models/Product.js';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

const KOSHA_ASSETS_PATH = path.resolve('..', 'frontend', 'public', 'assets', 'kosha');

const PRODUCT_DESCRIPTIONS = {
  'soap-dish': 'Handcrafted soap dish made from premium materials, perfect for luxury bathrooms.',
  'toothbrush-holder': 'Elegant toothbrush holder to keep your bathroom organized and stylish.',
  'enamel-bowl': 'Beautiful enamel bowl set, ideal for serving and decor.',
  'geo-bowl': 'Geometric design bowl, a modern touch for your kitchen or dining.',
  'glass': 'Premium glassware for a sophisticated dining experience.',
  'katori': 'Traditional katori bowls, perfect for serving sides and desserts.',
  'fork': 'Handcrafted fork, combining style and utility.',
  'spoon': 'Elegant spoon, perfect for daily use or special occasions.',
  'tea-cup': 'Classic tea cup for a refined tea experience.',
  'wine': 'Luxury wine glass for celebrations and fine dining.'
};

const PRODUCT_PRICES = {
  'soap-dish': 299,
  'toothbrush-holder': 249,
  'enamel-bowl': 599,
  'geo-bowl': 499,
  'glass': 399,
  'katori': 199,
  'fork': 99,
  'spoon': 99,
  'tea-cup': 299,
  'wine': 499
};

const PRODUCT_STOCK = 10;

async function getAdminUser() {
  const admin = await User.findOne({ role: 'ADMIN' });
  if (!admin) throw new Error('No admin user found. Please create an admin user first.');
  return admin;
}

function getAllProductImages() {
  const products = [];
  const mainCategories = fs.readdirSync(KOSHA_ASSETS_PATH).filter(f => !f.startsWith('.'));
  for (const mainCat of mainCategories) {
    const mainCatPath = path.join(KOSHA_ASSETS_PATH, mainCat);
    if (!fs.statSync(mainCatPath).isDirectory()) continue;
    const subCategories = fs.readdirSync(mainCatPath).filter(f => !f.startsWith('.'));
    for (const subCat of subCategories) {
      const subCatPath = path.join(mainCatPath, subCat);
      if (!fs.statSync(subCatPath).isDirectory()) continue;
      const subCatContents = fs.readdirSync(subCatPath).filter(f => !f.startsWith('.'));
      // Check if subCat contains folders (product names) or images directly
      const hasProductFolders = subCatContents.some(f => fs.statSync(path.join(subCatPath, f)).isDirectory());
      if (hasProductFolders) {
        // Each folder is a product, images inside are variants/images
        for (const prodFolder of subCatContents) {
          const prodFolderPath = path.join(subCatPath, prodFolder);
          if (!fs.statSync(prodFolderPath).isDirectory()) continue;
          const images = fs.readdirSync(prodFolderPath).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));
          if (images.length === 0) continue;
          const productKey = prodFolder.toLowerCase();
          const imgArr = images.map(img => `/assets/kosha/${mainCat}/${subCat}/${prodFolder}/${img}`);
          products.push({
            name: `${subCat.replace(/-/g, ' ')} - ${prodFolder.replace(/-/g, ' ')}`,
            description: PRODUCT_DESCRIPTIONS[productKey] || 'Premium handcrafted product from Kosha collection.',
            price: PRODUCT_PRICES[productKey] || 299,
            countInStock: PRODUCT_STOCK,
            category: 'kosha',
            image: imgArr[0],
            images: imgArr
          });
        }
      } else {
        // Images directly under subCat, subCat is the product name
        const images = subCatContents.filter(f => f.endsWith('.png') || f.endsWith('.jpg'));
        if (images.length === 0) continue;
        const productKey = subCat.toLowerCase();
        const imgArr = images.map(img => `/assets/kosha/${mainCat}/${subCat}/${img}`);
        products.push({
          name: subCat.replace(/-/g, ' '),
          description: PRODUCT_DESCRIPTIONS[productKey] || 'Premium handcrafted product from Kosha collection.',
          price: PRODUCT_PRICES[productKey] || 299,
          countInStock: PRODUCT_STOCK,
          category: 'kosha',
          image: imgArr[0],
          images: imgArr
        });
      }
    }
  }
  return products;
}

async function seedProducts() {
  await connectDB();
  const admin = await getAdminUser();
  const products = getAllProductImages();
  // Remove all kosha products first
  await Product.deleteMany({ category: 'kosha' });
  // Add user field
  const productsWithUser = products.map(p => ({ ...p, user: admin._id }));
  await Product.insertMany(productsWithUser);
  console.log(`Seeded ${productsWithUser.length} Kosha products.`);
  process.exit();
}

seedProducts().catch(err => {
  console.error(err);
  process.exit(1);
});
