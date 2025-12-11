const path = require("path");
const fs = require("fs");
const Shipper = require('../../models/Shipper');
const Carrier = require('../../models/Carrier');
const User = require('../../models/User');
const Booking = require('../../models/Booking');
const Space = require('../../models/Space');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');



// bookings 
exports.createBooking = async (req, res) => {
  try {
    const data = req.body;
    // const shipper = await Shipper.findOne({ _id: data?.shipperId });
    const shipper = await Shipper.findOne({ userId: data?.userId });

    if (!shipper) {
      return res.status(404).json({ success: false, message: 'Shipper not found for this user' });
    }

    const space = await Space.findById({ _id: data?.spaceId });
    if (!space) {
      return res.status(404).json({ success: false, message: 'Space not found' });
    }

    if (space.availableSpaces <= space.bookedSpaces) {
      return res.status(400).json({ success: false, message: 'No spaces available' });
    }

    const bookingId = `BK-${uuidv4().substring(0, 8).toUpperCase()}`;
    
    const bookValuetaxinc = JSON.parse(data.bookValuetaxinc || "{}");
    const pickup = JSON.parse(data.pickup || "{}");
    const delivery = JSON.parse(data.delivery || "{}");
    const shippingInfo = JSON.parse(data.shippingInfo || "{}");
    const parsedVehicleDetails = JSON.parse(data.vehicleDetails || '{}');

    const booking = await Booking.create({
      ...data,
      vehicleDetails: parsedVehicleDetails,
      bookValuetaxinc,
      pickup,
      delivery,
      shippingInfo,
      shipperId: shipper._id, 
      bookingId:bookingId,
      status: 'pending',
      createdBy: data?.userId,
      createdAt:Date.now(),
      deletstatus: 0,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      statusUpdatedetails:[]
    });

    const uploadedPhotos = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        const ext = path.extname(file.originalname);
        // const baseName = path.basename(file.originalname, ext);
        const newFilename = `vehicle${index + 1}_${booking._id}${ext}`;
        const newPath = path.join(path.dirname(file.path), newFilename);

        fs.renameSync(file.path, newPath);
        uploadedPhotos.push(`/uploads/booking/${newFilename}`);
      });
    }

    if (uploadedPhotos.length > 0) {
      booking.vehicleDetails.photos = uploadedPhotos;
      await booking.save();
    }

    space.bookedSpaces += 1;
    if (space.bookedSpaces >= space.availableSpaces) {
      space.status = 'booked';
    }
    await space.save();

    res.status(201).json({
      success: true,
      message:"Bookings created Sucessfully",
      data: booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, message: 'Server error', test: error }); // , stack: error.stack
  }
};


exports.getBookingsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findById(userId).populate('role');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
   
    const shipper = await Shipper.findOne({ userId });
    const carrier = await Carrier.findOne({ userId });
    let bookings = [];
    if (shipper && user.role.roleType === "Shipper") {
      const shipperBookings = await Booking.find({ shipperId: shipper._id, deletstatus: 0 })
        .populate([
          { path: 'spaceId' },
          { path: 'truckId' },
          { 
            path: 'carrierId',
            populate: { path: 'userId', select: 'firstName lastName email phone role' }
          },
          { 
            path: 'shipperId',
            populate: { path: 'userId', select: 'firstName lastName email phone role' }
          }
        ])
        .lean();

      bookings = bookings.concat(shipperBookings);
    }

    if (carrier && (user.role.roleType === "Carrier")) {
      const carrierBookings = await Booking.find({ carrierId: carrier._id, deletstatus: 0 })
        .populate([
          { path: 'spaceId' },
          { path: 'truckId' },
          { 
            path: 'carrierId',
            populate: { path: 'userId', select: 'firstName lastName email phone role' }
          },
          { 
            path: 'shipperId',
            populate: { path: 'userId', select: 'firstName lastName email phone role' }
          }
        ])
        .lean();

      bookings = bookings.concat(carrierBookings);
    }

    if (bookings.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No bookings found for this user",
        data:[],
      });
    }

    // ✅ 5. Response
    return res.status(200).json({
      success: true,
      message: "Bookings fetched successfully",
      // role: user.role,
      count: bookings.length,
      data: bookings
    });

  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching bookings",
      error: error.message
    });
  }
};


exports.filterBookings = async (req, res) => {
  try {
    let { minPrice, maxPrice, truckType } = req.query;

    minPrice = Number(minPrice);
    maxPrice = Number(maxPrice);
    const filter = { deletstatus: 0 };
    if (!isNaN(minPrice) && !isNaN(maxPrice)) {
      filter["bookValuetaxinc.price"] = {
        $gte: minPrice,
        $lte: maxPrice
      };
    }

    let bookings = await Booking.find(filter)
      .populate({
        path: "truckId",
        populate: {
          path: "truckType",
          select: "name"
        }
      })
      .populate({
        path: "carrierId",
        select: "companyName"
      })
      .populate({
        path: "spaceId",
        select: "price"
      })
      .lean();
      
    if (truckType) {
      bookings = bookings.filter(b =>
        b.truckId?.truckType?.name?.toLowerCase() === truckType.toLowerCase()
      );
    }

    res.status(200).json({
      success: true,
      message: "Filtered bookings fetched successfully",
      count: bookings.length,
      data: bookings
    });

  } catch (error) {
    console.error("Booking Filter Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error
    });
  }
};


exports.updateAcceptbookingstatus = async (req, res) => {
  try {
    const { userId, bookingId } = req.params;
    const  data  = req.body; 

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ success: false, message: "Invalid userId or bookingId" });
    }

    const carrier = await Carrier.findOne({ userId:userId });
    if (!carrier) {
      return res.status(404).json({ success: false, message: "Carrier not found" });
    }

    const booking = await Booking.findOne({ _id: bookingId, carrierId: carrier._id });
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found for this carrier" });
    }
    booking.addtionalfee  = data.addtionalfee;
    booking.conformpickupDate = data.conformpickupDate;
    booking.estimateDeliveryDate = data.estimateDeliveryDate;
    booking.estimateDeliveryWindow = data.estimateDeliveryWindow;
    booking.message = data.message;
    booking.truckforship = data.truckforship;
    booking.status = data.status;
    booking.updatedAt = new Date();
    booking.statusUpdatedetails = [{
      updatedAt: new Date(),
      status: data.status
    }];
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: booking,
    });

  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating booking status",
      error: error.message,
    });
  }
};