const path = require('path');
const fs = require('fs');
const Truck = require('../models/Truck');
const Carrier = require('../models/Carrier');
const Route = require('../models/Route');
const { uploadToS3 } = require('../utils/s3Upload');

// exports.createTruck = async (req, res) => {
//   try {
//     //const carrier = await Carrier.findOne({ userId: req.user._id });
//     const carrier = await Carrier.findOne({ userId: req.body.UserId });

//     const {
//       nickname,
//       registrationNumber,
//       truckType,
//       hasWinch, 
//       capacity,
//       mcDotNumber,
//       vinNumber,
//       insuranceExpiry
//     } = req.body;

//     let insuranceUrl, coverPhotoUrl;
//     let photoUrls = [];

//     if (req.files.insurance) {
//       insuranceUrl = await uploadToS3(req.files.insurance[0], 'truck-insurance');
//     }
//     if (req.files.coverPhoto) {
//       coverPhotoUrl = await uploadToS3(req.files.coverPhoto[0], 'truck-photos');
//     }
//     if (req.files.photos) {
//       for (const photo of req.files.photos) {
//         const url = await uploadToS3(photo, 'truck-photos');
//         photoUrls.push(url);
//       }
//     }

//     const truck = await Truck.create({
//       carrierId: carrier._id,
//       nickname,
//       registrationNumber,
//       truckType,
//       hasWinch: hasWinch === 'true',
//       capacity,
//       mcDotNumber,
//       vinNumber,
//       insurance: insuranceUrl,
//       insuranceExpiry,
//       coverPhoto: coverPhotoUrl,
//       photos: photoUrls
//     });

//     res.status(201).json({
//       success: true,
//       data: truck
//     });
//   } catch (error) {
//     console.error('Create truck error:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };


exports.createTruck = async (req, res) => {
  try {
    const carrier = await Carrier.findOne({ userId: req.body.userId });

    if (!carrier) {
      return res.status(404).json({ success: false, message: "Carrier not found" });
    }

    const {
      nickname,
      registrationNumber,
      truckType,
      hasWinch,
      capacity,
      mcDotNumber,
      vinNumber,
      insuranceExpiry,
      zipcode,
      origin,
      destination,

    } = req.body;

    const baseDir = path.join(__dirname, "../upload/trucks");
    if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

    let insurancePath = null;
    let coverPhotoPath = null;
    let photoPaths = [];

    if (req.files?.insurance) {
      const file = req.files.insurance[0];
      const ext = path.extname(file.originalname);
      const fileName = `insurance_${Date.now()}${ext}`;
      const savePath = path.join(baseDir, fileName);

      fs.writeFileSync(savePath, file.buffer);
      insurancePath = path.join("upload", "trucks", fileName);
    }

    if (req.files?.coverPhoto) {
      const file = req.files.coverPhoto[0];
      const ext = path.extname(file.originalname);
      const fileName = `cover_${Date.now()}${ext}`;
      const savePath = path.join(baseDir, fileName);

      fs.writeFileSync(savePath, file.buffer);
      coverPhotoPath = path.join("upload", "trucks", fileName);
    }
    if (req.files?.photos) {
      req.files.photos.forEach((file, index) => {
        const ext = path.extname(file.originalname);
        const fileName = `photo_${Date.now()}_${index}${ext}`;
        const savePath = path.join(baseDir, fileName);

        fs.writeFileSync(savePath, file.buffer);
        photoPaths.push(path.join("upload", "trucks", fileName));
      });
    }
    console.log("BODY DATA:", req.body);

    const truck = await Truck.create({
      carrierId: carrier._id,
      nickname,
      registrationNumber,
      truckType,
      hasWinch: hasWinch === "true",
      capacity,
      mcDotNumber,
      vinNumber,
      insurance: insurancePath,
      insuranceExpiry,
      coverPhoto: coverPhotoPath,
      photos: photoPaths,
      createdBy: req.body.createdBy,
      updatedBy: req.body.createdBy,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const route = await Route.create({
      carrierId: carrier._id,
      truckId: truck._id,
      origin: {
        fullAddress: origin.fullAddress,
        formattedAddress: origin.fullAddress,
        city: origin.city,
        state: origin.state,
        stateCode: origin.stateCode,
        zipcode: origin.zipcode,
        pickupWindow: origin.pickupWindow,
        pickupRadius: origin.pickupRadius
      },
      destination: {
        fullAddress: destination.fullAddress,
        formattedAddress: destination.fullAddress,
        city: destination.city,
        state: destination.state,
        stateCode: destination.stateCode,
        zipcode: destination.zipcode,
        deliveryWindow: destination.deliveryWindow,
        deliveryRadius: destination.deliveryRadius
      },
      createdBy: req.body.createdBy,
      updatedBy: req.body.createdBy,  
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return res.status(201).json({
      success: true,
      message: "Truck created successfully",
      data: truck, route
    });

  } catch (error) {
    console.error("Create truck error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
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
