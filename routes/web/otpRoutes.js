const express = require("express");
const router = express.Router();
const { sendOtp, verifyOtp } = require("../../controllers/otpController");

// SEND OTP
router.post("/send", sendOtp);

// VERIFY OTP
router.post("/verify", verifyOtp);

module.exports = router;
