const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const TruckType = require('./models/MasterTruckType'); // Adjust path if needed

const MONGO_URI = process.env.MONGODB_URI;

// Use your actual admin user ID
const userId = new mongoose.Types.ObjectId('68e73aebda9fdad99d4d53ea');

async function insertTruckTypes() {
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

    // Sample truck type data
    const truckTypeSample = [
      {
        category: "Truck",
        icon_url: "https://example.com/icons/light-truck.png",
        condition: [], // Empty array for categories without conditions
        // capacity field omitted since it's not required for this category
        sub_categories: [
          {
            name: "Open Car Hauler",
            description: "Open car hauler for vehicle transportation",
            is_active: true,
            display_order: 1,
            audit: createAudit()
          },
          {
            name: "Wedge",
            description: "More powerful light truck",
            is_active: true,
            display_order: 2,
            audit: createAudit()
          },
          {
            name: "Hotshot",
            description: "More powerful light truck",
            is_active: true,
            display_order: 2,
            audit: createAudit()
          },
           {
            name: "Enclosed Car Hauler",
            description: "Enclosed trailer for vehicle transport",
            is_active: true,
            display_order: 2,
            audit: createAudit()
          },
          {
            name: "Pickup Truck w/Trailer",
            description: "Pickup truck with trailer attachment",
            is_active: true,
            display_order: 3,
            audit: createAudit()
          },
          {
            name: "Semi Truck w/Trailer",
            description: "Semi truck with large trailer capacity",
            is_active: true,
            display_order: 4,
            audit: createAudit()
          }
        ],
        is_active: true,
        display_order: 1,
        audit: createAudit()
      },
    ];

    // ✅ Option 1: insertMany (for arrays)
    const savedTruckTypes = await TruckType.insertMany(truckTypeSample);


    savedTruckTypes.forEach(truckType => {
      console.log(`   - ${truckType.category} (${truckType.sub_categories.length} sub-categories)`);
    });
    await mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error inserting truck types:', err);
    process.exit(1);
  }
}

insertTruckTypes();