// routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

const { protect } = require('../middleware/auth'); // optional, if using auth middleware

// POST - Create a new review
router.post('/createReview', reviewController.createReview);
router.post('/getReviews', reviewController.getReviews);

module.exports = router;