// const mongoose = require('mongoose');
// const Space = require('./models/Space'); // adjust path if needed
// const dotenv = require('dotenv');
// dotenv.config();
// // Replace with your MongoDB connection string
// const MONGO_URI = process.env.MONGODB_URI;

// async function insertSpace() {
//   try {
//     // Connect to MongoDB
//     await mongoose.connect(MONGO_URI);

//     // Example ObjectIds (replace with valid ones from your Carrier, Truck, Route, User collections)
//     // const carrierId = new mongoose.Types.ObjectId();
//     // const truckId = new mongoose.Types.ObjectId();
//     // const routeId = new mongoose.Types.ObjectId();
//     // const userId = new mongoose.Types.ObjectId();

// const carrierId = "690c6bf47e8ffea31089230e";
//   const truckId = "690c6c417e8ffea310892337";
//   const routeId = "690c6e755cc8eb34ab62500f";
//    const userId = "690c6bf37e8ffea31089230b";
    
//     // Sample document
//     const newSpace = new Space({
//       carrierId: carrierId,
//       truckId: truckId,
//       routeId: routeId,
//       origin: {
//         location: 'Chennai',
//         city: 'Chennai',
//         state: 'Tamil Nadu',
//         pickupDate: new Date('2025-10-10'),
//         pickupWindow: '09:00 - 11:00 AM',
//         pickupRadius: 15,
        
//       },
//       destination: {
//         location: 'Bangalore',
//         city: 'Bangalore',
//         state: 'Karnataka',
//         deliveryDate: new Date('2025-10-12'),
//         deliveryWindow: '02:00 - 04:00 PM',
//         deliveryRadius: 20,
        
//       },
//       availableSpaces: 6,
//       message: 'Refrigerated truck available for goods transport.',
//       rateCard: [
//         {
//           vehicleType: 'Truck',
//           basePrice: 12000,
//           variants: [
//             { name: 'Small', price: 10000 },
//             { name: 'Large', price: 15000 }
//           ]
//         }
//       ],
//       status: 'active',
//       postedDate: new Date(),
//       expiryDate: new Date('2025-10-20'),
//       createdBy: userId,
//       updatedBy: userId,
//       ipAddress: '192.168.1.10',
//       userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
//     });

//     // Save the document
//     const result = await newSpace.save();

//     // Close connection
//     await mongoose.connection.close();
//   } catch (error) {
//     console.error('❌ Error inserting space:', error);
//   }
// }

// insertSpace();




// insertSpace.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Space = require('./models/Space'); // adjust path as needed

const MONGO_URI = process.env.MONGODB_URI;

// // IDs provided
// const carrierId = "690c6bf47e8ffea31089230e";
// const truckId = "690c6c417e8ffea310892337";
// const routeId = "690c6e755cc8eb34ab62500f";
// const userId = "690c6bf37e8ffea31089230b";

async function insertSpaces() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const spaces = [
{
  carrierId: "690eb4b222d1aff410ad18c9",
  truckId: "690eb6b722d1aff410ad1910",
  routeId: "690ebd36bfd59357e1e2d7d4",
  userId: "690eb4b122d1aff410ad18c6",

  origin: {
    location: "Phoenix Industrial Park, AZ",
    city: "Phoenix",
    state: "Arizona",
    stateCode: "AZ",
    pickupDate: "2025-11-11T07:00:00.000Z",
    pickupWindow: "07:00 AM - 09:00 AM",
    pickupRadius: 40,
    coordinates: {
      type: "Point",
      coordinates: [-112.0740, 33.4484]
    }
  },

  destination: {
    location: "Denver Logistics Hub, CO",
    city: "Denver",
    state: "Colorado",
    stateCode: "CO",
    deliveryDate: "2025-11-13T17:00:00.000Z",
    deliveryWindow: "03:00 PM - 05:00 PM",
    deliveryRadius: 60,
    coordinates: {
      type: "Point",
      coordinates: [-104.9903, 39.7392]
    }
  },

  availableSpaces: 4,
  bookedSpaces: 1,
  message: "Quick shipment from Arizona to Colorado. Safe and reliable!",

  rateCard: [
    {
      vehicleType: "Flatbed",
      basePrice: 900,
      variants: [
        { name: "Standard Flatbed", price: 850 },
        { name: "Heavy-duty Flatbed", price: 1000 }
      ]
    },
    {
      vehicleType: "Reefer Truck",
      basePrice: 1200,
      variants: [
        { name: "Small Reefer", price: 1100 },
        { name: "Large Reefer", price: 1300 }
      ]
    }
  ],

  status: "active",
  postedDate: "2025-11-08T12:00:00.000Z",
  expiryDate: "2025-11-25T12:00:00.000Z",

  createdBy: "690eb4b122d1aff410ad18c6",
  updatedBy: "690eb4b122d1aff410ad18c6",
  ipAddress: "192.168.1.105",
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  deletstatus: 0
},
{
  carrierId: "690eb4b222d1aff410ad18c9",
  truckId: "690eb67422d1aff410ad1905",
  routeId: "690ebd36bfd59357e1e2d7d3",
  userId: "690eb4b122d1aff410ad18c6",

  origin: {
    location: "Las Vegas Freight Terminal, NV",
    city: "Las Vegas",
    state: "Nevada",
    stateCode: "NV",
    pickupDate: "2025-11-12T08:00:00.000Z",
    pickupWindow: "08:00 AM - 10:00 AM",
    pickupRadius: 35,
    coordinates: {
      type: "Point",
      coordinates: [-115.1398, 36.1699]
    }
  },

  destination: {
    location: "Salt Lake City Cargo Center, UT",
    city: "Salt Lake City",
    state: "Utah",
    stateCode: "UT",
    deliveryDate: "2025-11-14T18:00:00.000Z",
    deliveryWindow: "04:00 PM - 06:00 PM",
    deliveryRadius: 55,
    coordinates: {
      type: "Point",
      coordinates: [-111.8910, 40.7608]
    }
  },

  availableSpaces: 7,
  bookedSpaces: 3,
  message: "Las Vegas to Utah – Fast refrigerated load available!",

  rateCard: [
    {
      vehicleType: "Refrigerated Truck",
      basePrice: 950,
      variants: [
        { name: "Light Load", price: 900 },
        { name: "Full Load", price: 1100 }
      ]
    },
    {
      vehicleType: "Box Truck",
      basePrice: 800,
      variants: [
        { name: "Small Box Truck", price: 750 },
        { name: "Large Box Truck", price: 950 }
      ]
    }
  ],

  status: "active",
  postedDate: "2025-11-08T13:00:00.000Z",
  expiryDate: "2025-11-24T13:00:00.000Z",

  createdBy: "690eb4b122d1aff410ad18c6",
  updatedBy: "690eb4b122d1aff410ad18c6",
  ipAddress: "192.168.1.106",
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  deletstatus: 0
},
{
  carrierId: "690eb4b222d1aff410ad18c9",
  truckId: "690eb6fb22d1aff410ad1919",
  routeId: "690ebd36bfd59357e1e2d7d5",
  userId: "690eb4b122d1aff410ad18c6",

  origin: {
    location: "Seattle Port Terminal, WA",
    city: "Seattle",
    state: "Washington",
    stateCode: "WA",
    pickupDate: "2025-11-09T09:00:00.000Z",
    pickupWindow: "09:00 AM - 11:00 AM",
    pickupRadius: 60,
    coordinates: {
      type: "Point",
      coordinates: [-122.3321, 47.6062]
    }
  },

  destination: {
    location: "San Francisco Bay Yard, CA",
    city: "San Francisco",
    state: "California",
    stateCode: "CA",
    deliveryDate: "2025-11-11T19:00:00.000Z",
    deliveryWindow: "05:00 PM - 07:00 PM",
    deliveryRadius: 65,
    coordinates: {
      type: "Point",
      coordinates: [-122.4194, 37.7749]
    }
  },

  availableSpaces: 8,
  bookedSpaces: 4,
  message: "West Coast delivery – Fast and flexible scheduling!",

  rateCard: [
    {
      vehicleType: "Container Truck",
      basePrice: 1400,
      variants: [
        { name: "20ft", price: 1300 },
        { name: "40ft", price: 1550 }
      ]
    },
    {
      vehicleType: "Open Truck",
      basePrice: 1000,
      variants: [
        { name: "Medium Open", price: 950 },
        { name: "Large Open", price: 1150 }
      ]
    }
  ],

  status: "active",
  postedDate: "2025-11-08T14:00:00.000Z",
  expiryDate: "2025-11-23T14:00:00.000Z",

  createdBy: "690eb4b122d1aff410ad18c6",
  updatedBy: "690eb4b122d1aff410ad18c6",
  ipAddress: "192.168.1.107",
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  deletstatus: 0
}



    ];

    const result = await Space.insertMany(spaces);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error inserting spaces:", error);
    process.exit(1);
  }
}

insertSpaces();
