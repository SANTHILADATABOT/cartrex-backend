const Shipper = require('../../models/Shipper');
const User = require('../../models/User');
const Bid = require('../../models/Bid');
const { uploadToS3 } = require('../../utils/s3Upload');

exports.createOrUpdateshipperProfile = async (req, res) => {
  try {
    const { companyName, address,  zipCode, country ,stateCode,city,state} = req.body;
    const userId = req.body.userId;


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
      shipper.city = city;
      shipper.state = state;
      shipper.stateCode = stateCode;
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
        zipCode,
        country,
        city,
        state,
        stateCode,
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


exports.getshipperbyId = async (req, res) => {
  try {
    const { shipperId } = req.params;

    const shipper = await Shipper.findOne({ _id: shipperId, deletstatus: 0 })
      .populate("userId", "firstName lastName email phone companyname role")
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email");

    if (!shipper) {
      return res.status(404).json({
        success: false,
        message: "Shipper not found or deleted",
      });
    }

    res.status(200).json({
      success: true,
      message: "Shipper details fetched successfully",
      data: shipper,
    });

  } catch (error) {
    console.error("Error fetching shipper by ID:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// bookings 
exports.createBooking = async (req, res) => {
  try {
    const data = req.body;
    // const shipper = await Shipper.findOne({ _id: data?.shipperId });
    const shipper = await Shipper.findOne({ userId: data?.userId });

    if (!shipper) {
      return res.status(404).json({ success: false, message: 'Shipper not found for this user' });
    }

    const space = await Space.findById({ _id: data?.spaceId });
    if (!space) {
      return res.status(404).json({ success: false, message: 'Space not found' });
    }

    if (space.availableSpaces <= space.bookedSpaces) {
      return res.status(400).json({ success: false, message: 'No spaces available' });
    }

    const bookingId = `BK-${uuidv4().substring(0, 8).toUpperCase()}`;
    
    const bookValuetaxinc = JSON.parse(data.bookValuetaxinc || "{}");
    const pickup = JSON.parse(data.pickup || "{}");
    const delivery = JSON.parse(data.delivery || "{}");
    const shippingInfo = JSON.parse(data.shippingInfo || "{}");
    const parsedVehicleDetails = JSON.parse(data.vehicleDetails || '{}');

    const booking = await Booking.create({
      ...data,
      vehicleDetails: parsedVehicleDetails,
      bookValuetaxinc,
      pickup,
      delivery,
      shippingInfo,
      shipperId: shipper._id, 
      bookingId:bookingId,
      status: 'pending',
      createdBy: data?.userId,
      createdAt:Date.now(),
      deletstatus: 0,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      statusUpdatedetails:[]
    });

    const uploadedPhotos = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        const ext = path.extname(file.originalname);
        // const baseName = path.basename(file.originalname, ext);
        const newFilename = `vehicle${index + 1}_${booking._id}${ext}`;
        const newPath = path.join(path.dirname(file.path), newFilename);

        fs.renameSync(file.path, newPath);
        uploadedPhotos.push(`/uploads/booking/${newFilename}`);
      });
    }

    if (uploadedPhotos.length > 0) {
      booking.vehicleDetails.photos = uploadedPhotos;
      await booking.save();
    }

    space.bookedSpaces += 1;
    if (space.bookedSpaces >= space.availableSpaces) {
      space.status = 'booked';
    }
    await space.save();

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, message: 'Server error', test: error }); // , stack: error.stack
  }
};
exports.getBookingsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findById(userId).populate('role');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
   
    const shipper = await Shipper.findOne({ userId });
    const carrier = await Carrier.findOne({ userId });
    let bookings = [];
    if (shipper && user.role.roleType === "Shipper") {
      const shipperBookings = await Booking.find({ shipperId: shipper._id, deletstatus: 0 })
        .populate([
          { path: 'spaceId' },
          { path: 'truckId' },
          { 
            path: 'carrierId',
            populate: { path: 'userId', select: 'firstName lastName email phone role' }
          },
          { 
            path: 'shipperId',
            populate: { path: 'userId', select: 'firstName lastName email phone role' }
          }
        ])
        .lean();

      bookings = bookings.concat(shipperBookings);
    }

    if (carrier && (user.role.roleType === "Carrier")) {
      const carrierBookings = await Booking.find({ carrierId: carrier._id, deletstatus: 0 })
        .populate([
          { path: 'spaceId' },
          { path: 'truckId' },
          { 
            path: 'carrierId',
            populate: { path: 'userId', select: 'firstName lastName email phone role' }
          },
          { 
            path: 'shipperId',
            populate: { path: 'userId', select: 'firstName lastName email phone role' }
          }
        ])
        .lean();

      bookings = bookings.concat(carrierBookings);
    }

    if (bookings.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No bookings found for this user",
        data:[],
      });
    }

    // ✅ 5. Response
    return res.status(200).json({
      success: true,
      message: "Bookings fetched successfully",
      // role: user.role,
      count: bookings.length,
      data: bookings
    });

  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching bookings",
      error: error.message
    });
  }
};
// bids 

exports.getallbidsfilter = async (req, res) => {
  try {
    // const { isActive } = req.query;
    const data = req.query;
    const filter = { deletstatus: 0 };
    if (data?.deliveryLocation && data?.pickupLocation) {
      filter["pickup.stateCode"] = data?.pickupLocation;
      filter["delivery.stateCode"] = data?.deliveryLocation;
    }
    const bids = await Bid.find(filter)
      .populate('shipperId', 'companyName dba')
      .populate('carrierId', 'companyName dba')
      .populate('routeId', 'routeName')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);           

    if (!bids.length) {
      return res.status(200).json({
        success: true,
        message: "No bids found",
        data: []
      });
    }

    return res.status(200).json({
      success: true,
      count: bids.length,
      message: "Bids fetched successfully",
      data: bids
    });

  } catch (error) {
    console.error("Error fetching bids:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
