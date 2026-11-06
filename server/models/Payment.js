const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  feeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fee', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  paymentMode: { type: String, enum: ['online', 'cash', 'dd', 'cheque', 'upi'], required: true },
  transactionId: { type: String, trim: true },
  receiptNumber: { type: String, unique: true },
  status: { type: String, enum: ['success', 'failed', 'pending', 'refunded'], default: 'success' },
  collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  remarks: { type: String },
}, { timestamps: true });

paymentSchema.pre('save', function (next) {
  if (!this.receiptNumber) {
    this.receiptNumber = 'RCP-' + Date.now().toString().slice(-10);
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
