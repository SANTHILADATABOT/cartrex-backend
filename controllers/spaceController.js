const mongoose = require('mongoose');
const Truck = require('../models/Truck');
const Route = require('../models/Route');
const User = require('../models/User');



const Space = require('../models/Space');
const Carrier = require('../models/Carrier');

exports.createSpace = async (req, res) => {
  try {
    const carrier = await Carrier.findOne({ userId: req.user._id });
    
    const {
      truckId,
      routeId,
      origin,
      destination,
      availableSpaces,
      rateCard,
      message
    } = req.body;

    const space = await Space.create({
      carrierId: carrier._id,
      truckId,
      routeId,
      origin,
      destination,
      availableSpaces,
      bookedSpaces: 0,
      rateCard,
      message,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      data: space
    });
  } catch (error) {
    console.error('Create space error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.searchSpaces = async (req, res) => {
  try {
    const {
      originCity,
      originState,
      destinationCity,
      destinationState,
      pickupDate,
      vehicleType,
      minPrice,
      maxPrice,
      truckType,
      page = 1,
      limit = 10
    } = req.query;

    let query = { status: 'active' };

    if (originCity) query['origin.city'] = new RegExp(originCity, 'i');
    if (originState) query['origin.state'] = new RegExp(originState, 'i');
    if (destinationCity) query['destination.city'] = new RegExp(destinationCity, 'i');
    if (destinationState) query['destination.state'] = new RegExp(destinationState, 'i');
    if (pickupDate) {
      query['origin.pickupDate'] = { $gte: new Date(pickupDate) };
    }

    const spaces = await Space.find(query)
      .populate('carrierId')
      .populate('truckId')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ postedDate: -1 });

    const count = await Space.countDocuments(query);

    res.status(200).json({
      success: true,
      data: spaces,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Search spaces error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getSpaces = async (req, res) => {
  try {
    const carrier = await Carrier.findOne({ userId: req.user._id });
    
    const spaces = await Space.find({ carrierId: carrier._id })
      .populate('truckId')
      .populate('routeId')
      .sort({ postedDate: -1 });

    res.status(200).json({
      success: true,
      data: spaces
    });
  } catch (error) {
    console.error('Get spaces error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateSpace = async (req, res) => {
  try {
    const space = await Space.findById(req.params.id);

    if (!space) {
      return res.status(404).json({ success: false, message: 'Space not found' });
    }

    const carrier = await Carrier.findOne({ userId: req.user._id });
    if (space.carrierId.toString() !== carrier._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    Object.assign(space, req.body);
    space.updatedAt = Date.now();
    await space.save();

    res.status(200).json({
      success: true,
      data: space
    });
  } catch (error) {
    console.error('Update space error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// exports.deleteSpace = async (req, res) => {
//   try {
//     const space = await Space.findById(req.params.id);

//     if (!space) {
//       return res.status(404).json({ success: false, message: 'Space not found' });
//     }

//     // const carrier = await Carrier.findOne({ userId: req.user._id });
//     // if (space.carrierId.toString() !== carrier._id.toString()) {
//     //   return res.status(403).json({ success: false, message: 'Not authorized' });
//     // }

//     await space.deleteOne();

//     res.status(200).json({
//       success: true,
//       message: 'Space listing deleted successfully'
//     });
//   } catch (error) {
//     console.error('Delete space error:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// Already written post a space api's

exports.deleteSpace = async (req, res) => {
  try {
    const { spaceId } = req.params;
    const userId = req.user?._id; // if you're using authentication middleware

    const space = await Space.findById(spaceId);
    if (!space) {
      return res.status(404).json({ success: false, message: 'Space not found' });
    }

    // Soft delete instead of removing document
    space.deletstatus = 1;
    space.deletedBy = "68e4aa373e31aa48741bd932";
    space.deletedAt = new Date();
    space.deletedipAddress = req.ip;
    space.userAgent = req.headers['user-agent'];
    
    await space.save();
console.log("deleteed")
    return res.status(200).json({
      success: true,
      message: 'Space listing marked as deleted successfully',
    });

  } catch (error) {
    console.error('Delete space error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
exports.getspacedetails = async (req, res) => {
  try {
    const { userId } =  req.params;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }
    const carrier = await Carrier.findOne({ userId });
    if (!carrier) {
      return res.status(404).json({ message: "Carrier not found for this user" });
    }
    const trucks = await Truck.find({ carrierId: carrier._id });
    const truckIds = trucks.map(t => t._id);
    const routes = await Route.find({ truckId: { $in: truckIds } });
    const availableSpaces = Array.from({ length: 9 }, (_, i) => i + 1);
    const result = {
      carrierId: carrier._id,
      companyName: carrier.companyName,
      trucks: trucks.map(truck => ({
      _id: truck._id,
      nickname: truck.nickname,
      truckType: truck.truckType,
      routes: routes.filter(r => r.truckId.toString() === truck._id.toString())
      })),
      availableSpaces
    };

    return res.status(200).json({success: true, message: "Space Details Fetched Sucessfully",data:result});

  } catch (error) {
    console.error("Error fetching space details:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};
exports.getSpaceResult = async (req, res) => {
  try {
    const { selectedVehiclecat,selectedVehiclesub,selectdeliverycity ,selectpickupcity}  =  req.query;
    const filter = { deletstatus: 0 };
    if (selectedVehiclecat && selectedVehiclesub && selectdeliverycity && selectpickupcity) {
      filter.rateCard = {
        $elemMatch: {
          vehicleType: selectedVehiclecat,
          variants: {
            $elemMatch: { name: selectedVehiclesub }
          }
        }
      };
      filter["origin.location"] = selectpickupcity;
      filter["destination.location"] = selectdeliverycity;
    }
    console.log('filter=>',filter)
    let spaces = await Space.find(filter)
      .populate({
        path: "carrierId",
        select: "userId companyName",
        populate: {
          path: "userId",
          select: "firstName lastName",
        },
      })
      .populate("truckId", "carrierId nickname truckType registrationNumber rating location")
      .populate("routeId")
      .lean();

    const carrierIds = [
      ...new Set(spaces.map((s) => s.carrierId?._id?.toString()).filter(Boolean)),
    ];

    const truckCounts = await Truck.aggregate([
      {
        $match: {
          carrierId: { $in: carrierIds.map((id) => new mongoose.Types.ObjectId(id)) },
          deletstatus: 0,
        },
      },
      { $group: { _id: "$carrierId", totalTrucks: { $sum: 1 } } },
    ]);

    const truckCountMap = {};
    truckCounts.forEach((tc) => {
      truckCountMap[tc._id.toString()] = tc.totalTrucks;
    });

    spaces = spaces.map((space) => {
      if (space.carrierId && space.carrierId._id) {
        space.carrierId.noOfTrucks =
          truckCountMap[space.carrierId._id.toString()] || 0;
      }
      return space;
    });

    res.status(200).json({
      success: true,
      message: "All Spaces fetched successfully",
      count: spaces.length,
      data: spaces,
    });

  } catch (error) {
    console.error("Error fetching space details:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};
exports.addSpacesDetails = async (req, res) => {
  try {
    const { carrierId } = req.params;
    const data = req.body;

    console.log("Received carrierId:", carrierId);


    const carrier = await Carrier.findById(carrierId);
    console.log(carrier);
    if (!carrier) return res.status(404).json({ message: "Carrier not found" });
   const spaceData = {
      carrierId: carrierId,
      truckId: data?.selectedTruck,
      availableSpaces: data?.availablespace,
      message: data?.message,
      rateCard: data?.rateCard,
      createdAt: new Date(),
      createdBy: carrier.userId,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    };

    // Add origin info if available
    if (data?.originLocation) {
      spaceData.origin = {
        location: data.originLocation,
        city: "",
        state: "",
        pickupDate: data.pickupdate,
        pickupWindow: data.pickupwindow,
        pickupRadius: data.pickupradius,
        coordinates: {
          type: "Point",
          coordinates: [0, 0],
        },
      };
    }

    // Add destination info if available
    if (data?.destinationLocation) {
      spaceData.destination = {
        location: data.destinationLocation,
        city: "",
        state: "",
        deliveryDate: data.deliveryDate,
        deliveryWindow: data.deliverywindow,
        deliveryRadius: data.deliveryradius,
        coordinates: {
          type: "Point",
          coordinates: [0, 0],
        },
      };
    }

    const space = await Space.create(spaceData);

    res.status(200).json({
      sucess:"true",
      message: "Origin and destination details saved successfully",
      //carrier: { id: carrier._id, companyName: carrier.companyName },
      //spaceId: space._id,
      data:space,
    });
  } catch (error) {
    console.error("Error saving origin and destination:", error);
    res.status(500).json({
      message: "Error saving origin and destination details",
      error: error.message,
    });
  }
};

exports.getSpacesByCarrierUserId = async (req, res) => {
  try {
    const { userId } = req.params;
console.log("userId",userId)
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    // if (user.role !== 'carrier') return res.status(400).json({ success: false, message: 'User is not a carrier' });

  
    const carrier = await Carrier.findOne({ userId: userId, deletstatus: 0 });
    if (!carrier) return res.status(404).json({ success: false, message: 'Carrier not found' });

  
    const trucks = await Truck.find({ carrierId: carrier._id, deletstatus: 0 }).select('_id');
    const truckIds = trucks.map(t => t._id);

    if (!truckIds.length) {
      return res.status(200).json({ success: true, message: 'No trucks found for this carrier', data: [] });
    }

    const routes = await Route.find({
      truckId: { $in: truckIds },
      carrierId: carrier._id,
      deletstatus: 0
    }).select('_id');
    const routeIds = routes.map(r => r._id);
   

    if (!routeIds.length) {
      return res.status(200).json({ success: true, message: 'No routes found for this carrier', data: [] });
    }
  
    const spaces = await Space.find({
      carrierId: carrier._id,
      truckId: { $in: truckIds },
      routeId: { $in: routeIds },
      deletstatus: 0
    })
       .populate('userId', 'firstName lastName')
      .populate('carrierId', 'companyName')
      .populate('truckId', 'nickname registrationNumber')
      .populate('routeId', 'origin destination status')                
      .lean();
       
    return res.status(200).json({
      success: true,
      count: spaces.length, 
      message: spaces.length ? 'Spaces found' : 'No spaces found for this carrier',
      data: spaces
    });

  } catch (error) {
    console.error(' Error fetching spaces:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.editSpacesDetails = async (req, res) => {
  try {
    const { spaceId } = req.params; // ✅ space ID to edit
    const data = req.body;

    console.log("🟢 Received spaceId for edit:", spaceId);

    // Check if space exists
    const existingSpace = await Space.findById(spaceId);
    if (!existingSpace) {
      return res.status(404).json({ success: false, message: "Space not found" });
    }

    // If carrier ID is sent, validate carrier
    if (data.carrierId) {
      const carrier = await Carrier.findById(data.carrierId);
      if (!carrier) {
        return res.status(404).json({ success: false, message: "Carrier not found" });
      }
    }

    // Prepare update data
    const updatedData = {
      carrierId: data.carrierId ?? existingSpace.carrierId,
      truckId: data.selectedTruck ?? existingSpace.truckId,
      availableSpaces: data.availablespace ?? existingSpace.availableSpaces,
      message: data.message ?? existingSpace.message,
      rateCard: data.rateCard ?? existingSpace.rateCard,
      updatedAt: new Date(),
      updatedBy: data.updatedBy || existingSpace.updatedBy,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    };

    // Update origin if provided
    if (data.originLocation) {
      updatedData.origin = {
        location: data.originLocation,
        city: "",
        state: "",
        pickupDate: data.pickupdate,
        pickupWindow: data.pickupwindow,
        pickupRadius: data.pickupradius,
        coordinates: {
          type: "Point",
          coordinates: [0, 0],
        },
      };
    }

    // Update destination if provided
    if (data.destinationLocation) {
      updatedData.destination = {
        location: data.destinationLocation,
        city: "",
        state: "",
        deliveryDate: data.deliveryDate,
        deliveryWindow: data.deliverywindow,
        deliveryRadius: data.deliveryradius,
        coordinates: {
          type: "Point",
          coordinates: [0, 0],
        },
      };
    }

    // Perform the update
    const updatedSpace = await Space.findByIdAndUpdate(spaceId, updatedData, {
      new: true, // returns the updated document
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Space details updated successfully",
      data: updatedSpace,
    });
  } catch (error) {
    console.error("❌ Error updating space:", error);
    res.status(500).json({
      success: false,
      message: "Error updating space details",
      error: error.message,
    });
  }
};
