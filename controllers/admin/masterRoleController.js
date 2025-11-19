const AdminRole = require('../../models/AdminRoles');

// GET all roles
exports.getRoles = async (req, res) => {
  try {
    const {isActive } = req.query;
    const filter = { 'audit.deletstatus': 0 };
        // ✅ Status filter
    if (isActive) {
      if (isActive === "all") {
        filter.isActive = { $in: ["active", "inactive"] }; // both
      } else {
        filter.isActive = isActive;
      }
    }
    const roles = await AdminRole.find(filter);
    res.status(200).json({ success: true, data: roles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// GET all roles
exports.getRolesfordropdowns = async (req, res) => {
  try {
    const roles = await AdminRole.find({ 
      isActive: "active" ,
      'audit.deletstatus': 0   // ✅ include deletstatus condition
    }).select('_id roleName roleType');
    res.status(200).json({ success: true, data: roles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET single role by ID
exports.getRoleById = async (req, res) => {
  try {
    const { roleid } = req.params;
    const role = await AdminRole.findById(roleid);
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    res.status(200).json({ success: true, data: role });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADD a new role
// exports.addRole = async (req, res) => {
//   try {
//     const { personalInfo, isActive } = req.body;
//     // Optionally check if roleType already exists
//     const existingRole = await AdminRole.findOne({ roleType });
//     if (existingRole) {
//       return res.status(400).json({ success: false, message: 'Role type already exists' });
//     }

//     const newRole = new AdminRole({
//       roleName,
//       roleType,
//       description,
//       permissions,
//       isDefault: isDefault || false,
//       audit: {
//         createdBy: req.user._id, // Assuming req.user is set by auth middleware
//         updatedBy: req.user._id,
//         ipAddress: req.ip,
//         userAgent: req.get('User-Agent')
//       }
//     });

//     await newRole.save();
//     res.status(201).json({ success: true, data: newRole });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
// req.body = {
//   personalInfo: { roll_name: 'Manager', roll_type: 'manager' },
//   isActive: 'active'
// }

exports.addRole = async (req, res) => {
  try {
    const { personalInfo, isActive } = req.body;
    const { roll_name, roll_type } = personalInfo;

    // Check if role type already exists
    const existingRole = await AdminRole.findOne({
      roleType: roll_type,
      isActive: "active",
      "audit.deletstatus": 0
    });
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'Role type already exists',
      });
    }

    // Construct the audit object properly
    const audit = {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      createdBy: req.user?._id || undefined, // only if user is logged in
      updatedBy: req.user?._id || undefined,
    };

    // If there's no logged-in user (e.g. initial setup), skip required fields dynamically
    if (!req.user?._id) {
      delete audit.createdBy;
      delete audit.updatedBy;
    }

    const newRole = new AdminRole({
      roleName: roll_name,
      roleType: roll_type,
      isActive: isActive || 'inactive',
      audit,
    });

    await newRole.save();

    res.status(201).json({
      success: true,
      message: 'Role added successfully',
      data: newRole,
    });
  } catch (error) {
    console.error('Error in addRole:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// UPDATE role
exports.updateRole = async (req, res) => {
  try {
    const { roleid } = req.params;
    const { personalInfo ,isActive} = req.body;

    const role = await AdminRole.findById(roleid);
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    role.roleName = personalInfo?.roll_name || role.roleName;
    role.roleType = personalInfo?.roll_type || role.roleType;
    // role.description = description || role.description;
    // role.permissions = permissions || role.permissions;
    if (isActive !== undefined) role.isActive = isActive;

    role.audit.updatedBy = req._id;
    role.audit.updatedAt = new Date();
    role.audit.ipAddress = req.ip;
    role.audit.userAgent = req.get('User-Agent');

    await role.save();
    res.status(200).json({ success: true, data: role });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE role (soft delete)
exports.deleteRole = async (req, res) => {
  try {
    const { roleid } = req.params;
    const role = await AdminRole.findById(roleid);
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });

    role.isActive = "inactive";
    role.audit.deletstatus = 1;
    role.audit.deletedAt = new Date();
    // role.audit.deletedBy = req.user._id;
    role.audit.deletedipAddress = req.ip;

    await role.save();
    res.status(200).json({ success: true, message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.updateStatusRole = async (req, res) => {
  try {
    const { roleid } = req.params;
    const { status } = req.body; 
    if (!["active", "inactive", "under_maintenance"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed values: active, inactive, under_maintenance",
      });
    }

const roles = await AdminRole.findOne({ _id: roleid });

    if (!roles) {
      return res.status(404).json({
        success: false,
        message: "Role not found or deleted",
      });
    }
    roles.isActive = status;
    roles.updatedAt = new Date();
    roles.updatedBy = req.user?._id || null;
    await roles.save();

    res.status(200).json({
      success: true,
      message: `roles status updated to ${status}`,
      data: roles,
    });

  } catch (error) {
    console.error("Error updating roles status:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
