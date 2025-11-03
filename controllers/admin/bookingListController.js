const Booking = require('../../models/Booking');
const mongoose = require('mongoose');

const User = require("../../models/User");

// ✅ GET all bookings (only active ones)

exports.getallbookings = async (req, res) => {
  try {
    const {status,carrier,shipper} = req.query;
     const filter = {deletstatus: 0};
      if (status) {
        if (status === "all") {
          filter.status = { $in: ['confirmed','pending','in_progress','cancelled','completed'] }; // both
        } else {
          filter.status = status;
        }
      }
      if (carrier && carrier !== "all") {
        filter.carrierId = carrier;
      }
      if (shipper && shipper !== "all") {
        filter.shipperId = shipper;
      }
      console.log('filter=>',filter)
    const bookings = await Booking.find(filter)
      .populate({
        path: "carrierId",
        populate: {
          path: "userId",
          select: "firstName lastName email"
        }
      })
      .populate({
        path: "shipperId",
        populate: {
          path: "userId",
          select: "firstName lastName email"
        }
      })
      .sort({ createdAt: -1 });

    if (!bookings.length) {
      return res.status(200).json({
        success: true,
        message: "No bookings found",
        data: []
      });
    }

    return res.status(200).json({
      success: true,
      count: bookings.length,
      message: "Bookings fetched successfully",
      data: bookings
    });

  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};


exports.getbookingbyId = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate({
        path: 'carrierId',
        populate: {
          path: 'userId',
          model: 'User',
          select: 'firstName lastName email phone'
        }
      })
      .populate({
        path: 'shipperId',
        populate: {
          path: 'userId',
          model: 'User',
          select: 'firstName lastName email phone'
        }
      });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({ message: 'Booking fetched successfully', data: booking });
  } catch (error) {
    console.error('Error fetching booking by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// ✅ SOFT DELETE booking (set deletstatus = 1)
exports.deletebooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }

    const booking = await Booking.findOne({ _id: bookingId, deletstatus: 0 });
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found or already deleted" });
    }

    booking.deletstatus = 1;
    booking.deletedAt = new Date();
    booking.deletedBy = req.user?._id || null;
    booking.deletedipAddress = req.ip;

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
      data: booking
    });

  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.updatebookingold = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const updateData = req.body;

    // Validate booking ID
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Update booking fields if any
    Object.keys(updateData).forEach(f => {
      if (!["carrierId", "shipperId"].includes(f) && updateData[f] !== undefined) {
        booking[f] = updateData[f];
      }
    });

    // If carrier info is passed
    if (updateData.carrierId?.userId) {
      const carrierUserId = booking.carrierId?.userId || updateData.carrierId.userId._id;
      if (carrierUserId) {
        await User.findByIdAndUpdate(
          carrierUserId,
          {
            firstName: updateData.carrierId.userId.firstName,
            lastName: updateData.carrierId.userId.lastName,
            email: updateData.carrierId.userId.email,
            phone: updateData.carrierId.userId.phone,
          },
          { new: true }
        );
      }
    }

    // Same logic can be added for shipperId if needed
    if (updateData.shipperId?.userId) {
      const shipperUserId = booking.shipperId?.userId || updateData.shipperId.userId._id;
      if (shipperUserId) {
        await User.findByIdAndUpdate(
          shipperUserId,
          {
            firstName: updateData.shipperId.userId.firstName,
            lastName: updateData.shipperId.userId.lastName,
            email: updateData.shipperId.userId.email,
            phone: updateData.shipperId.userId.phone,
          },
          { new: true }
        );
      }
    }

    // Save the booking changes
    await booking.save();

    // Populate and return updated booking
    const populatedBooking = await Booking.findById(bookingId)
      .populate({
        path: "carrierId",
        populate: { path: "userId", select: "firstName lastName email phone" },
      })
      .populate({
        path: "shipperId",
        populate: { path: "userId", select: "firstName lastName email phone" },
      })
      .populate({
        path: "truckId",
        select: "nickname truckNumber location capacity type",
      });

    res.status(200).json({
      success: true,
      message: "Booking and carrier details updated successfully",
      data: populatedBooking,
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


exports.updatebooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const updateData = req.body;

    // ✅ Validate booking ID
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }

    // ✅ Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // ✅ Update only specific fields safely
    if (updateData.pickup) {
      booking.pickup.location = updateData.pickup.location || booking.pickup.location;
      booking.pickup.pickupDate = updateData.pickup.pickupDate || booking.pickup.pickupDate;
    }

    if (updateData.delivery) {
      booking.delivery.location = updateData.delivery.location || booking.delivery.location;
    }

    if (updateData.status) {
      booking.status = updateData.status;
    }
    booking.carrierId = updateData.carrierId;
    booking.shipperId = updateData.shipperId;
    booking.truckId = updateData.truckId;
    
    // ✅ Optional: track who updated and when
    booking.updatedAt = new Date();
    if (req.user?._id) booking.updatedBy = req.user._id;

    // ✅ Save changes
    await booking.save();

    // ✅ Populate related data and return response
    const populatedBooking = await Booking.findById(bookingId)
      .populate({
        path: "carrierId",
        populate: { path: "userId", select: "firstName lastName email phone" },
      })
      .populate({
        path: "shipperId",
        populate: { path: "userId", select: "firstName lastName email phone" },
      })
      .populate({
        path: "truckId",
        select: "nickname truckNumber location capacity type",
      });

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: populatedBooking,
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


exports.updateStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const updateData = req.body;

    // Allowed status values
    const allowedStatuses = ["pending", "confirmed", "in_progress", "completed", "cancelled"];

    // Validate status
    if (updateData.status && !allowedStatuses.includes(updateData.status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Prepare update fields with audit details
    const auditFields = {
      ...updateData,
      updatedAt: new Date(),
      updatedBy: updateData.updatedBy,
      updated_ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
    };

    // Update booking document
    const updatedBooking = await Booking.findByIdAndUpdate(bookingId, auditFields, {
      new: true,
      runValidators: true,
    });

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({
      message: "Booking status updated successfully",
      updatedBooking,
    });
  } catch (error) {
    console.error("Booking status update error:", error);
    res.status(500).json({
      message: "Error updating booking status",
      error: error.message,
    });
  }
};


