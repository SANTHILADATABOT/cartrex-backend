// insertShipper.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Shipper = require('./models/Shipper'); // adjust the path if needed

const MONGO_URI = process.env.MONGODB_URI;

async function insertShipper() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    // Example shipper data (with U.S. addresses)
    const shippers = [
      {
        userId: '68e4fff8f371a0aabdd7d61a', // priya.s@santhila.co
        companyName: 'Santhila Exports Inc',
        dba: 'Santhila Shipping',
        photo: '',
        address: '600 Travis St',
        city: 'Houston',
        state: 'Texas',
        zipCode: '77002',
        country: 'USA',
        totalBookings: 5,
        outstandingPayouts: 1000,
        status: 'active',
        recentActivity: new Date(),
        createdBy: '68e73aebda9fdad99d4d53ea', // admin userId
        ipAddress: '34.123.56.24',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    ];

    const result = await Shipper.insertMany(shippers);
    process.exit(0);
  } catch (error) {
    console.error('Error inserting shipper data:', error);
    process.exit(1);
  }
}

insertShipper();
