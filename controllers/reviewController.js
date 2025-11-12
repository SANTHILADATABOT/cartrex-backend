const Review = require("../models/Reviews");


exports.createReview = async (req, res) => {
  try {
    const {
      bookingId,
      carrierId,
      shipperId,
      overallRating,
      comment,
    } = req.body;

    // Basic validation
    if (!bookingId || !carrierId || !shipperId || !overallRating) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing',
      });
    }

    const newReview = new Reviews({
      bookingId,
      carrierId,
      shipperId,
      overallRating,
      comment,
      createdBy: req.user?._id || shipperId, // depends on your auth setup
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    const savedReview = await newReview.save();

    return res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: savedReview,
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating review',
      error: error.message,
    });
  }
};


exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate("userId bidId bookingId");
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching reviews" });
  }
};
