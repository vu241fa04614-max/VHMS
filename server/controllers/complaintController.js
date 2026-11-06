const Complaint = require('../models/Complaint');
const Student = require('../models/Student');
const Notification = require('../models/Notification');

exports.getComplaints = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'warden') filter.hostelId = req.user.hostelId;
    if (req.query.hostelId) filter.hostelId = req.query.hostelId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email' } })
        .populate('hostelId', 'name code')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit).limit(limit),
      Complaint.countDocuments(filter)
    ]);
    res.json({ success: true, data: complaints, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyComplaints = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });
    const complaints = await Complaint.find({ studentId: student._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.submitComplaint = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });
    const complaint = await Complaint.create({ studentId: student._id, hostelId: student.hostelId, ...req.body });
    res.status(201).json({ success: true, data: complaint, message: 'Complaint submitted successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status, resolutionDetails, assignedTo } = req.body;
    const update = { status };
    if (resolutionDetails) update.resolutionDetails = resolutionDetails;
    if (assignedTo) update.assignedTo = assignedTo;
    if (status === 'resolved') update.resolvedAt = new Date();
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate({ path: 'studentId', populate: { path: 'userId', select: '_id name' } });
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    if (complaint.studentId?.userId?._id) {
      await Notification.create({
        userId: complaint.studentId.userId._id,
        title: 'Complaint Update',
        message: `Your complaint "${complaint.title}" status has been updated to ${status}.`,
        type: 'complaint',
        referenceId: complaint._id,
        referenceModel: 'Complaint'
      });
    }
    res.json({ success: true, data: complaint, message: 'Complaint updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.submitFeedback = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    const complaint = await Complaint.findOne({ _id: req.params.id, studentId: student._id });
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    complaint.feedback = req.body.feedback;
    await complaint.save();
    res.json({ success: true, message: 'Feedback submitted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
