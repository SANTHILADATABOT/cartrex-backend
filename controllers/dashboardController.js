const Booking = require('../models/Booking');
const Carrier = require('../models/Carrier');

exports.getCarrierBookings = async (req, res) => {
  try {
    // if (!req.session || !req.session.user) {
    //   return res.status(401).json({ success: false, message: "ser not logged in or session expired", test: req.session });
    // }

    // const userId = req.session.user.id;

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "Missing userId in request", test: req.body });
    }

    // Find carrier by userId
    const carrier = await Carrier.findOne({ userId });

    if (!carrier) {
      return res.status(404).json({ success: false, message: 'Carrier not found for this user' });
    }

    const bookings = await Booking.find({ carrierId: carrier._id })
      .populate('shipperId')
      .populate('truckId')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, bookings, carrier, test: carrier._id });

  } catch (error) {
    console.error("Error fetching carrier bookings:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};