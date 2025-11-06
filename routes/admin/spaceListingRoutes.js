const express = require('express');
const router = express.Router();
const {
  getAllSpaces,
  getspacebyId,
  updateSpaceStatus,
  DeleteSpace,
  updatespace,
  getSpacesByCarrierUserId
} = require('../../controllers/admin/spaceListingController');

router.get('/getallspaces', getAllSpaces);
router.get('/getspacebyId/:id', getspacebyId);
router.put('/updatespacestatus/:id', updateSpaceStatus);
router.put('/updatespace/:spaceid', updatespace);
router.delete('/deletespace/:id', DeleteSpace);

router.get('/getSpacesByCarrierUserId/:userId', getSpacesByCarrierUserId);
module.exports = router;
