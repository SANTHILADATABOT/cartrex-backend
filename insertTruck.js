// insertTruck.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Truck = require('./models/Truck'); // adjust path if needed

const MONGO_URI = process.env.MONGODB_URI;

async function insertTruck() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    // Example truck data linked with your Carrier records
    const trucks = [
    //   {
    //     carrierId: '68e4aa373e31aa48741bd932', // Priya Dharshini’s carrier
    //     nickname: 'Priya Express 2',
    //     registrationNumber: 'TX-98285A',
    //     truckType: 'Open Car Hauler',
    //     hasWinch: true,
    //     capacity: 7,
    //     mcDotNumber: 'MC1234568',
    //     vinNumber: '1XP5DB9X6YN525744',
    //     insurance: 'https://s3.amazonaws.com/fleetdata/insurance/priya_express1.pdf',
    //     insuranceExpiry: new Date('2026-03-31'),
    //     insuranceValidated: true,
    //     coverPhoto: 'https://s3.amazonaws.com/fleetdata/trucks/priya_express_cover1.jpg',
    //     photos: [
    //       'https://s3.amazonaws.com/fleetdata/trucks/priya_express_side1.jpg',
    //       'https://s3.amazonaws.com/fleetdata/trucks/priya_express_back1.jpg'
    //     ],
    //     rating: 4.8,
    //     status: 'active',
    //     location: {
    //       city: 'Dallas',
    //       state: 'Texas',
    //       coordinates: {
    //         type: 'Point',
    //         coordinates: [-96.7970, 32.7767] // Dallas, TX
    //       }
    //     },
    //     createdBy: '68e73aebda9fdad99d4d53ea', // admin
    //     ipAddress: '34.123.56.25',
    //     userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    //   },
      {
        carrierId: '68e4adee242cb5d538cf73d0', // Angelin Nivetha’s carrier
        nickname: 'Nivetha Freightliner-1',
        registrationNumber: 'CA-776541',
        truckType: 'Enclosed Car Hauler',
        hasWinch: false,
        capacity: 6,
        mcDotNumber: 'MC7654322',
        vinNumber: '1HTMKADN63H561232',
        insurance: 'https://s3.amazonaws.com/fleetdata/insurance/nivetha_freight1.pdf',
        insuranceExpiry: new Date('2026-05-15'),
        insuranceValidated: true,
        coverPhoto: 'https://s3.amazonaws.com/fleetdata/trucks/nivetha_freight_cover1.jpg',
        photos: [
          'https://s3.amazonaws.com/fleetdata/trucks/nivetha_freight_front1.jpg',
          'https://s3.amazonaws.com/fleetdata/trucks/nivetha_freight_side1.jpg'
        ],
        rating: 4.6,
        status: 'active',
        location: {
          city: 'Los Angeles',
          state: 'California',
          coordinates: {
            type: 'Point',
            coordinates: [-118.2437, 34.0522] // Los Angeles, CA
          }
        },
        createdBy: '68e73aebda9fdad99d4d53ea',
        ipAddress: '34.123.56.26',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
      }
    ];

    const result = await Truck.insertMany(trucks);
    process.exit(0);
  } catch (error) {
    console.error('Error inserting truck data:', error);
    process.exit(1);
  }
}

insertTruck();
