const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Complaint = require('./models/Complaint'); // adjust path if needed

const MONGO_URI = process.env.MONGODB_URI;

async function insertComplaint() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    // Example complaint data linked with Users and Bookings
    const complaints = [
      {
    
        userId: "69173b2078b6b8e35555bb82",   // Replace with valid user
        bookingId: "69214cc5f7d05799667e526b", // Replace with valid booking

        customerid: "69173b2078b6b8e35555bb85",
        complaintType: "Booking Issue",
        description: "The carrier delayed pickup by 5 days without notice.",

        priority: "high",
        status: "open",
        assignedTo: "69173932c623b033491ed855", // admin/user id
        resolution: "",
        attachments: [
          "https://example.com/evidence/photo1.jpg",
          "https://example.com/evidence/photo2.jpg"
        ],

        raisedAt: new Date(),
        createdAt: new Date(),
        deletstatus: 0,
        deletedipAddress: "",
        updatedAt: new Date()
      }
    ];

    const result = await Complaint.insertMany(complaints);
    console.log("Inserted Complaint Data:", result);
    process.exit(0);

  } catch (error) {
    console.error('Error inserting complaint data:', error);
    process.exit(1);
  }
}

insertComplaint();
