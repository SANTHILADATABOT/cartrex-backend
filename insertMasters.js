const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MasterData = require('./models/MasterVehicleType'); // Adjust path if needed

const MONGO_URI = process.env.MONGODB_URI;

// Replace with your actual user ID
const userId = new mongoose.Types.ObjectId('6501a2b3c4d567e89f0abc12');

async function insertMasterData() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const ipAddress = '192.168.1.10';
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';

    // Helper function to create audit object
    const createAudit = () => ({
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
      updatedBy: userId,
      deletedBy: null,
      deletedAt: null,
      ipAddress,
      userAgent
    });

    // Sample master data
    const masterDataSample = {
      vehicles: [
        {
          category: "Sedan",
          icon_url: "https://example.com/icons/sedan.png",
          condition: ["operable", "inoperable"],
          capacity: 5,
          sub_categories: [
            { name: "small", price: 50, audit: createAudit() },
            { name: "mid", price: 60, audit: createAudit() }
          ],
          is_active: true,
          display_order: 1,
          audit: createAudit()
        },
        {
          category: "SUV",
          icon_url: "https://example.com/icons/suv.png",
           condition: ["operable", "inoperable"],
          capacity: 7,
          sub_categories: [
            { name: "small", price: 70, audit: createAudit() },
            { name: "mid", price: 100, audit: createAudit() },
            { name: "large", price: 150, audit: createAudit() }
          ],
          is_active: true,
          display_order: 2,
          audit: createAudit()
        },
        {
          category: "Van",
          icon_url: "https://example.com/icons/van.png",
           condition: ["operable", "inoperable"],
          capacity: 7,
          sub_categories: [
            { name: "small", price: 70, audit: createAudit() },
            { name: "mid", price: 100, audit: createAudit() },
            { name: "large", price: 150, audit: createAudit() }
          ],
          is_active: true,
          display_order: 3,
          audit: createAudit()
        },
        {
          category: "Truck",
          icon_url: "https://example.com/icons/truck.png",
           condition: ["operable", "inoperable"],
          capacity: 7,
          sub_categories: [
            { name: "single cab", price: 70, audit: createAudit() },
            { name: "extended cab", price: 100, audit: createAudit() },
            { name: "crew cab", price: 150, audit: createAudit() },
            { name: "short bed", price: 70, audit: createAudit() },
            { name: "long bed", price: 70, audit: createAudit() },
            { name: "utility bed", price: 70, audit: createAudit() },
            { name: "flatbed", price: 70, audit: createAudit() },
            { name: "big tires", price: 70, audit: createAudit() },
            { name: "lift kit", price: 70, audit: createAudit() },
            { name: "cab & chassis", price: 70, audit: createAudit() }
          ],
          is_active: true,
          display_order: 4,
          audit: createAudit()
        },
        {
          category: "Classic car",
          icon_url: "https://example.com/icons/classic-car.png",
          condition: ["operable", "inoperable"],
          capacity: 7,
          sub_categories: [
            { name: "small", price: 70, audit: createAudit() },
            { name: "mid", price: 100, audit: createAudit() }
          ],
          is_active: true,
          display_order: 5,
          audit: createAudit()
        },
        {
          category: "MotorBike",
          icon_url: "https://example.com/icons/motorbike.png",
         condition: ["operable", "inoperable"],
          capacity: 7,
          sub_categories: [
            { name: "small", price: 70, audit: createAudit() },
            { name: "large", price: 150, audit: createAudit() }
          ],
          is_active: true,
          display_order: 6,
          audit: createAudit()
        }
      ],
     
      status: 'active',
      postedDate: new Date(),
      expiryDate: new Date('2025-10-20'),
      createdBy: userId,
      updatedBy: userId,
      ipAddress: ipAddress,
      userAgent: userAgent
    };

    const doc = new MasterData(masterDataSample);
    const savedDoc = await doc.save();

    await mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error inserting MasterData:', err);
  }
}

insertMasterData();
