const express = require('express');
const router = express.Router();
const bookingController = require('../../controllers/admin/bookingListController');

// ✅ GET all bookings
router.get('/getallbookings', bookingController.getallbookings);

router.get('/getbookingbyId/:bookingId', bookingController.getbookingbyId);
// ✅ UPDATE booking
router.put('/updatebooking/:bookingId', bookingController.updatebooking);

// ✅ DELETE booking (soft delete)
router.delete('/deletebooking/:bookingId', bookingController.deletebooking);
router.delete('/deleteSelectedBooking', bookingController.deleteSelectedBooking);

router.put('/updateStatus/:bookingId', bookingController.updateStatus);

module.exports = router;
