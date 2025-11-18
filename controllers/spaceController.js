const mongoose = require('mongoose');
const Truck = require('../models/Truck');
const Route = require('../models/Route');
const User = require('../models/User');



const Space = require('../models/Space');
const Carrier = require('../models/Carrier');
const AdminRoles = require('../models/AdminRoles');

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
    const UserData = await User.findOne({_id : userId});
    if (!UserData) {
      return res.status(400).json({ message: "User not found" });
    }
    const roleData = await AdminRoles.findOne({_id :UserData.role});
    if (!roleData) {
      return res.status(400).json({ message: "Role not found" });
    }
    if(roleData.roleType === "Carrier"){
      const carrier = await Carrier.findOne({ userId : userId });
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
    }
    else if(roleData.roleType === "Shipper"){
        // 1. Find all carrier users
      const carrierUsers = await User.find({
        role: "68ff5689aa5d489915b8caa8",
        deletstatus: 0
      });

      if (!carrierUsers.length) {
        return res.status(200).json({
          success: true,
          message: "No active carrier users found",
          data: [],
        });
      }

      const carrierUserIds = carrierUsers.map(user => user._id.toString());

      // 2. Find all carriers belonging to those users
      const carriers = await Carrier.find({
        userId: { $in: carrierUserIds },
        deletstatus: 0,
        status: "active"
      });

      if (!carriers.length) {
        return res.status(200).json({
          success: true,
          message: "No active carriers found",
          data: [],
        });
      }

      // 3. Find all trucks belonging to these carriers
      const carrierIds = carriers.map(c => c._id);
      const trucks = await Truck.find({
        carrierId: { $in: carrierIds },
        deletstatus: 0,
        status: "active"
      });

      // 4. Find all routes for those trucks
      const truckIds = trucks.map(t => t._id);
      const routes = await Route.find({ truckId: { $in: truckIds } });
      const availableSpaces = Array.from({ length: 9 }, (_, i) => i + 1);

      // 5. Build final structured response
      const result = carriers.map(carrier => ({
        carrierId: carrier._id,
        companyName: carrier.companyName,
        trucks: trucks
          .filter(truck => truck.carrierId.toString() === carrier._id.toString())
          .map(truck => ({
            _id: truck._id,
            nickname: truck.nickname,
            truckType: truck.truckType,
            routes: routes.filter(
              r => r.truckId.toString() === truck._id.toString()
            ),
          })),
        availableSpaces,
      }));

      return res.status(200).json({
        success: true,
        message: "All active carriers and trucks fetched successfully",
        data: result,
      });
    }
    


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
      filter["origin.city"] = selectpickupcity;
      filter["destination.city"] = selectdeliverycity;
    }
    let spaces = await Space.find(filter)
      .populate({
        path: "carrierId",
        select: "userId companyName",
        populate: {
          path: "userId",
          select: "firstName lastName",
        },
      })
      .populate("truckId")
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
    spaces = spaces.filter(space => {
        return space.availableSpaces > space.bookedSpaces;
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
    const carrier = await Carrier.findOne({ userId: carrierId });
    if (!carrier) return res.status(404).json({ message: "Carrier not found" });
   const spaceData = {
      carrierId: carrier._id,
      truckId: data?.selectedTruck,
      routeId: data?.selectedRoute,
      userId: carrier.userId,
      availableSpaces: data?.availablespace,
      message: data?.message,
      rateCard: data?.rateCard,
      createdAt: new Date(),
      createdBy: carrier.userId,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    };

    // Add origin info if available
    if (data?.origin) {
      spaceData.origin = {
        location: data.origin.location,
        city:data.origin.city,
        state: data.origin.state,
        stateCode: data.origin.state,
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
    if (data?.destination) {
      spaceData.destination = {
        location: data.destination.location,
        city: data.destination.city,
        state: data.destination.state,
        stateCode:data.destination.state,
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
    if (data.origin) {
      updatedData.origin = {
        location: data.origin.location,
        city:data.origin.city,
        state: data.origin.state,
        stateCode: data.origin.state,
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
    if (data.destination) {
      updatedData.destination = {
        location: data.destination.location,
        city: data.destination.city,
        state: data.destination.state,
        stateCode:data.destination.state,
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
