// const mongoose = require('mongoose');
// const Bid = require('./models/Bid');
// const dotenv = require('dotenv');
// dotenv.config();

// const MONGO_URI = process.env.MONGODB_URI;

// async function insertSampleBid() {
//   try {
//     await mongoose.connect(MONGO_URI);
//     console.log('✅ Connected to MongoDB');

//     const newBid = await Bid.create({
//         shipperId: "690eb52622d1aff410ad18d4",
//         carrierId: "690eb42122d1aff410ad18c1",
//         routeId: "690ebb97053d8cbe758c3be8",

//         bidValue: 1200,
//         vehicleDetails: {
//           licenseNumber: "TXA-4532",
//           brand: "Toyota",
//           vehicleType: "SUV",
//           yearMade: 2021,
//           features: ["GPS", "Air Conditioning", "ABS"],
//           condition: "excellent",
//           quantity: 1,
//           photos: ["https://example.com/img1.jpg"],
//           contains100lbs: false
//         },
//         shippingDescription: "Transporting a single SUV from CA to TX",
//         transportType: "Open Transport",
//         vinNumber: "1HGCM82633A123456",
//         lotNumber: "LOT-1001",

//         pickup: {
//           city: "Los Angeles",
//           state: "California",
//           stateCode: "CA",
//           zipcode: "90001",
//           pickupDate: "2025-11-10T08:00:00.000Z",
//           pickupLocationType: "Business"
//         },
//         delivery: {
//           city: "Dallas",
//           state: "Texas",
//           stateCode: "TX",
//           zipcode: "75201"
//         },
//         additionalComments: "Need careful handling, flexible timing",
//         timing: "1_week",
//         status: "pending",
//         createdBy: "690eb42022d1aff410ad18be",
//         ipAddress: "192.168.1.101",
//         userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
//       },
//       {
//         shipperId: "690eb59922d1aff410ad18db",
//         carrierId: "690eb4b222d1aff410ad18c9",
//         routeId: "690ebd36bfd59357e1e2d7d4",

//         bidValue: 1800,
//         vehicleDetails: {
//           licenseNumber: "DLX-7834",
//           brand: "Ford",
//           vehicleType: "Pickup Truck",
//           yearMade: 2022,
//           features: ["Airbags", "Bluetooth", "4x4"],
//           condition: "good",
//           quantity: 1,
//           photos: ["https://example.com/ford.jpg"],
//           contains100lbs: true
//         },
//         shippingDescription: "Pickup truck relocation service",
//         transportType: "Enclosed Transport",
//         vinNumber: "1FTFW1EF1EFA12345",
//         lotNumber: "LOT-1002",

//         pickup: {
//           city: "Houston",
//           state: "Texas",
//           stateCode: "TX",
//           zipcode: "77001",
//           pickupDate: "2025-11-12T09:00:00.000Z",
//           pickupLocationType: "AuctionHouse"
//         },
//         delivery: {
//           city: "Chicago",
//           state: "Illinois",
//           stateCode: "IL",
//           zipcode: "60601"
//         },
//         additionalComments: "Pickup at auction house only after 9AM",
//         timing: "good_till_cancelled",
//         status: "confirmed",
//         createdBy: "690eb4b122d1aff410ad18c6",
//         ipAddress: "192.168.1.103",
//         userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X)"
//       });

//     console.log('🚛 Bid inserted successfully:', newBid._id);
//     process.exit(0);
//   } catch (error) {
//     console.error('❌ Error inserting bid:', error);
//     process.exit(1);
//   }
// }

// insertSampleBid();
const mongoose = require('mongoose');
const Bid = require('./models/Bid');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;






async function insertBids() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    const bids = [
      // 1️⃣ Bid — CA to TX
      {
        shipperId: "690eb52622d1aff410ad18d4",
        carrierId: "690eb42122d1aff410ad18c1",
        routeId: "690ebd36bfd59357e1e2d7d1",
        bidValue: 1150,
        vehicleDetails: {
          licenseNumber: "CA-9812",
          brand: "Honda",
          vehicleType: "Sedan",
          yearMade: 2020,
          features: ["Air Conditioning", "GPS"],
          condition: "excellent",
          quantity: 1,
          photos: ["https://example.com/honda.jpg"]
        },
        shippingDescription: "Sedan delivery from Los Angeles to Houston",
        transportType: "Open Transport",
        vinNumber: "1HGCM82633A000001",
        lotNumber: "LOT-CA-TX-01",
        pickup: {
          city: "Los Angeles",
          state: "California",
          stateCode: "CA",
          zipcode: "90001",
          pickupDate: "2025-11-10T08:00:00.000Z",
          pickupLocationType: "Business"
        },
        delivery: {
          city: "Houston",
          state: "Texas",
          stateCode: "TX",
          zipcode: "77001"
        },
        additionalComments: "Handle carefully; early morning pickup preferred.",
        timing: "1_week",
        status: "pending",
        createdBy: "690eb42022d1aff410ad18be",
        ipAddress: "192.168.1.101",
        userAgent: "Mozilla/5.0"
      },

      // 2️⃣ Bid — CA to FL
      {
        shipperId: "690eb52622d1aff410ad18d4",
        carrierId: "690eb42122d1aff410ad18c1",
        routeId: "690ebd36bfd59357e1e2d7d2",
        bidValue: 1350,
        vehicleDetails: {
          licenseNumber: "CA-4444",
          brand: "Tesla",
          vehicleType: "Sedan",
          yearMade: 2023,
          features: ["Electric", "Autopilot"],
          condition: "new",
          quantity: 1,
          photos: ["https://example.com/tesla.jpg"]
        },
        shippingDescription: "Tesla Model 3 shipment to Miami",
        transportType: "Enclosed Transport",
        vinNumber: "5YJ3E1EA7JF123456",
        lotNumber: "LOT-CA-FL-02",
        pickup: {
          city: "San Diego",
          state: "California",
          stateCode: "CA",
          zipcode: "92101",
          pickupDate: "2025-11-12T09:00:00.000Z",
          pickupLocationType: "CarDealership"
        },
        delivery: {
          city: "Miami",
          state: "Florida",
          stateCode: "FL",
          zipcode: "33101"
        },
        additionalComments: "Requires enclosed trailer for protection.",
        timing: "good_till_cancelled",
        status: "pending",
        createdBy: "690eb42022d1aff410ad18be",
        ipAddress: "192.168.1.102",
        userAgent: "Mozilla/5.0"
      },

      // 3️⃣ Bid — TX to IL
      {
        shipperId: "690eb59922d1aff410ad18db",
        carrierId: "690eb4b222d1aff410ad18c9",
        routeId: "690ebd36bfd59357e1e2d7d3",
        bidValue: 1600,
        vehicleDetails: {
          licenseNumber: "TX-7891",
          brand: "Ford",
          vehicleType: "Pickup Truck",
          yearMade: 2021,
          features: ["4x4", "Bluetooth"],
          condition: "good",
          quantity: 1,
          photos: ["https://example.com/fordtruck.jpg"]
        },
        shippingDescription: "Ford F-150 shipment from Houston to Chicago",
        transportType: "Open Transport",
        vinNumber: "1FTFW1E50MFB12345",
        lotNumber: "LOT-TX-IL-03",
        pickup: {
          city: "Houston",
          state: "Texas",
          stateCode: "TX",
          zipcode: "77001",
          pickupDate: "2025-11-13T10:00:00.000Z",
          pickupLocationType: "AuctionHouse"
        },
        delivery: {
          city: "Chicago",
          state: "Illinois",
          stateCode: "IL",
          zipcode: "60601"
        },
        additionalComments: "Flexible delivery time.",
        timing: "1_week",
        status: "confirmed",
        createdBy: "690eb4b122d1aff410ad18c6",
        ipAddress: "192.168.1.103",
        userAgent: "Mozilla/5.0"
      },

      // 4️⃣ Bid — NY to OH
      {
        shipperId: "690eb59922d1aff410ad18db",
        carrierId: "690eb4b222d1aff410ad18c9",
        routeId: "690ebd36bfd59357e1e2d7d5",
        bidValue: 1450,
        vehicleDetails: {
          licenseNumber: "NY-5532",
          brand: "BMW",
          vehicleType: "Sedan",
          yearMade: 2019,
          features: ["Leather Seats", "Sunroof"],
          condition: "excellent",
          quantity: 1,
          photos: ["https://example.com/bmw.jpg"]
        },
        shippingDescription: "Luxury BMW sedan to be shipped to Ohio",
        transportType: "Enclosed Transport",
        vinNumber: "WBA3A5C59CF123456",
        lotNumber: "LOT-NY-OH-04",
        pickup: {
          city: "New York",
          state: "New York",
          stateCode: "NY",
          zipcode: "10001",
          pickupDate: "2025-11-15T09:00:00.000Z",
          pickupLocationType: "CarDealership"
        },
        delivery: {
          city: "Columbus",
          state: "Ohio",
          stateCode: "OH",
          zipcode: "43004"
        },
        additionalComments: "Handle with care, luxury vehicle.",
        timing: "good_till_cancelled",
        status: "pending",
        createdBy: "690eb4b122d1aff410ad18c6",
        ipAddress: "192.168.1.104",
        userAgent: "Mozilla/5.0"
      },

      // 5️⃣ Bid — TX to IL (repeat route, different vehicle)
      {
        shipperId: "690eb59922d1aff410ad18db",
        carrierId: "690eb4b222d1aff410ad18c9",
        routeId: "690ebd36bfd59357e1e2d7d3",
        bidValue: 1550,
        vehicleDetails: {
          licenseNumber: "TX-8820",
          brand: "Chevrolet",
          vehicleType: "SUV",
          yearMade: 2022,
          features: ["Heated Seats", "Backup Camera"],
          condition: "good",
          quantity: 1,
          photos: ["https://example.com/chevy.jpg"]
        },
        shippingDescription: "Chevrolet SUV shipment from Texas to Illinois",
        transportType: "Open Transport",
        vinNumber: "1GNEK13ZX3R123456",
        lotNumber: "LOT-TX-IL-05",
        pickup: {
          city: "Austin",
          state: "Texas",
          stateCode: "TX",
          zipcode: "73301",
          pickupDate: "2025-11-16T08:00:00.000Z",
          pickupLocationType: "Business"
        },
        delivery: {
          city: "Chicago",
          state: "Illinois",
          stateCode: "IL",
          zipcode: "60616"
        },
        additionalComments: "Pickup on weekdays only.",
        timing: "1_week",
        status: "pending",
        createdBy: "690eb4b122d1aff410ad18c6",
        ipAddress: "192.168.1.105",
        userAgent: "Mozilla/5.0"
      }
    ];

    const result = await Bid.insertMany(bids);
    console.log('🚛 Bids inserted successfully:', result);



    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inserting bids:', error);
    process.exit(1);
  }
}

insertBids();
