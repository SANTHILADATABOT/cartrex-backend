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

      .populate("shipperId", " companyName name email phone")
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
  "", // dummy index
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// // Function for total yearly bookings
// async function getTotal(startDate, endDate) {
//   const result = await Booking.aggregate([
//     {
//       $match: {
//         deletstatus: 0,
//         status: { $in: ["completed", "delivered"] },
//         createdAt: { $gte: startDate, $lte: endDate }
//       }
//     },
//     {
//       $group: {
//         _id: null,
//         totalPrice: { $sum: { $toDouble: "$bookValuetaxinc.total" } }
//       }
//     }
//   ]);

//   return result.length ? result[0].totalPrice : 0;
// }

// exports.getdashboardcounts = async (req, res) => {
//   try {
//     const now = new Date();

//     // Total counts
//     const totalShippers = await Shipper.countDocuments({ deletstatus: 0 });
//     const totalCarriers = await Carrier.countDocuments({ deletstatus: 0 });

//     const activeShippers = await Shipper.countDocuments({ status: "active", deletstatus: 0 });
//     const activeCarriers = await Carrier.countDocuments({ status: "active", deletstatus: 0 });

//     const totalTrucks = await Truck.countDocuments({ deletstatus: 0 });
//     const totalBookings = await Booking.countDocuments({ deletstatus: 0 });

//     // SHIPPER Aggregation for year
//     const shipperAgg = await Shipper.aggregate([
//       { $match: { deletstatus: 0, status: "active", $expr: { $eq: [{ $year: "$createdAt" }, now.getFullYear()] } } },
//       { $group: { _id: { month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
//       { $sort: { "_id.month": 1 } }
//     ]);

//     // CARRIER Aggregation for year
//     const carrierAgg = await Carrier.aggregate([
//       { $match: { deletstatus: 0, status: "active", $expr: { $eq: [{ $year: "$createdAt" }, now.getFullYear()] } } },
//       { $group: { _id: { month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
//       { $sort: { "_id.month": 1 } }
//     ]);

//     // BOOKING Aggregation for year
//     const bookingAgg = await Booking.aggregate([
//       {
//         $match: {
//           deletstatus: 0,
//           status: { $in: ["completed", "delivered"] },
//           $expr: { $eq: [{ $year: "$createdAt" }, now.getFullYear()] }
//         }
//       },
//       {
//         $group: {
//           _id: { month: { $month: "$createdAt" } },
//           total: { $sum: { $toDouble: "$bookValuetaxinc.total" } }
//         }
//       },
//       { $sort: { "_id.month": 1 } }
//     ]);

//     // BID Aggregation for year
//     const bidAgg = await Bid.aggregate([
//       {
//         $match: {
//           deletstatus: 0,
//           status: { $in: ["completed", "delivered"] },
//           $expr: { $eq: [{ $year: "$createdAt" }, now.getFullYear()] }
//         }
//       },
//       {
//         $group: {
//           _id: { month: { $month: "$createdAt" } },
//           total: { $sum: { $toDouble: "$bidValuetaxinc.total" } }
//         }
//       },
//       { $sort: { "_id.month": 1 } }
//     ]);

//     // Map monthly values
//     const shipperMap = {}, carrierMap = {}, bookingMap = {}, bidMap = {};

//     shipperAgg.forEach(i => shipperMap[i._id.month] = i.count);
//     carrierAgg.forEach(i => carrierMap[i._id.month] = i.count);
//     bookingAgg.forEach(i => bookingMap[i._id.month] = i.total);
//     bidAgg.forEach(i => bidMap[i._id.month] = i.total);

//     const monthlyData = [];
//     const earningsChartData = [];
//     const bookingsChartData = [];
//     const bidsChartData = [];

//     for (let m = 1; m <= 12; m++) {
//       monthlyData.push({
//         month: monthShort[m],
//         shippers: shipperMap[m] || 0,
//         carriers: carrierMap[m] || 0
//       });
//     }

//     for (let m = 1; m <= 12; m++) {
//       const bookingTotal = bookingMap[m] || 0;
//       const bidTotal = bidMap[m] || 0;
//       const total = bookingTotal + bidTotal;

//       earningsChartData.push({ month: monthShort[m], earnings: total });
//       bookingsChartData.push({ month: monthShort[m], earnings: bookingTotal });
//       bidsChartData.push({ month: monthShort[m], earnings: bidTotal });
//     }

//     // CURRENT YEAR VS LAST YEAR EARNINGS
//     const startCurrent = new Date(now.getFullYear(), 0, 1);
//     const endCurrent = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

//     const lastYear = now.getFullYear() - 1;
//     const startLast = new Date(lastYear, 0, 1);
//     const endLast = new Date(lastYear, 11, 31, 23, 59, 59);

//     const currentYearBookings = await getTotal(startCurrent, endCurrent);

//     const currentYearBids = await Bid.aggregate([
//       {
//         $match: {
//           deletstatus: 0,
//           status: { $in: ["completed", "delivered"] },
//           createdAt: { $gte: startCurrent, $lte: endCurrent }
//         }
//       },
//       { $group: { _id: null, totalAmount: { $sum: { $toDouble: "$bidAmount" } } } }
//     ]);

//     const currentYearTotal =
//       currentYearBookings +
//       (currentYearBids.length ? currentYearBids[0].totalAmount : 0);

//     const lastYearTotal = await getTotal(startLast, endLast);

//     let percentageChange = lastYearTotal > 0
//       ? Number((((currentYearTotal - lastYearTotal) / lastYearTotal) * 100).toFixed(2))
//       : 0;

//     // ---------------- NEW REQUIREMENTS BELOW ----------------

//     const startCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//     const endCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

//     const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//     const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

//     const percent = (curr, prev) =>
//       prev > 0 ? Number((((curr - prev) / prev) * 100).toFixed(2)) : 0;

//     // BOOKINGS THIS MONTH
//     const bookingCurr = await Booking.aggregate([
//       {
//         $match: {
//           deletstatus: 0,
//           status: { $in: ["completed", "delivered"] },
//           createdAt: { $gte: startCurrentMonth, $lte: endCurrentMonth }
//         }
//       },
//       { $group: { _id: null, total: { $sum: { $toDouble: "$bookValuetaxinc.total" } }, count: { $sum: 1 } } }
//     ]);

//     const bookingLast = await Booking.aggregate([
//       {
//         $match: {
//           deletstatus: 0,
//           status: { $in: ["completed", "delivered"] },
//           createdAt: { $gte: startLastMonth, $lte: endLastMonth }
//         }
//       },
//       { $group: { _id: null, total: { $sum: { $toDouble: "$bookValuetaxinc.total" } }, count: { $sum: 1 } } }
//     ]);

//     const currentMonthBookingTotal = bookingCurr[0]?.total || 0;
//     const lastMonthBookingTotal = bookingLast[0]?.total || 0;

//     const currentMonthBookingCount = bookingCurr[0]?.count || 0;
//     const lastMonthBookingCount = bookingLast[0]?.count || 0;

//     // BIDS THIS MONTH
//     const bidCurr = await Bid.aggregate([
//       {
//         $match: {
//           deletstatus: 0,
//           status: { $in: ["completed", "delivered"] },
//           createdAt: { $gte: startCurrentMonth, $lte: endCurrentMonth }
//         }
//       },
//       { $group: { _id: null, total: { $sum: { $toDouble: "$bidValuetaxinc.total" } }, count: { $sum: 1 } } }
//     ]);

//     const bidLast = await Bid.aggregate([
//       {
//         $match: {
//           deletstatus: 0,
//           status: { $in: ["completed", "delivered"] },
//           createdAt: { $gte: startLastMonth, $lte: endLastMonth }
//         }
//       },
//       { $group: { _id: null, total: { $sum: { $toDouble: "$bidValuetaxinc.total" } }, count: { $sum: 1 } } }
//     ]);

//     const currentMonthBidTotal = bidCurr[0]?.total || 0;
//     const lastMonthBidTotal = bidLast[0]?.total || 0;

//     const currentMonthBidCount = bidCurr[0]?.count || 0;
//     const lastMonthBidCount = bidLast[0]?.count || 0;

//     // TOTAL EARNINGS THIS MONTH
//     const currentMonthTotalEarnings = currentMonthBookingTotal + currentMonthBidTotal;
//     const lastMonthTotalEarnings = lastMonthBookingTotal + lastMonthBidTotal;

//     // MONTH WISE % CHANGES
//     const earningsPercent = percent(currentMonthTotalEarnings, lastMonthTotalEarnings);
//     const bookingPercent = percent(currentMonthBookingCount, lastMonthBookingCount);
//     const bidPercent = percent(currentMonthBidCount, lastMonthBidCount);

//     // SHIPPERS
//     const newShippers = await Shipper.countDocuments({ deletstatus: 0, createdAt: { $gte: startCurrentMonth, $lte: endCurrentMonth } });
//     const oldShippers = await Shipper.countDocuments({ deletstatus: 0, createdAt: { $gte: startLastMonth, $lte: endLastMonth } });
//     const shipperPercent = percent(newShippers, oldShippers);

//     // CARRIERS
//     const newCarriers = await Carrier.countDocuments({ deletstatus: 0, createdAt: { $gte: startCurrentMonth, $lte: endCurrentMonth } });
//     const oldCarriers = await Carrier.countDocuments({ deletstatus: 0, createdAt: { $gte: startLastMonth, $lte: endLastMonth } });
//     const carrierPercent = percent(newCarriers, oldCarriers);

//     // ----------- FINAL RESPONSE --------------

//     return res.statusCode = 200, res.json({
//       success: true,
//       message: "Dashboard data fetched successfully",

//       count: {
//         totalShippers,
//         activeShippers,
//         totalCarriers,
//         activeCarriers,
//         totalTrucks,
//         totalBookings,
//          totalEarnings: currentMonthTotalEarnings,
//       },

//       Totalearning: { currentYearTotal, percentageChange },

//       monthly_data: monthlyData,
//       earningsChartData,
//       bookingsChartData,
//       bidsChartData,

//       thisMonth: {
//         totalEarnings: currentMonthTotalEarnings,
//         bookingTotal: currentMonthBookingTotal,
//         bidTotal: currentMonthBidTotal,
//         bookingCount: currentMonthBookingCount,
//         bidCount: currentMonthBidCount
//       },

//       percentageChangeMonthwise: {
//         earningsPercent,
//         bookingPercent,
//         bidPercent,
//         shipperPercent,
//         carrierPercent
//       }


//     });   

//   } catch (error) {
//     console.error("Dashboard count error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching counts",
//       error: error.message
//     });
//   }
// };



//Generate date ranges
function getDateRangeLast12Months() {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 12); // correct last 12 months
  return { start, end };
}


function getDateRangeLast30Days() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return { start, end };
}
//user Start calculation
async function getUserStats(Model, start, end, filter) {
  const total = await Model.countDocuments({ deletstatus: 0 }); // total all-time

  let active;
  if (filter === "12months") {
    active = await Model.countDocuments({ deletstatus: 0, status: "active" });
  } else {
    active = await Model.countDocuments({
      deletstatus: 0,
      status: "active",
      createdAt: { $gte: start, $lte: end }
    });
  }

  const created = await Model.countDocuments({
    deletstatus: 0,
    createdAt: { $gte: start, $lte: end }
  });

  return { total, active, created };
}



//Percentage Calculation
function calcPercent(curr, prev) {
  if (prev === 0 && curr === 0) return 0;
  if (prev === 0) return 100;
  return Number((((curr - prev) / prev) * 100).toFixed(2));
}

//Build Last 12 Months List
function buildLast12MonthsLabels() {
  const labels = [];
  const now = new Date();
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  for (let i = 11; i >= 0; i--) {
    let d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(months[d.getMonth()]);
  }

  return labels;
}

//Build Last 30 Days X-axis
function buildLast30DaysLabels() {
  const labels = [];
  const now = new Date();

  for (let i = 30; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    labels.push(d.toLocaleDateString("en-US", { day: "2-digit", month: "short" }));
  }
  return labels;
}


//Count per-day or per-month
async function aggregateByDate(Model, start, end, groupBy = "month") {
  return await Model.aggregate([
    {
      $match: {
        deletstatus: 0,
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: groupBy === "month"
          ? { month: { $month: "$createdAt" } }
          : {
            day: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            }
          },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
}

// const getUserDashboardData = async (filter) => {
//   let range, labels, groupType;

//   if (filter === "12months") {
//     range = getDateRangeLast12Months();
//     labels = buildLast12MonthsLabels();
//     groupType = "month";
//   } else {
//     range = getDateRangeLast30Days();
//     labels = buildLast30DaysLabels();
//     groupType = "day";
//   }

//   const currShippers = await getUserStats(Shipper, range.start, range.end);
//   const currCarriers = await getUserStats(Carrier, range.start, range.end);

//   let prevStart = new Date(range.start);
//   let prevEnd = new Date(range.start);
//   prevStart.setDate(prevStart.getDate() - (filter === "12months" ? 365 : 30));
//   prevEnd.setDate(prevEnd.getDate() - 1);

//   const prevShippers = await getUserStats(Shipper, prevStart, prevEnd);
//   const prevCarriers = await getUserStats(Carrier, prevStart, prevEnd);

//   const shipperPercent = calcPercent(currShippers.created, prevShippers.created);
//   const carrierPercent = calcPercent(currCarriers.created, prevCarriers.created);

//   const shipperAgg = await aggregateByDate(Shipper, range.start, range.end, groupType);
//   const carrierAgg = await aggregateByDate(Carrier, range.start, range.end, groupType);

//   const chartData = labels.map(label => ({
//     label,
//     shippers: 0,
//     carriers: 0
//   }));

//   const monthShort = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
//   if (groupType === "month") {
//     shipperAgg.forEach(i => {
//       chartData[labels.indexOf(monthShort[i._id.month - 1])].shippers = i.count;
//     });
//     carrierAgg.forEach(i => {
//       chartData[labels.indexOf(monthShort[i._id.month - 1])].carriers = i.count;
//     });
//   } else {
//     shipperAgg.forEach(i => {
//       const label = new Date(i._id.day).toLocaleDateString("en-US", { day: "2-digit", month: "short" });
//       chartData[labels.indexOf(label)].shippers = i.count;
//     });
//     carrierAgg.forEach(i => {
//       const label = new Date(i._id.day).toLocaleDateString("en-US", { day: "2-digit", month: "short" });
//       chartData[labels.indexOf(label)].carriers = i.count;
//     });
//   }

//   return {
//     labels,
//     chartData,
//     totals: {
//        percentage: {
//       shipper: shipperPercent,
//       carrier: carrierPercent
//     },
//       shippers: currShippers.total,
//       carriers: currCarriers.total,
//       activeShippers: currShippers.active,
//       activeCarriers: currCarriers.active,
//       createdShippers: currShippers.created,
//       createdCarriers: currCarriers.created
//     },
   
//   };
// };
const getUserDashboardData = async (filter) => {
  let range, labels, groupType;

  if (filter === "12months") {
    range = getDateRangeLast12Months(); // last year
    labels = buildLast12MonthsLabels();
    groupType = "month";
  } else {
    range = getDateRangeLast30Days(); // last 30 days
    labels = buildLast30DaysLabels();
    groupType = "day";
  }

  // Current period stats
  const currShippers = await getUserStats(Shipper, range.start, range.end,filter);
  const currCarriers = await getUserStats(Carrier, range.start, range.end,filter);

  // Previous period stats
  if (filter === "12months") {
  prevStart = new Date(range.start);
  prevStart.setFullYear(prevStart.getFullYear() - 1);
  prevEnd = new Date(range.end);
  prevEnd.setFullYear(prevEnd.getFullYear() - 1);
} else {
  prevStart = new Date(range.start);
  prevStart.setDate(prevStart.getDate() - 30);
  prevEnd = new Date(range.end);
  prevEnd.setDate(prevEnd.getDate() - 30);
}

  const prevShippers = await getUserStats(Shipper, prevStart, prevEnd,filter);
  const prevCarriers = await getUserStats(Carrier, prevStart, prevEnd,filter);

  // Percentage change calculation
  const shipperPercent = calcPercent(currShippers.active, prevShippers.active);
  const carrierPercent = calcPercent(currCarriers.active, prevCarriers.active);

  // Aggregate chart data (optional)
  const shipperAgg = await aggregateByDate(Shipper, range.start, range.end, groupType);
  const carrierAgg = await aggregateByDate(Carrier, range.start, range.end, groupType);

  const chartData = labels.map(label => ({
    label,
    shippers: 0,
    carriers: 0
  }));

  const monthShort = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  if (groupType === "month") {
    shipperAgg.forEach(i => {
      chartData[labels.indexOf(monthShort[i._id.month - 1])].shippers = i.count;
    });
    carrierAgg.forEach(i => {
      chartData[labels.indexOf(monthShort[i._id.month - 1])].carriers = i.count;
    });
  } else {
    shipperAgg.forEach(i => {
      const label = new Date(i._id.day).toLocaleDateString("en-US", { day: "2-digit", month: "short" });
      chartData[labels.indexOf(label)].shippers = i.count;
    });
    carrierAgg.forEach(i => {
      const label = new Date(i._id.day).toLocaleDateString("en-US", { day: "2-digit", month: "short" });
      chartData[labels.indexOf(label)].carriers = i.count;
    });
  }

  return {
    labels,
    chartData,
    totals: {
      shippers: currShippers.total,
      carriers: currCarriers.total,
      activeShippers: currShippers.active,
      activeCarriers: currCarriers.active,
      createdShippers: currShippers.created,
      createdCarriers: currCarriers.created,
      percentage: {
        shipper: {
          value: shipperPercent,
          trend: shipperPercent > 0 ? "increase" : shipperPercent < 0 ? "decrease" : "no-change"
        },
        carrier: {
          value: carrierPercent,
          trend: carrierPercent > 0 ? "increase" : carrierPercent < 0 ? "decrease" : "no-change"
        }
      }
    }
  };
};

const getBookingDashboardData = async (filter) => {
  let range, labels, groupType;

  if (filter === "12months") {
    range = getDateRangeLast12Months();
    labels = buildLast12MonthsLabels();
    groupType = "month";
  } else {
    range = getDateRangeLast30Days();
    labels = buildLast30DaysLabels();
    groupType = "day";
  }

  // Current bookings (ready_for_pickup only)
  const currBookings = await Booking.countDocuments({
    deletstatus: 0,
    status: "ready_for_pickup",
    createdAt: { $gte: range.start, $lte: range.end }
  });

  // Previous period (ready_for_pickup only)
  let prevStart = new Date(range.start);
  let prevEnd = new Date(range.end);

  if (filter === "12months") {
    prevStart.setFullYear(prevStart.getFullYear() - 1);
    prevEnd.setFullYear(prevEnd.getFullYear() - 1);
  } else {
    prevStart.setDate(prevStart.getDate() - 30);
    prevEnd.setDate(prevEnd.getDate() - 30);
  }

  const prevBookings = await Booking.countDocuments({
    deletstatus: 0,
    status: "ready_for_pickup",
    createdAt: { $gte: prevStart, $lte: prevEnd }
  });

  // Percentage change
  const bookingPercent = calcPercent(currBookings, prevBookings);

  // Chart aggregation ONLY ready_for_pickup bookings
  const bookingAgg = await Booking.aggregate([
    {
      $match: {
        deletstatus: 0,
        status: "ready_for_pickup",
        createdAt: { $gte: range.start, $lte: range.end }
      }
    },
    {
      $group:
        groupType === "month"
          ? { _id: { month: { $month: "$createdAt" } }, count: { $sum: 1 } }
          : { _id: { day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } }, count: { $sum: 1 } }
    },
    { $sort: { "_id": 1 } }
  ]);

  const chartData = labels.map(label => ({ label, readyBookings: 0 }));

  if (groupType === "month") {
    const monthShort = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    bookingAgg.forEach(i => {
      const idx = labels.indexOf(monthShort[i._id.month - 1]);
      if (idx !== -1) chartData[idx].readyBookings = i.count;
    });
  } else {
    bookingAgg.forEach(i => {
      const label = new Date(i._id.day).toLocaleDateString("en-US", { day: "2-digit", month: "short" });
      const idx = labels.indexOf(label);
      if (idx !== -1) chartData[idx].readyBookings = i.count;
    });
  }

  return {
    labels,
    chartData,
    totals: {
      readyBookings: currBookings,
      percentage: {
        value: bookingPercent,
        trend: bookingPercent > 0 ? "increase" : bookingPercent < 0 ? "decrease" : "no-change"
      }
    }
  };
};
const getBidsDashboardData = async (filter) => {
  let range, labels, groupType;

  if (filter === "12months") {
    range = getDateRangeLast12Months();
    labels = buildLast12MonthsLabels();
    groupType = "month";
  } else {
    range = getDateRangeLast30Days();
    labels = buildLast30DaysLabels();
    groupType = "day";
  }

  // Current bids (ready_for_pickup only)
  const currBids = await Bid.countDocuments({
    deletstatus: 0,
    status: "ready_for_pickup",
    createdAt: { $gte: range.start, $lte: range.end }
  });

  // Previous period (ready_for_pickup only)
  let prevStart = new Date(range.start);
  let prevEnd = new Date(range.end);

  if (filter === "12months") {
    prevStart.setFullYear(prevStart.getFullYear() - 1);
    prevEnd.setFullYear(prevEnd.getFullYear() - 1);
  } else {
    prevStart.setDate(prevStart.getDate() - 30);
    prevEnd.setDate(prevEnd.getDate() - 30);
  }

  const prevBids = await Bid.countDocuments({
    deletstatus: 0,
    status: "ready_for_pickup",
    createdAt: { $gte: prevStart, $lte: prevEnd }
  });

  // Percentage change
  const bidPercent = calcPercent(currBids, prevBids);

  // Chart aggregation ONLY ready_for_pickup bids
  const bidsAgg = await Bid.aggregate([
    {
      $match: {
        deletstatus: 0,
        status: "ready_for_pickup",
        createdAt: { $gte: range.start, $lte: range.end }
      }
    },
    {
      $group:
        groupType === "month"
          ? { _id: { month: { $month: "$createdAt" } }, count: { $sum: 1 } }
          : { _id: { day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } }, count: { $sum: 1 } }
    },
    { $sort: { "_id": 1 } }
  ]);

  const chartData = labels.map(label => ({ label, readyBids: 0 }));

  if (groupType === "month") {
    const monthShort = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    bidsAgg.forEach(i => {
      const idx = labels.indexOf(monthShort[i._id.month - 1]);
      if (idx !== -1) chartData[idx].readyBids = i.count;
    });
  } else {
    bidsAgg.forEach(i => {
      const label = new Date(i._id.day).toLocaleDateString("en-US", { day: "2-digit", month: "short" });
      const idx = labels.indexOf(label);
      if (idx !== -1) chartData[idx].readyBids = i.count;
    });
  }

  return {
    labels,
    chartData,
    totals: {
      readyBids: currBids,
      percentage: {
        value: bidPercent,
        trend: bidPercent > 0 ? "increase" : bidPercent < 0 ? "decrease" : "no-change"
      }
    }
  };
};

const getEarningsDashboardData = async (filter) => {
  let range, labels, groupType;

  if (filter === "12months") {
    range = getDateRangeLast12Months();
    labels = buildLast12MonthsLabels(); // ["Jan","Feb",...]
    groupType = "month";
  } else {
    range = getDateRangeLast30Days();
    labels = buildLast30DaysLabels(); // ["01 Dec","02 Dec",...]
    groupType = "day";
  }

  // ---------- CURRENT PERIOD TOTAL ----------
  const currAgg = await Booking.aggregate([
    {
      $match: {
        deletstatus: 0,
        status: { $in: ["completed", "delivered"] },
        createdAt: { $gte: range.start, $lte: range.end }
      }
    },
    { $group: { _id: null, total: { $sum:{ $toDouble:"$bookValuetaxinc.taxValue" }} } }
  ]);

  const currAggBids = await Bid.aggregate([
    {
      $match: {
        deletstatus: 0,
        status: { $in: ["completed", "delivered"] },
        createdAt: { $gte: range.start, $lte: range.end }
      }
    },
    { $group: { _id: null, total: { $sum:{ $toDouble: "$bidValuetaxinc.taxValue"} } } }
  ]);

  const currEarnings =
    (currAgg[0]?.total || 0) + (currAggBids[0]?.total || 0);

  // ---------- PREVIOUS PERIOD TOTAL ----------
  let prevStart = new Date(range.start);
  let prevEnd = new Date(range.end);

  if (filter === "12months") {
    prevStart.setFullYear(prevStart.getFullYear() - 1);
    prevEnd.setFullYear(prevEnd.getFullYear() - 1);
  } else {
    prevStart.setDate(prevStart.getDate() - 30);
    prevEnd.setDate(prevEnd.getDate() - 30);
  }

  const prevAgg = await Booking.aggregate([
    {
      $match: {
        deletstatus: 0,
        status: { $in: ["completed", "delivered"] },
        createdAt: { $gte: prevStart, $lte: prevEnd }
      }
    },
    { $group: { _id: null, total: { $sum: { $toDouble:"$bookValuetaxinc.taxValue"} } } }
  ]);

  const prevAggBids = await Bid.aggregate([
    {
      $match: {
        deletstatus: 0,
        status: { $in: ["completed", "delivered"] },
        createdAt: { $gte: prevStart, $lte: prevEnd }
      }
    },
    { $group: { _id: null, total: { $sum:{ $toDouble: "$bidValuetaxinc.taxValue"} } } }
  ]);

  const prevEarnings =
    (prevAgg[0]?.total || 0) + (prevAggBids[0]?.total || 0);

  // ---------- Percentage ----------
  const earningsPercent = calcPercent(currEarnings, prevEarnings);

  // ---------- CHART AGGREGATION ----------
  const earningsAgg = await Booking.aggregate([
    {
      $match: {
        deletstatus: 0,
        status: { $in: ["completed", "delivered"] },
        createdAt: { $gte: range.start, $lte: range.end }
      }
    },
    {
      $group:
        groupType === "month"
          ? { _id: { month: { $month: "$createdAt" } }, earning: { $sum: { $toDouble:"$bookValuetaxinc.taxValue" }} }
          : { _id: { day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } }, earning: { $sum: { $toDouble:"$bookValuetaxinc.taxValue"} } }
    }
  ]);

  const earningsAggBids = await Bid.aggregate([
    {
      $match: {
        deletstatus: 0,
        status: { $in: ["completed", "delivered"] },
        createdAt: { $gte: range.start, $lte: range.end }
      }
    },
    {
      $group:
        groupType === "month"
          ? { _id: { month: { $month: "$createdAt" } }, earning: { $sum: { $toDouble:"$bidValuetaxinc.taxValue" }} }
          : { _id: { day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } }, earning: { $sum: { $toDouble:"$bidValuetaxinc.taxValue"} } }
    }
  ]);

  // ---------- BUILD CHART DATA ----------
  const chartData = labels.map(label => ({ label, earnings: 0 }));

  if (groupType === "month") {
    const monthShort = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    [...earningsAgg, ...earningsAggBids].forEach(i => {
      const idx = labels.indexOf(monthShort[i._id.month - 1]);
      if (idx !== -1) chartData[idx].earnings += i.earning;
    });
  } else {
    [...earningsAgg, ...earningsAggBids].forEach(i => {
      const label = new Date(i._id.day).toLocaleDateString("en-US", { day: "2-digit", month: "short" });
      const idx = labels.indexOf(label);
      if (idx !== -1) chartData[idx].earnings += i.earning;
    });
  }

  return {
    labels,
    chartData,
    totals: {
      totalearnings: currEarnings,
      percentage: {
        value: earningsPercent,
        trend: earningsPercent > 0 ? "increase" : earningsPercent < 0 ? "decrease" : "no-change"
      }
    }
  };
};



exports.getDashboardCounts = async (req, res) => {
  try {
    const filter = req.body.filter; // { user, earnings, bookings, bids }

    const userData = await getUserDashboardData(filter.user);
    const earningsData = await getEarningsDashboardData(filter.earnings);
    const bookingsData = await getBookingDashboardData(filter.bookings);
    const bidsData = await getBidsDashboardData(filter.bids);

    return res.json({
      success: true,
      message: "Dashboard data fetched successfully",
      data: {
        users: userData,
        earnings: earningsData,
        bookings: bookingsData,
        bids: bidsData,
         totals: {
      userTotals: userData.totals,        
      bookingTotals: bookingsData.totals,
      bidTotals:bidsData.totals,
      earningsTotals:earningsData.totals

    }
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


