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
    
        userId: "69173b3078b6b8e35555bb93",   // Replace with valid user
        bookingId: "6920a6062c3026154b06b4e9", // Replace with valid booking

        customerName: "Jeanne Schmitt",
        complaintType: "Booking Issue",
        description: "The carrier delayed pickup by 3 days without notice.",

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
      },
      {
      
        userId: "69173b2078b6b8e35555bb82",
        bookingId: "69214cc5f7d05799667e526b",

        customerName: "Michael Smith",
        complaintType: "Damage Claim",
        description: "Vehicle arrived with scratches on the rear bumper.",

        priority: "critical",
        status: "in_progress",
        assignedTo: "69173932c623b033491ed855", 
        resolution: "",
        attachments: [
          "https://example.com/evidence/scratch.jpg"
        ],

        raisedAt: new Date(),
        resolvedAt:new Date(),
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
