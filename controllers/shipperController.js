const Shipper = require('../models/Shipper');
const User = require('../models/User');
const { uploadToS3 } = require('../utils/s3Upload');
const Booking = require("../models/Booking");
const Bid = require("../models/Bid");

// exports.createOrUpdateProfile = async (req, res) => {
//   try {
//     const { companyName, dba, address, city, state, zipCode, country } = req.body;
//     let photoUrl = null;

//     if (req.file) {
//       photoUrl = await uploadToS3(req.file, 'shipper-profiles');
//     }

//     let shipper = await Shipper.findOne({ userId: req.user._id });

//     if (shipper) {
//       shipper.companyName = companyName || shipper.companyName;
//       shipper.dba = dba || shipper.dba;
//       shipper.address = address || shipper.address;
//       shipper.city = city || shipper.city;
//       shipper.state = state || shipper.state;
//       shipper.zipCode = zipCode || shipper.zipCode;
//       shipper.country = country || shipper.country;
//       if (photoUrl) shipper.photo = photoUrl;
//       shipper.updatedAt = Date.now();
//       await shipper.save();
//     } else {
//       shipper = await Shipper.create({
//         userId: req.user._id,
//         companyName,
//         dba,
//         address,
//         city,
//         state,
//         zipCode,
//         country,
//         photo: photoUrl
//       });
//     }

//     req.user.profileCompleted = true;
//     await req.user.save();

//     res.status(200).json({ success: true, data: shipper });
//   } catch (error) {
//     console.error('Shipper profile error:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };
 
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
    const location = await Location.findById(locationId);
    if (!location) {
      return res.status(404).json({ success: false, message: "Invalid locationId" });
    }

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


