const Truck = require('../../models/Truck');
const mongoose = require('mongoose');


// ✅ GET all trucks (only active ones)
exports.getalltrucks = async (req, res) => {
  try {
    const {status,owner} = req.query;
     const filter = { deletstatus: 0 };
      if (status) {
        if (status === "all") {
          filter.status = { $in: ["active", "inactive"] }; // both
        } else {
          filter.status = status;
        }
    }
     if (owner && owner !== "all") {
      filter.carrierId = owner;
    }
    const trucks = await Truck.find(filter)
      .populate({
        path: "carrierId",
        select: "companyName address city state zipCode country status userId",
        populate: {
          path: "userId",
          select: "firstName lastName email"
        }
      })
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email")
      .populate("truckType");


    if (!trucks.length) {
      return res.status(200).json({
        success: true,
        message: "No trucks found",
        data: []
      });
    }
    // ✅ Add ownerName for each truck
    const formattedTrucks = trucks.map(truck => {
      const owner = truck?.carrierId?.userId;
      const ownerName = owner
        ? `${owner?.firstName || ""} ${owner?.lastName || ""}`.trim()
        : null;

      // Convert mongoose doc to plain object so we can add fields
      const truckObj = truck.toObject();
      truckObj.ownerName = ownerName;

      return truckObj;
    });
    return res.status(200).json({
      success: true,
      message: "Trucks fetched successfully",
      data: formattedTrucks
    });

  } catch (error) {
    console.error("Error fetching trucks:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// ✅ UPDATE truck (only if not deleted)
// exports.updatetruck = async (req, res) => {
//   try {
//     const { truckId } = req.params;
//     const updateData = req.body;

//     const truck = await Truck.findOne({ _id: truckId, deletstatus: 0 });
//     if (!truck) {
//       return res.status(404).json({ success: false, message: "Truck not found or deleted" });
//     }

//     Object.keys(updateData).forEach(f => {
//       if (updateData[f] !== undefined) truck[f] = updateData[f];
//     });

//     truck.updatedAt = new Date();
//     truck.updatedBy = req.user?._id || null;

//     await truck.save();

//     res.status(200).json({
//       success: true,
//       message: "Truck updated successfully",
//       data: truck
//     });

//   } catch (error) {
//     console.error("Error updating truck:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// exports.updatetruck = async (req, res) => {
//   try {
//     const { truckId } = req.params;
//     const updateData = req.body;

//     const truck = await Truck.findOne({ _id: truckId, deletstatus: 0 });
//     if (!truck) {
//       return res.status(404).json({ success: false, message: "Truck not found or deleted" });
//     }

//     if (updateData.location) {
//       const newLoc = updateData.location;

//       // Update only provided location fields (city/state/country etc.)
//       if (newLoc.city !== undefined) truck.location.city = newLoc.city;
//       if (newLoc.state !== undefined) truck.location.state = newLoc.state;
   

//       // Remove it from updateData so it doesn’t overwrite the object
//       delete updateData.location;
//     }

//     Object.keys(updateData).forEach(f => {
//       if (updateData[f] !== undefined) truck[f] = updateData[f];
//     });

//     truck.updatedAt = new Date();
//     truck.updatedBy = req.user?._id || null;

//     await truck.save();

//     res.status(200).json({
//       success: true,
//       message: "Truck updated successfully",
//       data: truck
//     });

//   } catch (error) {
//     console.error("Error updating truck:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
exports.updatetruck = async (req, res) => {
  try {
    const { truckId } = req.params;
    const updateData = req.body;

    const truck = await Truck.findOne({ _id: truckId, deletstatus: 0 });
    if (!truck) {
      return res.status(404).json({ success: false, message: "Truck not found or deleted" });
    }

    // ✅ If location is passed as a string, update only the state field
    if (updateData.location && typeof updateData.location === "string") {
      const newState = updateData.location;
      console.log("Updating state inside location =>", newState);

      // ensure location object exists
      if (!truck.location) {
        truck.location = {
          city: "",
          state: "",
          coordinates: {
            type: "Point",
            coordinates: [0, 0]
          }
        };
      }

      truck.location.state = newState;
    }

    // ✅ If location is passed as an object, update its nested fields
    else if (updateData.location && typeof updateData.location === "object") {
      const newLoc = updateData.location;
      if (newLoc.city !== undefined) truck.location.city = newLoc.city;
      if (newLoc.state !== undefined) truck.location.state = newLoc.state;
      if (newLoc.coordinates !== undefined) truck.location.coordinates = newLoc.coordinates;
    }

    // ✅ Update other fields normally
    Object.keys(updateData).forEach(f => {
      if (f !== "location" && updateData[f] !== undefined) {
        truck[f] = updateData[f];
      }
    });

    truck.updatedAt = new Date();
    truck.updatedBy = req.user?._id || null;

    await truck.save();

    res.status(200).json({
      success: true,
      message: "Truck updated successfully",
      data: truck
    });

  } catch (error) {
    console.error("Error updating truck:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update Truck Status by Truck ID
exports.updatetruckstatusbyId = async (req, res) => {
  try {
    const { truckId } = req.params;
    const { status } = req.body; 
    if (!["active", "inactive", "under_maintenance"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed values: active, inactive, under_maintenance",
      });
    }

    const truck = await Truck.findOne({ _id: truckId, deletstatus: 0 })
      .populate("carrierId", "companyName");

    if (!truck) {
      return res.status(404).json({
        success: false,
        message: "Truck not found or deleted",
      });
    }
    truck.status = status;
    truck.updatedAt = new Date();
    truck.updatedBy = req.user?._id || null;
    await truck.save();

    res.status(200).json({
      success: true,
      message: `Truck status updated to ${status}`,
      data: truck,
    });

  } catch (error) {
    console.error("Error updating truck status:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ GET truck by ID (for edit)



exports.gettruckbyId = async (req, res) => {
  try {
    const { truckId } = req.params;

    const truck = await Truck.findOne({ _id: truckId, deletstatus: 0 })
   .populate({
        path: "carrierId",
        select: "companyName address city state zipCode country status userId",
        populate: {
          path: "userId",
          select: "firstName lastName email"
        }
      })
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email");

    if (!truck) {
      return res.status(404).json({
        success: false,
        message: "Truck not found or deleted",
      });
    }

    const owner = truck?.carrierId?.userId;
    const ownerName = owner ? `${owner?.firstName} ${owner?.lastName}` : null;

    res.status(200).json({
      success: true,
      message: "Truck details fetched successfully",
      data: {
        ...truck.toObject(),
        ownerName,
      },
    });

  } catch (error) {
    console.error("Error fetching truck by ID:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// ✅ SOFT DELETE truck (set deletstatus = 1)
exports.deletetruck = async (req, res) => {
  try {
    const { truckId } = req.params;

    const truck = await Truck.findOne({ _id: truckId, deletstatus: 0 });
    if (!truck) {
      return res.status(404).json({ success: false, message: "Truck not found or already deleted" });
    }

    truck.deletstatus = 1;
    truck.deletedAt = new Date();
    truck.deletedBy = req.user?._id || null;

    await truck.save();

    res.status(200).json({
      success: true,
      message: "Truck deleted successfully ",
      data: truck
    });
  } catch (error) {
    console.error("Error deleting truck:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.createTruck = async (req, res) => {
  try {
    const {
      nickname,
      registrationNumber,
      truckType,
      hasWinch,
      capacity,
      mcDotNumber,
      vinNumber,
      insurance,
      insuranceExpiry,
      status,
      location,
      owner,
      carrierId,
    } = req.body;
console.log("req.body in truck ",req.body)
    // Convert "yes"/"no" → Boolean
    const hasWinchBool = hasWinch === 'yes';

    // Convert insuranceExpiry "30/10/2025" → Date (yyyy-mm-dd)
    const [day, month, year] = insuranceExpiry.split('/');
    const insuranceExpiryDate = new Date(`${year}-${month}-${day}`);

    // Handle location split
    let city = '', state = '';
    if (location) {
      const parts = location.split(',');
      city = parts[0]?.trim() || '';
      state = parts[1]?.trim() || '';
    }

    // Create Truck document
    const newTruck = new Truck({
      carrierId: owner, // from token/session ideally
      nickname,
      registrationNumber,
      truckType,
      hasWinch: hasWinchBool,
      capacity: Number(capacity),
      mcDotNumber,
      vinNumber,
      insurance,
      insuranceExpiry: insuranceExpiryDate,
      status,
      location: {
        city : req.body?.location,
        state,
      },
      createdBy: req.user?._id || '68e73aebda9fdad99d4d53ea', // if available from auth middleware
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    await newTruck.save();

    res.status(201).json({
      success: true,
      message: 'Truck created successfully',
      data: newTruck
    });
  } catch (error) {
    console.error('Error creating truck:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};