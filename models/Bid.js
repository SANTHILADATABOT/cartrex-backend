const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  shipperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipper', required: true },
  carrierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Carrier' },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  userId:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},

  bidValue: { type: Number, required: true },
  bidValuetaxinc: {
    taxValue: { type: String },
    tax: { type: String },
    total: { type: String }
  },
  bidId: { type: String, required: true },
  vehicleDetails: {
    licenseNumber: { type: String, trim: true },
    brand: { type: String, trim: true },
    vehicleType: { type: String, trim: true },
    yearMade: { type: Number },
    features: [String], // Array of features
    condition: { type: String, enum: ['operable', 'inoperable'], default: 'operable' },
    quantity: { type: Number, default: 1 },
    photos: [String], // store image URLs or file paths
    contains100lbs: { type: Boolean, default: false },
    estimate_extra_weight: {type: String}
  },

  shippingDescription: { type: String, trim: true }, // "What are you shipping?"
  transportType: { type: String, trim: true },
  vinNumber: { type: String, trim: true },
  lotNumber: { type: String, trim: true },

  pickup: {
    city: { type: String },
    state: { type: String },
    zipcode: { type: String },
    pickupDate: { type: Date },
    pickupLocationType: { type: String, trim: true }
  },

  delivery: {
    city: { type: String },
    state: { type: String },
    zipcode: { type: String }
  },
  shippingInfo: {
    whatIsBeingShipped: { type: String},
    whatIsBeingShippedId: { type: String},
    additionalComments: { type: String}
  },

  timing: { 
    type: String, 
    enum: ['good_till_cancelled', '1_week'], 
    default: 'good_till_cancelled' 
  },

  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'], 
    default: 'pending' 
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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

// Index for faster queries (example: find bids for a shipment)
bidSchema.index({ shipmentId: 1, carrierId: 1 });

module.exports = mongoose.model('Bid', bidSchema);
