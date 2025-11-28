const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorize } = require('../../middleware/auth');
const carrierController = require('../../controllers/carrierController');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/profile', upload.single('photo'), carrierController.createOrUpdateProfile);
router.post('/CarrierprofileUpdate', upload.single('photo'), carrierController.CarrierprofileUpdate);
router.get('/profile', protect, authorize('carrier'), carrierController.getProfile);
router.get('/', protect, authorize('admin'), carrierController.getAllCarriers);
router.get('/getcarrierDeatilsbyId/:userid', carrierController.getcarrierDeatilsbyId);
router.put('/:id/approve', protect, authorize('admin'), carrierController.approveCarrier);
router.delete('/:id', protect, authorize('admin'), carrierController.deleteCarrier);

module.exports = router;
