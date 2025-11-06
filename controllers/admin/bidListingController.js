const Bid = require('../../models/Bid');
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

// ✅ GET bid by ID




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


exports.getBidsByCarrierUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // 1️⃣ Check if user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role !== 'carrier') return res.status(400).json({ success: false, message: 'User is not a carrier' });

    // 2️⃣ Find carrier details
    const carrier = await Carrier.findOne({ userId, deletstatus: 0 });
    if (!carrier) return res.status(404).json({ success: false, message: 'Carrier not found' });

    // 3️⃣ Find all trucks for the carrier
    const trucks = await Truck.find({ carrierId: carrier._id, deletstatus: 0 }).select('_id');
    const truckIds = trucks.map(t => t._id);

    if (!truckIds.length) {
      return res.status(200).json({ success: true, message: 'No trucks found for this carrier', data: [] });
    }

    // 4️⃣ Find all routes for the carrier
    const routes = await Route.find({
      carrierId: carrier._id,
      truckId: { $in: truckIds },
      deletstatus: 0
    }).select('_id');
    const routeIds = routes.map(r => r._id);

    if (!routeIds.length) {
      return res.status(200).json({ success: true, message: 'No routes found for this carrier', data: [] });
    }

    // 5️⃣ Fetch bids for this carrier (based on carrierId, truckId, routeId)
    const bids = await Bid.find({
      carrierId: carrier._id,
      truckId: { $in: truckIds },
      routeId: { $in: routeIds },
      deletstatus: 0
    })
      .populate('userId', 'firstName lastName email')
      .populate('carrierId', 'companyName')
      .populate('truckId', 'nickname registrationNumber')
      .populate('routeId', 'origin destination status')
      .lean();

    // 6️⃣ Response
    return res.status(200).json({
      success: true,
      count: bids.length,
      message: bids.length ? 'Bids found' : 'No bids found for this carrier',
      data: bids
    });

  } catch (error) {
    console.error('❌ Error fetching bids:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
