const Outpass = require('../models/Outpass');
const Student = require('../models/Student');
const Notification = require('../models/Notification');

exports.getOutpasses = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'warden') filter.hostelId = req.user.hostelId;
    if (req.query.hostelId) filter.hostelId = req.query.hostelId;
    if (req.query.status) filter.status = req.query.status;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const [outpasses, total] = await Promise.all([
      Outpass.find(filter)
        .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email phone' } })
        .populate('hostelId', 'name code')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit).limit(limit),
      Outpass.countDocuments(filter)
    ]);
    res.json({ success: true, data: outpasses, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyOutpasses = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });
    const outpasses = await Outpass.find({ studentId: student._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: outpasses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.applyOutpass = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });
    const outpass = await Outpass.create({ studentId: student._id, hostelId: student.hostelId, ...req.body });
    res.status(201).json({ success: true, data: outpass, message: 'Outpass application submitted successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.reviewOutpass = async (req, res) => {
  try {
    const { status, remarks, rejectionReason } = req.body;
    const outpass = await Outpass.findById(req.params.id).populate({ path: 'studentId', populate: { path: 'userId', select: '_id name' } });
    if (!outpass) return res.status(404).json({ success: false, message: 'Outpass not found' });
    if (outpass.status !== 'pending') return res.status(400).json({ success: false, message: 'Outpass already reviewed' });
    outpass.status = status;
    outpass.reviewedBy = req.user._id;
    outpass.reviewedAt = new Date();
    outpass.remarks = remarks;
    if (status === 'rejected') outpass.rejectionReason = rejectionReason;
    await outpass.save();
    // Send notification to student
    if (outpass.studentId?.userId?._id) {
      await Notification.create({
        userId: outpass.studentId.userId._id,
        title: `Outpass ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        message: status === 'approved' ? 'Your outpass request has been approved.' : `Your outpass request was rejected. ${rejectionReason || ''}`,
        type: 'outpass',
        referenceId: outpass._id,
        referenceModel: 'Outpass'
      });
    }
    res.json({ success: true, data: outpass, message: `Outpass ${status} successfully` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markReturn = async (req, res) => {
  try {
    const outpass = await Outpass.findByIdAndUpdate(req.params.id,
      { status: 'returned', actualReturnDate: new Date() },
      { new: true }
    );
    res.json({ success: true, data: outpass, message: 'Return marked successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancelOutpass = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    const outpass = await Outpass.findOne({ _id: req.params.id, studentId: student._id, status: 'pending' });
    if (!outpass) return res.status(404).json({ success: false, message: 'Outpass not found or cannot be cancelled' });
    await Outpass.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Outpass cancelled successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
