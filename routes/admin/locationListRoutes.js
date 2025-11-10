const express = require('express');
const router = express.Router();
const locationListingController = require('../../controllers/admin/locationlistingControlloer');
const { protect, authorize } = require('../../middleware/auth');

// 📍 Get all locations
router.get('/getAllLocations',  locationListingController.getAllLocations);

module.exports = router;
