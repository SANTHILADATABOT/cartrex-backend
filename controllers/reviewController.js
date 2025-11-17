const Reviews = require("../models/Reviews");


exports.createReview = async (req, res) => {
  try {
    // return console.log("req.body",req.body)
    const {
      bookingId,
      carrierId,
      bidId,
      shipperId,
      overallRating,
      comment,
      truckId
    } = req.body;

    // Basic validation
    if (!carrierId || !shipperId || !truckId) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing',
      });
    }

    const query = {
      shipperId,
      truckId,
    };

    // Add bookingId only if it exists  
    if (bookingId) {
      query.bookingId = bookingId;
    }

    // Add bidId only if it exists  
    if (bidId) {
      query.bidId = bidId;
    }
     // Check if review already exists for this booking + truck + shipper + carrier
    const existingReview = await Reviews.findOne(query);

    // If exists → Update Review
    if (existingReview) {
      existingReview.overallRating = overallRating;
      existingReview.comment = comment;
      existingReview.updatedAt = new Date();
      existingReview.updatedBy = req.user?._id || shipperId;

      const updatedReview = await existingReview.save();

      return res.status(200).json({
        success: true,
        message: "Review updated successfully.",
        data: updatedReview,
      });
    }
    const newReview = new Reviews({
      bookingId,
      bidId,
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

exports.deleteReview = async (req, res) => {
  try {
    const { reviewid } = req.params;

    const {
    bookingId,
    bidId,
    carrierId,
    shipperId,
    truckId
  } = req.body;

  const query = {
    _id: reviewid,
    shipperId,
    truckId,
  };

  // Add bookingId only if it exists  
  if (bookingId) {
    query.bookingId = bookingId;
  }

  // Add bidId only if it exists  
  if (bidId) {
    query.bidId = bidId;
}
    // Check if review exists with matching fields
    const existingReview = await Reviews.findOne(query);

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found or details do not match.",
      });
    }

    // Delete review
    await Reviews.findByIdAndDelete(reviewid);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
      data: existingReview,
    });

  } catch (error) {
    console.error("Error deleting review:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting review.",
    });
  }
};
