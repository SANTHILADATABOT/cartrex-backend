// copyRateCard.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Space = require('./models/Space'); // adjust path as needed

const MONGO_URI = process.env.MONGODB_URI;

// Replace with actual Space IDs
const sourceSpaceId = "690c798687d9f78cc0fdaf67"; // Source space (copy from)
const targetSpaceId = "690c781e15ff5c10b95c0af7"; // Target space (copy to)

async function copyRateCard() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("✅ Connected to MongoDB");

    // Fetch the source space
    const sourceSpace = await Space.findById(sourceSpaceId).lean();
    if (!sourceSpace) {
      throw new Error("Source space not found");
    }

    const rateCardData = sourceSpace.rateCard;
    if (!rateCardData || rateCardData.length === 0) {
      throw new Error("Source space has no rateCard data");
    }

    // Update the target space with the copied rateCard
    const result = await Space.updateOne(
      { _id: targetSpaceId },
      { $set: { rateCard: rateCardData } }
    );

    console.log("🚛 RateCard copied successfully!");
    console.log("Result:", result);

    // Close the DB connection
    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error copying rateCard:", error.message);
    process.exit(1);
  }
}

copyRateCard();
