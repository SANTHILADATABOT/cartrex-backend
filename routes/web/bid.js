const express = require('express');
const router = express.Router();
const bidController = require('../../controllers/bidsController');
const { protect, authorize, requireProfileComplete } = require('../../middleware/auth');

// Create new bids - Shipper only
router.post('/getAddBid', bidController.createBid);
router.put('/editBid/:bidId', bidController.editBid);

//update bids status by user Id 
router.put('/updatebidstatusbyuserId/:userId/:bidId' , bidController.updatebidstatusbyuserId);

router.put('/updateAcceptBidstatus/:userId/:bidId',bidController.updateAcceptbidstatus);
// cancel status
router.put('/updateBidStatusCancel/:userId/:bidId',bidController.updateBidStatusCancel);


module.exports = router;
