const express = require('express');
const router = express.Router();
const adminComplaintsController = require('../../controllers/admin/adminComplaintsController');

router.get('/getallcomplaints', adminComplaintsController.getAllComplaints);
router.get('/getcomplainbyid/:complaintId', adminComplaintsController.getComplaintById);
router.put("/updatecomplaintstatus/:complaintId", adminComplaintsController.updateComplaintStatus);
router.put("/updatepriority/:complaintId", adminComplaintsController.updatePriority);

router.put("/updateComplaint/:complaintId", adminComplaintsController.updateComplaint);

router.delete("/deleteComplaint/:complaintId", adminComplaintsController.deleteComplaint);


module.exports = router;
