// insertCarrier.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Carrier = require('./models/Carrier'); // adjust the path if needed

const MONGO_URI = process.env.MONGODB_URI;

async function insertCarrier() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    // Example carrier data (with U.S. addresses)
    const carriers = [
      {
        userId: '68e4aa373e31aa48741bd932', // Priya Dharshini
        companyName: 'Priya Logistics LLC',
        photo: '',
        address: '1250 Peachtree St NE',
        city: 'Atlanta',
        state: 'Georgia',
        zipCode: '30309',
        country: 'USA',
        rating: 4.5,
        totalRatings: 20,
        totalBookings: 15,
        outstandingPayouts: 5000,
        status: 'pending',
        recentActivity: new Date(),
        createdBy: '68e73aebda9fdad99d4d53ea', // admin userId
        ipAddress: '34.123.56.22',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      {
        userId: '68e4adee242cb5d538cf73d0', // Angelin Nivetha
        companyName: 'Nivetha Freight Carriers Inc',
        photo: '',
        address: '400 W 7th St',
        city: 'Los Angeles',
        state: 'California',
        zipCode: '90014',
        country: 'USA',
        rating: 4.2,
        totalRatings: 10,
        totalBookings: 8,
        outstandingPayouts: 2500,
        status: 'pending',
        recentActivity: new Date(),
        createdBy: '68e73aebda9fdad99d4d53ea',
        ipAddress: '34.123.56.23',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
      }
    ];

    const result = await Carrier.insertMany(carriers);
    process.exit(0);
  } catch (error) {
    console.error('Error inserting carrier data:', error);
    process.exit(1);
  }
}

insertCarrier();
