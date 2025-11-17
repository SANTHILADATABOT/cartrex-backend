const Carrier = require('../models/Carrier');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Truck = require('../models/Truck');
const Location =require('../models/Location');
const { uploadToS3 } = require('../utils/s3Upload');
// exports.createOrUpdateProfile = async (req, res) => {
//   try {
//     const { companyName, address, city, state, zipCode, country } = req.body;
//     let photoUrl = null;

//     if (req.file) {
//       photoUrl = await uploadToS3(req.file, 'carrier-profiles');
//     }

//     let carrier = await Carrier.findOne({ userId: req.user._id });

//     if (carrier) {
//       carrier.companyName = companyName || carrier.companyName;
//       carrier.address = address || carrier.address;
//       carrier.city = city || carrier.city;
//       carrier.state = state || carrier.state;
//       carrier.zipCode = zipCode || carrier.zipCode;
//       carrier.country = country || carrier.country;
//       if (photoUrl) carrier.photo = photoUrl;
//       carrier.updatedAt = Date.now();
//       await carrier.save();
//     } else {
//       carrier = await Carrier.create({
//         userId: req.user._id,
//         companyName,
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

//     res.status(200).json({ success: true, data: carrier });
//   } catch (error) {
//     console.error('Carrier profile error:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };
exports.createOrUpdateProfile = async (req, res) => {
  try {
    const { companyName, address, locationId, zipCode, country } = req.body;
    let photoUrl = null;

    if (req.file) {
      photoUrl = await uploadToS3(req.file, 'carrier-profiles');
    }
    
    const userId = req.body.userId; // temporary (until auth is added)

    // ✅ Validate if location exists
    const location = await Location.findById(locationId);
    if (!location) {
      return res.status(404).json({ success: false, message: "Invalid locationId" });
    }

    let carrier = await Carrier.findOne({ userId });

    if (carrier) {
      carrier.companyName = companyName || carrier.companyName;
      carrier.address = address || carrier.address;
      carrier.locationId = locationId || carrier.locationId;
      carrier.zipCode = zipCode || carrier.zipCode;
      carrier.country = country || carrier.country;
      if (photoUrl) carrier.photo = photoUrl;
      carrier.updatedAt = Date.now();
      await carrier.save();
    } else {
      carrier = await Carrier.create({
        userId,
        companyName,
        address,
        locationId,
        zipCode,
        country,
        photo: photoUrl
      });
    }

    res.status(200).json({ success: true, data: carrier });
  } catch (error) {
    console.error('Carrier profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
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
