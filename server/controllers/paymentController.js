const Payment = require('../models/Payment');
const Fee = require('../models/Fee');

exports.getPayments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.studentId) filter.studentId = req.query.studentId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email' } })
        .sort({ paymentDate: -1 })
        .skip((page - 1) * limit).limit(limit),
      Payment.countDocuments(filter)
    ]);
    res.json({ success: true, data: payments, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.recordPayment = async (req, res) => {
  try {
    const { feeId, amount, paymentMode, transactionId, remarks } = req.body;
    const fee = await Fee.findById(feeId);
    if (!fee) return res.status(404).json({ success: false, message: 'Fee record not found' });
    const payment = await Payment.create({
      feeId, studentId: fee.studentId, amount, paymentMode,
      transactionId, remarks, collectedBy: req.user._id
    });
    fee.paidAmount += amount;
    await fee.save();
    res.status(201).json({ success: true, data: payment, message: 'Payment recorded successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
