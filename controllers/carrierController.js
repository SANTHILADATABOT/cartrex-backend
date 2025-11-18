const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Carrier = require('../models/Carrier');
const Shipper = require('../models/Shipper');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Truck = require('../models/Truck');
const Location =require('../models/Location');
const { uploadToS3 } = require('../utils/s3Upload');



// exports.createOrUpdateProfile = async (req, res) => {
//   try {
//     const { companyName, address, locationId, zipCode, country } = req.body;
//     const userId = req.body.userId;
//     const location = await Location.findById(locationId);
//     if (!location) {
//       return res.status(404).json({ success: false, message: "Invalid locationId" });
//     }

//     let carrier = await Carrier.findOne({ userId });
//     let savedPhotoPath = null;


//     if (req.file) {
//       const dir = path.join(__dirname, "../upload/carrierProfiles");
//       if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

//       const ext = path.extname(req.file.originalname);
//       const filename = `carrier_${userId}${ext}`;
//       const finalPath = path.join(dir, filename);
//       fs.writeFileSync(finalPath, req.file.buffer);

//       savedPhotoPath = path.join("upload", "carrierProfiles", filename);
//     }
//     if (carrier) {
//       carrier.companyName = companyName || carrier.companyName;
//       carrier.address = address || carrier.address;
//       carrier.locationId = locationId || carrier.locationId;
//       carrier.zipCode = zipCode || carrier.zipCode;
//       carrier.country = country || carrier.country;

//       if (savedPhotoPath) carrier.photo = savedPhotoPath;

//       carrier.updatedAt = new Date();
//       await carrier.save();
//     } else {
//       // Create new one
//       carrier = await Carrier.create({
//         userId,
//         companyName,
//         address,
//         locationId,
//         zipCode,
//         country,
//         photo: savedPhotoPath || null
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Carrier profile created/updated successfully",
//       data: carrier,
//     });

//   } catch (error) {
//     console.error("Carrier profile error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };

exports.createOrUpdateProfile = async (req, res) => {
  try {
    console.log(" Incoming Request Body:", req.body);
    console.log(" Incoming File:", req.file);

    const { userId, roleType, companyName, address, locationId, zipCode, country,city,state } = req.body;

    console.log("userId:", userId);
    console.log(" roleType:", roleType);
    console.log(" req.body:", req.body);

    // Validate required fields
    if (!userId) {
      console.log(" ERROR: userId missing");
      return res.status(400).json({ success: false, message: "userId is required" });
    }
    if (!roleType) {
      console.log(" ERROR: roleType missing");
      return res.status(400).json({ success: false, message: "roleType is required" });
    }

    if (!["Carrier", "Shipper"].includes(roleType)) {
      console.log(" ERROR: Invalid roleType", roleType);
      return res.status(400).json({
        success: false,
        message: "Invalid roleType. Use Carrier or Shipper",
      });
    }

    // Validate locationId
    console.log(" Checking Location:", locationId);
    const location = await Location.findById(locationId);

    console.log(" Location found:", location);

    if (!location) {
      console.log(" ERROR: Invalid locationId");
      return res.status(404).json({ success: false, message: "Invalid locationId" });
    }

    // Select Model
    const Model = roleType === "Carrier" ? Carrier : Shipper;
    console.log(" Using Model:", roleType);

    // Check existing profile
    let profile = await Model.findOne({ userId });
    console.log(" Existing Profile:", profile);

    let savedPhotoPath = null;
console.log(req.file,"req.file")
    // File Upload Handling
    if (req.file) {
      const folderName = roleType === "Carrier" ? "carrierProfiles" : "shipperProfiles";
      const dir = path.join(__dirname, "../upload/" + folderName);

      console.log(" Upload Directory:", dir);

      if (!fs.existsSync(dir)) {
        console.log(" Creating folder:", dir);
        fs.mkdirSync(dir, { recursive: true });
      }

      const ext = path.extname(req.file.originalname);
      const filename = `${roleType.toLowerCase()}_${userId}${ext}`;
      const finalPath = path.join(dir, filename);

      console.log(" Saving File To:", finalPath);

      fs.writeFileSync(finalPath, req.file.buffer);
      savedPhotoPath = path.join("upload", folderName, filename);

      console.log(" Saved Photo Path:", savedPhotoPath);
    }

    // Update if exists
    if (profile) {
      console.log(" Updating Existing Profile");

      profile.companyName = companyName || profile.companyName;
      profile.address = address || profile.address;
      profile.locationId = locationId || profile.locationId;
      profile.zipCode = zipCode || profile.zipCode;
      profile.country = country || profile.country;
      profile.city = city || profile.city;
      profile.state = state || profile.state;

      if (savedPhotoPath) profile.photo = savedPhotoPath;

      profile.updatedAt = new Date();
      await profile.save();
    } 
    else {
      console.log("➡ Creating New Profile");

      profile = await Model.create({
        userId,
        companyName,
        address,
        locationId,
        zipCode,
        country,
        city,
        state,
        photo: savedPhotoPath || null
      });
    }

    console.log(" SUCCESS: Profile Saved:", profile);

    return res.status(200).json({
      success: true,
      message: `${roleType} profile created/updated successfully`,
      data: profile,
    });

  } catch (error) {
    console.error(" SERVER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};



exports.getProfile = async (req, res) => {
  try {
    const carrier = await Carrier.findOne({ userId: req.user._id }).populate('userId', '-password');

    if (!carrier) {
      return res.status(404).json({ success: false, message: 'Carrier profile not found' });
    }

    res.status(200).json({ success: true, data: carrier });
  } catch (error) {
    console.error('Get carrier profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAllCarriers = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;

    if (search) {
      const users = await User.find({
        role: 'Carrier',
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      query.userId = { $in: users.map(u => u._id) };
    }

    const carriers = await Carrier.find(query)
      .populate('userId', '-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Carrier.countDocuments(query);

    res.status(200).json({
      success: true,
      data: carriers,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get carriers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.approveCarrier = async (req, res) => {
  try {
    const carrier = await Carrier.findById(req.params.id);

    if (!carrier) {
      return res.status(404).json({ success: false, message: 'Carrier not found' });
    }

    carrier.status = 'approved';
    await carrier.save();

    const user = await User.findById(carrier.userId);
    user.isApproved = true;
    await user.save();

    res.status(200).json({ success: true, message: 'Carrier approved successfully', data: carrier });
  } catch (error) {
    console.error('Approve carrier error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteCarrier = async (req, res) => {
  try {
    const carrier = await Carrier.findById(req.params.id);

    if (!carrier) {
      return res.status(404).json({ success: false, message: 'Carrier not found' });
    }

    const ongoingBookings = await Booking.countDocuments({
      carrierId: carrier._id,
      status: { $in: ['accepted', 'ready_for_pickup', 'in_progress'] }
    });

    if (ongoingBookings > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete carrier with ${ongoingBookings} ongoing bookings`
      });
    }

    await Truck.deleteMany({ carrierId: carrier._id });
    await carrier.deleteOne();
    await User.findByIdAndDelete(carrier.userId);

    res.status(200).json({ success: true, message: 'Carrier deleted successfully' });
  } catch (error) {
    console.error('Delete carrier error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
