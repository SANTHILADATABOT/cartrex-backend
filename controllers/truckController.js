const Truck = require('../models/Truck');
const Carrier = require('../models/Carrier');
const { uploadToS3 } = require('../utils/s3Upload');

exports.createTruck = async (req, res) => {
  try {
    const carrier = await Carrier.findOne({ userId: req.user._id });
    
    const {
      nickname,
      registrationNumber,
      truckType,
      hasWinch,
      capacity,
      mcDotNumber,
      vinNumber,
      insuranceExpiry
    } = req.body;

    let insuranceUrl, coverPhotoUrl;
    let photoUrls = [];

    if (req.files.insurance) {
      insuranceUrl = await uploadToS3(req.files.insurance[0], 'truck-insurance');
    }
    if (req.files.coverPhoto) {
      coverPhotoUrl = await uploadToS3(req.files.coverPhoto[0], 'truck-photos');
    }
    if (req.files.photos) {
      for (const photo of req.files.photos) {
        const url = await uploadToS3(photo, 'truck-photos');
        photoUrls.push(url);
      }
    }

    const truck = await Truck.create({
      carrierId: carrier._id,
      nickname,
      registrationNumber,
      truckType,
      hasWinch: hasWinch === 'true',
      capacity,
      mcDotNumber,
      vinNumber,
      insurance: insuranceUrl,
      insuranceExpiry,
      coverPhoto: coverPhotoUrl,
      photos: photoUrls
    });

    res.status(201).json({
      success: true,
      data: truck
    });
  } catch (error) {
    console.error('Create truck error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getTrucks = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'Carrier') {
      const carrier = await Carrier.findOne({ userId: req.user._id });
      query.carrierId = carrier._id;
    }

    const trucks = await Truck.find(query)
      .populate('carrierId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: trucks
    });
  } catch (error) {
    console.error('Get trucks error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getTruckById = async (req, res) => {
  try {
    const truck = await Truck.findById(req.params.id).populate('carrierId');

    if (!truck) {
      return res.status(404).json({ success: false, message: 'Truck not found' });
    }

    res.status(200).json({
      success: true,
      data: truck
    });
  } catch (error) {
    console.error('Get truck error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateTruck = async (req, res) => {
  try {
    const truck = await Truck.findById(req.params.id);

    if (!truck) {
      return res.status(404).json({ success: false, message: 'Truck not found' });
    }

    const carrier = await Carrier.findOne({ userId: req.user._id });
    if (truck.carrierId.toString() !== carrier._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    Object.assign(truck, req.body);
    truck.updatedAt = Date.now();
    await truck.save();

    res.status(200).json({
      success: true,
      data: truck
    });
  } catch (error) {
    console.error('Update truck error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteTruck = async (req, res) => {
  try {
    const truck = await Truck.findById(req.params.id);

    if (!truck) {
      return res.status(404).json({ success: false, message: 'Truck not found' });
    }

    const carrier = await Carrier.findOne({ userId: req.user._id });
    if (truck.carrierId.toString() !== carrier._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await truck.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Truck deleted successfully'
    });
  } catch (error) {
    console.error('Delete truck error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
