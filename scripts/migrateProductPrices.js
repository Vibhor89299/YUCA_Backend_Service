import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';

dotenv.config();

async function migrateProductPrices() {
  await connectDB();

  const db = mongoose.connection.db;
  const productsCollection = db.collection('products');

  // Find all products that have the old 'price' field but not 'retailPrice'
  const productsToMigrate = await productsCollection.find({
    price: { $exists: true }
  }).toArray();

  console.log(`Found ${productsToMigrate.length} products to migrate`);

  for (const product of productsToMigrate) {
    const updateFields = {};

    // Copy price to retailPrice
    if (product.price !== undefined) {
      updateFields.retailPrice = product.price;
    }

    // Set mrp to price if mrp doesn't exist
    if (product.mrp === undefined) {
      updateFields.mrp = product.price;
    }

    // Update the product
    await productsCollection.updateOne(
      { _id: product._id },
      {
        $set: updateFields,
        $unset: { price: "" }  // Remove old price field
      }
    );

    console.log(`Migrated: ${product.name} - retailPrice: ${updateFields.retailPrice}, mrp: ${updateFields.mrp || product.mrp}`);
  }

  console.log('\nMigration completed successfully!');
  process.exit(0);
}

migrateProductPrices().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
