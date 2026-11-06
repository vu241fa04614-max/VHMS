const mongoose = require('mongoose');

const outpassSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
  type: { type: String, enum: ['day', 'night', 'weekend', 'vacation'], default: 'day' },
  purpose: { type: String, required: true, trim: true },
  destination: { type: String, trim: true },
  departureDate: { type: Date, required: true },
  expectedReturnDate: { type: Date, required: true },
  actualReturnDate: { type: Date },
  parentContactDuringLeave: { type: String, trim: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'returned', 'overstayed'], default: 'pending' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  remarks: { type: String },
  rejectionReason: { type: String },
}, { timestamps: true });

outpassSchema.index({ studentId: 1, status: 1 });
outpassSchema.index({ hostelId: 1, status: 1 });

module.exports = mongoose.model('Outpass', outpassSchema);
