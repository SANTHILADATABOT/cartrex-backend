const express = require('express');
const router = express.Router();
const DashboardListingController = require('../../controllers/admin/adminDashboardListingController');

router.get('/getallcompletedbookingsandbids/completed', DashboardListingController.getallcompletedbookingsandbids);

router.get('/getdashboardcounts/counts', DashboardListingController.getdashboardcounts);

module.exports = router;