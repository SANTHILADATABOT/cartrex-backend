const path = require("path");
const fs = require("fs");
const Shipper = require('../../models/Shipper');
const Carrier = require('../../models/Carrier');
const User = require('../../models/User');
const Bid = require('../../models/Bid');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Space = require('../../models/Space')


// bids 

exports.getBidsByCarrierUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { pickupLocation, deliveryLocation, pickupDate } = req.body || {};

    // 1️⃣ Check if user exists
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const CARRIER_ROLE_ID = "68ff5689aa5d489915b8caa8";

    if (String(user.role) !== String(CARRIER_ROLE_ID))
      return res.status(400).json({ success: false, message: "User is not a carrier" });

    // 2️⃣ Get carrier details
    const carrier = await Carrier.findOne({ userId, deletstatus: 0 });
    if (!carrier)
      return res.status(404).json({ success: false, message: "Carrier not found" });

    // 3️⃣ Build filter for bids
    const baseFilter = {
      //  "carrierRouteList.carrierId": carrier._id.toString(),
       "carrierRouteList.carrierId": carrier._id,
      // carrierId: carrier._id,
      deletstatus: 0,
    };

    const orConditions = [];

    if (pickupLocation) {
      orConditions.push({ "pickup.city": { $regex: new RegExp(pickupLocation, "i") } });
    }

    if (deliveryLocation) {
      orConditions.push({ "delivery.city": { $regex: new RegExp(deliveryLocation, "i") } });
    }

    if (pickupDate) {
      const date = new Date(pickupDate);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      orConditions.push({
        "pickup.pickupDate": { $gte: startOfDay, $lte: endOfDay },
      });
    }

    // ✅ Combine filters
    const finalFilter = orConditions.length
      ? { ...baseFilter, $or: orConditions }
      : baseFilter;


    // 4️⃣ Fetch bids
    const bids = await Bid.find(finalFilter)
      .populate({
        path: "shipperId",
        populate: { path: "userId", select: "firstName lastName" },
      })
      .populate({
        path: "carrierId",
        populate: { path: "userId", select: "firstName lastName" },
      })
      .populate({
        path: "truckforship",
      })
      .lean();

    bids.forEach((bid, i) => console.log(`🔹 Bid ${i + 1}:`, bid.pickup?.city, "→", bid.delivery?.city));

    // 5️⃣ Respond
    return res.status(200).json({
      success: true,
      count: bids.length,
      message: bids.length ? "Bids found" : "No bids found",
      data: bids,
    });

  } catch (error) {
    console.error("Error fetching bids:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getBidsByShipperUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // 1️⃣ Check if user exists
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    // Shipper role ObjectId (replace with your actual shipper role ID)
    const SHIPPER_ROLE_ID = '68ff5689aa5d489915b8caaa'; 

    // 2️⃣ Check if the user has a shipper role
    if (String(user.role) !== String(SHIPPER_ROLE_ID))
      return res.status(400).json({ success: false, message: 'User is not a shipper' });

    // 3️⃣ Find shipper details
    const shipper = await Shipper.findOne({ userId, deletstatus: 0 });
    if (!shipper)
      return res.status(404).json({ success: false, message: 'Shipper not found' });

    // 4️⃣ Find all bids created by this shipper
    const bids = await Bid.find({
      shipperId: shipper._id,
      deletstatus: 0
    })
      .populate({
        path: 'shipperId',
        select: 'companyName userId address',
        populate: { path: 'userId', select: 'firstName lastName' }
      })
      .populate({
        path: 'carrierId',
        select: 'companyName userId address',
        populate: { path: 'userId', select: 'firstName lastName' }
      })
      .populate({
        path: "truckforship",
      })
      .populate('routeId', 'origin destination status')
      .lean();

    // 5️⃣ Response
    return res.status(200).json({
      success: true,
      count: bids.length,
      message: bids.length ? 'Bids found' : 'No bids found for this shipper',
      data: bids
    });

  } catch (error) {
    console.error('❌ Error fetching bids by shipper:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.createBid = async (req, res) => {
  try {
    const data = req.body;
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
      statusUpdatedetails : []
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

    res.status(201).json({ 
      success: true,
      message: "Bid created Sucessfully ",
      data: bid });

  } catch (error) {
    console.error('Create bid error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message, test: req.body });
  }
};

exports.editBidDetails = async (req, res) => {
  try {
    const { bidId } = req.params; 
    const data = req.body;
    const files = req.files || [];
  
    const bid = await Bid.findById(bidId);
    if (!bid) {
      return res.status(404).json({ success: false, message: "Bid not found" });
    }

    const shipper = await Shipper.findOne({ userId: data?.userId });
    if (!shipper) {
      return res.status(404).json({ success: false, message: "Shipper not found", test: data });
    }

    const carrierRouteList = JSON.parse(data.carrierRouteList || "[]");
    const bidValuetaxinc = JSON.parse(data.bidValuetaxinc || "{}");
    const pickup = JSON.parse(data.pickup || "{}");
    const delivery = JSON.parse(data.delivery || "{}");
    const shippingInfo = JSON.parse(data.shippingInfo || "{}");
    const parsedVehicleDetails = JSON.parse(data.vehicleDetails || "{}");
    const removedImages = JSON.parse(data.removedImages || "[]"); 

    console.log('bid.vehicleDetails=>',bid.vehicleDetails)
    console.log('req.files=>',req.files)

  if (bid.vehicleDetails?.photos?.length > 0 && req.files && req.files.length > 0) {
    bid.vehicleDetails.photos.forEach((imgPath) => {
      // const fullPath = path.join(__dirname, `../..${imgPath}`);
      const cleanPath = imgPath.replace(/^\/+/, ""); 
      const fullPath = path.resolve(__dirname, "..", cleanPath);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (err) {
          console.error(`Error deleting file ${fullPath}:`, err);
        }
      }
    });
    bid.vehicleDetails.photos = [];
  }

  const uploadDir = path.join(__dirname, "../../uploads/bid");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const newPhotoPaths = [];
  if (req.files && req.files.length > 0 && bid.vehicleDetails?.photos?.length !== 0) {
      req.files.forEach((file, index) => {
        const ext = path.extname(file.originalname);
        // const baseName = path.basename(file.originalname, ext);
        const newFilename = `vehicle${index + 1}_${bid._id}${ext}`;
        const newPath = path.join(path.dirname(file.path), newFilename);

        fs.renameSync(file.path, newPath);
        newPhotoPaths.push(`/uploads/bid/${newFilename}`);
      });
    }
  if(newPhotoPaths){

    bid.vehicleDetails.photos = [...bid.vehicleDetails.photos, ...newPhotoPaths];
  }
   
    bid.shipperId = bid.shipperId || shipper._id;
    bid.userId = data.userId;
    bid.carrierRouteList = carrierRouteList;
    bid.carrierId = bid.carrierId;
    bid.bidValue = data.bidValue ?? bid.bidValue;
    bid.bidValuetaxinc = bidValuetaxinc ?? bid.bidValuetaxinc;
    bid.vehicleDetails = { ...bid.vehicleDetails, ...parsedVehicleDetails };
    bid.shippingDescription = shippingInfo?.whatIsBeingShipped ?? bid.shippingDescription;
    bid.transportType = data.transportType ?? bid.transportType;
    bid.vinNumber = data.vinNumber ?? bid.vinNumber;
    bid.lotNumber = data.lotNumber ?? bid.lotNumber;
    bid.pickup = { ...bid.pickup, ...pickup };
    bid.delivery = { ...bid.delivery, ...delivery };
    bid.shippingInfo = { ...bid.shippingInfo, ...shippingInfo };
    bid.timing = data.timing ?? bid.timing;
    bid.updatedBy = data.userId;
    bid.updatedAt = new Date();
    bid.ipAddress = req.ip;
    bid.userAgent = req.get("User-Agent");
    bid.statusUpdatedetails= bid.statusUpdatedetails ?? []
    await bid.save();

    res.status(200).json({
      success: true,
      message: "Bid updated successfully",
      data: bid,
      dirname: __dirname,
    });

  } catch (error) {
    console.error("Edit bid error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
      test: req.body
    });
  }
};
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

    const updatedBid = await Bid.findById(bidId);
    updatedBid.addtionalfee  = data.addtionalfee;
    updatedBid.conformpickupDate = data.conformpickupDate;
    updatedBid.estimateDeliveryDate = data.estimateDeliveryDate;
    updatedBid.estimateDeliveryWindow = data.estimateDeliveryWindow;
    updatedBid.message = data.message;
    updatedBid.truckforship = data.truckforship;
    updatedBid.status = data.status;
    if (!Array.isArray(updatedBid.statusUpdatedetails)) {
      // Case 1: If it is an object (not array), convert to array
      if (updatedBid.statusUpdatedetails && typeof updatedBid.statusUpdatedetails === "object") {
        updatedBid.statusUpdatedetails = [updatedBid.statusUpdatedetails];
      } 
      // Case 2: null, undefined, string, empty, missing → set empty array
      else {
        updatedBid.statusUpdatedetails = [];
      }
    }
    updatedBid.statusUpdatedetails.push({
      updatedAt: new Date(),
      status: data.status
    });
    updatedBid.updatedAt = new Date();
    await updatedBid.save();
    return res.status(200).json({
      success: true,
      message: "Bid status updated successfully",
      data: updatedBid,
    });

  } catch (error) {
    console.error("Error updating Bid status:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating Bid status",
      error: error.message,
    });
  }
};

exports.updatebidstatus = async (req, res) => {
  try {
    const { userId, bidId } = req.params;
    const { status } = req.body; 

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(bidId)) {
      return res.status(400).json({ success: false, message: "Invalid userId or bidId" });
    }

    const carrier = await Carrier.findOne({ userId });
    if (!carrier) {
      return res.status(404).json({ success: false, message: "Carrier not found" });
    }
    const bidData = await Bid.findOne({ _id: bidId, "carrierRouteList.carrierId": carrier._id, });
    if (!bidData) {
      return res.status(404).json({ success: false, message: "Bid not found for this carrier" });
    }

    bidData.status = status;
    bidData.updatedAt = new Date();
    if (!Array.isArray(bidData.statusUpdatedetails)) {

      // Case 1: If it is an object (not array), convert to array
      if (bidData.statusUpdatedetails && typeof bidData.statusUpdatedetails === "object") {
        bidData.statusUpdatedetails = [bidData.statusUpdatedetails];
      } 
      // Case 2: null, undefined, string, empty, missing → set empty array
      else {
        bidData.statusUpdatedetails = [];
      }
    }
    bidData.statusUpdatedetails.push({
      updatedAt: new Date(),
      status: status
    });
    if (status === "in_progress") {
      bidData.statusUpdatedetails.push({
        updatedAt: new Date(),
        status: "Reach"
      });
    }
    await bidData.save();

    return res.status(200).json({
      success: true,
      message: "Bid status updated successfully",
      data: bidData,
    });

  } catch (error) {
    console.error("Error updating Bid status:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating Bid status",
      error: error.message,
    });
  }
};