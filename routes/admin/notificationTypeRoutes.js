const express = require('express');
const router = express.Router();

const notificationTypeController = require('../../controllers/admin/notificationTypeController');

// Get all notification types
router.get('/getallnotificationtypes', notificationTypeController.getAllNotificationTypes);

// Get notification type by ID
router.get('/getnotificationtypebyId/:typeId', notificationTypeController.getNotificationTypeById);

// Create notification type
router.post('/createnotificationtype', notificationTypeController.createNotificationType);

// Update notification type
router.put('/updatenotificationtype/:typeId', notificationTypeController.updateNotificationType);

// Delete single notification type (soft delete)
router.delete('/deletenotificationtype/:typeId', notificationTypeController.deleteNotificationType);


module.exports = router;
