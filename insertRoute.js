// insertRoute.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Route = require('./models/Route'); // adjust path if needed

const MONGO_URI = process.env.MONGODB_URI;

async function insertRoutes() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    // Example routes for the two carriers
    const routes = [
      {
        carrierId: '690d8ef022d1aff410ad1828', // Priya Logistics LLC
        truckId: '690d8fff22d1aff410ad1846', // replace with an actual Truck ObjectId
        origin: {
          state: 'New York',
          city: 'Buffalo',
          pickupWindow: '08:00-14:00',
          pickupRadius: 18
        },
        destination: {
          state: 'Pennsylvania',
          city: 'Pittsburgh',
          deliveryWindow: '09:00-17:00',
          deliveryRadius: 25
        },
        status: 'active',
        createdBy: '68e73aebda9fdad99d4d53ea', // admin user
        ipAddress: '34.123.56.30',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },

    ];

    const result = await Route.insertMany(routes);
    console.log('🛣️ Routes inserted successfully:', result);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inserting routes:', error);
    process.exit(1);
  }
}

insertRoutes();
