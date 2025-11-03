// routes/adminUserRoutes.js
const express = require('express');
const router = express.Router();
const adminUserController = require('../../controllers/admin/adminUserlistController');

// Creat Admin User
router.post('/createadminuser', adminUserController.createadminuser);

// GetAll Admin User
router.get('/getalladminusers', adminUserController.getalladminusers);

// Update Admin User
router.put('/updateadminuser/:adminid', adminUserController.updateadminuser);

// Update Admin User Active/Inactive Status
router.put('/updateadminstatus/:adminid', adminUserController.updateadminuserstatus);


// Delete Admin User
router.delete('/deleteadminuser/:adminid', adminUserController.deleteadminuser);
router.delete('/deleteSelectedadminuser', adminUserController.deleteSelectedadminuser);

// Get Adminuser By Id
router.get('/getadminuserbyid/:adminid', adminUserController.getadminuserbyid);


module.exports = router;
