const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorize } = require('../../middleware/auth');
const shipperController = require('../../controllers/shipperController');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/profile', protect, authorize('shipper'), upload.single('photo'), shipperController.createOrUpdateProfile);
router.get('/profile', protect, authorize('shipper'), shipperController.getProfile);
router.get('/', protect, authorize('admin'), shipperController.getAllShippers);
router.get('/getShipperDetailsbyId/:userid', shipperController.getShipperDeatilsbyId);
router.post('/profileShipper', upload.single('photo'), shipperController.createOrUpdateShipperProfile);
router.post('/ShipperProfileUpdate', upload.single('photo'), shipperController.ShipperProfileUpdate);

module.exports = router;
