const mongoose = require('mongoose');
const spaceSchema = new mongoose.Schema({
  carrierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Carrier', required: true },
  truckId: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  origin: {
    location: { type: String, required: true },
    city: { type: String },
    state: { type: String },
    stateCode: { type: String },
    pickupDate: { type: Date, required: true },
    pickupWindow: { type: String, required: true },
    pickupRadius: { type: Number, required: true },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number]
    }
  },
  destination: {
    location: { type: String, required: true },
    city: { type: String },
    state: { type: String },
      stateCode: { type: String },
    deliveryDate: { type: Date, required: true },
    deliveryWindow: { type: String, required: true },
    deliveryRadius: { type: Number, required: true },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number]
    }
  },
  availableSpaces: { type: Number, required: true, min: 1, max: 9 },
  message: { type: String, required: false },
  bookedSpaces: { type: Number, default: 0 },
  rateCard: [{
    vehicleType: { type: String, required: true },
    basePrice: { type: Number, required: true },
    variants: [{
      name: { type: String },
      price: { type: Number },
    }]
  }],
  status: { type: String, enum: ['active', 'booked', 'expired'], default: 'active' },
  postedDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
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

spaceSchema.index({ 'origin.coordinates': '2dsphere' });
spaceSchema.index({ 'destination.coordinates': '2dsphere' });

module.exports = mongoose.model('Space', spaceSchema);