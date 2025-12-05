const express = require('express');
const router = express.Router();
const adminComplaintsController = require('../../controllers/admin/adminComplaintsController');

router.get('/getallcomplaints', adminComplaintsController.getAllComplaints);
router.get('/getcomplainbyid/:complaintId', adminComplaintsController.getComplaintById);
router.put("/updatecomplaintstatus/:complaintId", adminComplaintsController.updateComplaintStatus);
router.put("/updatepriority/:complaintId", adminComplaintsController.updatePriority);


module.exports = router;
