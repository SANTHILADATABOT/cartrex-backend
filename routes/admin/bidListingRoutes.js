const express = require('express');
const router = express.Router();
const bidController = require('../../controllers/admin/bidListingController');

// GET all bids
router.get('/getallbids', bidController.getallbids);

router.post('/getallbidsbyfilter', bidController.getallbidsbyfilter);

router.get('/getbidbyId/:bidId', bidController.getbidbyId);

// UPDATE bid
router.put('/updatebid/:bidId', bidController.updatebid);

router.put('/updatebidstatusbyId/:bidId', bidController.updatebidstatusbyId);

// DELETE bid
router.delete('/deletebid/:bidId', bidController.deletebid);
router.delete('/deleteSelectedBid', bidController.deleteSelectedBid);


router.get('/getBidsByCarrierUserId/:userId',bidController.getBidsByCarrierUserId);
router.post('/getBidsByFilter',bidController.getBidsByFilter);

router.get('/getBidsByShipperUserId/:userId',bidController.getBidsByShipperUserId);



module.exports = router;
