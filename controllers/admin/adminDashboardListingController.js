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

  const active = await Model.countDocuments({
    deletstatus: 0,
    status: "active",
    createdAt: { $gte: start, $lte: end }  // always respect the period
  });

  const created = await Model.countDocuments({
    deletstatus: 0,
    createdAt: { $gte: start, $lte: end }
  });

  return { total, active, created };
}




//Percentage Calculation
// function calcPercent(curr, prev) {
//   if (prev === 0 && curr === 0) return 0;
//   if (prev === 0) return 100;
//   return Number((((curr - prev) / prev) * 100).toFixed(2));
// }
const calcPercent = (current, previous) => {
  if (previous === 0 && current > 0) return 100;
  if (previous === 0 && current === 0) return 0;
  return ((current - previous) / previous) * 100;
};

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
  status: { $ne: "cancelled" }, // include all except 'cancelled'
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


