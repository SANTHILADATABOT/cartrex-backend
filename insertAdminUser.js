const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const AdminUser = require("./models/AdminUsers");

mongoose.connect("mongodb+srv://cartrex:Cartrex%40123@cluster0.sm4ugja.mongodb.net/cartrex-correcteddb?retryWrites=true&w=majority&appName=Cluster0") // replace with your Mongo URI
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

async function insertAdminUser() {
  try {
    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const newAdmin = new AdminUser({
      personalInfo: {
        firstName: "Admin",
        lastName: "Admin",
        email: "admin@yopmail.com",
        phone: "9999999999",
        department: "operations"
      },
      roleType: "super_admin",
      password: hashedPassword,
      isActive: "active",
      isSuperAdmin: true,
      audit: {
        createdBy: null, // can leave null or ObjectId of creator
        updatedBy: null,
        ipAddress: "127.0.0.1",
        userAgent: "manual-script"
      }
    });

    await newAdmin.save();
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error inserting admin user:", err);
  }
}

insertAdminUser();
