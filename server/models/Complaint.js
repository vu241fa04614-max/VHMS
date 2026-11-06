const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
  category: {
    type: String,
    enum: ['electrical', 'plumbing', 'furniture', 'cleaning', 'wifi', 'security', 'mess', 'other'],
    required: true
  },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: { type: String, enum: ['pending', 'in_progress', 'resolved', 'closed', 'rejected'], default: 'pending' },
  attachments: [{ type: String }],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date },
  resolutionDetails: { type: String },
  feedback: { rating: { type: Number, min: 1, max: 5 }, comment: { type: String } },
  complaintNumber: { type: String, unique: true },
}, { timestamps: true });

complaintSchema.pre('save', function (next) {
  if (!this.complaintNumber) {
    this.complaintNumber = 'CMP-' + Date.now().toString().slice(-8);
  }
  next();
});

complaintSchema.index({ studentId: 1, status: 1 });
complaintSchema.index({ hostelId: 1, status: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
