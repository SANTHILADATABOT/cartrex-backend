const express = require('express');
const router = express.Router();
const spaceController = require('../../controllers/spaceController');
const { protect, authorize, requireProfileComplete } = require('../../middleware/auth');

router.post('/', protect, authorize('carrier'), requireProfileComplete, spaceController.createSpace);

router.get('/search', protect, authorize('shipper'), spaceController.searchSpaces);

router.get('/', protect, authorize('carrier'), spaceController.getSpaces);

router.put('/:id', protect, authorize('carrier'), spaceController.updateSpace);

router.delete('/:id', protect, authorize('carrier'), spaceController.deleteSpace);

// Already written post a space routes's
router.get('/getspacedetails/:userId', spaceController.getspacedetails);

router.post('/addSpacesDetails/:carrierId',spaceController.addSpacesDetails);

module.exports = router;
