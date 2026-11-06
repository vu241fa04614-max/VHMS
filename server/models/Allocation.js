const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
  blockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Block', required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  bedNumber: { type: String, trim: true },
  allocationDate: { type: Date, default: Date.now },
  vacatingDate: { type: Date },
  academicYear: { type: String, required: true, trim: true },
  status: { type: String, enum: ['active', 'vacated', 'transferred'], default: 'active' },
  allocatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  remarks: { type: String },
}, { timestamps: true });

allocationSchema.index({ studentId: 1, status: 1 });
allocationSchema.index({ roomId: 1, status: 1 });

module.exports = mongoose.model('Allocation', allocationSchema);
