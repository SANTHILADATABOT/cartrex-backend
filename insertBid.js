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
      shipperId: '690c8d4322d1aff410ad175c',  // Replace with actual Shipper ID
      carrierId: '690c8cac22d1aff410ad174f',  // Replace with actual Carrier ID
      routeId: '690c90418c0c2af03abee750',    // Replace with actual Route ID

      bidValue: 1500,

      vehicleDetails: {
        licenseNumber: 'TX-9087',
        brand: 'Volvo',
        vehicleType: 'Flatbed Truck',
        yearMade: 2018,
        features: ['GPS', 'Air Suspension', 'Covered Bed'],
        condition: 'good',
        quantity: 2,
        photos: [
          'https://example.com/uploads/vehicles/volvo1.jpg',
          'https://example.com/uploads/vehicles/volvo2.jpg'
        ],
        contains100lbs: true
      },

      shippingDescription: 'Transporting heavy construction equipment',
      transportType: 'road',
      vinNumber: '1HGCM82633A123456',
      lotNumber: 'LOT-2398',

      pickup: {
        city: 'Dallas',
        state: 'Texas',
        zipcode: '75201',
        pickupDate: new Date('2025-11-10T09:00:00Z'),
        pickupLocationType: 'warehouse'
      },

      delivery: {
        city: 'Houston',
        state: 'Texas',
        zipcode: '77001'
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
