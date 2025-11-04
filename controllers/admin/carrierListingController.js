const User = require('../../models/User');
const Carrier = require('../../models/Carrier');
const mongoose = require("mongoose");

// exports.addcarrier = async (req, res) => {
//   try{
//     const data = req.body;
//     console.log('req.body=> in add carrier ',req.body);
//     const UserData = new User({
//       email:data?.email,
//       firstName: data?.firstName,
//       lastName : data?.lastName,
//       phone : data?.phone,
//       roleId : data?.roleId,
//       isApproved : true,
//       isActive : true,
//       password : data?.phone,
//       audit: { ...data?.audit , deletstatus: 0 }
//     });

//     const saved = await UserData.save();
//     if(!saved){
//       return res.status(404).json({ success: false, message: "User not found or deleted" });
//     }
//     const carrierData = new Carrier({
//        userId:saved._id,
//        companyName:data?.companyName,
//        status:data?.status,
//     });
//     res.status(201).json({ success: true, data: adminUser });
//   }
//   catch(error){
//     console.error(err);
//     res.status(500).json({ success: false, message: err.message });
//   }

// }
//Get All Carrier from User and Carrier

exports.addcarrier = async (req, res) => {
  try {
    const data = req.body;
    console.log('req.body => in add carrier', data);
   
    // 1️⃣ Create and save User
    const userData = new User({
      email: data?.email,
      firstName: data?.firstName,
      lastName: data?.lastName,
      phone: data?.phone,
      role: data?.roleId,
      isApproved: true,
      isActive: true,
      audit: { ...data?.audit, deletstatus: 0 },
    });
    if(data?.password){
        userData.password = data.password;
    }
    const savedUser = await userData.save();

    if (!savedUser) {
      return res.status(400).json({ success: false, message: 'Failed to create user.' });
    }

    // 2️⃣ Create and save Carrier
    const carrierData = new Carrier({
      userId: savedUser._id,
      companyName: data?.companyName,
      status: data?.status,
      address:data?.Address,
      zipCode:data?.zipcode
    });

    const savedCarrier = await carrierData.save();

    // 3️⃣ Return success response
    return res.status(201).json({
      success: true,
      message: 'Carrier and user created successfully.',
      data: {
        user: savedUser,
        carrier: savedCarrier,
      },
    });

  } catch (error) {
    console.error('Error in addcarrier:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: error.message,
    });
  }
};

exports.getallcarriers = async (req, res) => {
  try {
    const {status} = req.query;
    const carrierUsers = await User.find({ 
      role: "68ff5689aa5d489915b8caa8", 
    deletstatus: 0 
    });
    if (!carrierUsers.length) {
      return res.status(200).json({
        success: true,
        message: "No active carrier users found",
        data: [],
      });
    }
    const carrierUserIds = carrierUsers.map(user => user._id.toString());
    const filter = {userId: { $in: carrierUserIds },deletstatus: 0};
      if (status) {
        if (status === "all") {
          filter.status = { $in: ["active", "inactive"] }; // both
        } else {
          filter.status = status;
        }
    }
    const matchedCarriers = await Carrier.find(filter)
    .populate("userId", "firstName lastName email phone role")
    .populate("createdBy", "firstName lastName email")
    .populate("updatedBy", "firstName lastName email");

    res.status(200).json({
      success: true,
      count: matchedCarriers.length,
      data: matchedCarriers,
    });

  } catch (error) {
    console.error("Error in getAllCarriers:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//Update Carrier from User and Carrier

exports.updatecarrier = async (req, res) => {
  try {
    const { userId } = req.params; 
    const updateData = req.body;

   
    const user = await User.findOne({ _id: userId, deletstatus: 0 });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found or deleted" });
    }

    const carrier = await Carrier.findOne({ userId: userId, deletstatus: 0 });
    if (!carrier) {
      return res.status(404).json({ success: false, message: "Carrier not found or deleted" });
    }

    const userFields = ["firstName", "lastName", "email", "phone"];
    userFields.forEach(f => { if (updateData[f]) user[f] = updateData[f]; });
    user.updatedAt = new Date();
    user.updatedBy = req.user?._id || null;
    await user.save();

    const carrierFields = ["companyName", "photo", "address", "city", "state", "zipCode", "country", "status"];
    carrierFields.forEach(f => { if (updateData[f] !== undefined) carrier[f] = updateData[f]; });
    carrier.updatedAt = new Date();
    carrier.updatedBy = req.user?._id || null;
    await carrier.save();
    
    res.status(200).json({
      success: true,
      message: "Carrier and User updated successfully",
      data: { carrier, user }
    });

  } catch (error) {
    console.error("Error updating carrier:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Carrier Status by Carrier ID
exports.updateCarrierStatusById = async (req, res) => {
  try {
    const { carrierId } = req.params;
    const { status } = req.body; 
    // Validate input
    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed values: active, inactive",
      });
    }

    // Find carrier
    const carrier = await Carrier.findOne({ _id: carrierId, deletstatus: 0 });
    if (!carrier) {
      return res.status(404).json({
        success: false,
        message: "Carrier not found or deleted",
      });
    }

    // Update status
    carrier.status = status;
    carrier.updatedAt = new Date();
    carrier.updatedBy = req.user?._id || null;
    await carrier.save();

    res.status(200).json({
      success: true,
      message: `Carrier status updated to ${status}`,
      data: carrier,
    });

  } catch (error) {
    console.error("Error updating carrier status:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getcarrierbyId = async (req, res) => {
  try {
    const { carrierId } = req.params;

    // Find the carrier
    const carrier = await Carrier.findOne({ _id: carrierId, deletstatus: 0 })
      .populate("userId", "firstName lastName email phone role")
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email");

    if (!carrier) {
      return res.status(404).json({
        success: false,
        message: "Carrier not found or deleted",
      });
    }

    res.status(200).json({
      success: true,
      message: "Carrier details fetched successfully",
      data: carrier,
    });
  } catch (error) {
    console.error("Error fetching carrier by ID:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};




//Delete Carrier from User and Carrier


exports.deletecarrier = async (req, res) => {
  try {
    const { userId } = req.params; 

    // Find user
    const user = await User.findOne({ _id: userId, deletstatus: 0 });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found or already deleted" });
    }

    // Find carrier linked to user
    const carrier = await Carrier.findOne({ userId: userId, deletstatus: 0 });
    if (!carrier) {
      return res.status(404).json({ success: false, message: "Carrier not found or already deleted" });
    }

    carrier.deletstatus = 1;
    carrier.deletedAt = new Date();
    carrier.deletedBy = req.user?._id || null;
    await carrier.save();

    user.deletstatus = 1;
    user.deletedAt = new Date();
    user.deletedBy = req.user?._id || null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Carrier and linked user deleted successfully",
      data: { carrier, user }
    });

  } catch (error) {
    console.error("Error deleting carrier:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.deleteSelectedcarrier = async (req, res) => {
  try {
    const { userId } = req.body; 
    if (!userId || !Array.isArray(userId) || userId.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No Truck IDs provided to delete",
      });
    }
    const userData = await User.find({
          _id: { $in: userId },
           deletstatus: 0 
    });
    if (!userData.length) {
      return res.status(404).json({ success: false, message: "User not found or already deleted" });
    }
    const carrierData = await Carrier.find({
          userId: { $in: userId },
           deletstatus: 0 
    });
    if (!carrierData) {
      return res.status(404).json({ success: false, message: "Carrier not found or already deleted" });
    }
    for (const carrierinfo of carrierData) {
      carrierinfo.deletstatus = 1;
      carrierinfo.deletedAt = new Date();
      carrierinfo.deletedBy = req.user?._id || null;
      await carrierinfo.save();
    }
    for (const userinfo of userData) {
      userinfo.deletstatus = 1;
      userinfo.deletedAt = new Date();
      userinfo.deletedBy = req.user?._id || null;
      await userinfo.save();
    }

    res.status(200).json({
      success: true,
      message: "Carrier and linked user deleted successfully",
      data: { carrierData, userData }
    });

  } catch (error) {
    console.error("Error deleting carrier:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};










