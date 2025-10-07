import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import Product from '../models/Product.js';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

const KOSHA_ASSETS_PATH = path.resolve('..', 'frontend', 'public', 'assets', 'kosha');

// Product Sets Configuration (seeded for local development)
// Notes:
// - category must be 'kosha' to satisfy the Product model enum
// - price is set to the discounted retail rate (10% off the final rate)
// - countInStock uses provided live quantity values
const PRODUCT_SETS = [
  {
    name: 'Geometric Bowl Set',
    description: 'Premium geometric bowl with coconut wood cutlery set.',
    items: '1 geometric bowl + 1 set cocnut wood cutlery',
    countInStock: 5,
    manufactureCost: 310,
    packagingCost: 35,
    profitMultiplier: 2,
    finalRate: 690.00,
    discountPercent: 0,
    rateAfterDiscount: 725.00, // GST 5% final
    gstPercentage: 5,
    category: 'kosha',
    image: '/assets/kosha/GEO-BOWL/geo-bowl/1.png',
    images: ['/assets/kosha/GEO-BOWL/geo-bowl/1.png', '/assets/kosha/GEO-BOWL/geo-bowl/2.png']
  },
  {
    name: 'Enamel bowl set',
    description: 'Enamel bowl with coconut wood cutlery. Elegant and durable.',
    items: '1 enamel bowl + 1 set cocnut wood cutlery',
    countInStock: 5,
    manufactureCost: 395,
    packagingCost: 35,
    profitMultiplier: 2,
    finalRate: 860.00,
    discountPercent: 0,
    rateAfterDiscount: 905.00,
    gstPercentage: 5,
    category: 'kosha',
    image: '/assets/kosha/ENAMEL BOWL SET/enamel-bowl/1.png',
    images: ['/assets/kosha/ENAMEL BOWL SET/enamel-bowl/1.png', '/assets/kosha/ENAMEL BOWL SET/enamel-bowl/2.png']
  },
  {
    name: 'Big set',
    description: '900ml bowl, 2 mini bowls, serving spoon, 2 coconut glasses, 2 shell cutlery sets.',
    items: '1 900 ml bowl+ 2 mini bowl+ 1 serving spoon + 2 cocmnut glass+ 2 set shell cutlery',
    countInStock: 5,
    manufactureCost: 1095,
    packagingCost: 35,
    profitMultiplier: 2,
    finalRate: 2260.00,
    discountPercent: 0,
    rateAfterDiscount: 2400.00,
    gstPercentage: 5,
    category: 'kosha',
    image: '/assets/kosha/KATORI/katori/1.png',
    images: ['/assets/kosha/KATORI/katori/1.png', '/assets/kosha/KATORI/katori/2.png']
  },
  {
    name: 'Bathroom set',
    description: 'Toothbrush holder and soap tray set.',
    items: '1 toothbrush holder + 1 soap tray',
    countInStock: 5,
    manufactureCost: 300,
    packagingCost: 35,
    profitMultiplier: 2,
    finalRate: 670.00,
    discountPercent: 0,
    rateAfterDiscount: 705.00,
    gstPercentage: 5,
    category: 'kosha',
    image: '/assets/kosha/BATHROOM/soap-dish/1.png',
    images: ['/assets/kosha/BATHROOM/soap-dish/1.png', '/assets/kosha/BATHROOM/toothbrush-holder/1.png']
  },
  {
    name: 'wine glass set',
    description: '2 wine glasses with a candle.',
    items: '2 wine glass+ 1 candle',
    countInStock: 4,
    manufactureCost: 495,
    packagingCost: 35,
    profitMultiplier: 2,
    finalRate: 1060.00,
    discountPercent: 0,
    rateAfterDiscount: 1120.00,
    gstPercentage: 5,
    category: 'kosha',
    image: '/assets/kosha/WINE/wine/1.png',
    images: ['/assets/kosha/WINE/wine/1.png', '/assets/kosha/WINE/wine/2.png']
  },
  {
    name: 'Tea cup set',
    description: 'Set of 4 tea cups.',
    items: '4 tea cups',
    countInStock: 5,
    manufactureCost: 800,
    packagingCost: 35,
    profitMultiplier: 2,
    finalRate: 1670.00,
    discountPercent: 0,
    rateAfterDiscount: 1800.00,
    gstPercentage: 5,
    category: 'kosha',
    image: '/assets/kosha/TEA CUP/tea-cup/1.png',
    images: ['/assets/kosha/TEA CUP/tea-cup/1.png', '/assets/kosha/TEA CUP/tea-cup/2.png']
  },
  {
    name: 'Coconut glass set',
    description: 'Set of 2 coconut glasses.',
    items: '2 coconut glass set',
    countInStock: 5,
    manufactureCost: 250,
    packagingCost: 35,
    profitMultiplier: 2,
    finalRate: 570.00,
    discountPercent: 0,
    rateAfterDiscount: 600.00,
    gstPercentage: 5,
    category: 'kosha',
    image: '/assets/kosha/GLASS/glass/1.png',
    images: ['/assets/kosha/GLASS/glass/1.png', '/assets/kosha/GLASS/glass/2.png']
  },
  {
    name: 'Lid container',
    description: 'Set of 2 lid containers.',
    items: '2 lid containers',
    countInStock: 5,
    manufactureCost: 310,
    packagingCost: 35,
    profitMultiplier: 2,
    finalRate: 690.00,
    discountPercent: 0,
    rateAfterDiscount: 725.00,
    gstPercentage: 5,
    category: 'kosha',
    image: '/assets/kosha/SPOON FOLK/spoon/1.png',
    images: ['/assets/kosha/SPOON FOLK/spoon/1.png']
  },
  {
    name: '500 ML bowl',
    description: 'Single 500 ML bowl.',
    items: '1 500 ML bowl',
    countInStock: 5,
    manufactureCost: 125,
    packagingCost: 35,
    profitMultiplier: 2,
    finalRate: 320.00,
    discountPercent: 0,
    rateAfterDiscount: 340.00,
    gstPercentage: 5,
    category: 'kosha',
    image: '/assets/kosha/KATORI/katori/1.png',
    images: ['/assets/kosha/KATORI/katori/1.png']
  },
  {
    name: 'Mini bowl set',
    description: 'Set of 2 mini bowls.',
    items: '2 mini bowl set',
    countInStock: 5,
    manufactureCost: 190,
    packagingCost: 35,
    profitMultiplier: 2,
    finalRate: 450.00,
    discountPercent: 0,
    rateAfterDiscount: 475.00,
    gstPercentage: 5,
    category: 'kosha',
    image: '/assets/kosha/KATORI/katori/2.png',
    images: ['/assets/kosha/KATORI/katori/2.png']
  }
];

// Calculate final price with GST
function round2(n) {
  return Math.round(n * 100) / 100;
}

async function getAdminUser() {
  let admin = await User.findOne({ role: 'ADMIN' });
  if (!admin) {
    console.log('No admin user found. Creating a default admin user...');
    admin = new User({
      name: 'Admin User',
      email: 'admin@yucalifestyle.com',
      password: 'admin123',
      role: 'ADMIN'
    });
    await admin.save();
    console.log('Admin user created successfully.');
  }
  return admin;
}

function getProductSets() {
  return PRODUCT_SETS.map(set => ({
    name: set.name,
    description: set.description,
    // Use provided rate after discount for seeding price
    price: Math.round(set.rateAfterDiscount),
    countInStock: set.countInStock,
    category: set.category,
    image: set.image,
    images: set.images,
    items: set.items
  }));
}

async function seedProducts() {
  await connectDB();
  const admin = await getAdminUser();
  const products = getProductSets();
  
  // Remove all kosha products first
  await Product.deleteMany({ category: 'kosha' });
  
  // Add user field and log pricing details
  const productsWithUser = products.map(p => {
    console.log(`${p.name}:`);
    console.log(`  Seed Price (after 10% discount): ₹${p.price}`);
    console.log(`  Stock: ${p.countInStock}`);
    console.log(`  Items: ${p.items}`);
    console.log('');
    return { ...p, user: admin._id };
  });
  
  await Product.insertMany(productsWithUser);
  console.log(`Seeded ${productsWithUser.length} Kosha product sets.`);
  process.exit();
}

seedProducts().catch(err => {
  console.error(err);
  process.exit(1);
});
