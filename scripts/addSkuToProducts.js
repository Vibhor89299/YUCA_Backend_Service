import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';

dotenv.config();

// Generate SKU from product name
function generateSku(name, index) {
  // Take first 3 letters of each word (up to 2 words), uppercase
  const words = name.toUpperCase().split(' ').filter(w => w.length > 0);
  const prefix = words.slice(0, 2).map(w => w.slice(0, 3)).join('-');
  // Add a unique number suffix
  const suffix = String(index + 1).padStart(3, '0');
  return `${prefix}-${suffix}`;
}

async function addSkuToProducts() {
  await connectDB();

  const db = mongoose.connection.db;
  const productsCollection = db.collection('products');

  // Find all products without SKU
  const productsWithoutSku = await productsCollection.find({
    $or: [
      { sku: { $exists: false } },
      { sku: null },
      { sku: '' }
    ]
  }).toArray();

  console.log(`Found ${productsWithoutSku.length} products without SKU`);

  // Get all existing SKUs to avoid duplicates
  const existingSkus = new Set(
    (await productsCollection.find({ sku: { $exists: true, $ne: null, $ne: '' } }).toArray())
      .map(p => p.sku)
  );

  let skuCounter = existingSkus.size;

  for (const product of productsWithoutSku) {
    let sku;
    let attempts = 0;

    // Generate a unique SKU
    do {
      sku = generateSku(product.name, skuCounter + attempts);
      attempts++;
    } while (existingSkus.has(sku) && attempts < 100);

    if (attempts >= 100) {
      console.error(`Could not generate unique SKU for: ${product.name}`);
      continue;
    }

    existingSkus.add(sku);
    skuCounter++;

    await productsCollection.updateOne(
      { _id: product._id },
      { $set: { sku: sku } }
    );

    console.log(`Added SKU: ${sku} to product: ${product.name}`);
  }

  console.log('\nSKU migration completed successfully!');
  process.exit(0);
}

addSkuToProducts().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
