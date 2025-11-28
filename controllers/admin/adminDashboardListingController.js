const Booking = require('../../models/Booking');
const Bid = require('../../models/Bid');
const Truck = require('../../models/Truck');
const Shipper = require('../../models/Shipper');
const Carrier = require('../../models/Carrier')
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

const monthShort = [
  "", // dummy
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

exports.getdashboardcounts = async (req, res) => {
  try {

    const totalShippers = await Shipper.countDocuments({ deletstatus: 0 });

    const activeShippers = await Shipper.countDocuments({
      status: "active",
      deletstatus: 0
    });

    const totalTrucks = await Truck.countDocuments({ deletstatus: 0 });

  
    const totalBookings = await Booking.countDocuments({ deletstatus: 0 });
 
    
   const shipperAgg = await Shipper.aggregate([
      { $match: { deletstatus: 0 ,status: "active" , $expr: { $eq: [ { $year: "$createdAt" }, 2025 ] }  } },
      { $group: { _id: { month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.month": 1 } }
    ]);

 
    const carrierAgg = await Carrier.aggregate([
      { $match: { deletstatus: 0, status: "active" , $expr: { $eq: [ { $year: "$createdAt" }, 2025 ] }  } },
      { $group: { _id: { month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.month": 1 } }
    ]);

  
    const shipperMap = {};
    shipperAgg.forEach(i => { shipperMap[i._id.month] = i.count });

    const carrierMap = {};
    carrierAgg.forEach(i => { carrierMap[i._id.month] = i.count });

    
    const monthlyData = [];

    for (let m = 1; m <= 12; m++) {
      monthlyData.push({
        month: monthShort[m],
        shippers: shipperMap[m] || 0,
        carriers: carrierMap[m] || 0
      });
    }
    const now = new Date();
        // Current Year Range
    const startCurrent = new Date(now.getFullYear(), 0, 1);
    const endCurrent = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    
    // Last Year Range
    const lastYear = now.getFullYear() - 1;
    const startLast = new Date(lastYear, 0, 1);
    const endLast = new Date(lastYear, 11, 31, 23, 59, 59);

    // Function to calculate total
    async function getTotal(startDate, endDate) {
      const result = await Booking.aggregate([
        {
          $match: {
            deletstatus: 0,
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            totalPrice: { $sum: { $toDouble: "$bookValuetaxinc.total" } }
          }
        }
      ]);

      return result.length ? result[0].totalPrice : 0;
    }

    // Get totals
    const currentYearTotal = await getTotal(startCurrent, endCurrent);
    const lastYearTotal = await getTotal(startLast, endLast);

    // Percentage calculation
    let percentageChange = 0;

    if (lastYearTotal > 0) {
      percentageChange = ((currentYearTotal - lastYearTotal) / lastYearTotal) * 100;
    }

    // Format to 2 decimals
    percentageChange = Number(percentageChange.toFixed(2));

    return res.status(200).json({
      success: true,
      message: "Counts of TotalShippers,ActiveShippers,TotalTrucks,TotalBookings fetched successfully",
      count:
      {totalShippers,
      activeShippers,
      totalTrucks,
      totalBookings},
      Totalearning:{currentYearTotal,percentageChange},
      monthly_data: monthlyData
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
