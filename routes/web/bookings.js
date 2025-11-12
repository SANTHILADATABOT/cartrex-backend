const express = require('express');
const router = express.Router();
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const bookingController = require('../../controllers/bookingController');
const { protect, authorize, requireProfileComplete } = require('../../middleware/auth');
const tempDir = path.join(__dirname, "../upload/bookingDelivery");
const upload = multer({ dest: tempDir });
// Create new booking - Shipper only
router.post('/addbooking', bookingController.createBooking);

// Get bookings filtered by role
router.get('/', bookingController.getBookings);
//router.get('/', bookingController.getBookings);


// Get booking by user ID
router.get('/getBookingsByUserId/:userId', bookingController.getBookingsByUserId);

//update booking status for carrier 
router.put('/updatebookingstatus/:userId/:bookingId',bookingController.updatebookingstatus);

//update Accept booking status for carrier 
router.put('/updateAcceptbookingstatus/:userId/:bookingId',bookingController.updateAcceptbookingstatus);
//update Completed booking status with upload image for carrier  
router.put('/updateJobbookingCompletedstatus/:userId/:bookingId',upload.single("image"),bookingController.updateJobbookingCompletedstatus);
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
