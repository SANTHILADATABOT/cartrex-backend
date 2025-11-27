const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');
const { generateToken, generateOTP } = require('../utils/jwt');

// Auth routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOTP);
router.post('/userVerificaion', authController.UserVerification);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/logout', authController.logout);

// Google SSO example
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = generateToken(req.user._id);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// Session check route
router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Not logged in' });
  }
  res.json({ success: true, user: req.session.user });
});

module.exports = router;
