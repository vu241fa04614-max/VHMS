const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
  academicYear: { type: String, required: true },
  semester: { type: Number, enum: [1, 2], required: true },
  hostelFee: { type: Number, required: true, default: 0 },
  messFee: { type: Number, default: 0 },
  maintenanceFee: { type: Number, default: 0 },
  otherFees: { type: Number, default: 0 },
  totalFee: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  outstandingAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'partial', 'paid', 'overdue'], default: 'pending' },
  dueDate: { type: Date },
  fineAmount: { type: Number, default: 0 },
  waiverAmount: { type: Number, default: 0 },
  remarks: { type: String },
}, { timestamps: true });

feeSchema.pre('save', function (next) {
  this.totalFee = this.hostelFee + this.messFee + this.maintenanceFee + this.otherFees;
  this.outstandingAmount = this.totalFee + this.fineAmount - this.waiverAmount - this.paidAmount;
  if (this.paidAmount >= this.totalFee + this.fineAmount - this.waiverAmount) {
    this.status = 'paid';
  } else if (this.paidAmount > 0) {
    this.status = 'partial';
  } else if (this.dueDate && new Date() > this.dueDate) {
    this.status = 'overdue';
  } else {
    this.status = 'pending';
  }
  next();
});

feeSchema.index({ studentId: 1, academicYear: 1, semester: 1 });

module.exports = mongoose.model('Fee', feeSchema);
