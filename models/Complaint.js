const mongoose = require('mongoose');
const complaintSchema = new mongoose.Schema({
  // complaintId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  
  customerName: String,
  complaintType: String,
  description: { type: String, required: true },
  
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'medium' 
  },
  
  status: { 
    type: String, 
    enum: ['open', 'in_progress', 'escalated', 'resolved', 'closed'], 
    default: 'open' 
  },
  
  
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolution: String,
  attachments: [String],
  
  raisedAt: { type: Date, default: Date.now },
  resolvedAt:{ type: Date, default: Date.now },

  createdAt: { type: Date, default: Date.now },
  deletstatus: {
    type: Number,
    enum: [0, 1],   // Only allow 0 or 1
    default: 0      // Default value is 0
  },
  deletedipAddress: { type: String },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', complaintSchema);