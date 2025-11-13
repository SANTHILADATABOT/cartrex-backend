const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Bid = require('../models/Bid');
const Shipper = require('../models/Shipper');
const Carrier = require('../models/Carrier');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');



// Create Bid Controller
exports.createBid = async (req, res) => {
  try {
    const data = req.body;
    console.log("data in create", data);
    // Step 1: Validate shipper
    const shipper = await Shipper.findOne({ userId: data?.userId });

    if (!shipper) {
      return res.status(404).json({ success: false, message: "Shipper not found for this user", test: data });
    }
    // Step 2: Create Bid Record
    const bidId = `BD-${uuidv4().substring(0, 8).toUpperCase()}`;
    const bidValuetaxinc = JSON.parse(data.bidValuetaxinc || "{}");
    const pickup = JSON.parse(data.pickup || "{}");
    const delivery = JSON.parse(data.delivery || "{}");
    const shippingInfo = JSON.parse(data.shippingInfo || "{}");
    const carrierRouteList = JSON.parse(data.carrierRouteList || "{}");
    const parsedVehicleDetails = JSON.parse(data.vehicleDetails || '{}');
    const carrierData = carrierRouteList[0] || {};

    const bid = await Bid.create({
      ...data,
      carrierRouteList,
      bidValuetaxinc,
      vehicleDetails: parsedVehicleDetails,
      pickup,
      delivery,
      shippingInfo,
      shipperId: shipper._id,
      userId:data.userId,
      bidId: bidId,
      carrierId: carrierData.carrierId,
      routeId: carrierData.routeList?.[0] || null,
      bidValue: data.bidValue,
      shippingDescription: data.shippingInfo?.whatIsBeingShipped,
      transportType: data.transportType,
      vinNumber: data?.vinNumber,
      lotNumber: data?.lotNumber,
      timing: data?.timing,
      status: 'pending',
      createdBy: data.userId,
      deletstatus: 0,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    const uploadedPhotos = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        const ext = path.extname(file.originalname);
        // const baseName = path.basename(file.originalname, ext);
        const newFilename = `vehicle${index + 1}_${bid._id}${ext}`;
        const newPath = path.join(path.dirname(file.path), newFilename);

        fs.renameSync(file.path, newPath);
        uploadedPhotos.push(`/uploads/bid/${newFilename}`);
      });
    }

    if (uploadedPhotos.length > 0) {
      bid.vehicleDetails.photos = uploadedPhotos;
      await bid.save();
    }
    // await bid.save();

    res.status(201).json({ success: true, data: bid });

  } catch (error) {
    console.error('Create bid error:', error);
    res.status(500).json({ success: false, message: 'Server errorj', error: error.message, test: req.body });
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
      vehicleTypeName: data.vehicleDetails?.vehicleTypeName ?? bid.vehicleDetails.vehicleTypeName,
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

exports.updateAcceptbidstatus = async (req, res) => {
  try {
    const { userId, bidId } = req.params;
    const data = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(bidId)) {
      return res.status(400).json({ success: false, message: "Invalid userId or bidId" });
    }

    const carrier = await Carrier.findOne({ userId });
    if (!carrier) {
      return res.status(404).json({ success: false, message: "Carrier not found" });
    }

    const bidsFound = await Bid.findOne({
      _id: bidId,
      "carrierRouteList.carrierId": carrier._id.toString(),
    });

    if (!bidsFound) {
      return res.status(404).json({ success: false, message: "bidsFound not found for this carrier" });
    }

    // ✅ Only update given fields (no validation errors)
    await Bid.updateOne(
      { _id: bidId },
      {
        $set: {
          addtionalfee: data.addtionalfee,
          conformpickupDate: data.conformpickupDate,
          estimateDeliveryDate: data.estimateDeliveryDate,
          estimateDeliveryWindow: data.estimateDeliveryWindow,
          message: data.message,
          truckforship: data.truckforship,
          status: data.status,
          updatedAt: new Date(),
        },
      },
      { runValidators: false }
    );

    const updatedBid = await Bid.findById(bidId);

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: updatedBid,
    });

  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating booking status",
      error: error.message,
    });
  }
};


exports.updateBidStatusCancel = async (req, res) => {
  try {
    const { userId, bidId } = req.params;
    const { status } = req.body;

    // ✅ Validate params
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(bidId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId or bidId",
      });
    }

    // ✅ Verify user
    const user = await User.findById(userId).populate("role");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Ensure user is a shipper
    const shipper = await Shipper.findOne({ userId });
    // if (!shipper) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Only shippers can cancel bookings.",
    //   });
    // }

    // ✅ Find the bid belonging to this shipper
    const bidsfound = await Bid.findOne({
      _id: bidId,
      shipperId: shipper._id,
      deletstatus: 0,
    });

    if (!bidsfound) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or not owned by this shipper.",
      });
    }

    // ✅ Update only required fields (avoid revalidating full doc)
    await Bid.updateOne(
      { _id: bidId },
      {
        $set: {
          status: status,
          updatedAt: new Date(),
          updatedBy: userId,
        },
      },
      { runValidators: false } // 🚫 prevents validation error from unrelated fields
    );

    // ✅ Fetch updated bid for response
    const updatedBid = await Bid.findById(bidId);

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      role: "shipper",
      data: {
        bookingId: updatedBid._id,
        status: updatedBid.status,
        bid: updatedBid,
      },
    });

  } catch (error) {
    console.error("Error cancelling bids:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while cancelling bids",
      error: error.message,
    });
  }
};
