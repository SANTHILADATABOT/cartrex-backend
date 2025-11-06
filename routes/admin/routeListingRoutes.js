const express = require('express');
const router = express.Router();
const routeController = require('../../controllers/admin/routeListingController');

// Get all routes
router.get('/getallroutes', routeController.getallroutes);

router.get('/getroutebyId/:routeId',routeController.getroutebyId);

//Update
router.put('/updateroute/:routeId', routeController.updateroute);

//delete
router.delete('/deleteroute/:routeId', routeController.deleteroute);
router.delete('/deleteSelectedRoute', routeController.deleteSelectedRoute);

router.put('/updateStatusRoute/:routeId',routeController.updateStatusRoute);

module.exports = router;
