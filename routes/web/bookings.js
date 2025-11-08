const express = require('express');
const router = express.Router();
const bookingController = require('../../controllers/bookingController');
const { protect, authorize, requireProfileComplete } = require('../../middleware/auth');

// Create new booking - Shipper only
router.post('/', bookingController.createBooking);

// Get bookings filtered by role
router.get('/', protect, bookingController.getBookings);
//router.get('/', bookingController.getBookings);


// Get booking by user ID
router.get('/getBookingsByUserId/:userId', bookingController.getBookingsByUserId);

//update booking status for carrier 
router.put('/updatebookingstatus/:userId/:bookingId',bookingController.updatebookingstatus);

// cancel status
router.put('/updateBookingStatusCancel/:userId/:bookingId',bookingController.updateBookingStatusCancel);


// Get booking by ID
router.get('/:id', protect, bookingController.getBookingById);

// Carrier accepts booking
router.put('/:id/accept', protect, authorize('carrier'), bookingController.acceptBooking);

// Cancel booking
router.put('/:id/cancel', protect, bookingController.cancelBooking);

// Update booking status (Carrier only)
router.put('/:id/status', protect, authorize('carrier'), bookingController.updateBookingStatus);

module.exports = router;
