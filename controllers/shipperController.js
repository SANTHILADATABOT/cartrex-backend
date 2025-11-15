const Shipper = require('../models/Shipper');
const User = require('../models/User');
const { uploadToS3 } = require('../utils/s3Upload');

exports.createOrUpdateProfile = async (req, res) => {
  try {
    const { companyName, dba, address, city, state, zipCode, country } = req.body;
    let photoUrl = null;

    if (req.file) {
      photoUrl = await uploadToS3(req.file, 'shipper-profiles');
    }

    let shipper = await Shipper.findOne({ userId: req.user._id });

    if (shipper) {
      shipper.companyName = companyName || shipper.companyName;
      shipper.dba = dba || shipper.dba;
      shipper.address = address || shipper.address;
      shipper.city = city || shipper.city;
      shipper.state = state || shipper.state;
      shipper.zipCode = zipCode || shipper.zipCode;
      shipper.country = country || shipper.country;
      if (photoUrl) shipper.photo = photoUrl;
      shipper.updatedAt = Date.now();
      await shipper.save();
    } else {
      shipper = await Shipper.create({
        userId: req.user._id,
        companyName,
        dba,
        address,
        city,
        state,
        zipCode,
        country,
        photo: photoUrl
      });
    }

    req.user.profileCompleted = true;
    await req.user.save();

    res.status(200).json({ success: true, data: shipper });
  } catch (error) {
    console.error('Shipper profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
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
