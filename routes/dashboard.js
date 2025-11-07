const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.post('/bookings', dashboardController.getCarrierBookings);

// Session check route
router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Not logged in' });
  }
  res.json({ success: true, user: req.session.user });
});

module.exports = router;