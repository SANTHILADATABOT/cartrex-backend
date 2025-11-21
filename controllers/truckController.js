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


exports.createTruckProfile = async (req, res) => {
  try {
 
    const {userId } = req.body.params;
    // const userId = '692060d4895dbb36b25caaef';

    const carrier = await Carrier.findOne({ userId: userId });
    console.log("req.body.userId",userId)
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
      originCity,
      originStateCode,
      originZipcode,
      destinationCity,
      destinationZipcode,
      destinationstateCode,
      deliveryRadius,
      deliveryWindow,
      pickupWindow,
      pickupRadius,
      originState,
      destinationstate,
      destinationlocation,
      originlocation
    } = req.body.params;

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
        fullAddress: originlocation,
        // formattedAddress: origin.fullAddress,
        city: originCity,
        state: originState,
        stateCode: originStateCode,
        zipcode: originZipcode,
        pickupWindow: pickupWindow,
        pickupRadius: pickupRadius
      },
      destination: {
        fullAddress: destinationlocation,
        // formattedAddress: destination.fullAddress,
        city: destinationCity,
        state: destinationstate,
        stateCode: destinationstateCode,
        zipcode: destinationZipcode,
        deliveryWindow:deliveryWindow,
        deliveryRadius: deliveryRadius
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

exports.updateTruck = async (req, res) => {
  try {
    const { truckId, routeId } = req.params;

    const truck = await Truck.findOne({ _id: truckId, deletstatus: 0 });
    if (!truck) {
      return res.status(404).json({
        success: false,
        message: "Truck not found"
      });
    }

    const route = await Route.findOne({ _id: routeId, deletstatus: 0 });
    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found"
      });
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
      destination
    } = req.body;


    const baseDir = path.join(__dirname, "../upload/trucks");
    if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

    let insurancePath = truck.insurance;
    let coverPhotoPath = truck.coverPhoto;
    let photoPaths = truck.photos || [];

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
      photoPaths = []; 
      req.files.photos.forEach((file, index) => {
        const ext = path.extname(file.originalname);
        const fileName = `photo_${Date.now()}_${index}${ext}`;
        const savePath = path.join(baseDir, fileName);

        fs.writeFileSync(savePath, file.buffer);
        photoPaths.push(path.join("upload", "trucks", fileName));
      });
    }

    truck.nickname = nickname ?? truck.nickname;
    truck.registrationNumber = registrationNumber ?? truck.registrationNumber;
    truck.truckType = truckType ?? truck.truckType;
    truck.hasWinch = hasWinch !== undefined ? (hasWinch === "true") : truck.hasWinch;
    truck.capacity = capacity ?? truck.capacity;
    truck.mcDotNumber = mcDotNumber ?? truck.mcDotNumber;
    truck.vinNumber = vinNumber ?? truck.vinNumber;
    truck.insurance = insurancePath;
    truck.insuranceExpiry = insuranceExpiry ?? truck.insuranceExpiry;
    truck.coverPhoto = coverPhotoPath;
    truck.photos = photoPaths;

    truck.updatedAt = new Date();
    truck.updatedBy = req.body.updatedBy;
    truck.ipAddress = req.ip;
    truck.userAgent = req.headers["user-agent"];

    await truck.save();

    route.origin = {
      fullAddress: origin?.fullAddress ?? route.origin.fullAddress,
      formattedAddress: origin?.fullAddress ?? route.origin.formattedAddress,
      city: origin?.city ?? route.origin.city,
      state: origin?.state ?? route.origin.state,
      stateCode: origin?.stateCode ?? route.origin.stateCode,
      zipcode: origin?.zipcode ?? route.origin.zipcode,
      pickupWindow: origin?.pickupWindow ?? route.origin.pickupWindow,
      pickupRadius: origin?.pickupRadius ?? route.origin.pickupRadius
    };

    route.destination = {
      fullAddress: destination?.fullAddress ?? route.destination.fullAddress,
      formattedAddress: destination?.fullAddress ?? route.destination.formattedAddress,
      city: destination?.city ?? route.destination.city,
      state: destination?.state ?? route.destination.state,
      stateCode: destination?.stateCode ?? route.destination.stateCode,
      zipcode: destination?.zipcode ?? route.destination.zipcode,
      deliveryWindow: destination?.deliveryWindow ?? route.destination.deliveryWindow,
      deliveryRadius: destination?.deliveryRadius ?? route.destination.deliveryRadius
    };

    route.updatedAt = new Date();
    route.updatedBy = req.body.updatedBy;
    route.ipAddress = req.ip;
    route.userAgent = req.headers["user-agent"];

    await route.save();


    return res.status(200).json({
      success: true,
      message: "Truck and Route updated successfully",
      truck,
      route
    });

  } catch (error) {
    console.error("Update truck error:", error);
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

// exports.updateTruck = async (req, res) => {
//   try {
//     const truck = await Truck.findById(req.params.id);

//     if (!truck) {
//       return res.status(404).json({ success: false, message: 'Truck not found' });
//     }

//     const carrier = await Carrier.findOne({ userId: req.body.userId });
//     if (truck.carrierId.toString() !== carrier._id.toString()) {
//       return res.status(403).json({ success: false, message: 'Not authorized' });
//     }

//     Object.assign(truck, req.body);
//     truck.updatedAt = Date.now();
//     await truck.save();

//     res.status(200).json({
//       success: true,
//       data: truck
//     });
//   } catch (error) {
//     console.error('Update truck error:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

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
