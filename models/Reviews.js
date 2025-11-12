const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  carrierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shipperId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  truckId: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck', required: true },

  overallRating: { type: Number, required: true, min: 1, max: 5 }, // Rating out of 5
  comment: { type: String, trim: true },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletstatus: {
    type: Number,
    enum: [0, 1],   // Only allow 0 or 1
    default: 0      // Default value is 0
  },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date },
    deletedipAddress: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String }
});

// Optional indexes for faster queries
reviewSchema.index({ bookingId: 1 });
reviewSchema.index({ carrierId: 1 });
reviewSchema.index({ shipperId: 1 });

module.exports = mongoose.model('Reviews', reviewSchema);
