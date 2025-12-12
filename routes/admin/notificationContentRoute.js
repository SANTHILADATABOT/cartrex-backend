const express = require('express');
const router = express.Router();

const notificationContentController = require('../../controllers/admin/notificationContentController');


// Get  notification types
router.get('/getContentByType/:typeId', notificationContentController.getContentByType);

// Get notification content by ID
router.put('/updateNotificationContent/:typeId', notificationContentController.updateNotificationContent);

module.exports = router;

