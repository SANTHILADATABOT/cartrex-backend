const Bid = require('../models/Bid');
const Shipper = require('../models/Shipper');
const Carrier = require('../models/Carrier');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');
const User = require('../models/User');
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');

// Temporary upload directory
const tempDir = path.join(__dirname, "../uploads/tmp");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}_${uuidv4().substring(0, 6)}${ext}`);
  },
});

exports.uploadBidPhotos = multer({ storage }).array("photos", 10);

// Create Bid Controller
exports.createBid = async (req, res) => {
  try {
    const data = req.body;
    const files = req.files || [];
console.log("data in create",data)
    // Step 1: Validate shipper
    const shipper = await Shipper.findOne({ userId: data.shipperId });
    if (!shipper) {
      return res.status(404).json({ success: false, message: "Shipper not found" });
    }

    // Step 2: Create Bid Record
    const bidId = `BD-${uuidv4().substring(0, 8).toUpperCase()}`;
    const bid = await Bid.create({
      shipperId: shipper._id,
      carrierRouteList: data.carrierRouteList,
      userId:data.userId,
      bidValue: data.bidValue,
      bidValuetaxinc: data.totalpriceinfo,
      bidId: bidId,
      vehicleDetails: {
        licenseNumber: data.vehicleDetails?.licenseNumber,
        brand: data.vehicleDetails?.brand,
        vehicleType: data.vehicleDetails?.vehicleType,
        yearMade: data.vehicleDetails?.yearMade,
        features: data.vehicleDetails?.features || [],
        condition: data.vehicleDetails?.condition,
        quantity: data.vehicleDetails?.quantity,
        photos: [],
        contains100lbs: data.vehicleDetails?.contains100lbs,
        estimate_extra_weight: data.vehicleDetails?.estimate_extra_weight
      },
      shippingDescription: data.shippingInfo?.whatIsBeingShipped,
      transportType: data.transportType,
      vinNumber: data?.vinNumber,
      lotNumber: data?.lotNumber,
      pickup: {
        city: data?.pickup?.city,
        state: data?.pickup?.state,
        zipcode: data?.pickup?.zipcode,
        pickupDate: data?.pickup?.pickupDate,
        pickupLocationType: data?.pickup?.pickupLocationType
      },
      delivery: {
        city: data?.delivery?.city,
        state: data?.delivery?.state,
        zipcode: data?.delivery?.zipcode
      },
      shippingInfo: {
        whatIsBeingShipped: data.shippingInfo?.whatIsBeingShipped,
        whatIsBeingShippedId: data.shippingInfo?.whatIsBeingShippedId,
        additionalComments: data.shippingInfo?.additionalComments
      },
      timing: data?.timing,
      status: 'pending',
      createdBy: data.shipperId,
      deletstatus: 0,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    // Step 3: Move uploaded files from tmp to final folder
    const uploadDir = path.join(__dirname, "../uploads/bidvehicle");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const photoPaths = [];

    for (const file of files) {
      const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext);
      const newFilename = `${baseName}_${bid._id}${ext}`; // use custom bidId (e.g. BD-XXXXXX)
      const newPath = path.join(uploadDir, newFilename);

      fs.renameSync(file.path, newPath);
      photoPaths.push(`/uploads/bidvehicle/${newFilename}`);
    }

    // Step 4: Update bid with photo paths
    bid.vehicleDetails.photos = photoPaths;
    await bid.save();

    res.status(201).json({ success: true, data: bid });

  } catch (error) {
    console.error('Create bid error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
exports.getBids = async (req, res) => {
  try {
    const { status, pickupLocation, deliveryLocation, page = 1, limit = 10 } = req.query;
    let query = {};

    if (req.user.role === 'carrier') {
      const carrier = await Carrier.findOne({ userId: req.user._id });
      query.$or = [{ carrierId: carrier._id }, { carrierId: null }];
    } else if (req.user.role === 'shipper') {
      const shipper = await Shipper.findOne({ userId: req.user._id });
      query.shipperId = shipper._id;
    }

    if (status) query.status = status;
    if (pickupLocation) query['route.from.city'] = { $regex: pickupLocation, $options: 'i' };
    if (deliveryLocation) query['route.to.city'] = { $regex: deliveryLocation, $options: 'i' };

    const bids = await Bid.find(query).populate('shipperId carrierId spaceId').limit(limit * 1).skip((page - 1) * limit).sort({ createdAt: -1 });
    const count = await Bid.countDocuments(query);

    res.status(200).json({ success: true, data: bids, totalPages: Math.ceil(count / limit), currentPage: page, total: count });
  } catch (error) {
    console.error('Get bids error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getBidById = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id).populate('shipperId carrierId spaceId');
    if (!bid) return res.status(404).json({ success: false, message: 'Bid not found' });
    res.status(200).json({ success: true, data: bid });
  } catch (error) {
    console.error('Get bid error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


//update bid status =>cancelled
exports.updatebidstatusbyuserId = async (req, res) => {
  try {
    const { userId, bidId } = req.params;
    const {status}=req.body;
console.log("status in update api",status)
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(bidId)) {
      return res.status(400).json({ success: false, message: "Invalid userId or bidId" });
    }
    const user = await User.findById(userId).populate('role');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // if (user.role.name.toLowerCase() !== 'shipper') {
    //   return res.status(403).json({ success: false, message: "Only shippers can cancel bids" });
    // }

    const shipper = await Shipper.findOne({ userId });
    if (!shipper) {
      return res.status(404).json({ success: false, message: "No shipper found for this user" });
    }

    const bid = await Bid.findOne({ _id: bidId, shipperId: shipper._id, deletstatus: 0 });
    if (!bid) {
      return res.status(404).json({ success: false, message: "Bid not found or not owned by this shipper" });
    }

    bid.status = status;
    bid.updatedAt = new Date();
    bid.updatedBy = userId;
    if (!bid.bidId) bid.bidId = bidId;
    await bid.save();


    return res.status(200).json({
      success: true,
      message: "Bid status updated to cancelled successfully",
      data: {
        bidId: bid._id,
        status: bid.status,bid
      }
    });

  } catch (error) {
    console.error("Error updating bid status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating bid status",
      error: error.message
    });
  }
};

exports.editBid = async (req, res) => {
  try {
    const { bidId } = req.params; // get bidId from URL params
    const data = req.body;
    const files = req.files || [];
console.log("data",req.body,"bidId...",bidId)
    // Step 1: Validate Bid Existence
    const bid = await Bid.findById(bidId);
    if (!bid) {
      return res.status(404).json({ success: false, message: "Bid not found" });
    }

    // Step 2: Validate Shipper
    const shipper = await Shipper.findOne({ userId: data.shipperId });
    if (!shipper) {
      return res.status(404).json({ success: false, message: "Shipper not found" });
    }

    // Step 3: Update Bid Fields
    bid.shipperId = shipper._id;
    bid.userId = data.userId;
    bid.carrierRouteList = data.carrierRouteList;
    bid.bidValue = data.bidValue ?? bid.bidValue;
    bid.bidValuetaxinc = data.totalpriceinfo ?? bid.bidValuetaxinc;
    bid.vehicleDetails = {
      ...bid.vehicleDetails,
      licenseNumber: data.vehicleDetails?.licenseNumber ?? bid.vehicleDetails.licenseNumber,
      brand: data.vehicleDetails?.brand ?? bid.vehicleDetails.brand,
      vehicleType: data.vehicleDetails?.vehicleType ?? bid.vehicleDetails.vehicleType,
      yearMade: data.vehicleDetails?.yearMade ?? bid.vehicleDetails.yearMade,
      features: data.vehicleDetails?.features || bid.vehicleDetails.features,
      condition: data.vehicleDetails?.condition ?? bid.vehicleDetails.condition,
      quantity: data.vehicleDetails?.quantity ?? bid.vehicleDetails.quantity,
      contains100lbs: data.vehicleDetails?.contains100lbs ?? bid.vehicleDetails.contains100lbs,
      estimate_extra_weight: data.vehicleDetails?.estimate_extra_weight ?? bid.vehicleDetails.estimate_extra_weight,
    };

    bid.shippingDescription = data.shippingInfo?.whatIsBeingShipped ?? bid.shippingDescription;
    bid.transportType = data.transportType ?? bid.transportType;
    bid.vinNumber = data?.vinNumber ?? bid.vinNumber;
    bid.lotNumber = data?.lotNumber ?? bid.lotNumber;
    bid.pickup = {
      ...bid.pickup,
      city: data?.pickup?.city ?? bid.pickup.city,
      state: data?.pickup?.state ?? bid.pickup.state,
      zipcode: data?.pickup?.zipcode ?? bid.pickup.zipcode,
      pickupDate: data?.pickup?.pickupDate ?? bid.pickup.pickupDate,
      pickupLocationType: data?.pickup?.pickupLocationType ?? bid.pickup.pickupLocationType,
    };
    bid.delivery = {
      ...bid.delivery,
      city: data?.delivery?.city ?? bid.delivery.city,
      state: data?.delivery?.state ?? bid.delivery.state,
      zipcode: data?.delivery?.zipcode ?? bid.delivery.zipcode,
    };
    bid.shippingInfo = {
      ...bid.shippingInfo,
      whatIsBeingShipped: data.shippingInfo?.whatIsBeingShipped ?? bid.shippingInfo.whatIsBeingShipped,
      whatIsBeingShippedId: data.shippingInfo?.whatIsBeingShippedId ?? bid.shippingInfo.whatIsBeingShippedId,
      additionalComments: data.shippingInfo?.additionalComments ?? bid.shippingInfo.additionalComments,
    };
    bid.timing = data?.timing ?? bid.timing;
    bid.updatedBy = data.shipperId;
    bid.ipAddress = req.ip;
    bid.userAgent = req.get('User-Agent');
    bid.updatedAt = new Date();

    // Step 4: Handle Updated Photos (if new ones are uploaded)
    const uploadDir = path.join(__dirname, "../uploads/bidvehicle");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const newPhotoPaths = [];

    for (const file of files) {
      const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext);
      const newFilename = `${baseName}_${bid._id}${ext}`;
      const newPath = path.join(uploadDir, newFilename);

      fs.renameSync(file.path, newPath);
      newPhotoPaths.push(`/uploads/bidvehicle/${newFilename}`);
    }

    // Merge with existing photos
    if (newPhotoPaths.length > 0) {
      bid.vehicleDetails.photos = [...bid.vehicleDetails.photos, ...newPhotoPaths];
    }

    // Step 5: Save updated bid
    await bid.save();

    res.status(200).json({
      success: true,
      message: "Bid updated successfully",
      data: bid,
    });

  } catch (error) {
    console.error("Edit bid error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// exports.acceptBid = async (req, res) => {
//   try {
//     const { truckId, additionalFee, pickupDate, deliveryDate, message } = req.body;
//     const bid = await Bid.findById(req.params.id);
//     if (!bid) return res.status(404).json({ success: false, message: 'Bid not found' });
//     if (bid.status !== 'open') return res.status(400).json({ success: false, message: 'Bid is no longer available' });

//     const carrier = await Carrier.findOne({ userId: req.user._id });

//     bid.status = 'approved'; bid.approvedBy = carrier._id; bid.updatedAt = Date.now();
//     await;

