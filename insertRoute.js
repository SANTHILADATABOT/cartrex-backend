// insertRoute.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Route = require('./models/Route'); // adjust path if needed

const MONGO_URI = process.env.MONGODB_URI;

async function insertRoutes() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    // Example routes for the two carriers
    const routes = [
        {
    carrierId: "69130fd46401c567c2c0202a",
    truckId: "690eb61f22d1aff410ad18f7",
    origin: {
      state: "California",
      stateCode: "CA",
      city: "Los Angeles",
      pickupWindow: "2025-11-10T08:00:00.000Z",
      pickupRadius: 50
    },
    destination: {
      state: "Nevada",
      stateCode: "NV",
      city: "Las Vegas",
      deliveryWindow: "2025-11-11T17:00:00.000Z",
      deliveryRadius: 60
    },
    status: "active",
    createdBy: "69130fd46401c567c2c0202a",
    updatedBy: "69130fd46401c567c2c0202a",
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    deletstatus: 0
  },

  // 2️⃣ Pair 2
  {
    carrierId: "69130fd46401c567c2c0202a",
    truckId: "690eb64822d1aff410ad18fe",
    origin: {
      state: "Arizona",
      stateCode: "AZ",
      city: "Phoenix",
      pickupWindow: "2025-11-12T09:00:00.000Z",
      pickupRadius: 45
    },
    destination: {
      state: "New Mexico",
      stateCode: "NM",
      city: "Albuquerque",
      deliveryWindow: "2025-11-13T18:00:00.000Z",
      deliveryRadius: 70
    },
    status: "active",
    createdBy: "69130fd46401c567c2c0202a",
    updatedBy: "69130fd46401c567c2c0202a",
    ipAddress: "192.168.1.102",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    deletstatus: 0
  },

  // 3️⃣ Pair 3
  {
    carrierId: "690eb4b222d1aff410ad18c9",
    truckId: "690eb67422d1aff410ad1905",
    origin: {
      state: "Texas",
      stateCode: "TX",
      city: "Dallas",
      pickupWindow: "2025-11-14T07:30:00.000Z",
      pickupRadius: 55
    },
    destination: {
      state: "Louisiana",
      stateCode: "LA",
      city: "Baton Rouge",
      deliveryWindow: "2025-11-15T16:30:00.000Z",
      deliveryRadius: 65
    },
    status: "active",
    createdBy: "690eb4b222d1aff410ad18c9",
    updatedBy: "690eb4b222d1aff410ad18c9",
    ipAddress: "192.168.1.103",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    deletstatus: 0
  },

  // 4️⃣ Pair 4
  {
    carrierId: "690eb4b222d1aff410ad18c9",
    truckId: "690eb6b722d1aff410ad1910",
    origin: {
      state: "Georgia",
      stateCode: "GA",
      city: "Atlanta",
      pickupWindow: "2025-11-16T08:45:00.000Z",
      pickupRadius: 40
    },
    destination: {
      state: "Florida",
      stateCode: "FL",
      city: "Orlando",
      deliveryWindow: "2025-11-17T15:45:00.000Z",
      deliveryRadius: 55
    },
    status: "active",
    createdBy: "690eb4b222d1aff410ad18c9",
    updatedBy: "690eb4b222d1aff410ad18c9",
    ipAddress: "192.168.1.104",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    deletstatus: 0
  },

  // 5️⃣ Pair 5
  {
    carrierId: "690eb4b222d1aff410ad18c9",
    truckId: "690eb6fb22d1aff410ad1919",
    origin: {
      state: "Illinois",
      stateCode: "IL",
      city: "Chicago",
      pickupWindow: "2025-11-18T09:15:00.000Z",
      pickupRadius: 70
    },
    destination: {
      state: "Ohio",
      stateCode: "OH",
      city: "Columbus",
      deliveryWindow: "2025-11-19T18:15:00.000Z",
      deliveryRadius: 80
    },
    status: "active",
    createdBy: "690eb4b222d1aff410ad18c9",
    updatedBy: "690eb4b222d1aff410ad18c9",
    ipAddress: "192.168.1.105",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    deletstatus: 0
  }

    ];

    const result = await Route.insertMany(routes);
    console.log('🛣️ Routes inserted successfully:', result);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inserting routes:', error);
    process.exit(1);
  }
}

insertRoutes();
