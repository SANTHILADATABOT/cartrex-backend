const Bid = require('../../models/Bid');
const User = require('../../models/User');
const Carrier = require('../../models/Carrier');
const Truck = require('../../models/Truck');
const Route = require('../../models/Route');
const Shipper = require('../../models/Shipper')


const mongoose = require('mongoose');

// GET all bids
exports.getallbids = async (req, res) => {
  try {
    const { isActive } = req.query;
    const filter = { deletstatus: 0 };
    if (isActive) {
      if (isActive === "all") {
        filter.status = { $in: ["pending", "confirmed", "in_progress", "completed", "cancelled"] };
      } else {
        filter.status = isActive; // show only the selected status
      }
    }
    const bids = await Bid.find(filter)
      .populate('shipperId', 'companyName dba')
      .populate('carrierId', 'companyName dba')
      .populate('routeId', 'routeName')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 });

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

// exports.getallbids = async (req, res) => {
//   try {
//     const { isActive } = req.query; // same param naming style as others

//     // 🔹 Base filter
//     const filter = { deletstatus: 0 };

//     // 🔹 Apply status filter (pending, confirmed, in_progress, completed, cancelled)
//     if (isActive) {
//       if (isActive === "all") {
//         filter.status = { $in: ["pending", "confirmed", "in_progress", "completed", "cancelled"] };
//       } else {
//         filter.status = isActive; // show only the selected status
//       }
//     }

//     // 🔹 Fetch bids with population
//     const bids = await Bid.find(filter)
//       .populate('shipperId', 'companyName dba')
//       .populate('carrierId', 'companyName dba')
//       .populate('routeId', 'routeName')
//       .populate('createdBy', 'name email')
//       .populate('updatedBy', 'name email')
//       .sort({ createdAt: -1 });

//     // 🔹 If no bids found
//     if (!bids.length) {
//       return res.status(200).json({
//         success: true,
//         message: "No bids found",
//         data: []
//       });
//     }

//     // 🔹 Send response
//     return res.status(200).json({
//       success: true,
//       count: bids.length,
//       message: "Bids fetched successfully",
//       data: bids
//     });

//   } catch (error) {
//     console.error("Error fetching bids:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

exports.getallbidsbyfilter = async (req, res) => {
  try {
    const { pickupLocation, deliveryLocation } = req.body || {};
    const { isActive } = req.query;
    const filter = { deletstatus: 0 };
    if (isActive) {
      if (isActive === "all") {
        filter.status = { $in: ["pending", "confirmed", "in_progress", "completed", "cancelled"] };
      } else {
        filter.status = isActive; // show only the selected status
      }
    }
    if (pickupLocation) {
      filter["pickup.state"] = { $regex: new RegExp(pickupLocation, "i") };
    }
    if (deliveryLocation) {
      filter["delivery.state"] = { $regex: new RegExp(deliveryLocation, "i") };
    }
    const bids = await Bid.find(filter)
      .populate('shipperId', 'companyName dba')
      .populate('carrierId', 'companyName dba')
      .populate('routeId', 'routeName')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 });

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

exports.getbidbyId = async (req, res) => {
  try {
    const { bidId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(bidId)) {
      return res.status(400).json({ success: false, message: "Invalid bid ID" });
    }
    const bid = await Bid.findOne({ _id: bidId, deletstatus: 0 })
      .populate({
        path: 'shipperId',
        select: 'companyName dba userId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email'
        }
      })
      // 🟢 Populate Carrier + its User (if you want similar owner info)
      .populate({
        path: 'carrierId',
        select: 'companyName dba userId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email'
        }
      })
      .populate('routeId', 'routeName origin destination') // from Route collection
      .populate('createdBy', 'firstName lastName email')   // from User
      .populate('updatedBy', 'firstName lastName email');


    if (!bid) {
      return res.status(404).json({
        success: false,
        message: "Bid not found or deleted"
      });
    }

    res.status(200).json({
      success: true,
      message: "Bid details fetched successfully",
      data: bid
    });

  } catch (error) {
    console.error("Error fetching bid by ID:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


//  UPDATE bid
// exports.updatebid = async (req, res) => {
//   try {
//     const { bidId } = req.params;
//     const updateData = req.body;

//     if (!mongoose.Types.ObjectId.isValid(bidId)) {
//       return res.status(400).json({ success: false, message: "Invalid bid ID" });
//     }

//     const bid = await Bid.findOne({ _id: bidId, deletstatus: 0 });
//     if (!bid) {
//       return res.status(404).json({ success: false, message: "Bid not found or deleted" });
//     }


//     Object.keys(updateData).forEach(f => {
//       if (updateData[f] !== undefined) bid[f] = updateData[f];
//     });

//     bid.updatedAt = new Date();
//     bid.updatedBy = req.user?._id || null;
//     bid.ipAddress = req.ip || null;
//     bid.userAgent = req.headers['user-agent'] || null;


//     await bid.save();

//     res.status(200).json({
//       success: true,
//       message: "Bid updated successfully",
//       data: bid
//     });

//   } catch (error) {
//     console.error("Error updating bid:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

exports.updatebid = async (req, res) => {
  try {
    const { bidId } = req.params;
    const updateData = req.body;

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data provided for update",
      });
    }

    const updatedBid = await Bid.findByIdAndUpdate(
      bidId,
      { $set: updateData },
      { new: true, runValidators: false } // ensures schema validation
    );

    if (!updatedBid) {
      return res
        .status(404)
        .json({ success: false, message: "Bid not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Bid updated successfully", data: updatedBid });
  } catch (error) {
    console.error("Error updating bid:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error updating bid" });
  }
};

exports.updatebidstatusbyId = async (req, res) => {
  try {
    const { bidId } = req.params;
    const { status } = req.body;

    // ✅ Validate allowed status values
    const allowedStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`
      });
    }
    // ✅ Update only the status field
    const updatedBid = await Bid.findByIdAndUpdate(
      bidId,
      {
        $set: {
          status,
          updatedAt: new Date(),
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedBid) {
      return res.status(404).json({
        success: false,
        message: "Bid not found or already deleted"
      });
    }

    return res.status(200).json({
      success: true,
      message: `Bid status updated to '${status}' successfully`,
      data: updatedBid
    });

  } catch (error) {
    console.error("Error updating bid status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating bid status"
    });
  }
};



// DELETE bid 
exports.deletebid = async (req, res) => {
  try {
    const { bidId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bidId)) {
      return res.status(400).json({ success: false, message: "Invalid bid ID" });
    }

    const bid = await Bid.findOne({ _id: bidId, deletstatus: 0 });
    if (!bid) {
      return res.status(404).json({ success: false, message: "Bid not found or already deleted" });
    }

    bid.deletstatus = 1;
    bid.deletedAt = new Date();
    bid.deletedBy = req.user?._id || null;
    bid.deletedipAddress = req.ip;
    bid.userAgent = req.headers['user-agent'] || null;

    await bid.save();

    res.status(200).json({
      success: true,
      message: "Bid deleted successfully",
      data: bid
    });

  } catch (error) {
    console.error("Error deleting bid:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteSelectedBid = async (req, res) => {
  try {
    const { bidId } = req.body;

    if (!bidId || !Array.isArray(bidId) || bidId.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No Booking IDs provided to delete",
      });
    }
    const bidData = await Bid.find({
      _id: { $in: bidId },
      deletstatus: 0
    });
    if (!bidData.length) {
      return res.status(404).json({ success: false, message: "Bid not found or already deleted" });
    }
    for (const bidinfo of bidData) {
      bidinfo.deletstatus = 1;
      bidinfo.deletedAt = new Date();
      bidinfo.deletedBy = null;
      bidinfo.deletedipAddress = req.ip;
      await bidinfo.save();
    }

    res.status(200).json({
      success: true,
      message: "Bid deleted successfully",
      data: bidData
    });

  } catch (error) {
    console.error("Error deleting bid:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// exports.getBidsByCarrierUserId = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     // 1️⃣ Check if user exists
//     const user = await User.findById(userId);

//     if (!user)
//       return res.status(404).json({ success: false, message: 'User not found' });

//     // Carrier role ObjectId (replace with your actual carrier role ID)
//     const CARRIER_ROLE_ID = '68ff5689aa5d489915b8caa8';

//     // 2️⃣ Check if the user has a carrier role
//     if (String(user.role) !== String(CARRIER_ROLE_ID))
//       return res.status(400).json({ success: false, message: 'User is not a carrier' });

//     // 3️⃣ Find carrier details
//     const carrier = await Carrier.findOne({ userId, deletstatus: 0 });
//     if (!carrier)
//       return res.status(404).json({ success: false, message: 'Carrier not found' });

//     // 4️⃣ Find all trucks for the carrier
//     const trucks = await Truck.find({ carrierId: carrier._id, deletstatus: 0 }).select('_id');
//     const truckIds = trucks.map(t => t._id);

//     if (!truckIds.length) {
//       return res.status(200).json({ success: true, message: 'No trucks found for this carrier', data: [] });
//     }


//     // 5️⃣ Find all routes for the carrier
//     const routes = await Route.find({
//       carrierId: carrier._id,
//       truckId: { $in: truckIds },
//       deletstatus: 0
//     }).select('_id');
//     const routeIds = routes.map(r => r._id);

//     if (!routeIds.length) {
//       return res.status(200).json({ success: true, message: 'No routes found for this carrier', data: [] });
//     }

//     const bids = await Bid.find({
//       carrierId: carrier._id,
//       routeId: { $in: routeIds },
//       deletstatus: 0
//     })
//       .populate({
//         path: 'shipperId',
//         select: 'companyName userId',
//         populate: { path: 'userId', select: 'firstName lastName' }
//       })
//       .populate({
//         path: 'carrierId',
//         select: 'companyName userId',
//         populate: { path: 'userId', select: 'firstName lastName' }
//       })
//       .populate('routeId', 'origin destination status')
//       .lean();
//     // 7️⃣ Response
//     return res.status(200).json({
//       success: true,
//       count: bids.length,
//       message: bids.length ? 'Bids found' : 'No bids found for this carrier',
//       data: bids
//     });

//   } catch (error) {
//     console.error('❌ Error fetching bids:', error);
//     return res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };

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
    console.error("❌ Error fetching bids:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getBidsByFilter = async (req, res) => {
  try {
    // const { userId } = req.params;
    const { userId, pickupLocation, deliveryLocation, pickupDate, search } = req.body || {};

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
      "carrierRouteList.carrierId": carrier._id,
      // carrierId: carrier._id,
      deletstatus: 0,
    };
    const filter = baseFilter;
    if (deliveryLocation) {
      filter["pickup.stateCode"] = pickupLocation;
    }
    if(deliveryLocation){
      filter["delivery.stateCode"] = deliveryLocation;
    }
    if(pickupLocation){
      filter["pickup.stateCode"] = pickupLocation;
    }
   if (pickupDate) {
      filter["pickup.pickupDate"] = pickupDate;
    }
   const orConditions = [];
    
    // if (pickupLocation) {
    //   orConditions.push({ "pickup.stateCode": { $regex: new RegExp(pickupLocation, "i") } });
    // }

    // if (deliveryLocation) {
    //   orConditions.push({ "delivery.stateCode": { $regex: new RegExp(deliveryLocation, "i") } });
    // }


    // if (pickupDate) {
    //   const date = new Date(pickupDate);
    //   const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    //   const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    //   orConditions.push({
    //     "pickup.pickupDate": { $gte: startOfDay, $lte: endOfDay },
    //   });
    // }

    if (search && search.trim() !== "") {
        const searchRegex = new RegExp(search, "i");
        const searchNum = Number(search);
        const searchConditions = [
          { "pickup.city": searchRegex },
          { "delivery.city": searchRegex },
          { "pickup.stateCode": searchRegex },
          { "delivery.stateCode": searchRegex },
          { "shipperId.companyName": searchRegex },
          { "shipperId.address": searchRegex },
          { "timing": searchRegex },
        ];

        // ✅ Add number search only if it’s a valid number
        if (!isNaN(searchNum)) {
          searchConditions.push({ bidValue: searchNum });
        }

        orConditions.push(...searchConditions);
    }

    // ✅ Combine filters
    const finalFilter = orConditions.length
      ? { ...filter, $or: orConditions }
      : filter;
    // const finalFilter = filter;

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
      .lean();
    bids.forEach((bid, i) => console.log(`🔹 Bid ${i + 1}:`, bid.pickup?.city, "→", bid.delivery?.city));

    // 5️⃣ Respond
    return res.status(200).json({
      success: true,
      count: bids.length,
      message: bids.length ? "Bids found" : "No bids found",
      data: bids,
      test2: pickupLocation,
      test: filter,
      test3: req.body,
      test4: search,
    });

  } catch (error) {
    console.error("❌ Error fetching bids:", error);
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
exports.getBidsBycarrierUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // 1️⃣ Check if user exists
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    // Shipper role ObjectId (replace with your actual shipper role ID)
    const CARRIER_ROLE_ID = '68ff5689aa5d489915b8caa8'; 

    // 2️⃣ Check if the user has a shipper role
    if (String(user.role) !== String(CARRIER_ROLE_ID))
      return res.status(400).json({ success: false, message: 'User is not a shipper' });

    // 3️⃣ Find shipper details
    const carrier = await Carrier.findOne({ userId, deletstatus: 0 });
    if (!carrier)
      return res.status(404).json({ success: false, message: 'Carrier not found' });

    // 4️⃣ Find all bids created by this shipper
    const bids = await Bid.find({
       "carrierRouteList.carrierId": carrier._id,
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

