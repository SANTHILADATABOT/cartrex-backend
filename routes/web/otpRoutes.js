const express = require("express");
const router = express.Router();
const { sendOtp, verifyOtp } = require("../../controllers/otpController");

// SEND OTP
router.post("/send", sendOtp);
// SEND OTP
router.post("/send-otp", sendOtp);

// VERIFY OTP
router.post("/verify", verifyOtp);
router.post("/verify-otp", verifyOtp);

module.exports = router;
