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

