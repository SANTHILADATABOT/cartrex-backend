
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

exports.deleteSpace = async (req, res) => {
  try {
    const space = await Space.findById(req.params.id);

    if (!space) {
      return res.status(404).json({ success: false, message: 'Space not found' });
    }

    const carrier = await Carrier.findOne({ userId: req.user._id });
    if (space.carrierId.toString() !== carrier._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await space.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Space listing deleted successfully'
    });
  } catch (error) {
    console.error('Delete space error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Already written post a space api's

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
exports.addoriginanddestinationdetails = async (req, res) => {
  try {
    const { carrierId } = req.params;
    const { origin, destination } = req.body;

    console.log("Received carrierId:", carrierId);


    const carrier = await Carrier.findById(carrierId);
    console.log(carrier);
    if (!carrier) return res.status(404).json({ message: "Carrier not found" });

    const space = await Space.findOne({ carrierId: carrier._id, deletstatus: 0 }).sort({ createdAt: -1 });
    console.log(space)

    if (!space) return res.status(404).json({ message: "No active space found for this carrier" });
    if (origin) {
      space.origin = {
        location: origin.location,
        city: origin.city,
        state: origin.state,
        pickupDate: origin.pickupDate,
        pickupWindow: origin.pickupWindow,
         pickupRadius: origin.pickupRadius,
        coordinates: {
          type: 'Point',
          coordinates: origin.coordinates || [0, 0]
        }
      };
    }

    if (destination) {
      space.destination = {
        location: destination.location,
        city: destination.city,
        state: destination.state,
        deliveryDate: destination.deliveryDate,
        deliveryWindow: destination.deliveryWindow,
        deliveryRadius: destination.deliveryRadius,
        coordinates: {
          type: 'Point',
          coordinates: destination.coordinates || [0, 0]
        }
      };
    }


    space.updatedAt = new Date();
    space.updatedBy = carrier.userId; 
    space.updated_ipAddress = req.ip;
    space.userAgent = req.get('User-Agent');

    await space.save();

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
