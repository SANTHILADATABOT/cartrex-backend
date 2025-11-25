const Shipper = require('../../models/Shipper');
const User = require('../../models/User');
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
