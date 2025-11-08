const express = require('express');
const router = express.Router();
const bidController = require('../../controllers/bidsController');
const { protect, authorize, requireProfileComplete } = require('../../middleware/auth');

// Create new booking - Shipper only
router.post('/getAddBid', bidController.createBid);
router.put('/editBid/:bidId', bidController.editBid);

module.exports = router;
