// controllers/bookingController.js
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Booking = require('../models/Booking');
const Space = require('../models/Space');
const Shipper = require('../models/Shipper');
const Carrier = require('../models/Carrier');
const User = require('../models/User');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
exports.createBooking = async (req, res) => {
  try {
    const data = req.body;
    console.log("data in createbooking",data);
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
      data: booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, message: 'Server error', test: error }); // , stack: error.stack
  }
};



exports.getBookings = async (req, res) => {
  try {

    req.user = { _id: '69036837bd5648fb37fa6e27', role: 'Carrier' };
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    if (req.user.role === 'Carrier') {
      const carrier = await Carrier.findOne({ userId: req.user._id });
      query.carrierId = carrier._id;
    } else if (req.user.role === 'Shipper') {
      const shipper = await Shipper.findOne({ userId: req.user._id });
      query.shipperId = shipper._id;
    }
    
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('shipperId')
      .populate('carrierId')
      .populate('truckId')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      data: bookings,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

//get booking by user Id 
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
    // console.log('user book=>',user)
    let bookings = [];
   
    console.log('type of rolw',user.role.roleType)
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
      return res.status(404).json({
        success: false,
        message: "No bookings found for this user",
        role: user.role
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

//update booking status by user id of carriers alone staus:pending to confirmed

exports.updatebookingstatus = async (req, res) => {
  try {
    const { userId, bookingId } = req.params;
    const { status } = req.body; 

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ success: false, message: "Invalid userId or bookingId" });
    }

    const carrier = await Carrier.findOne({ userId });
    if (!carrier) {
      return res.status(404).json({ success: false, message: "Carrier not found" });
    }

    const booking = await Booking.findOne({ _id: bookingId, carrierId: carrier._id });
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found for this carrier" });
    }

    booking.status = status;
    booking.updatedAt = new Date();
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
exports.updateJobbookingCompletedstatus = async (req, res) => {
  try {
    const { userId, bookingId } = req.params;

    // Validate Mongo IDs
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ success: false, message: "Invalid userId or bookingId" });
    }

    // Find carrier
    const carrier = await Carrier.findOne({ userId });
    if (!carrier) {
      // cleanup temp file if exists
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: "Carrier not found" });
    }

    // Find booking
    const booking = await Booking.findOne({ _id: bookingId, carrierId: carrier._id });
    if (!booking) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: "Booking not found for this carrier" });
    }

    // ✅ Step 1: Update booking status
    booking.status = "completed";
    booking.updatedAt = new Date();

    // ✅ Step 2: Handle image upload
    if (req.file) {
      const dir = path.join(__dirname, "../upload/bookingDelivery");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const ext = path.extname(req.file.originalname);
      const filename = `image_${bookingId}${ext}`;
      const filePath = path.join(dir, filename);

      // Move file from temp folder to final destination
      fs.renameSync(req.file.path, filePath);

      // Save relative path to DB
      booking.confirmUploadphoto = path.join("upload", "bookingDelivery", filename);
    }

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking status updated and image uploaded successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({
      success: false,
      message: "Server error while updating booking status",
      error: error.message,
    });
  }
};
// exports.updateJobbookingCompletedstatus = async (req, res) => {
//   try {
//     upload.single("image");
//     const { userId, bookingId } = req.params;
//     const  data  = req.body; 

//     if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(bookingId)) {
//       return res.status(400).json({ success: false, message: "Invalid userId or bookingId" });
//     }

//     const carrier = await Carrier.findOne({ userId:userId });
//     console.log('carrier=>',carrier);
//     console.log('bookingId=>',bookingId);
//     console.log('userId=>',userId);
//     if (!carrier) {
//       return res.status(404).json({ success: false, message: "Carrier not found" });
//     }

//     const booking = await Booking.findOne({ _id: bookingId, carrierId: carrier._id });
//     if (!booking) {
//       return res.status(404).json({ success: false, message: "Booking not found for this carrier" });
//     }
    
//     // 📸 Save file path to DB
//     if (req.file) {
//       // store relative path like "upload/bookingDelivery/image_123.png"
//       const relativePath = path.join(
//         "upload",
//         "bookingDelivery",
//         req.file.filename
//       );
//       booking.confirmUploadphoto = relativePath;
//       booking.status = "completed";
//       booking.updatedAt = new Date();
//       await booking.save();

//       return res.status(200).json({
//         success: true,
//         message: "Booking status updated successfully",
//         data: booking,
//       });
//     }else {
//         return res
//           .status(400)
//           .json({ success: false, message: "No image uploaded" });
//       }

//   } catch (error) {
//     console.error("Error updating booking status:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while updating booking status",
//       error: error.message,
//     });
//   }
// };

// //update booking status=> cancelled
// exports.updateBookingStatusCancel = async (req, res) => {
//   try {
//     const { userId, bookingId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(bookingId)) {
//       return res.status(400).json({ success: false, message: "Invalid userId or bookingId" });
//     }

//     const user = await User.findById(userId).populate('role');
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     const roleName = user.role?.name ? user.role.name.toLowerCase() : "unknown";

//     if (roleName !== 'shipper') {
//       return res.status(403).json({
//         success: false,
//         message:"Only shippers can cancel bookings"
//       });
//     }

//     // 4️⃣ Find the corresponding shipper
//     const shipper = await Shipper.findOne({ userId });
//     if (!shipper) {
//       return res.status(404).json({ success: false, message: "No shipper found for this user" });
//     }

//     // 5️⃣ Find the booking owned by this shipper
//     const booking = await Booking.findOne({ _id: bookingId, shipperId: shipper._id, deletstatus: 0 });
//     if (!booking) {
//       return res.status(404).json({ success: false, message: "Booking not found or not owned by this shipper" });
//     }

//     // 6️⃣ Update status to "cancelled"
//     booking.status = "cancelled";
//     booking.updatedAt = new Date();
//     booking.updatedBy = userId;
//     await booking.save();

//     // 7️⃣ Success response
//     return res.status(200).json({
//       success: true,
//       message: "Booking cancelled successfully",
//       role: usre.role,
//       data: {
//         bookingId: booking._id,
//         status: booking.status
//       }
//     });

//   } catch (error) {
//     console.error("Error cancelling booking:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error while cancelling booking",
//       error: error.message
//     });
//   }
// };

exports.updateBookingStatusCancel = async (req, res) => {
  try {
    const { userId, bookingId } = req.params;
    const data = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId or bookingId",
      });
    }
    const user = await User.findById(userId).populate("role");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const shipper = await Shipper.findOne({ userId });
    const carrier = await Carrier.findOne({ userId });
    let booking = {};
    if (!shipper && carrier) {
      booking = await Booking.findOne({_id: bookingId,carrierId: carrier._id,deletstatus: 0,});
    }
    else if(shipper && !carrier){
      booking = await Booking.findOne({_id: bookingId,shipperId: shipper._id,deletstatus: 0,});
    } 
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or not owned by this shipper.",
      });
    }
    booking.cancelReason = data.cancelReason;
    booking.status = "cancelled";
    booking.updatedAt = new Date();
    booking.updatedBy = userId;
    

    await booking.save();
    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      role: "Shipper",
      data: {
        bookingId: booking._id,
        status: booking.status,
        booking
      },
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while cancelling booking",
      error: error.message,
    });
  }
};





exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findOne({ _id: id })
      .populate("truckId")
      .populate("spaceId")
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    
    let shipperDetails = null;
    let carrierDetails = null;

    if (booking.shipperId) {
      shipperDetails = await Shipper.findById(booking.shipperId)
        .populate("userId", "firstName lastName email phone role")
        .lean();
    }

    if (booking.carrierId) {
      carrierDetails = await Carrier.findById(booking.carrierId)
        .populate("userId", "firstName lastName email phone role")
        .lean();
    }

 
    const bookingWithExtras = {
      ...booking.toObject(),
      shipperName: shipperDetails?.userId
        ? `${shipperDetails.userId.firstName} ${shipperDetails.userId.lastName || ""}`.trim()
        : null,
      shipperEmail: shipperDetails?.userId?.email || null,
      carrierName: carrierDetails?.userId
        ? `${carrierDetails.userId.firstName} ${carrierDetails.userId.lastName || ""}`.trim()
        : null,
      carrierEmail: carrierDetails?.userId?.email || null,
    };

    res.status(200).json({
      success: true,
      message: "Booking details fetched successfully",
      data: bookingWithExtras,
    });
  } catch (error) {
    console.error("Error fetching booking by ID:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



exports.acceptBooking = async (req, res) => {
  try {
    const { carrierMessage, truckId, additionalFee, confirmPickupDate, estimatedDeliveryDate } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.status = 'accepted';
    booking.carrierMessage = carrierMessage;
    if (truckId) booking.truckId = truckId;
    if (additionalFee) booking.pricing.additionalFee = additionalFee;
    if (confirmPickupDate) booking.pickup.date = confirmPickupDate;
    if (estimatedDeliveryDate) booking.delivery.estimatedDate = estimatedDeliveryDate;
    
    booking.timeline.push({
      status: 'accepted',
      timestamp: new Date(),
      note: 'Booking accepted by carrier'
    });

    await booking.save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Accept booking error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason;
    booking.timeline.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: `Cancelled: ${cancellationReason}`
    });

    await booking.save();

    const space = await Space.findById(booking.spaceId);
    if (space) {
      space.bookedSpaces = Math.max(0, space.bookedSpaces - 1);
      space.status = 'active';
      await space.save();
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, note, deliveryPhotos } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.status = status;
    if (deliveryPhotos) booking.deliveryPhotos = deliveryPhotos;
    
    booking.timeline.push({
      status,
      timestamp: new Date(),
      note: note || `Status updated to ${status}`
    });

    await booking.save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
