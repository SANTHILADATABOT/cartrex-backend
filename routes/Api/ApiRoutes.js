const express = require('express');
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const { signup, login, logout, verifyOtp, sendOtp, UserVerification, forgotPassword, resetPassword ,signUpVerification} = require('../../controllers/api/authController');
const { createSpace, searchSpaces, getSpaces, updateSpace, deleteSpace, getspacedetails, getSpaceResult, getAllLocations, getcategorysubcategories, addSpacesDetails, getSpacesByCarrierUserId, editSpacesDetails } = require('../../controllers/api/spaceController');
const { createOrUpdateProfile,checkCarrierProfileCompleteTruckHave } = require('../../controllers/api/carrierController');
const { createOrUpdateshipperProfile, getshipperbyId} = require('../../controllers/api/shipperController');
const {getReviewRouteDetails} = require('../../controllers/api/RouteController');
const { createTruckProfile, uploadTruckPhotos, createTruckRoute ,getTruckDetails, createTruckProfileAndRoute, editTruckProfileAndRoute} = require('../../controllers/api/TruckController');
const {createBooking, 
      getBookingsByUserId, 
      updateAcceptbookingstatus} = require('../../controllers/api/bookingController');
const {getallbidsfilter,getBidsByCarrierUserId, getBidsByShipperUserId ,updateAcceptbidstatus, createBid, editBidDetails } = require('../../controllers/api/bidsController');
const upload = multer({ storage: multer.memoryStorage() });


//auth 
router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/sendOtp', sendOtp);
router.post('/userVerificaion', UserVerification);
router.post('/signUpVerification', signUpVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', logout);

//carrier 

//router.post('/carrierprofile', upload.single('photo'), createOrUpdateCarrierProfile);
router.post('/createupdateProfile',upload.single('photo'),createOrUpdateProfile);
router.get('/checkCarrierProfileCompleteTruckHave/:userId', checkCarrierProfileCompleteTruckHave);

//router.post('/createupdateProfilePhoto', upload.single('photo'), createupdateProfilePhoto);

//shipper

router.post('/shipperprofile', upload.single('photo'), createOrUpdateshipperProfile);
router.get('/getshipperbyId/:shipperId',getshipperbyId)

//bid
router.get('/getallbidsfilter',getallbidsfilter);

router.post('/getAddBid', upload.array('photos', 10), createBid);
router.put('/editBidDetails/:bidId', upload.array('photos', 10),editBidDetails);

router.get('/getBidsByCarrierUserId/:userId',getBidsByCarrierUserId);
router.get('/getBidsByShipperUserId/:userId',getBidsByShipperUserId);



router.put('/updateAcceptBidstatus/:userId/:bidId',updateAcceptbidstatus);

//booking
router.post('/addbooking', upload.array('photos', 10),createBooking);

router.get('/getBookingsByUserId/:userId',getBookingsByUserId);

//update Accept booking status for carrier 
router.put('/updateAcceptbookingstatus/:userId/:bookingId',updateAcceptbookingstatus);

//truck

// router.post("/createtruckprofile",upload.fields([
//         { name: "insurance", maxCount: 1 }
//     ]),  createTruckProfile);

router.post("/uploadtruckphotos",upload.fields([
        { name: "truckProfile", maxCount: 1 },
        { name: "coverPhoto", maxCount: 1 },
        { name: "photos", maxCount: 6 }
    ]),
    uploadTruckPhotos
);

// router.post("/createtruckroute", createTruckRoute);

router.post("/createTruckProfileAndRoute",upload.fields([
        { name: "insurance", maxCount: 1 }
    ]),createTruckProfileAndRoute);

router.put("/edittruckprofile",upload.fields([
        { name: "insurance", maxCount: 1 }
    ]),editTruckProfileAndRoute);


router.get("/getTruckDetails",getTruckDetails);

//space

router.get('/getSpaceResult', getSpaceResult);
router.get('/getSpacesByCarrierUserId/:userId' , getSpacesByCarrierUserId)

//post a space
router.get('/getspacedetails/:userId',getspacedetails);
router.get('/getAllLocations', getAllLocations);
router.get("/getcategorysubcategories", getcategorysubcategories);

//post a space view 
router.post('/addSpacesDetails/:carrierId',addSpacesDetails);



//route
router.get('/getreviewroutedetails', getReviewRouteDetails);


module.exports = router;