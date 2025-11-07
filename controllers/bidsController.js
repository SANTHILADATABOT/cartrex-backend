const Bid = require('../models/Bid');
const Shipper = require('../models/Shipper');
const Carrier = require('../models/Carrier');
const Booking = require('../models/Booking');
const { v4: uuidv4 } = require('uuid');

exports.createBid = async (req, res) => {
  try {
    const shipper = await Shipper.findOne({ userId: req.user._id });
    const { spaceId, carrierId, route, vehicle, bidAmount, pickupDate, deliveryDate, additionalDetails } = req.body;

    const bidId = `BD-${uuidv4().substring(0, 8).toUpperCase()}`;
    const expiryDate = new Date(); expiryDate.setDate(expiryDate.getDate() + 7);

    const bid = await Bid.create({ bidId, shipperId: shipper._id, carrierId, spaceId, route, vehicle, bidAmount, pickupDate, deliveryDate, additionalDetails, expiryDate, status: 'open' });

    res.status(201).json({ success: true, data: bid });
  } catch (error) {
    console.error('Create bid error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
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

// exports.acceptBid = async (req, res) => {
//   try {
//     const { truckId, additionalFee, pickupDate, deliveryDate, message } = req.body;
//     const bid = await Bid.findById(req.params.id);
//     if (!bid) return res.status(404).json({ success: false, message: 'Bid not found' });
//     if (bid.status !== 'open') return res.status(400).json({ success: false, message: 'Bid is no longer available' });

//     const carrier = await Carrier.findOne({ userId: req.user._id });

//     bid.status = 'approved'; bid.approvedBy = carrier._id; bid.updatedAt = Date.now();
//     await

//update status by user id 
const mongoose = require('mongoose');
const Bid = require('../../models/Bid');
const Shipper = require('../../models/Shipper');
const User = require('../../models/User');

exports.updateBidStatusByUserId = async (req, res) => {
  try {
    const { userId, bidId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(bidId)) {
      return res.status(400).json({ success: false, message: "Invalid userId or bidId" });
    }
    const user = await User.findById(userId).populate('role');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role.name.toLowerCase() !== 'shipper') {
      return res.status(403).json({ success: false, message: "Only shippers can cancel bids" });
    }

    const shipper = await Shipper.findOne({ userId });
    if (!shipper) {
      return res.status(404).json({ success: false, message: "No shipper found for this user" });
    }

    const bid = await Bid.findOne({ _id: bidId, shipperId: shipper._id, deletstatus: 0 });
    if (!bid) {
      return res.status(404).json({ success: false, message: "Bid not found or not owned by this shipper" });
    }

    bid.status = "cancelled";
    bid.updatedAt = new Date();
    bid.updatedBy = userId;
    await bid.save();


    return res.status(200).json({
      success: true,
      message: "Bid status updated to cancelled successfully",
      role: user.role.name,
      data: {
        bidId: bid._id,
        status: bid.status
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
