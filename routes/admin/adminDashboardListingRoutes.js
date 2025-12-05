const express = require('express');
const router = express.Router();
const DashboardListingController = require('../../controllers/admin/adminDashboardListingController');

router.get('/getallcompletedbookingsandbids/completed', DashboardListingController.getallcompletedbookingsandbids);

router.post('/getdashboardcounts/counts', DashboardListingController.getDashboardCounts);

module.exports = router;