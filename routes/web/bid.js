const express = require('express');
const router = express.Router();
const bidController = require('../../controllers/bidsController');
const { protect, authorize, requireProfileComplete } = require('../../middleware/auth');

// Create new bids - Shipper only
router.post('/getAddBid', bidController.createBid);

//update bids status by user Id 
router.put('/updatebidstatusbyuserId/:userId/:bidId' , bidController.updatebidstatusbyuserId);

module.exports = router;
