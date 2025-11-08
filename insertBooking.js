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
      // 1️⃣ Booking
  {
    spaceId: "690ec07c6e8e80d65bae3788",
    shipperId: "690eb52622d1aff410ad18d4",
    carrierId: "690eb42122d1aff410ad18c1",
    truckId: "690eb5ee22d1aff410ad18f0",

    vehicleDetails: {
      licenseNumber: "CA1234TRX",
      brand: "Toyota",
      vehicleType: "Sedan",
      yearMade: 2021,
      features: ["Air Conditioning", "Cruise Control"],
      condition: "excellent",
      quantity: 1,
      photos: ["https://example.com/car1.jpg"],
      contains100lbs: false
    },

    shippingInfo: {
      whatIsBeingShipped: "1 Toyota Camry Sedan",
      additionalComments: "Please handle with care and ensure covered transport."
    },

    pickup: {
      location: "Los Angeles, CA",
      stateCode: "CA",
      pickupDate: "2025-11-10T09:00:00.000Z",
      locationType: "CarDealership"
    },

    delivery: {
      location: "Dallas, TX",
      stateCode: "TX"
    },

    status: "confirmed",
    createdBy: "690eb42022d1aff410ad18be",
    updatedBy: "690eb42022d1aff410ad18be",
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    deletstatus: 0
  },

  // 2️⃣ Booking
  {
    spaceId: "690ec1244e136f104a21da8f",
    shipperId: "690eb59922d1aff410ad18db",
    carrierId: "690eb42122d1aff410ad18c1",
    truckId: "690eb64822d1aff410ad18fe",

    vehicleDetails: {
      licenseNumber: "TX7658SUV",
      brand: "Ford",
      vehicleType: "SUV",
      yearMade: 2019,
      features: ["4x4 Drive", "Bluetooth Audio"],
      condition: "good",
      quantity: 2,
      photos: ["https://example.com/suv1.jpg"],
      contains100lbs: true
    },

    shippingInfo: {
      whatIsBeingShipped: "Two Ford Explorers",
      additionalComments: "One vehicle is slightly oversized."
    },

    pickup: {
      location: "Houston, TX",
      stateCode: "TX",
      pickupDate: "2025-11-12T08:00:00.000Z",
      locationType: "Business"
    },

    delivery: {
      location: "Atlanta, GA",
      stateCode: "GA"
    },

    status: "pending",
    createdBy: "690eb42022d1aff410ad18be",
    updatedBy: "690eb42022d1aff410ad18be",
    ipAddress: "192.168.1.102",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    deletstatus: 0
  },

  // 3️⃣ Booking
  {
    spaceId: "690ec1d266731bf335f27f9a",
    shipperId: "690eb59922d1aff410ad18db",
    carrierId: "690eb42122d1aff410ad18c1",
    truckId: "690eb61f22d1aff410ad18f7",

    vehicleDetails: {
      licenseNumber: "NV8765LUX",
      brand: "BMW",
      vehicleType: "Luxury Sedan",
      yearMade: 2023,
      features: ["Leather Seats", "Heated Seats", "Sunroof"],
      condition: "new",
      quantity: 1,
      photos: ["https://example.com/bmw.jpg"],
      contains100lbs: false
    },

    shippingInfo: {
      whatIsBeingShipped: "BMW 7 Series Luxury Sedan",
      additionalComments: "Premium vehicle – use enclosed trailer only."
    },

    pickup: {
      location: "Las Vegas, NV",
      stateCode: "NV",
      pickupDate: "2025-11-13T07:30:00.000Z",
      locationType: "AuctionHouse"
    },

    delivery: {
      location: "Salt Lake City, UT",
      stateCode: "UT"
    },

    status: "in_progress",
    createdBy: "690eb42022d1aff410ad18be",
    updatedBy: "690eb42022d1aff410ad18be",
    ipAddress: "192.168.1.103",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    deletstatus: 0
  },

  // 4️⃣ Booking
  {
    spaceId: "690ec33ceeaa8e7419d7b239",
    shipperId: "690eb52622d1aff410ad18d4",
    carrierId: "690eb4b222d1aff410ad18c9",
    truckId: "690eb6b722d1aff410ad1910",

    vehicleDetails: {
      licenseNumber: "AZ3456PU",
      brand: "Chevrolet",
      vehicleType: "Pickup Truck",
      yearMade: 2018,
      features: ["Extended Cab", "Tow Hitch"],
      condition: "good",
      quantity: 1,
      photos: ["https://example.com/pickup.jpg"],
      contains100lbs: false
    },

    shippingInfo: {
      whatIsBeingShipped: "Chevrolet Silverado Pickup",
      additionalComments: "Deliver during business hours only."
    },

    pickup: {
      location: "Phoenix, AZ",
      stateCode: "AZ",
      pickupDate: "2025-11-14T09:00:00.000Z",
      locationType: "Business"
    },

    delivery: {
      location: "Denver, CO",
      stateCode: "CO"
    },

    status: "confirmed",
    createdBy: "690eb4b122d1aff410ad18c6",
    updatedBy: "690eb4b122d1aff410ad18c6",
    ipAddress: "192.168.1.104",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    deletstatus: 0
  },

  // 5️⃣ Booking
  {
    spaceId: "690ec33ceeaa8e7419d7b240",
    shipperId: "690eb52622d1aff410ad18d4",
    carrierId: "690eb4b222d1aff410ad18c9",
    truckId: "690eb67422d1aff410ad1905",

    vehicleDetails: {
      licenseNumber: "UT9999SP",
      brand: "Honda",
      vehicleType: "Sports Car",
      yearMade: 2020,
      features: ["Low Suspension", "Turbo Engine"],
      condition: "excellent",
      quantity: 1,
      photos: ["https://example.com/sportscar.jpg"],
      contains100lbs: false
    },

    shippingInfo: {
      whatIsBeingShipped: "Honda Civic Type-R Sports Car",
      additionalComments: "Use straps to secure tightly."
    },

    pickup: {
      location: "Las Vegas, NV",
      stateCode: "NV",
      pickupDate: "2025-11-15T08:00:00.000Z",
      locationType: "CarDealership"
    },

    delivery: {
      location: "Salt Lake City, UT",
      stateCode: "UT"
    },

    status: "pending",
    createdBy: "690eb4b122d1aff410ad18c6",
    updatedBy: "690eb4b122d1aff410ad18c6",
    ipAddress: "192.168.1.105",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    deletstatus: 0
  },

  // 6️⃣ Booking
  {
    spaceId: "690ec33ceeaa8e7419d7b247",
    shipperId: "690eb59922d1aff410ad18db",
    carrierId: "690eb4b222d1aff410ad18c9",
    truckId: "690eb6fb22d1aff410ad1919",

    vehicleDetails: {
      licenseNumber: "WA7777CT",
      brand: "Volvo",
      vehicleType: "Container Truck",
      yearMade: 2022,
      features: ["GPS", "Air Suspension"],
      condition: "excellent",
      quantity: 1,
      photos: ["https://example.com/container.jpg"],
      contains100lbs: true
    },

    shippingInfo: {
      whatIsBeingShipped: "Volvo Container Cargo",
      additionalComments: "Urgent delivery request."
    },

    pickup: {
      location: "Seattle, WA",
      stateCode: "WA",
      pickupDate: "2025-11-16T10:00:00.000Z",
      locationType: "Business"
    },

    delivery: {
      location: "San Francisco, CA",
      stateCode: "CA"
    },

    status: "confirmed",
    createdBy: "690eb4b122d1aff410ad18c6",
    updatedBy: "690eb4b122d1aff410ad18c6",
    ipAddress: "192.168.1.106",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    deletstatus: 0
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
