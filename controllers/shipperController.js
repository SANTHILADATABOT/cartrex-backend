const Shipper = require('../models/Shipper');
const User = require('../models/User');
const { uploadToS3 } = require('../utils/s3Upload');
const Booking = require("../models/Booking");
const Bid = require("../models/Bid");
const fs = require("fs");
const path = require("path");
exports.createOrUpdateShipperProfile = async (req, res) => {
  try {
    const {
      userId, roleType, companyName, address, locationId, zipCode,
      country, city, state, stateCode, companyDescription,
      phone, firstName, lastName, email
    } = req.body;

    // ------------------------ VALIDATION ------------------------
    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required" });
    }

    if (!["Shipper", "Carrier"].includes(roleType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid roleType. Use Carrier or Shipper",
      });
    }

    const location = await Location.findById(locationId);
    if (!location) {
      return res.status(404).json({ success: false, message: "Invalid locationId" });
    }

    // ------------------------ USER UPDATE ------------------------
    const user = await User.findOne({ deletstatus: 0, _id: userId });
    if (!user) {
      return res.status(200).json({ success: false, message: "User Not found" });
    }
    let userupdate = false;
    if (email && user.email !== email) {
      userupdate= true;
      user.verifyuser = "unverified";
    }
    if(firstName && firstName!==user.firstName){
      userupdate= true;
      user.firstName = firstName;
    }
    if(lastName && user.lastName !== lastName){
      userupdate= true;
      user.lastName = lastName
    }
    if(email && user.email !== email){
      userupdate= true;
      user.email = email
    }
    if(phone && user.phone !== phone){
      userupdate= true;
      user.phone = phone
    }
    if(userupdate){
      await user.save();
    }

    // ------------------------ GET MODEL ------------------------
    const Model = roleType === "Shipper" ? Shipper : Carrier;
    let profile = await Model.findOne({ userId });

    // ------------------------ PHOTO UPLOAD ------------------------
    let savedPhotoPath = null;

    if (req.file) {
      const folderName = roleType === "Shipper" ? "shipperProfiles" : "carrierProfiles";
      const dir = path.join(__dirname, "../upload/" + folderName);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const ext = path.extname(req.file.originalname);
      const filename = `${roleType.toLowerCase()}_${userId}${ext}`;
      const finalPath = path.join(dir, filename);

      fs.writeFileSync(finalPath, req.file.buffer);

      savedPhotoPath = path.join("upload", folderName, filename);
    }

    // ------------------------ CREATE OR UPDATE PROFILE ------------------------
    if (profile) {
      profile.companyName = companyName || profile.companyName;
      profile.phone = phone || profile.phone;
      profile.companyDescription = companyDescription || profile.companyDescription;
      profile.address = address || profile.address;
      profile.locationId = locationId || profile.locationId;
      profile.zipCode = zipCode || profile.zipCode;
      profile.country = country || profile.country;
      profile.city = city || profile.city;
      profile.state = state || profile.state;
      profile.stateCode = stateCode || profile.stateCode;

      if (savedPhotoPath) profile.photo = savedPhotoPath;

      profile.updatedAt = new Date();
      await profile.save();
    } else {
      profile = await Model.create({
        userId,
        companyName,
        address,
        locationId,
        zipCode,
        country,
        city,
        state,
        stateCode,
        companyDescription,
        photo: savedPhotoPath || null
      });
    }

    // ------------------------ RESPONSE ------------------------
    return res.status(200).json({
      success: true,
      message: `${roleType} profile created/updated successfully`,
      data: profile,
    });

  } catch (error) {
    console.error("SERVER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


exports.ShipperProfileUpdate = async (req, res) => {
  try {
    console.log(" Incoming Request Body:", req.body);
    console.log(" Incoming File:", req.file);

    const { userId, deletePhoto} = req.body;
    // Validate required fields
    if (!userId) {
      console.log(" ERROR: userId missing");
      return res.status(400).json({ success: false, message: "userId is required" });
    }
   
    let profile = await Shipper.findOne({ userId:userId});
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Shipper not found"
      });
    }
    if (profile.photo) {
        const oldPath = path.join(
          __dirname,
          "../",
          profile.photo.replace(/\\/g, "/")
        );

        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      if (deletePhoto === "true") {
      profile.photo = "";
      profile.updatedAt = new Date();
      await profile.save();

      return res.status(200).json({
        success: true,
        message: "Profile photo deleted successfully",
        data: profile
      });
    }
    let savedPhotoPath = null;
      if (req.file) {
        const folderName = "shipperProfiles";
        const dir = path.join(__dirname, "../upload/" + folderName);

        console.log(" Upload Directory:", dir);

        if (!fs.existsSync(dir)) {
          console.log(" Creating folder:", dir);
          fs.mkdirSync(dir, { recursive: true });
        }

        const ext = path.extname(req.file.originalname);
        const filename = `shipper_${userId}${ext}`;
        const finalPath = path.join(dir, filename);
        fs.writeFileSync(finalPath, req.file.buffer);
        savedPhotoPath = path.join("upload", folderName, filename).replace(/\\/g, "/");
      }
      profile.photo = savedPhotoPath;
      profile.updatedAt = new Date();
      await profile.save();
      return res.status(200).json({
      success: true,
      message: `Shipper profile updated successfully`,
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

exports.getShipperDeatilsbyId = async (req, res) => {
  try {
    const { userid } = req.params;
    if (!userid) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    /** ---------------------------------------------------
     * 1. Get shipper by userId
     * --------------------------------------------------- */
    const shipper = await Shipper.findOne({ 
        userId: userid, 
        deletstatus: 0 
      })
      .populate("userId", "firstName lastName email phone role")
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email");

    if (!shipper) {
      return res.status(404).json({
        success: false,
        message: "Shipper not found",
      });
    }

    const shipperId = shipper._id;


    /** ---------------------------------------------------
     * 3. Get Bookings for this shipper
     * --------------------------------------------------- */
    const bookings = await Booking.find({
      shipperId: shipperId,
      deletstatus: 0
    });

    /** ---------------------------------------------------
     * 4. Get Bids for this shipper
     * --------------------------------------------------- */
    const bids = await Bid.find({
      shipperId: shipperId,
      deletstatus: 0
    });

    /** ---------------------------------------------------
     * 5. Count totals
     * --------------------------------------------------- */
    const summary = {
      totalBookings: bookings.length,
      totalBids: bids.length,
    };
    res.status(200).json({
      success: true,
      message: "shipper details fetched successfully",
      data: {
        shipper,
        bookings,
        bids,
        summary
      },
    });
  } catch (error) {
    console.error("Error fetching shipper by ID:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.createOrUpdateProfile = async (req, res) => {
  try {
    const { companyName, address, locationId, zipCode, country } = req.body;
    const userId = req.body.userId;
    // const location = await Location.findById(locationId);
    // if (!location) {
    //   return res.status(404).json({ success: false, message: "Invalid locationId" });
    // }

    let shipper = await Shipper.findOne({ userId });
    let savedPhotoPath = null;


    if (req.file) {
      const dir = path.join(__dirname, "../upload/shipperProfiles");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const ext = path.extname(req.file.originalname);
      const filename = `shipper_${userId}${ext}`;
      const finalPath = path.join(dir, filename);
      fs.writeFileSync(finalPath, req.file.buffer);

      savedPhotoPath = path.join("upload", "shipperProfiles", filename);
    }
    if (shipper) {
      shipper.companyName = companyName || shipper.companyName;
      shipper.address = address || shipper.address;
      shipper.locationId = locationId || shipper.locationId;
      shipper.zipCode = zipCode || shipper.zipCode;
      shipper.country = country || shipper.country;

      if (savedPhotoPath) shipper.photo = savedPhotoPath;

      shipper.updatedAt = new Date();
      await shipper.save();
    } else {
      // Create new one
      shipper = await Shipper.create({
        userId,
        companyName,
        address,
        locationId,
        zipCode,
        country,
        photo: savedPhotoPath || null
      });
    }

    return res.status(200).json({
      success: true,
      message: "Shipper profile created/updated successfully",
      data: shipper,
    });

  } catch (error) {
    console.error("Shipper profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const shipper = await Shipper.findOne({ userId: req.user._id }).populate('userId', '-password');

    if (!shipper) {
      return res.status(404).json({ success: false, message: 'Shipper profile not found' });
    }

    res.status(200).json({ success: true, data: shipper });
  } catch (error) {
    console.error('Get shipper profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAllShippers = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      const users = await User.find({
        role: 'Shipper',
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      query.userId = { $in: users.map(u => u._id) };
    }

    const shippers = await Shipper.find(query)
      .populate('userId', '-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Shipper.countDocuments(query);

    res.status(200).json({
      success: true,
      data: shippers,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get shippers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


