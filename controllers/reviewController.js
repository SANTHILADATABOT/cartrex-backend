const Reviews = require("../models/Reviews");


exports.createReview = async (req, res) => {
  try {
    // return console.log("req.body",req.body)
    const {
      bookingId,
      carrierId,
      shipperId,
      overallRating,
      comment,
      truckId
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
      truckId,
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
    console.log('Error creating review:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating review',
      error: error.message,
    });
  }
};


exports.getReviews = async (req, res) => {
  try {
    const ReviewData= await Reviews.find();
    res.status(200).json({ success: true, data: ReviewData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message});
  }
};
