const express = require('express');
const router = express.Router();
const {
  getAllSpaces,
  getspacebyId,
  updateSpaceStatus,
  DeleteSpace,
  deleteSelectedSpace,
  updatespace
} = require('../../controllers/admin/spaceListingController');

router.get('/getallspaces', getAllSpaces);
router.get('/getspacebyId/:id', getspacebyId);
router.put('/updatespacestatus/:id', updateSpaceStatus);
router.put('/updatespace/:spaceid', updatespace);
router.delete('/deletespace/:id', DeleteSpace);
router.delete('/deleteSelectedSpace', deleteSelectedSpace);

module.exports = router;
