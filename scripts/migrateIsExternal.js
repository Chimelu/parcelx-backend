const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('../models/Order');

dotenv.config();

async function runMigration() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/parcelx';
    await mongoose.connect(uri);

    console.log('Connected to MongoDB, starting isExternal migration...');

    const result = await Order.updateMany(
      { isExternal: { $exists: false } },
      { $set: { isExternal: false } }
    );

    console.log(
      `Migration complete. Matched: ${result.matchedCount || result.n}, Modified: ${result.modifiedCount || result.nModified}`
    );
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

runMigration();

