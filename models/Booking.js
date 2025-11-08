const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  spaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Space', required: true },
  shipperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipper', required: true },
  carrierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Carrier', required: true },
  truckId: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck', required: true },
  

  vehicleDetails: {
    licenseNumber: { type: String, required: true, trim: true },
    brand: { type: String, trim: true },
    vehicleType: { type: String, trim: true },
    yearMade: { type: Number },
    features: [String],
    condition: { type: String, enum: ['new', 'used', 'excellent', 'good', 'fair', 'poor'], default: 'good' },
    quantity: { type: Number, default: 1 },
    photos: [String], // URLs of uploaded photos
    contains100lbs: { type: Boolean, default: false }
  },

  shippingInfo: {
    whatIsBeingShipped: { type: String, trim: true },
    additionalComments: { type: String, trim: true }
  },

  pickup: {
    location: { type: String, required: true },
      stateCode: { type: String, trim: true }, 
    pickupDate: { type: Date, required: true },
    locationType: { type: String, enum: ['Business', 'AuctionHouse', 'CarDealership'], trim: true }
  },

  delivery: {
    location: { type: String, required: true },
      stateCode: { type: String, trim: true }, 
  },

  status: { 
    type: String, 
    enum: ['confirmed','pending','in_progress','cancelled','completed'], 
    default: 'pending' 
  },

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

// Optional: index for faster queries
bookingSchema.index({ shipperId: 1, carrierId: 1 });
bookingSchema.index({ spaceId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
