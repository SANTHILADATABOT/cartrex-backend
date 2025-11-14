const express = require('express');
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const bidController = require('../../controllers/bidsController');
const { protect, authorize, requireProfileComplete } = require('../../middleware/auth');

// Multer setup for booking uploads
const tempDir = path.join(__dirname, "../../uploads/bid");
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

// Create new bids - Shipper only
router.post('/getAddBid', upload.array('photos', 10), bidController.createBid);

router.put('/editBid/:bidId', upload.array('photos', 10), bidController.editBid);

//update bids status by user Id 
router.put('/updatebidstatusbyuserId/:userId/:bidId' , bidController.updatebidstatusbyuserId);

router.put('/updateAcceptBidstatus/:userId/:bidId',bidController.updateAcceptbidstatus);
// cancel status
router.put('/updateBidStatusCancel/:userId/:bidId',bidController.updateBidStatusCancel);


module.exports = router;
