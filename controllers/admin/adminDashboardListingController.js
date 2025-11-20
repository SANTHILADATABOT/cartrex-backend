const Booking = require('../../models/Booking');
const Bid = require('../../models/Bid');
const Truck = require('../../models/Truck');
const Shipper = require('../../models/Shipper');
const mongoose = require('mongoose');

// get all bookings and bids status:completed

exports.getallcompletedbookingsandbids = async (req, res) => {
  try {


    const completedbids = await Bid.find({ status: "completed", deletstatus: 0 })

      .populate("shipperId")
      .populate("carrierId")
      .populate("routeId")
      .populate("userId")
      .sort({ createdAt: -1 });

    const completedBookings = await Booking.find({ status: "completed", deletstatus: 0 })

      .populate("shipperId", "name email phone")
      .populate("carrierId", "companyName phone")
      .populate("truckId", "nickname registrationNumber truckType")
      .populate("spaceId")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Completed bookings fetched successfully",
      data: {
        totalCompletedbids: completedbids.length,
        totalCompletedBookings: completedBookings.length,
        bids: completedbids,
        bookings: completedBookings
      }
    });

  } catch (error) {
    console.error("Get completed bookings error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};


exports.getdashboardcounts = async (req, res) => {
  try {

    const totalShippers = await Shipper.countDocuments({ deletstatus: 0 });

    const activeShippers = await Shipper.countDocuments({
      status: "active",
      deletstatus: 0
    });
    const totalTrucks = await Truck.countDocuments({ deletstatus: 0 });

  
    const totalBookings = await Booking.countDocuments({ deletstatus: 0 });

    return res.status(200).json({
      success: true,
      message: "Counts of TotalShippers,ActiveShippers,TotalTrucks,TotalBookings fetched successfully",
      count:
      {totalShippers,
      activeShippers,
      totalTrucks,
      totalBookings}
    });

  } catch (error) {
    console.error("Dashboard count error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching counts",
      error: error.message
    });
  }
};
