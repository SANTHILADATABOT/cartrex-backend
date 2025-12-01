const express = require('express');
const router = express.Router();
const truckController = require('../../controllers/truckController');
const { protect, authorize, requireProfileComplete } = require('../../middleware/auth');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/createTruckProfile', upload.fields([
  { name: 'insurance', maxCount: 1 },
  { name: 'coverPhoto', maxCount: 1 },
  { name: 'main', maxCount: 1 },
  { name: 'photos', maxCount: 6 }
]), truckController.createTruckProfile);

router.put('/updateTruck/:truckId/:routeId' ,upload.fields([
  { name: 'insurance', maxCount: 1 },
  { name: 'coverPhoto', maxCount: 1 },
  { name: 'main', maxCount: 1 },
  { name: 'photos', maxCount: 6 }
]), truckController.updateTruck);

router.get('/', protect, truckController.getTrucks);

router.get('/:id', protect, truckController.getTruckById);

router.put('/:id', protect, authorize('carrier'), truckController.updateTruck);

router.delete('/:id', protect, authorize('carrier'), truckController.deleteTruck);

module.exports = router;
