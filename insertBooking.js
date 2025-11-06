const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Booking = require('./models/Booking'); // Adjust path if needed

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');

    // Sample insert
    const newBooking = new Booking({
      spaceId: '68e8a033a56150607b6b08e9', // Replace with real Space _id
      shipperId: '69036224c20f231856087db7', // Replace with real Shipper _id
      carrierId: '69036838bd5648fb37fa6e2a', // Replace with real Carrier _id
      truckId: '68f1db9e6598d5db0486a8b8', // Replace with real Truck _id

      vehicleDetails: {
        licenseNumber: 'GA-2435-LMN',
        brand: 'Tata',
        vehicleType: 'Electric Truck',
        yearMade: 2023,
        features: ['GPS', 'Refrigerated', 'Windroof'],
        condition: 'excellent',
        quantity: 1,
        photos: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
        contains100lbs: true
      },

      shippingInfo: {
        whatIsBeingShipped: 'Electronics',
        additionalComments: 'Handle with care'
      },

      pickup: {
        location: '123 Main St, City A',
        pickupDate: new Date('2025-11-10T09:00:00Z'),
        locationType: 'Business'
      },

      delivery: {
        location: '456 Market St, City B'
      },

      status: 'pending',

      createdBy: '690afffcc5696493cf8a9377', // Replace with real User _id
      updatedBy: '690afffcc5696493cf8a9377',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    });

    await newBooking.save();
    console.log('Booking inserted successfully:', newBooking);

    mongoose.connection.close();
  })
  .catch(err => console.error('MongoDB connection error:', err));
