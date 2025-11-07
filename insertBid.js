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
      shipperId: '690d936622d1aff410ad1863',  // Replace with actual Shipper ID
      carrierId: '690d8ef022d1aff410ad1828',  // Replace with actual Carrier ID
      routeId: '690d916aa2bcebb6aae914df',    // Replace with actual Route ID

      bidValue: 1500,

      vehicleDetails: {
        licenseNumber: 'FL-6290',
        brand: 'Tata',
        vehicleType: 'Flatbed Truck',
        yearMade: 2017,
        features: ['Hydraulic Lift', 'GPS', 'Side Rails'],
        condition: 'fair',
        quantity: 1,
        photos: [
          'https://example.com/uploads/vehicles/tata1.jpg',
          'https://example.com/uploads/vehicles/tata2.jpg'
        ],
        contains100lbs: true
      },
      shippingDescription: 'Heavy machinery components for factory installation',
      transportType: 'road',
      vinNumber: '5NPDH4AE1DH123987',
      lotNumber: 'LOT-5823',
      pickup: {
        city: 'Orlando',
        state: 'Florida',
        zipcode: '32801',
        pickupDate: new Date('2025-11-15T10:00:00Z'),
        pickupLocationType: 'construction site'
      },
      delivery: {
        city: 'Tampa',
        state: 'Florida',
        zipcode: '33602'
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
