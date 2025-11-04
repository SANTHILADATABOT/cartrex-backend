const AdminUser = require('../../models/AdminUsers');
const mongoose = require('mongoose');



// CREATE Admin User
exports.createadminuser = async (req, res) => {
  try {
    const { personalInfo =null, roleId = null, roleType = null, isActive = true, isSuperAdmin = false, password, audit } = req.body;
    console.log(' req.body=> ',req.body);
    const adminUser = new AdminUser({
      personalInfo,
      roleId,
      roleType,
      isActive,
      isSuperAdmin,
      password,
      audit: { ...audit, deletstatus: 0 }
    });

       const existingUser = await AdminUser.findOne({
      'personalInfo.email': personalInfo.email
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    await adminUser.save();
    res.status(201).json({ success: true, data: adminUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET ALL Admin Users 
exports.getalladminusers = async (req, res) => {
  try {
    const {isActive, roleId } = req.query;
    const filter = { 'audit.deletstatus': 0 };
   // ✅ Role filter
    if (roleId && roleId !== "all") {
      filter.roleId = roleId;
    }

    // ✅ Status filter
    if (isActive) {
      if (isActive === "all") {
        filter.isActive = { $in: ["active", "inactive"] }; // both
      } else {
        filter.isActive = isActive;
      }
    }

    const adminUsers = await AdminUser.find(filter)
      .populate('roleId')
      .populate('personalInfo.firstName personalInfo.lastName password')
      .populate('audit.createdBy', 'personalInfo.firstName personalInfo.lastName')
      .populate('audit.updatedBy', 'personalInfo.firstName personalInfo.lastName');

    res.status(200).json({ success: true, data: adminUsers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
// GET ALL Admin Users 
exports.getAdminDataById = async (req, res) => {
  try {
    const { adminid } = req.params;
    const adminUser = await AdminUser.findOne({ _id: adminid, 'audit.deletstatus': 0 }).populate('roleId')
      .populate('personalInfo.firstName personalInfo.lastName')
      .populate('audit.createdBy', 'personalInfo.firstName personalInfo.lastName')
      .populate('audit.updatedBy', 'personalInfo.firstName personalInfo.lastName');
    if (!adminUser) return res.status(404).json({ success: false, message: 'Admin user not found or already deleted' });

    res.status(200).json({ success: true, data: adminUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};



//UPDATE Admin User
exports.updateadminuser = async (req, res) => {
  try {
    const { adminid } = req.params;
    const updateData = req.body;

    const adminUser = await AdminUser.findOne({ _id: adminid, 'audit.deletstatus': 0 });
    if (!adminUser) return res.status(404).json({ success: false, message: 'Admin user not found or deleted' });

    for (const key in updateData) {
      if (updateData.hasOwnProperty(key)) {
        adminUser[key] = updateData[key];
      }
    }
  
    await adminUser.save();
    res.status(200).json({ success: true, data: adminUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ UPDATE Admin User Active Status
exports.updateadminuserstatus = async (req, res) => {
  try {
    const { adminid } = req.params;
    const { isActive } = req.body;

    if (!["active", "inactive"].includes(isActive))  {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed values: active, inactive"
      });
    }

    const adminUser = await AdminUser.findOne({ _id: adminid, 'audit.deletstatus': 0 });
    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found or deleted.'
      });
    }

    adminUser.isActive = isActive;
    adminUser.audit.updatedAt = new Date();
    adminUser.audit.updatedBy = req.user?._id || null; // optional if auth middleware is added

    await adminUser.save();

    res.status(200).json({
      success: true,
      message: `Admin user has been ${isActive ? 'activated' : 'deactivated'} successfully.`,
      data: adminUser
    });

  } catch (err) {
    console.error("Error updating admin user status:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


//  DELETE Admin User 
exports.deleteadminuser = async (req, res) => {
  try {
    const { adminid } = req.params;
    console.log('adminid=>',adminid)

    const adminUser = await AdminUser.findOne({ _id: adminid, 'audit.deletstatus': 0 });
    if (!adminUser) return res.status(404).json({ success: false, message: 'Admin user not found or already deleted' });

    adminUser.isActive = "inactive";
    if (adminUser.audit) {
      adminUser.audit.deletstatus = 1;
      adminUser.audit.deletedAt = new Date();
    }

    await adminUser.save();
    res.status(200).json({ success: true, message: 'Admin user deleted ' , data:adminUser});
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
//  DELETE Admin User 
exports.deleteSelectedadminuser = async (req, res) => {
  try {
    const { adminid } = req.body; // receive array of admin IDs
    console.log("Received admin IDs =>", adminid);

    if (!adminid || !Array.isArray(adminid) || adminid.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No admin IDs provided to delete",
      });
    }

    // Find all matching admin users that are not already deleted
    const adminUsers = await AdminUser.find({
      _id: { $in: adminid },
      "audit.deletstatus": 0,
    });

    if (!adminUsers.length) {
      return res.status(404).json({
        success: false,
        message: "No matching admin users found or already deleted",
      });
    }

    // Loop through and soft delete each user
    const now = new Date();
    for (const adminUser of adminUsers) {
      adminUser.isActive = "inactive";
      if (adminUser.audit) {
        adminUser.audit.deletstatus = 1;
        adminUser.audit.deletedAt = now;
      } else {
        adminUser.audit = { deletstatus: 1, deletedAt: now };
      }
      await adminUser.save();
    }

    return res.status(200).json({
      success: true,
      message: "Selected admin users deleted successfully",
      count: adminUsers.length,
      data: adminUsers,
    });
  } catch (err) {
    console.error("Bulk delete error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};


// Get Admin User by Id 
exports.getadminuserbyid = async (req, res) => {
  try {
    const { adminid } = req.params;

    // Fetch only needed fields
    const adminUser = await AdminUser.findOne({ _id: adminid, 'audit.deletstatus': 0 })
      .select('personalInfo.firstName personalInfo.lastName personalInfo.email roleType roleId isActive _id');

    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found or deleted',
      });
    }

    // Format the response
    const responseData = {
      adminId: adminUser?._id,
      firstName: adminUser.personalInfo?.firstName || '',
      lastName: adminUser.personalInfo?.lastName || '',
      email: adminUser.personalInfo?.email || '',
      role: adminUser.roleId || '',
      status: adminUser.isActive,
    };

    res.status(200).json({
      success: true,
      data: responseData,
    });

  } catch (err) {
    console.error('Error fetching admin user:', err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
