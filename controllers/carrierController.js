const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Carrier = require('../models/Carrier');
const Shipper = require('../models/Shipper');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Route = require('../models/Route');
const Bid = require('../models/Bid');
const Truck = require('../models/Truck');
const Location =require('../models/Location');
const { uploadToS3 } = require('../utils/s3Upload');

// exports.createOrUpdateProfile = async (req, res) => {
//   try {
//     const { userId, roleType, companyName, address, locationId, zipCode, country,city,state,stateCode,companyDescription ,phone,firstName,lastName,email} = req.body;
//     // Validate required fields
//     if (!userId) {
//       return res.status(400).json({ success: false, message: "userId is required" });
//     }
//     if (!roleType) {
//       return res.status(400).json({ success: false, message: "roleType is required" });
//     }
//     if (!["Carrier", "Shipper"].includes(roleType)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid roleType. Use Carrier or Shipper",
//       });
//     }
//     const location = await Location.findById(locationId);
//     if (!location) {
//       return res.status(404).json({ success: false, message: "Invalid locationId" });
//     }
//     let filter = {deletstatus:0,_id:userId};
//     const user = await User.findOne(filter);
//     if (!user) return res.status(200).json({ success: false, message: 'User Not found' });
//     if(user.email !== email){
//       user.verifyuser = "unverified";
//     }
//     user.firstName = firstName;
//     user.lastName = lastName;
//     user.email = email;
//     user.phone = phone;
//     await user.save();
//     const Model = roleType === "Carrier" ? Carrier : Shipper;
//     let profile = await Model.findOne({ userId });
//     let savedPhotoPath = null;
//     if (req.file) {
//       const folderName = roleType === "Carrier" ? "carrierProfiles" : "shipperProfiles";
//       const dir = path.join(__dirname, "../upload/" + folderName);
//       if (!fs.existsSync(dir)) {
//         fs.mkdirSync(dir, { recursive: true });
//       }
//       const ext = path.extname(req.file.originalname);
//       const filename = `${roleType.toLowerCase()}_${userId}${ext}`;
//       const finalPath = path.join(dir, filename);
//       fs.writeFileSync(finalPath, req.file.buffer);
//       savedPhotoPath = path.join("upload", folderName, filename);
//     }
//     if (profile) {
//       profile.companyName = companyName || profile.companyName;
//       profile.phone = phone || profile.phone;
//       profile.companyDescription = companyDescription || profile.companyDescription;
//       profile.address = address || profile.address;
//       profile.locationId = locationId || profile.locationId;
//       profile.zipCode = zipCode || profile.zipCode;
//       profile.country = country || profile.country;
//       profile.city = city || profile.city;
//       profile.state = state || profile.state;
//       profile.stateCode = stateCode || profile.stateCode;
//       if (savedPhotoPath) profile.photo = savedPhotoPath;
//       profile.updatedAt = new Date();
//       await profile.save();
//     } 
//     else {
//       profile = await Model.create({
//         userId,
//         companyName,
//         address,
//         locationId,
//         zipCode,
//         country,
//         city,
//         state,
//         stateCode,
//         companyDescription,
//         photo: savedPhotoPath || null
//       });
//     }
//     return res.status(200).json({
//       success: true,
//       message: `${roleType} profile created/updated successfully`,
//       data: profile,
//     });

//   } catch (error) {
//     console.error(" SERVER ERROR:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };
exports.createOrUpdateProfile = async (req, res) => {
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

    if (!roleType) {
      return res.status(400).json({ success: false, message: "roleType is required" });
    }

    if (!["Carrier", "Shipper"].includes(roleType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid roleType. Use Carrier or Shipper",
      });
    }

    // const location = await Location.findById(locationId);
    // if (!location) {
    //   return res.status(404).json({ success: false, message: "Invalid locationId" });
    // }

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
    const Model = roleType === "Carrier" ? Carrier : Shipper;
    let profile = await Model.findOne({ userId });

    // ------------------------ PHOTO UPLOAD ------------------------
    let savedPhotoPath = null;

    if (req.file) {
      const folderName = roleType === "Carrier" ? "carrierProfiles" : "shipperProfiles";
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


exports.CarrierprofileUpdate = async (req, res) => {
  try {
    console.log(" Incoming Request Body:", req.body);
    console.log(" Incoming File:", req.file);

    const { userId, carrierId,deletePhoto} = req.body;
    // Validate required fields
    if (!userId) {
      console.log(" ERROR: userId missing");
      return res.status(400).json({ success: false, message: "userId is required" });
    }
    if (!carrierId) {
      return res.status(400).json({ success: false, message: "CarrierId is required" });
    }
    let profile = await Carrier.findOne({ userId:userId ,_id:carrierId});
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Carrier not found"
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
        const folderName = "carrierProfiles";
        const dir = path.join(__dirname, "../upload/" + folderName);

        console.log(" Upload Directory:", dir);

        if (!fs.existsSync(dir)) {
          console.log(" Creating folder:", dir);
          fs.mkdirSync(dir, { recursive: true });
        }

        const ext = path.extname(req.file.originalname);
        const filename = `carrier_${userId}${ext}`;
        const finalPath = path.join(dir, filename);
        fs.writeFileSync(finalPath, req.file.buffer);
        savedPhotoPath = path.join("upload", folderName, filename).replace(/\\/g, "/");
      }
      profile.photo = savedPhotoPath;
      profile.updatedAt = new Date();
      await profile.save();
      return res.status(200).json({
      success: true,
      message: `Carrier profile updated successfully`,
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
exports.getcarrierDeatilsbyId = async (req, res) => {
  try {
    const { userid } = req.params;
    if (!userid) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }
    const carrier = await Carrier.findOne({ 
        userId: userid, 
        deletstatus: 0 
      })
      .populate("userId", "firstName lastName email phone role")
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email");

    if (!carrier) {
      return res.status(404).json({
        success: false,
        message: "Carrier not found",
      });
    }

    const carrierId = carrier._id;

    const trucks = await Truck.find({ 
      carrierId: carrierId, 
      deletstatus: 0 
    });
    const truckIds = trucks.map(t => t._id);

    const routes = await Route.find({
      truckId: { $in: truckIds },
      deletstatus: 0
    });

    const bookings = await Booking.find({
      carrierId: carrierId,
      deletstatus: 0
    });

    const bids = await Bid.find({
      carrierId: carrierId,
      deletstatus: 0
    });

    const summary = {
      totalTrucks: trucks.length,
      totalBookings: bookings.length,
      totalBids: bids.length,
    };
    res.status(200).json({
      success: true,
      message: "Carrier details fetched successfully",
      data: {
        carrier,
        trucks,
        bookings,
        bids,
        routes,
        summary
      },
    });
  } catch (error) {
    console.error("Error fetching carrier by ID:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
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
