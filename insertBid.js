const mongoose = require('mongoose');
const Bid = require('./models/Bid');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

async function insertSampleBid() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const newBid = await Bid.create({
      shipperId: '690dcb3722d1aff410ad189a',  // Replace with actual Shipper ID
      carrierId: '690d8e9322d1aff410ad1820',  // Replace with actual Carrier ID
      routeId: '690dccfe122b6f51f1d1d9b3',    // Replace with actual Route ID

      bidValue: 1800,

      vehicleDetails: {
    licenseNumber: 'TX-8841',
    brand: 'Mercedes-Benz',
    vehicleType: 'Flatbed Truck',
    yearMade: 2018,
    features: ['GPS', 'Air Suspension', 'Toolbox'],
    condition: 'excellent',
    quantity: 2,
    photos: [
      'https://example.com/uploads/vehicles/mercedes_flatbed1.jpg',
      'https://example.com/uploads/vehicles/mercedes_flatbed2.jpg'
    ],
    contains100lbs: true
  },
  shippingDescription: 'Heavy machinery delivery to construction site',
  transportType: 'road',
  vinNumber: 'WDDZF4JB3HA251942',
  lotNumber: 'LOT-7824',
  pickup: {
    city: 'Dallas',
    state: 'Texas',
    zipcode: '75201',
    pickupDate: new Date('2025-11-12T08:30:00Z'),
    pickupLocationType: 'industrial park'
  },
  delivery: {
    city: 'Houston',
    state: 'Texas',
    zipcode: '77002'
  },

      additionalComments: 'Please ensure the load is secured and covered properly.',
      timing: '1_week',
      status: 'pending',

      createdBy: '672b2fd998a5bb8a00f21f44', // Replace with User ID
      updatedBy: '672b2fd998a5bb8a00f21f44',
      ipAddress: '192.168.1.120',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    });

    console.log('🚛 Bid inserted successfully:', newBid._id);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inserting bid:', error);
    process.exit(1);
  }
}

insertSampleBid();
