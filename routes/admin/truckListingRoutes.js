const express = require('express');
const router = express.Router();
const truckController = require('../../controllers/admin/truckListingController');

// Get all trucks
router.get('/getalltrucks', truckController.getalltrucks);

// Update truck by ID
router.put('/updatetruck/:truckId', truckController.updatetruck);

router.put('/updatetruckstatusbyId/:truckId',truckController.updatetruckstatusbyId);

// router.get('/gettruckbyId/:truckId', truckController.gettruckbyId);
router.get('/gettruckbyId/:truckId', truckController.gettruckbyId);

// Soft delete truck
router.delete('/deletetruck/:truckId', truckController.deletetruck);
router.delete('/deleteselectedTruck', truckController.deleteselectedTruck);

router.post('/createTruck', truckController.createTruck);

module.exports = router;
