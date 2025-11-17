const express = require('express');
const router = express.Router();
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const bookingController = require('../../controllers/bookingController');
const { protect, authorize, requireProfileComplete } = require('../../middleware/auth');

// Multer setup for booking uploads
const tempDir = path.join(__dirname, "../../uploads/booking");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});
const tempBidDir = path.join(__dirname, "../../uploads/bid");
const bidstorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(tempBidDir)) fs.mkdirSync(tempBidDir, { recursive: true });
    cb(null, tempBidDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}_${Date.now()}${ext}`);
  },
});
const Bidupload = multer({
  storage: bidstorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// Create new booking - Shipper only
// router.post('/addbooking', bookingController.createBooking);
router.post('/addbooking', upload.array('photos', 10), bookingController.createBooking);

// Get bookings filtered by role
router.get('/', bookingController.getBookings);
//router.get('/', bookingController.getBookings);


// Get booking by user ID
router.get('/getBookingsByUserId/:userId', bookingController.getBookingsByUserId);

//update booking status for carrier 
router.put('/updatebookingstatus/:userId/:bookingId',bookingController.updatebookingstatus);
router.put('/updatebidstatus/:userId/:bidId',bookingController.updatebidstatus);

//update Accept booking status for carrier 
router.put('/updateAcceptbookingstatus/:userId/:bookingId',bookingController.updateAcceptbookingstatus);
//update Completed booking status with upload image for carrier  
router.put('/updateJobbookingCompletedstatus/:userId/:bookingId',upload.single("image"),bookingController.updateJobbookingCompletedstatus);
//update Completed booking status with upload image for carrier  
router.put('/updateJobBidCompletedstatus/:userId/:bidId',Bidupload.single("image"),bookingController.updateJobBidCompletedstatus);
// cancel status
router.put('/updateBookingStatusCancel/:userId/:bookingId',bookingController.updateBookingStatusCancel);


// Get booking by ID
router.get('/:id',bookingController.getBookingById);

// Carrier accepts booking
router.put('/:id/accept',authorize('carrier'), bookingController.acceptBooking);

// Cancel booking
router.put('/:id/cancel',bookingController.cancelBooking);

// Update booking status (Carrier only)
router.put('/:id/status',authorize('carrier'), bookingController.updateBookingStatus);

module.exports = router;
