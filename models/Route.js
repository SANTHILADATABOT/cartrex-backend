const mongoose = require('mongoose');
const routeSchema = new mongoose.Schema({
  carrierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Carrier', required: true },
   truckId: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck', required: true },
  origin: {
    state: { type: String, required: true },
      stateCode: { type: String, trim: true }, 
    city: { type: String, required: true },
       zipcode: {
      type: String,
      required: true,
      match: [/^\d{5}(-\d{4})?$/, "Invalid ZIP code"],
    },
    fullAddress: { type: String, required: true, trim: true },
    formattedAddress: { type: String, trim: true },
    pickupWindow: { type: String, required: true },
    pickupRadius: { type: Number, required: true } // in miles
  },
  destination: {
    state: { type: String, required: true },
      stateCode: { type: String, trim: true }, 
    city: { type: String, required: true },
       zipcode: {
      type: String,
      required: true,
      match: [/^\d{5}(-\d{4})?$/, "Invalid ZIP code"],
    },
    fullAddress: { type: String, required: true, trim: true },
    formattedAddress: { type: String, trim: true },
    deliveryWindow: { type: String, required: true },
    deliveryRadius: { type: Number, required: true } // in miles
  },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
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

module.exports = mongoose.model('Route', routeSchema);