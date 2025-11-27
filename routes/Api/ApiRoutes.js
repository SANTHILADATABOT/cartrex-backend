const express = require('express');
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const { signup, login, logout, verifyOtp, sendOtp, UserVerification, forgotPassword, resetPassword } = require('../../controllers/api/authController');
const { createSpace, searchSpaces, getSpaces, updateSpace, deleteSpace, getspacedetails, getSpaceResult, addSpacesDetails, getSpacesByCarrierUserId, editSpacesDetails } = require('../../controllers/api/spaceController');
const { createupdateProfile, createupdateProfilePhoto } = require('../../controllers/api/carrierController');
const { createOrUpdateshipperProfile } = require('../../controllers/api/shipperController');
const { createTruckProfile, uploadTruckPhotos, createTruckRoute } = require('../../controllers/api/TruckController');
const upload = multer({ storage: multer.memoryStorage() });
//auth 
router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/sendOtp', sendOtp);
router.post('/userVerificaion', UserVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', logout);

//carrier 

//router.post('/carrierprofile', upload.single('photo'), createOrUpdateCarrierProfile);
router.post('/createupdateProfile', createupdateProfile);

router.post('/createupdateProfilePhoto', upload.single('photo'), createupdateProfilePhoto);

//shipper

router.post('/shipperprofile', upload.single('photo'), createOrUpdateshipperProfile);

//truck

router.post("/createtruckprofile",upload.fields([
        { name: "insurance", maxCount: 1 }
    ]),  createTruckProfile);

router.post("/uploadtruckphotos",upload.fields([
        { name: "truckProfile", maxCount: 1 },
        { name: "coverPhoto", maxCount: 1 },
        { name: "photos", maxCount: 6 }
    ]),
    uploadTruckPhotos
);

router.post("/createtruckroute", createTruckRoute);

//space

router.get('/getSpaceResult', getSpaceResult);



module.exports = router;