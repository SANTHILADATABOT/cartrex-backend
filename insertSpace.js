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
//     console.log('✅ Connected to MongoDB');

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
//     console.log('✅ Space inserted successfully:', result);

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

// IDs provided
const carrierId = "690c6bf47e8ffea31089230e";
const truckId = "690c6c417e8ffea310892337";
const routeId = "690c6e755cc8eb34ab62500f";
const userId = "690c6bf37e8ffea31089230b";

async function insertSpaces() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("✅ Connected to MongoDB");

    const spaces = [
      {
        carrierId,
        truckId,
        routeId,
        origin: {
          location: "Atlanta, Georgia",
          city: "Atlanta",
          state: "Georgia",
          pickupDate: new Date("2025-11-10"),
          pickupWindow: "08:00 - 12:00",
          pickupRadius: 25,
          coordinates: { type: "Point", coordinates: [-84.3880, 33.7490] } // longitude, latitude
        },
        destination: {
          location: "Miami, Florida",
          city: "Miami",
          state: "Florida",
          deliveryDate: new Date("2025-11-12"),
          deliveryWindow: "09:00 - 17:00",
          deliveryRadius: 30,
          coordinates: { type: "Point", coordinates: [-80.1918, 25.7617] }
        },
        availableSpaces: 4,
        message: "Space available for vehicle transport from Atlanta to Miami.",
        rateCard: [
          {
            vehicleType: "Sedan",
            basePrice: 500,
            variants: [
              { name: "SUV", price: 650 },
              { name: "Truck", price: 800 }
            ]
          }
        ],
        status: "active",
        expiryDate: new Date("2025-12-01"),
        createdBy: userId,
        ipAddress: "192.168.1.10",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      },
      {
        carrierId,
        truckId,
        routeId,
        origin: {
          location: "Dallas, Texas",
          city: "Dallas",
          state: "Texas",
          pickupDate: new Date("2025-11-15"),
          pickupWindow: "07:00 - 11:00",
          pickupRadius: 20,
          coordinates: { type: "Point", coordinates: [-96.7970, 32.7767] }
        },
        destination: {
          location: "Houston, Texas",
          city: "Houston",
          state: "Texas",
          deliveryDate: new Date("2025-11-16"),
          deliveryWindow: "10:00 - 18:00",
          deliveryRadius: 25,
          coordinates: { type: "Point", coordinates: [-95.3698, 29.7604] }
        },
        availableSpaces: 3,
        message: "Available space for small vehicle shipment from Dallas to Houston.",
        rateCard: [
          {
            vehicleType: "Compact Car",
            basePrice: 300,
            variants: [
              { name: "SUV", price: 450 },
              { name: "Luxury", price: 600 }
            ]
          }
        ],
        status: "active",
        expiryDate: new Date("2025-12-05"),
        createdBy: userId,
        ipAddress: "192.168.1.11",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    ];

    const result = await Space.insertMany(spaces);
    console.log("🚚 Spaces inserted successfully:", result);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error inserting spaces:", error);
    process.exit(1);
  }
}

insertSpaces();
