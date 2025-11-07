// insertBooking.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Booking = require('./models/Booking'); // Adjust path as needed

const MONGO_URI = process.env.MONGODB_URI;

async function insertBookings() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    // Example booking documents
    const bookings = [
      {
        spaceId: '690c2da5b04e94799b000638', // Replace with actual Space _id
        shipperId: '690c7567d3da8329aedbb421', // Replace with actual Shipper _id
        carrierId: '690afffdc5696493cf8a937a', // Replace with actual Carrier _id
        truckId: '690c72d9bf44a256b66b26e0', // Replace with actual Truck _id

        vehicleDetails: {
          licenseNumber: 'GA-2345-LMN',
          brand: 'Tesla',
          vehicleType: 'Electric Truck',
          yearMade: 2023,
          features: ['GPS', 'Air Conditioning', 'Auto Drive'],
          condition: 'excellent',
          quantity: 2,
          photos: ['https://example.com/vehicle1.jpg', 'https://example.com/vehicle2.jpg'],
          contains100lbs: false
        },

        shippingInfo: {
          whatIsBeingShipped: 'Luxury Sedans',
          additionalComments: 'Handle with extra care — brand new vehicles.'
        },

        pickup: {
          location: 'Atlanta, Georgia',
          pickupDate: new Date('2025-11-10T09:00:00Z'),
          locationType: 'CarDealership'
        },

        delivery: {
          location: 'Miami, Florida'
        },

        status: 'confirmed',

        createdBy: '68e73aebda9fdad99d4d53ea', // admin user
        updatedBy: '68e73aebda9fdad99d4d53ea',

        ipAddress: '192.168.1.15',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      {
        spaceId: '672b1bfa22b3476a59ab5555',
        shipperId: '672b1c2e22b3476a59ab6666',
        carrierId: '672b1c6422b3476a59ab7777',
        truckId: '672b1c8822b3476a59ab8888',

        vehicleDetails: {
          licenseNumber: 'FL-7890-ABC',
          brand: 'Volvo',
          vehicleType: 'Trailer',
          yearMade: 2021,
          features: ['ABS', 'Bluetooth', 'Refrigeration'],
          condition: 'good',
          quantity: 1,
          photos: ['https://example.com/volvo1.jpg'],
          contains100lbs: true
        },

        shippingInfo: {
          whatIsBeingShipped: 'Frozen Food Supplies',
          additionalComments: 'Temperature-sensitive cargo.'
        },

        pickup: {
          location: 'Orlando, Florida',
          pickupDate: new Date('2025-11-12T08:30:00Z'),
          locationType: 'Business'
        },

        delivery: {
          location: 'Savannah, Georgia'
        },

        status: 'pending',

        createdBy: '68e73aebda9fdad99d4d53ea',
        ipAddress: '172.22.45.10',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
      }
    ];

    const result = await Booking.insertMany(bookings);
    console.log('📦 Bookings inserted successfully:', result);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inserting bookings:', error);
    process.exit(1);
  }
}

insertBookings();
