const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Audit Schema
const auditSchema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date },
  deletstatus: {
    type: Number,
    enum: [0, 1], // Only allow 0 or 1
    default: 0
  },
  deletedipAddress: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String }
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String,select: false },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, trim: true },
  phone: { type: String},
  // role: { type: String, enum: ['admin', 'carrier', 'shipper'], required: true },
  role: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "AdminRole",
  required: true
},
approvalStatus: {
  type: String,
  enum: ["pending","approved"],
  default: "pending"
},

  isApproved: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  mfaEnabled: { type: Boolean, default: false },
  profileCompleted: { type: Boolean, default: false },
  ssoProvider: { type: String, enum: ['google-oauth2', 'apple', 'microsoft', 'onelogin','windowslive', null], default: null },
  ssoId: { type: String },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  verifyuser:{type:String, enum:["verified","unverified"], default: "unverified"},
  phoneverifyuser:{type:String, enum:["verified","unverified"], default: "unverified"},
  //  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletstatus: {
    type: Number,
    enum: [0, 1],   // Only allow 0 or 1
    default: 0      // Default value is 0
  },
  deletedAt: { type: Date },
  deletedipAddress: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String },
  audit: { type: auditSchema } // embedding audit schema
 

});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
