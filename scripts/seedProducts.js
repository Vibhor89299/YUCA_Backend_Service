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
    name: 'Artisan Geometric Bowl Set',
    description: 'Handcrafted geometric bowl paired with premium coconut wood cutlery. A perfect fusion of modern design and natural elegance for your dining experience.',
    items: '1 geometric bowl + 1 set cocnut wood cutlery',
    countInStock: 9,
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
    name: 'Heritage Enamel Bowl Set',
    description: 'Exquisite enamel bowl accompanied by sustainable coconut wood cutlery. Timeless craftsmanship meets contemporary elegance in this artisanal dining essential.',
    items: '1 enamel bowl + 1 set cocnut wood cutlery',
    countInStock: 9,
    manufactureCost: 395,
    packagingCost: 35,
    profitMultiplier: 2,
    finalRate: 860.00,
    discountPercent: 0,
    rateAfterDiscount: 725.00,
    gstPercentage: 5,
    category: 'kosha',
    image: '/assets/kosha/ENAMEL BOWL SET/enamel-bowl/1.png',
    images: ['/assets/kosha/ENAMEL BOWL SET/enamel-bowl/1.png', '/assets/kosha/ENAMEL BOWL SET/enamel-bowl/2.png']
  },
  {
    name: 'Ultimate Dining Collection',
    description: 'Complete artisanal dining set featuring a generous 900ml bowl, two charming mini bowls, elegant serving spoon, crystal-clear coconut glasses, and premium shell cutlery sets. The ultimate expression of sustainable luxury for modern entertaining.',
    items: '1 900 ml bowl+ 2 mini bowl+ 1 serving spoon + 2 cocmnut glass+ 2 set shell cutlery',
    countInStock: 9,
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
    name: 'Spa Bathroom Essentials Set',
    description: 'Luxurious toothbrush holder and soap tray crafted for the sophisticated bathroom. Transform your daily routine into a spa-like ritual with these elegantly designed essentials.',
    items: '1 toothbrush holder + 1 soap tray',
    countInStock: 9,
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
    name: 'Premium Wine Glass & Candle Set',
    description: 'Elegant wine glasses paired with a scented candle for intimate gatherings. Create ambiance and sophistication with every sip and every flicker of light.',
    items: '2 wine glass+ 1 candle',
    countInStock: 9,
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
    name: 'Premium Tea Ceremony Set',
    description: 'Set of four exquisite tea cups designed for the perfect tea ritual. Each cup tells a story of craftsmanship and refined taste, elevating your daily tea experience to new heights of luxury.',
    items: '4 tea cups',
    countInStock: 9,
    manufactureCost: 800,
    packagingCost: 35,
    profitMultiplier: 2,
    finalRate: 1518.00,
    discountPercent: 0,
    rateAfterDiscount: 1600.00,
    gstPercentage: 5,
    category: 'kosha',
    image: '/assets/kosha/TEA CUP/tea-cup/1.png',
    images: ['/assets/kosha/TEA CUP/tea-cup/1.png', '/assets/kosha/TEA CUP/tea-cup/2.png']
  },
  {
    name: 'Natural Coconut Glass Set',
    description: 'Pair of handcrafted coconut shell glasses that bring nature to your table. Sustainably sourced and beautifully finished for eco-conscious entertaining with tropical elegance.',
    items: '2 coconut glass set',
    countInStock: 9,
    manufactureCost: 250,
    packagingCost: 35,
    profitMultiplier: 2,
    finalRate: 570.00,
    discountPercent: 0,
    rateAfterDiscount: 500.00,
    gstPercentage: 5,
    category: 'kosha',
    image: '/assets/kosha/GLASS/glass/1.png',
    images: ['/assets/kosha/GLASS/glass/1.png', '/assets/kosha/GLASS/glass/2.png']
  },
  {
    name: 'Premium Lid Container Set',
    description: 'Set of two versatile lid containers perfect for food storage and organization. Crafted with attention to detail for the modern kitchen, combining functionality with elegant design.',
    items: '2 lid containers',
    countInStock: 9,
    manufactureCost: 310,
    packagingCost: 35,
    profitMultiplier: 2,
    finalRate: 690.00,
    discountPercent: 0,
    rateAfterDiscount: 725.00,
    gstPercentage: 5,
    category: 'kosha',
    image: '/assets/kosha/SPOON FOLK/spoon/1.png',
    images: ['/assets/kosha/SPOON FOLK/spoon/1.png' , '/assets/kosha/SPOON FOLK/spoon/2.png']
  },
  // {
  //   name: 'Signature Scented Candle Jar (Sukoon)',
  //   description: 'Luxurious scented candle housed in an elegant lidded container. Fill your space with captivating fragrance while adding a touch of artisanal sophistication to your home decor.',
  //   items: 'A Scented Candle in a lid container',
  //   countInStock:9,
  //   manufactureCost: 350,
  //   packagingCost: 35,
  //   profitMultiplier: 2,
  //   finalRate: 666.67,
  //   discountPercent: 0,
  //   rateAfterDiscount: 700.00,
  //   gstPercentage: 5,
  //   category: 'kosha',
  //   image: '/assets/kosha/CANDLES/candles/1.png',
  //   images: ['/assets/kosha/CANDLES/candles/1.png' , '/assets/kosha/CANDLES/candles/2.png']
  // },
  {
    name: 'Versatile Breakfast Bowl',
    description: 'Generously sized 500ml bowl perfect for everyday meals and special occasions. Thoughtfully designed with premium craftsmanship for both functionality and aesthetic appeal in modern kitchens.',
    items: '1 500 ML bowl',
    countInStock: 9,
    manufactureCost: 125,
    packagingCost: 35,
    profitMultiplier: 2,
    finalRate: 427.00,
    discountPercent: 0,
    rateAfterDiscount: 400.00,
    gstPercentage: 5,
    category: 'kosha',
    image: '/assets/kosha/KATORI/katori/3.png',
    images: ['/assets/kosha/KATORI/katori/3.png']
  },
  {
    name: 'Elegant Mini Bowl Duo',
    description: 'Charming pair of mini bowls ideal for individual portions, dips, or desserts. Perfectly proportioned for intimate dining experiences with artisanal quality that speaks to discerning tastes.',
    items: '2 mini bowl set',
    countInStock: 9,
    manufactureCost: 190,
    packagingCost: 35,
    profitMultiplier: 2,
    finalRate: 356.00,
    discountPercent: 0,
    rateAfterDiscount: 375.00,
    gstPercentage: 5,
    category: 'kosha',
    image: '/assets/kosha/KATORI/katori/2.png',
    images: ['/assets/kosha/KATORI/katori/2.png']
  },
  // {
  //   name: 'Fork and Spoon Set',
  //   description: 'A set of two elegant forks and spoons, perfect for daily dining or special occasions. Each piece is crafted with precision and durability, ensuring a refined dining experience.',
  //   items: '1 forks + 1 spoons',
  //   countInStock: 9,
  //   manufactureCost: 190,
  //   packagingCost: 35,
  //   profitMultiplier: 2,
  //   finalRate: 356.00,
  //   discountPercent: 0,
  //   rateAfterDiscount: 250.00,
  //   gstPercentage: 5,
  //   category: 'kosha',
  //   image: '/assets/kosha/SPOON FOLK/fork/0.png',
  //   images: ['/assets/kosha/SPOON FOLK/fork/0.png' , '/assets/kosha/SPOON FOLK/fork/1.png' ]
  // }
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
  return PRODUCT_SETS.map((set, index) => ({
    name: set.name,
    description: set.description,
    // Use provided rate after discount for seeding price
    price: Math.round(set.rateAfterDiscount),
    countInStock: set.countInStock,
    category: set.category,
    image: set.image,
    images: set.images,
    items: set.items,
    displayOrder: index + 1 // Products will display in array order (1, 2, 3, etc.)
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
