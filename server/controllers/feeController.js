const Fee = require('../models/Fee');
const Student = require('../models/Student');

exports.getFees = async (req, res) => {
  try {
    const filter = {};
    if (req.query.hostelId) filter.hostelId = req.query.hostelId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const [fees, total] = await Promise.all([
      Fee.find(filter)
        .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email' } })
        .populate('hostelId', 'name code')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit).limit(limit),
      Fee.countDocuments(filter)
    ]);
    res.json({ success: true, data: fees, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyFees = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });
    const fees = await Fee.find({ studentId: student._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: fees });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createFee = async (req, res) => {
  try {
    const fee = await Fee.create(req.body);
    res.status(201).json({ success: true, data: fee, message: 'Fee record created' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateFee = async (req, res) => {
  try {
    const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!fee) return res.status(404).json({ success: false, message: 'Fee record not found' });
    res.json({ success: true, data: fee, message: 'Fee updated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
