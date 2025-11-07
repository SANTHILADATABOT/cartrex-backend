// insertBids.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Bid = require('./models/Bid'); // Adjust path if needed

const MONGO_URI = process.env.MONGODB_URI;

async function insertBids() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    // Example bid documents
    const bids = [
      {
        shipperId: '690d78ff22d1aff410ad17c8', // Replace with actual Shipper _id
        carrierId: '690c6bf47e8ffea31089230e', // Replace with actual Carrier _id
        routeId: '690c6e755cc8eb34ab62500f',   // Replace with actual Route _id

        bidValue: 1500,

        vehicleDetails: {
          licenseNumber: 'TX-1234-ABC',
          brand: 'Freightliner',
          vehicleType: 'Heavy Duty Truck',
          yearMade: 2022,
          features: ['GPS', 'Air Suspension', 'Refrigerated Unit'],
          condition: 'excellent',
          quantity: 1,
          photos: ['https://example.com/truck1.jpg', 'https://example.com/truck2.jpg'],
          contains100lbs: true
        },

        shippingDescription: 'Transporting industrial equipment',
        transportType: 'Flatbed',
        vinNumber: '1FTFW1E85JFC12345',
        lotNumber: 'LOT-7890',

        pickup: {
          city: 'Dallas',
          state: 'Texas',
          zipcode: '75201',
          pickupDate: new Date('2025-11-10T08:00:00Z'),
          pickupLocationType: 'Warehouse'
        },

        delivery: {
          city: 'Houston',
          state: 'Texas',
          zipcode: '77001'
        },

        additionalComments: 'Ensure straps and safety checks before departure.',
        timing: 'good_till_cancelled',
        status: 'pending',

        createdBy: '68e73aebda9fdad99d4d53ea',
        updatedBy: '68e73aebda9fdad99d4d53ea',
        ipAddress: '192.168.1.25',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      {
        shipperId: '672b1f0022b3476a59ab9999',
        carrierId: '672b1f2122b3476a59abaaaa',
        routeId: '672b1f3a22b3476a59abb111',

        bidValue: 950,

        vehicleDetails: {
          licenseNumber: 'CA-5678-XYZ',
          brand: 'Volvo',
          vehicleType: 'Semi-Trailer',
          yearMade: 2021,
          features: ['ABS', 'Bluetooth', 'Cruise Control'],
          condition: 'good',
          quantity: 1,
          photos: ['https://example.com/volvo-semi.jpg'],
          contains100lbs: false
        },

        shippingDescription: 'Transporting packaged electronics',
        transportType: 'Closed Container',
        vinNumber: '2HGFG11859H500987',
        lotNumber: 'LOT-9021',

        pickup: {
          city: 'San Francisco',
          state: 'California',
          zipcode: '94103',
          pickupDate: new Date('2025-11-12T09:30:00Z'),
          pickupLocationType: 'Distribution Center'
        },

        delivery: {
          city: 'Los Angeles',
          state: 'California',
          zipcode: '90001'
        },

        additionalComments: 'Fragile cargo — avoid sudden braking.',
        timing: '1_week',
        status: 'confirmed',

        createdBy: '68e73aebda9fdad99d4d53ea',
        ipAddress: '172.16.45.11',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
      }
    ];

    const result = await Bid.insertMany(bids);
    console.log('📦 Bids inserted successfully:', result);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inserting bids:', error);
    process.exit(1);
  }
}

insertBids();
