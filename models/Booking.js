const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  spaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Space', required: true },
  shipperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipper' },
  carrierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Carrier' },
  truckId: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck' },
  userId:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  bookingId:{type:String},
  bookValuetaxinc: {
    taxValue: { type: String },
    tax: { type: String },
    total: { type: String },
    price:{type: String},
  },
  vehicleDetails: {
    licenseNumber: { type: String, trim: true },
    brand: { type: String, trim: true },
    vehicleType: { type: String, trim: true },
    vehicleTypeName:{type: String, trim: true},
    yearMade: { type: Number },
    features: [String], // Array of features
    condition: { type: String, enum: ['operable', 'inoperable'], default: 'operable' },
    quantity: { type: Number, default: 1 },
    photos: [String], // store image URLs or file paths
    contains100lbs: { type: Boolean, default: false },
    estimate_extra_weight: {type: String}
  },
  vinNumber: { type: String},
  shippingInfo: {
    whatIsBeingShipped: { type: String, trim: true },
    whatIsBeingShippedId: { type: String, trim: true },
    additionalComments: { type: String, trim: true }
  },

  pickup: {
    city: { type: String },
    state: { type: String },
    stateCode: { type: String, trim: true },
    location: { type: String},
    pickupDate: { type: Date},
    locationType: { type: String, enum: ['Business', 'AuctionHouse', 'CarDealership'], trim: true }
  },

  delivery: {
    city: { type: String },
    state: { type: String },
    location: { type: String},
    deliveryDate: { type: Date},
    stateCode: { type: String, trim: true },
  },
  status: { 
    type: String, 
    enum: ['confirmed','pending','in_progress','cancelled','completed','ready_for_pickup'], 
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
