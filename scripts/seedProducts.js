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

// const PRODUCT_SETS = 
// [
//   {
//     name: 'Geometric bowl + shell cut',
//     description: 'Handcrafted geometric bowl paired with premium shell cutlery. A perfect blend of modern design and natural elegance for your dining experience.',
//     items: '1 geometric bowl + 1 set shell cutlery',
//     countInStock: 6,
//     manufactureCost: 340,
//     packagingCost: 35,
//     profitMultiplier: 2,
//     finalRate: 813.75,
//     discountPercent: 0,
//     rateAfterDiscount: 813.75,
//     gstPercentage: 5,
//     category: 'kosha',
//     image: '/assets/kosha/GEO-BOWL/geo-bowl/1.png',
//     images: [
//       '/assets/kosha/GEO-BOWL/geo-bowl/1.png',
//       '/assets/kosha/GEO-BOWL/geo-bowl/2.png',
//       '/assets/kosha/SPOON FOLK/shell/1.png',
//       '/assets/kosha/SPOON FOLK/shell/2.png'
//     ]
//   },
//   {
//     name: 'Jumbo bowl + shell cut',
//     description: 'Extra large jumbo bowl paired with premium shell cutlery. Perfect for family meals and gatherings.',
//     items: '1 jumbo bowl + 1 set shell cutlery',
//     countInStock: 4,
//     manufactureCost: 320,
//     packagingCost: 35,
//     profitMultiplier: 2,
//     finalRate: 787.50,
//     discountPercent: 0,
//     rateAfterDiscount: 787.50,
//     gstPercentage: 5,
//     category: 'kosha',
//     image: '/assets/kosha/JUMBO-BOWL/jumbo/1.png',
//     images: [
//       '/assets/kosha/JUMBO-BOWL/jumbo/1.png',
//       '/assets/kosha/SPOON FOLK/shell/1.png',
//       '/assets/kosha/SPOON FOLK/shell/2.png'
//     ]
//   },
//   {
//     name: 'Enamel bowl + coco wood cut',
//     description: 'Classic enamel bowl paired with coconut wood cutlery. A timeless combination of durability and functionality for everyday use.',
//     items: '1 enamel bowl + 1 set coconut wood cutlery',
//     countInStock: 4,
//     manufactureCost: 425,
//     packagingCost: 35,
//     profitMultiplier: 2,
//     finalRate: 761.25,
//     discountPercent: 0,
//     rateAfterDiscount: 761.25,
//     gstPercentage: 5,
//     category: 'kosha',
//     image: '/assets/kosha/ENAMEL BOWL SET/enamel-bowl/1.png',
//     images: [
//       '/assets/kosha/ENAMEL BOWL SET/enamel-bowl/1.png',
//       '/assets/kosha/SPOON FOLK/normal/1.png',
//       '/assets/kosha/SPOON FOLK/normal/2.png'
//     ]
//   },
//   {
//     name: 'Mid bowl + coc wood cut',
//     description: 'Perfectly sized mid bowl with coconut wood cutlery. Ideal for individual meals and portion control.',
//     items: '1 mid bowl + 1 set coconut wood cutlery',
//     countInStock: 4,
//     manufactureCost: 285,
//     packagingCost: 35,
//     profitMultiplier: 2,
//     finalRate: 603.75,
//     discountPercent: 0,
//     rateAfterDiscount: 603.75,
//     gstPercentage: 5,
//     category: 'kosha',
//     image: '/assets/kosha/KATORI/katori/3.png',
//     images: [
//       '/assets/kosha/KATORI/katori/3.png',
//       '/assets/kosha/SPOON FOLK/normal/1.png',
//       '/assets/kosha/SPOON FOLK/normal/2.png'
//     ]
//   },
//   {
//     name: 'Coconut water glass',
//     description: 'Natural coconut water glass, bringing tropical vibes to your table.',
//     items: '1 coconut water glass',
//     countInStock: 1,
//     manufactureCost: 155,
//     packagingCost: 35,
//     profitMultiplier: 2,
//     finalRate: 236.25,
//     discountPercent: 0,
//     rateAfterDiscount: 236.25,
//     gstPercentage: 5,
//     category: 'kosha',
//     image: '/assets/kosha/COCONUT WATER/coconut-water/1.png',
//     images: [
//       '/assets/kosha/COCONUT WATER/coconut-water/1.png',
//       '/assets/kosha/COCONUT WATER/coconut-water/2.png'
//     ]
//   },
//   {
//     name: '2 coconut water glass set',
//     description: 'Set of 2 natural coconut water glasses, perfect for serving refreshing beverages.',
//     items: '2 coconut water glasses',
//     countInStock: 2,
//     manufactureCost: 280,
//     packagingCost: 35,
//     profitMultiplier: 2,
//     finalRate: 551.25,
//     discountPercent: 0,
//     rateAfterDiscount: 551.25,
//     gstPercentage: 5,
//     category: 'kosha',
//     image: '/assets/kosha/COCONUT WATER/coconut-water/1.png',
//     images: [
//       '/assets/kosha/COCONUT WATER/coconut-water/1.png',
//       '/assets/kosha/COCONUT WATER/coconut-water/2.png'
//     ]
//   },
//   {
//     name: '4 coconut water glass set',
//     description: 'Set of 4 natural coconut water glasses, perfect for serving refreshing beverages to guests.',
//     items: '4 coconut water glasses',
//     countInStock: 1,
//     manufactureCost: 530,
//     packagingCost: 35,
//     profitMultiplier: 2,
//     finalRate: 1181.25,
//     discountPercent: 0,
//     rateAfterDiscount: 1181.25,
//     gstPercentage: 5,
//     category: 'kosha',
//     image: '/assets/kosha/COCONUT WATER/coconut-water/1.png',
//     images: [
//       '/assets/kosha/COCONUT WATER/coconut-water/1.png',
//       '/assets/kosha/COCONUT WATER/coconut-water/2.png'
//     ]
//   },
//   {
//     name: 'Coconut tea cup',
//     description: 'Elegant coconut tea cup, perfect for enjoying your favorite hot beverages.',
//     items: '1 coconut tea cup',
//     countInStock: 4,
//     manufactureCost: 230,
//     packagingCost: 35,
//     profitMultiplier: 2,
//     finalRate: 341.25,
//     discountPercent: 0,
//     rateAfterDiscount: 341.25,
//     gstPercentage: 5,
//     category: 'kosha',
//     image: '/assets/kosha/TEA CUP/tea-cup/1.png',
//     images: [
//       '/assets/kosha/TEA CUP/tea-cup/1.png',
//       '/assets/kosha/TEA CUP/tea-cup/2.png'
//     ]
//   },
//   {
//     name: '2 coconut tea cup set',
//     description: 'Set of 2 elegant coconut tea cups, perfect for tea time with a friend.',
//     items: '2 coconut tea cups',
//     countInStock: 5,
//     manufactureCost: 430,
//     packagingCost: 35,
//     profitMultiplier: 2,
//     finalRate: 656.25,
//     discountPercent: 0,
//     rateAfterDiscount: 656.25,
//     gstPercentage: 5,
//     category: 'kosha',
//     image: '/assets/kosha/TEA CUP/tea-cup/1.png',
//     images: [
//       '/assets/kosha/TEA CUP/tea-cup/1.png',
//       '/assets/kosha/TEA CUP/tea-cup/2.png'
//     ]
//   },
//   {
//     name: '4 coconut tea cup set',
//     description: 'Set of 4 elegant coconut tea cups, perfect for hosting tea parties.',
//     items: '4 coconut tea cups',
//     countInStock: 3,
//     manufactureCost: 830,
//     packagingCost: 35,
//     profitMultiplier: 2,
//     finalRate: 1286.25,
//     discountPercent: 0,
//     rateAfterDiscount: 1286.25,
//     gstPercentage: 5,
//     category: 'kosha',
//     image: '/assets/kosha/TEA CUP/tea-cup/1.png',
//     images: [
//       '/assets/kosha/TEA CUP/tea-cup/1.png',
//       '/assets/kosha/TEA CUP/tea-cup/2.png'
//     ]
//   },
//   {
//     name: '2 wine glass set',
//     description: 'Elegant set of 2 wine glasses, perfect for intimate dinners and special occasions.',
//     items: '2 wine glasses',
//     countInStock: 2,
//     manufactureCost: 410,
//     packagingCost: 35,
//     profitMultiplier: 2,
//     finalRate: 813.75,
//     discountPercent: 0,
//     rateAfterDiscount: 813.75,
//     gstPercentage: 5,
//     category: 'kosha',
//     image: '/assets/kosha/WINE/wine/1.png',
//     images: [
//       '/assets/kosha/WINE/wine/1.png',
//       '/assets/kosha/WINE/wine/2.png'
//     ]
//   },
//   {
//     name: 'Serving spoon',
//     description: 'Elegant serving spoon, perfect for serving dishes at the table.',
//     items: '1 serving spoon',
//     countInStock: 5,
//     manufactureCost: 115,
//     packagingCost: 35,
//     profitMultiplier: 2,
//     finalRate: 288.75,
//     discountPercent: 0,
//     rateAfterDiscount: 288.75,
//     gstPercentage: 5,
//     category: 'kosha',
//     image: '/assets/kosha/SPOON FOLK/spoon/1.png',
//     images: [
//       '/assets/kosha/SPOON FOLK/spoon/1.png',
//       '/assets/kosha/SPOON FOLK/spoon/2.png'
//     ]
//   },
//   {
//     name: 'Soap tray',
//     description: 'Elegant soap tray for your bathroom, keeping your soap dry and your counter clean.',
//     items: '1 soap tray',
//     countInStock: 3,
//     manufactureCost: 145,
//     packagingCost: 35,
//     profitMultiplier: 2,
//     finalRate: 288.75,
//     discountPercent: 0,
//     rateAfterDiscount: 288.75,
//     gstPercentage: 5,
//     category: 'kosha',
//     image: '/assets/kosha/BATHROOM/soap-dish/1.png',
//     images: [
//       '/assets/kosha/BATHROOM/soap-dish/1.png'
//     ]
//   },
//   {
//     name: '2 soap tray set',
//     description: 'Set of 2 elegant soap trays, perfect for organizing multiple soaps in your bathroom.',
//     items: '2 soap trays',
//     countInStock: 2,
//     manufactureCost: 260,
//     packagingCost: 35,
//     profitMultiplier: 2,
//     finalRate: 446.25,
//     discountPercent: 0,
//     rateAfterDiscount: 446.25,
//     gstPercentage: 5,
//     category: 'kosha',
//     image: '/assets/kosha/BATHROOM/soap-dish/1.png',
//     images: [
//       '/assets/kosha/BATHROOM/soap-dish/1.png'
//     ]
//   },
//   {
//     name: '2 coconut water glass set',
//     description: 'Set of 2 natural coconut water glasses, bringing tropical vibes to your table.',
//     items: '2 coconut water glasses',
//     countInStock: 2,
//     manufactureCost: 280,
//     packagingCost: 35,
//     profitMultiplier: 2,
//     finalRate: 551.25,
//     discountPercent: 0,
//     rateAfterDiscount: 551.25,
//     gstPercentage: 5,
//     category: 'kosha',
//     image: '/assets/kosha/GLASS/glass/1.png',
//     images: [
//       '/assets/kosha/GLASS/glass/1.png',
//       '/assets/kosha/GLASS/glass/2.png'
//     ]
//   },
//   {
//     name: '4 coconut water glass set',
//     description: 'Set of 4 natural coconut water glasses, perfect for family gatherings.',
//     items: '4 coconut water glasses',
//     countInStock: 1,
//     manufactureCost: 530,
//     packagingCost: 35,
//     profitMultiplier: 2,
//     finalRate: 1181.25,
//     discountPercent: 0,
//     rateAfterDiscount: 1181.25,
//     gstPercentage: 5,
//     category: 'kosha',
//     image: '/assets/kosha/GLASS/glass/1.png',
//     images: [
//       '/assets/kosha/GLASS/glass/1.png',
//       '/assets/kosha/GLASS/glass/2.png'
//     ]
//   },
//   {
//     name: 'Coconut tea cup',
//     description: 'Charming coconut tea cup, perfect for your morning tea rituals.',
//     items: '1 coconut tea cup',
//     countInStock: 4,
//     manufactureCost: 230,
//     packagingCost: 35,
//     profitMultiplier: 2,
//     finalRate: 341.25,
//     discountPercent: 0,
//     rateAfterDiscount: 341.25,
//     gstPercentage: 5,
//     category: 'kosha',
//     image: '/assets/kosha/TEA CUP/tea-cup/1.png',
//     images: [
//       '/assets/kosha/TEA CUP/tea-cup/1.png',
//       '/assets/kosha/TEA CUP/tea-cup/2.png'
//     ]
//   },
//   {
//     name: '2 coconut tea cup set',
//     description: 'Charming set of 2 coconut tea cups, perfect for your morning tea rituals.',
//     items: '2 coconut tea cups',
//     countInStock: 5,
//     manufactureCost: 430,
//     packagingCost: 35,
//     profitMultiplier: 2,
//     finalRate: 656.25,
//     discountPercent: 0,
//     rateAfterDiscount: 656.25,
//     gstPercentage: 5,
//     category: 'kosha',
//     image: '/assets/kosha/TEA CUP/tea-cup/1.png',
//     images: [
//       '/assets/kosha/TEA CUP/tea-cup/1.png',
//       '/assets/kosha/TEA CUP/tea-cup/2.png'
//     ]
//   },
//   {
//     name: '4 coconut tea cup set',
//     description: 'Elegant set of 4 coconut tea cups, perfect for hosting tea parties.',
//     items: '4 coconut tea cups',
//     countInStock: 3,
//     manufactureCost: 830,
//     packagingCost: 35,
//     profitMultiplier: 2,
//     finalRate: 1286.25,
//     discountPercent: 0,
//     rateAfterDiscount: 1286.25,
//     gstPercentage: 5,
//     category: 'kosha',
//     image: '/assets/kosha/TEA CUP/tea-cup/1.png',
//     images: [
//       '/assets/kosha/TEA CUP/tea-cup/1.png',
//       '/assets/kosha/TEA CUP/tea-cup/2.png'
//     ]
//   },
//   {
//     name: 'Lid Container Candle',
//     description: 'Elegant scented candle in a reusable lid container. Perfect for home decor and gifting.',
//     items: '1 lid container candle',
//     countInStock: 20,
//     manufactureCost: 200,
//     packagingCost: 35,
//     profitMultiplier: 2,
//     finalRate: 470.00,
//     discountPercent: 0,
//     rateAfterDiscount: 495.00,
//     gstPercentage: 5,
//     category: 'kosha',
//     image: '/assets/kosha/CANDLES/candles/1.png',
//     images: [
//       '/assets/kosha/CANDLES/candles/1.png',
//       '/assets/kosha/CANDLES/candles/2.png',
//       '/assets/kosha/CANDLES/candles/3.png'
//     ]
//   },
//   // {
//   //   name: 'Mini Bowl (Katori) Candle',
//   //   description: 'Delicate scented candle in a mini bowl (katori) design. A perfect blend of functionality and aesthetics.',
//   //   items: '1 mini bowl candle',
//   //   countInStock: 15,
//   //   manufactureCost: 180,
//   //   packagingCost: 35,
//   //   profitMultiplier: 2,
//   //   finalRate: 430.00,
//   //   discountPercent: 0,
//   //   rateAfterDiscount: 450.00,
//   //   gstPercentage: 5,
//   //   category: 'kosha',
//   //   image: '/assets/kosha/CANDLES/mini-candle/1.png',
//   //   images: [
//   //     '/assets/kosha/CANDLES/mini-candle/1.png',
//   //     '/assets/kosha/CANDLES/mini-candle/2.png'
//   //   ]
//   // },
//   // {
//   //   name: 'Soap Tray + Toothbrush Holder Set',
//   //   description: 'Elegant bathroom set including a soap tray and toothbrush holder. Perfect for maintaining a clean and organized bathroom.',
//   //   items: '1 soap tray + 1 toothbrush holder',
//   //   countInStock: 10,
//   //   manufactureCost: 300,
//   //   packagingCost: 35,
//   //   profitMultiplier: 2,
//   //   finalRate: 735.00,
//   //   discountPercent: 0,
//   //   rateAfterDiscount: 775.00,
//   //   gstPercentage: 5,
//   //   category: 'kosha',
//   //   image: '/assets/kosha/BATHROOM/soap-dish/1.png',
//   //   images: [
//   //     '/assets/kosha/BATHROOM/soap-dish/1.png',
//   //     '/assets/kosha/BATHROOM/toothbrush-holder/1.png',
//   //     '/assets/kosha/BATHROOM/toothbrush-holder/2.png'
//   //   ]
//   // },
// ];

const PRODUCT_SETS = [
  {
    name: 'Kalāpatra',
    description: 'Handcrafted geometric bowl paired with premium shell cutlery. A perfect blend of modern design and natural elegance for your dining experience.',
    items: '1 geometric bowl + 1 set shell cutlery',
    countInStock: 6,
    manufactureCost: 340,
    packagingCost: 35,
    profitMultiplier: 2,
    finalRate: 813.75,
    discountPercent: 0,
    rateAfterDiscount: 813.75,
    gstPercentage: 5,
    category: 'kosha',
    image: '/assets/kosha/geobowl/0.png',
    images: [
      // '/assets/kosha/GEO-BOWL/geo-bowl/1.png',
      '/assets/kosha/GEO-BOWL/geo-bowl/2.png',
      '/assets/kosha/GEO-BOWL/geo-bowl/3.png'
    ]
  },
  {
    name: 'Mahapatra',
    description: 'Extra large jumbo bowl paired with premium shell cutlery. Perfect for family meals and gatherings.',
    items: '1 jumbo bowl + 1 set shell cutlery',
    countInStock: 4,
    manufactureCost: 320,
    packagingCost: 35,
    profitMultiplier: 2,
    finalRate: 787.50,
    discountPercent: 0,
    rateAfterDiscount: 787.50,
    gstPercentage: 5,
    category: 'kosha',
    image: '/assets/kosha/jumbobowl/0.png',
    images: [
      '/assets/kosha/JUMBO-BOWL/jumbo/3.png',
    ]
  },
  {
    name: 'Varnikapatra',
    description: 'Classic enamel bowl paired with coconut wood cutlery. A timeless combination of durability and functionality for everyday use.',
    items: '1 enamel bowl + 1 set coconut wood cutlery',
    countInStock: 4,
    manufactureCost: 425,
    packagingCost: 35,
    profitMultiplier: 2,
    finalRate: 761.25,
    discountPercent: 0,
    rateAfterDiscount: 761.25,
    gstPercentage: 5,
    category: 'kosha',
    image: '/assets/kosha/enamelbowl-wood-cut/0.png',
    images: [
      '/assets/kosha/ENAMEL BOWL SET/enamel-bowl/1.png',
      '/assets/kosha/ENAMEL BOWL SET/enamel-bowl/2.png',
      '/assets/kosha/ENAMEL BOWL SET/enamel-bowl/3.png',
    ]
  },
  {
    name: 'Madhyapatra',
    description: 'Perfectly sized mid bowl with coconut wood cutlery. Ideal for individual meals and portion control.',
    items: '1 mid bowl + 1 set coconut wood cutlery',
    countInStock: 4,
    manufactureCost: 285,
    packagingCost: 35,
    profitMultiplier: 2,
    finalRate: 603.75,
    discountPercent: 0,
    rateAfterDiscount: 603.75,
    gstPercentage: 5,
    category: 'kosha',
    image: '/assets/kosha/midbowl-coco-wood-cut/0.png',
    images: [
      '/assets/kosha/midbowl-coco-wood-cut/1.png',
      '/assets/kosha/midbowl-coco-wood-cut/2.png',
    ]
  },
  // {
  //   name: 'Jala Patram',
  //   description: 'Natural coconut water glass, bringing tropical vibes to your table.',
  //   items: '1 coconut water glass',
  //   countInStock: 1,
  //   manufactureCost: 155,
  //   packagingCost: 35,
  //   profitMultiplier: 2,
  //   finalRate: 236.25,
  //   discountPercent: 0,
  //   rateAfterDiscount: 236.25,
  //   gstPercentage: 5,
  //   category: 'kosha',
  //   image: '/assets/kosha/GLASS/glass/1.png',
  //   images: [
  //     '/assets/kosha/GLASS/glass/1.png',
  //     '/assets/kosha/GLASS/glass/2.png'
  //   ]
  // },
  {
    name: 'Jala Patram Duo Set',
    description: 'Set of 2 natural coconut water glasses, perfect for serving refreshing beverages.',
    items: '2 coconut water glasses',
    countInStock: 2,
    manufactureCost: 280,
    packagingCost: 35,
    profitMultiplier: 2,
    finalRate: 625,
    discountPercent: 0,
    rateAfterDiscount: 625,
    gstPercentage: 5,
    category: 'kosha',
    image: '/assets/kosha/COCONUT WATER/coconut-water/twoset/0.png',
    images: [
      '/assets/kosha/COCONUT WATER/coconut-water/twoset/1.png',
    ]
  },
  {
    name: 'Jala Patram Quad Set',
    description: 'Set of 4 natural coconut water glasses, perfect for serving refreshing beverages to guests.',
    items: '4 coconut water glasses',
    countInStock: 1,
    manufactureCost: 530,
    packagingCost: 35,
    profitMultiplier: 2,
    finalRate: 1181.25,
    discountPercent: 0,
    rateAfterDiscount: 1181.25,
    gstPercentage: 5,
    category: 'kosha',
    image: '/assets/kosha/COCONUT WATER/coconut-water/fourset/0.png',
    images: [
      '/assets/kosha/COCONUT WATER/coconut-water/fourset/1.png',
    ]
  },
  {
    name: 'Prakṛti Pātram',
    description: 'Elegant coconut tea cup, perfect for enjoying your favorite hot beverages.',
    items: '1 coconut tea cup',
    countInStock: 4,
    manufactureCost: 230,
    packagingCost: 35,
    profitMultiplier: 2,
    finalRate: 341.25,
    discountPercent: 0,
    rateAfterDiscount: 341.25,
    gstPercentage: 5,
    category: 'kosha',
    image: '/assets/kosha/TEA CUP/tea-cup/0.png',
    images: [
      '/assets/kosha/TEA CUP/tea-cup/1.png',
      '/assets/kosha/TEA CUP/tea-cup/2.png'
    ]
  },
  {
    name: 'Prakṛti Pātram Duo Set',
    description: 'Set of 2 elegant coconut tea cups, perfect for tea time with a friend.',
    items: '2 coconut tea cups',
    countInStock: 5,
    manufactureCost: 430,
    packagingCost: 35,
    profitMultiplier: 2,
    finalRate: 656.25,
    discountPercent: 0,
    rateAfterDiscount: 656.25,
    gstPercentage: 5,
    category: 'kosha',
    image: '/assets/kosha/TEA CUP/tea-cup/twoset/0.png',
    images: [
      '/assets/kosha/TEA CUP/tea-cup/1.png',
      '/assets/kosha/TEA CUP/tea-cup/2.png'
    ]
  },
  {
    name: 'Prakṛti Pātram Quad Set',
    description: 'Set of 4 elegant coconut tea cups, perfect for hosting tea parties.',
    items: '4 coconut tea cups',
    countInStock: 3,
    manufactureCost: 830,
    packagingCost: 35,
    profitMultiplier: 2,
    finalRate: 1286.25,
    discountPercent: 0,
    rateAfterDiscount: 1286.25,
    gstPercentage: 5,
    category: 'kosha',
    image: '/assets/kosha/TEA CUP/tea-cup/fourset/0.png',
    images: [
      '/assets/kosha/TEA CUP/tea-cup/1.png',
      '/assets/kosha/TEA CUP/tea-cup/2.png'
    ]
  },
  {
    name: 'Madhu Pātram Set',
    description: 'Elegant set of 2 wine glasses, perfect for intimate dinners and special occasions.',
    items: '2 wine glasses',
    countInStock: 2,
    manufactureCost: 410,
    packagingCost: 35,
    profitMultiplier: 2,
    finalRate: 813.75,
    discountPercent: 0,
    rateAfterDiscount: 813.75,
    gstPercentage: 5,
    category: 'kosha',
    image: '/assets/kosha/WINE/wine/0.png',
    images: [
      '/assets/kosha/WINE/wine/1.png',
      '/assets/kosha/WINE/wine/2.png'
    ]
  },
  {
    name: 'Snehadātrī',
    description: 'Elegant serving spoon, perfect for serving dishes at the table.',
    items: '1 serving spoon',
    countInStock: 5,
    manufactureCost: 115,
    packagingCost: 35,
    profitMultiplier: 2,
    finalRate: 288.75,
    discountPercent: 0,
    rateAfterDiscount: 288.75,
    gstPercentage: 5,
    category: 'kosha',
    image: '/assets/kosha/SERVING SPOON/1.png',
    images: [
      '/assets/kosha/SERVING SPOON/1.png',
      '/assets/kosha/SERVING SPOON/2.png'
    ]
  },
  {
    name: 'Sugandhadhara Tray',
    description: 'Elegant soap tray for your bathroom, keeping your soap dry and your counter clean.',
    items: '1 soap tray',
    countInStock: 3,
    manufactureCost: 145,
    packagingCost: 35,
    profitMultiplier: 2,
    finalRate: 288.75,
    discountPercent: 0,
    rateAfterDiscount: 288.75,
    gstPercentage: 5,
    category: 'kosha',
    image: '/assets/kosha/BATHROOM/soap-dish/0.png',
    images: [
      '/assets/kosha/BATHROOM/soap-dish/4.png',
      '/assets/kosha/BATHROOM/soap-dish/2.png',
      '/assets/kosha/BATHROOM/soap-dish/3.png',
    ]
  },
  {
    name: 'Sugandhadhara Tray Set',
    description: 'Set of 2 elegant soap trays, perfect for organizing multiple soaps in your bathroom.',
    items: '2 soap trays',
    countInStock: 2,
    manufactureCost: 260,
    packagingCost: 35,
    profitMultiplier: 2,
    finalRate: 446.25,
    discountPercent: 0,
    rateAfterDiscount: 446.25,
    gstPercentage: 5,
    category: 'kosha',
    image: '/assets/kosha/BATHROOM/soap-dish/0.png',
    images: [
      '/assets/kosha/BATHROOM/soap-dish/4.png',
      '/assets/kosha/BATHROOM/soap-dish/2.png',
      '/assets/kosha/BATHROOM/soap-dish/3.png',
    ]
  },
  {
    name: 'Santidīpa',
    description: 'Elegant lid container candle, perfect for creating a serene and peaceful ambiance with its soft glow.',
    items: '1 lid container candle',
    countInStock: 2,
    manufactureCost: 300,
    packagingCost: 35,
    profitMultiplier: 2,
    finalRate: 735,
    discountPercent: 0,
    rateAfterDiscount: 735,
    gstPercentage: 5,
    category: 'kosha',
    image: '/assets/kosha/CANDLES/candles/1.png',
    images: [
      '/assets/kosha/CANDLE/candles/1.png',
      '/assets/kosha/CANDLE/candles/2.png',
    ]
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
