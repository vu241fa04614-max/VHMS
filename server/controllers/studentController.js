const Student = require('../models/Student');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const buildPagination = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

exports.getStudents = async (req, res) => {
  try {
    const { page, limit, skip } = buildPagination(req.query);
    const filter = { isActive: true };
    if (req.query.hostelId) filter.hostelId = req.query.hostelId;
    if (req.query.department) filter.department = req.query.department;
    if (req.query.year) filter.year = req.query.year;
    if (req.query.search) {
      const regex = { $regex: req.query.search, $options: 'i' };
      filter.$or = [{ registrationNumber: regex }];
    }
    const [students, total] = await Promise.all([
      Student.find(filter)
        .populate('userId', 'name email phone')
        .populate('hostelId', 'name code')
        .populate('roomId', 'roomNumber')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Student.countDocuments(filter)
    ]);
    res.json({ success: true, data: students, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id })
      .populate('userId', 'name email phone')
      .populate('hostelId', 'name code contactPhone')
      .populate({ path: 'roomId', populate: { path: 'blockId', select: 'name code' } })
      .populate('allocationId');
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('hostelId', 'name code')
      .populate({ path: 'roomId', populate: { path: 'blockId', select: 'name code' } });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const { name, email, password, phone, registrationNumber, department, year, ...rest } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email, password, phone, role: 'student' });
    const student = await Student.create({ userId: user._id, registrationNumber, department, year, ...rest });
    res.status(201).json({ success: true, data: student, message: 'Student created successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: student, message: 'Student updated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    await User.findByIdAndUpdate(student.userId, { isActive: false });
    res.json({ success: true, message: 'Student deactivated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
