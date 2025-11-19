const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const AdminRole = require('./models/AdminRoles'); // Adjust path if needed

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

// Replace with your actual User ID (creator/updater)
const userId = new mongoose.Types.ObjectId('6501a2b3c4d567e89f0abc12');

async function insertAdminRoles() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const ipAddress = '192.168.1.10';
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';

    // Helper to create audit fields
    const createAudit = () => ({
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
      updatedBy: userId,
      deletedBy: null,
      deletedAt: null,
      deletstatus: 0,
      ipAddress,
      userAgent
    });

    // Default permissions template
    const basePermissions = {
      dashboard: { view: true, export: true },
      homepageSettings: { view: true, edit: true },
      emailSmsNotifications: { view: true, create: true, edit: true, delete: true },
      masters: { view: true, create: true, edit: true, delete: true },
      manageUsers: { view: true, create: true, edit: true, delete: true },
      manageBookings: { view: true, create: true, edit: true, delete: true, approve: true },
      manageShippers: { view: true, create: true, edit: true, delete: true, approve: true },
      manageCarriers: { view: true, create: true, edit: true, delete: true, approve: true },
      manageTrucks: { view: true, create: true, edit: true, delete: true },
      manageRoutes: { view: true, create: true, edit: true, delete: true },
      manageSpaces: { view: true, create: true, edit: true, delete: true },
      manageBids: { view: true, create: true, edit: true, delete: true, approve: true },
      managePayments: { view: true, process_refund: true, export: true },
      reportsAnalytics: { view: true, export: true },
      shipmentsHistory: { view: true, export: true },
      complaintsDisputes: { view: true, create: true, edit: true, delete: true, resolve: true },
      systemSettings: { view: true, edit: true }
    };

    // Roles Data
    const rolesData = [
       {
        roleName: 'SuperAdmin',
        roleType: 'super_admin',
        description: 'Has full access to all system modules and settings.',
        permissions: basePermissions,
        isDefault: true,
        isActive: "active",
        audit: createAudit()
      },
      {
        roleName: 'Manager',
        roleType: 'manager',
        description: 'Has full access to all system modules and settings.',
        permissions: basePermissions,
        isDefault: true,
        isActive: "active",
        audit: createAudit()
      },
      {
        roleName: 'Carrier',
        roleType: 'carrier',
        description: 'Has full access to all system modules and settings.',
        permissions: basePermissions,
        isDefault: true,
        isActive: "active",
        audit: createAudit()
      },
      {
        roleName: 'Shipper',
        roleType: 'shipper',
        description: 'Can manage most administrative tasks except system-level configurations.',
        permissions: {
          ...basePermissions,
          systemSettings: { view: true, edit: false } // Restrict some permissions
        },
        isDefault: false,
        isActive: "active",
        audit: createAudit()
      },
    ];

    // Insert data
    const insertedRoles = await AdminRole.insertMany(rolesData);

    await mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error inserting AdminRoles:', err);
  }
}

insertAdminRoles();
