const express = require('express');
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const {signup,login,logout,verifyOtp,sendOtp,UserVerification,forgotPassword,resetPassword,signUpVerification} = require('../../controllers/api/authController');
const {createSpace,searchSpaces,getSpaces,updateSpace,deleteSpace,getspacedetails,getSpaceResult,addSpacesDetails,getSpacesByCarrierUserId,editSpacesDetails} = require('../../controllers/api/spaceController');
const {createOrUpdateCarrierProfile} = require('../../controllers/api/carrierController');
const {createOrUpdateshipperProfile} = require('../../controllers/api/shipperController');
const upload = multer({ storage: multer.memoryStorage() });
//auth 
router.post('/signup', signup);
router.post('/login', login);
router.post('/signUpVerification', signUpVerification);
router.post('/verify-otp', verifyOtp);
router.post('/sendOtp', sendOtp);
router.post('/userVerificaion', UserVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', logout);

//carrier 

router.post('/carrierprofile', upload.single('photo'), createOrUpdateCarrierProfile);

//shipper

router.post('/shipperprofile',upload.single('photo'), createOrUpdateshipperProfile);
//space

router.get('/getSpaceResult', getSpaceResult);



module.exports = router;