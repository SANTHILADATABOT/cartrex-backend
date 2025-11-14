// insertReview.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config(); 

const Review = require('./models/Reviews'); // ✅ adjust path if needed

const MONGO_URI = process.env.MONGODB_URI;

async function insertReviews() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    // Example reviews
    const reviews = [
      {
        bookingId: "6912eda7cbb50186298b096f",
        carrierId: "690eb4b222d1aff410ad18c9",
        shipperId: "690eb59922d1aff410ad18db",
        truckId: "690eb6b722d1aff410ad1910",
        overallRating: 5,
        comment: "Excellent communication and on-time delivery.",
        createdBy: "690eb52622d1aff410ad18d4",
        ipAddress: "192.168.1.105",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        deletstatus: 0
      },
      {
        bookingId: "691423e09cbc090c4a8ba7d5",
        carrierId: "690eb4b222d1aff410ad18c9",
        shipperId: "690eb59922d1aff410ad18db",
        truckId: "690eb6b722d1aff410ad1910",
        overallRating: 4,
        comment: "Good service but delivery slightly delayed.",
        createdBy: "690eb52622d1aff410ad18d4",
        ipAddress: "192.168.1.105",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        deletstatus: 0
      },
      {
        bookingId: "691423e09cbc090c4a8ba7d5",
        carrierId: "690eb4b222d1aff410ad18c9",
        shipperId: "690eb59922d1aff410ad18db",
        truckId: "690eb6b722d1aff410ad1910",
        overallRating: 3,
        comment: "Average experience — needs improvement.",
        createdBy: "690eb52622d1aff410ad18d4",
        ipAddress: "192.168.1.105",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        deletstatus: 0
      }
    ];

    const result = await Review.insertMany(reviews);
    console.log('⭐ Reviews inserted successfully:', result);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inserting reviews:', error);
    process.exit(1);
  }
}

insertReviews();
