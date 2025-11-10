// models/Location.js
const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    stateCode: { type: String, required: true, uppercase: true, trim: true },
    zipcode: {
      type: String,
      required: true,
      match: [/^\d{5}(-\d{4})?$/, "Invalid ZIP code"],
    },
    fullAddress: { type: String, required: true, trim: true },
    formattedAddress: { type: String, trim: true },
    placeId: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    deletedAt: { type: Date, default: null },
    deletstatus: { type: Number, default: 0 },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

// 🟢 This is the correct export for CommonJS
module.exports = mongoose.model("Location", locationSchema);
