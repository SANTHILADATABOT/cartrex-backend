const Shipper = require('../../models/Shipper');
const Carrier = require('../../models/Carrier');
const User = require('../../models/User');
const Bid = require('../../models/Bid');
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
        select: "companyName userId address",
        populate: { path: "userId", select: "firstName lastName" },
      })
      .populate({
        path: "carrierId",
        select: "companyName userId address",
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
