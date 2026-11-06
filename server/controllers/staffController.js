const Staff = require('../models/Staff');
const User = require('../models/User');

exports.getStaff = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.hostelId) filter.hostelId = req.query.hostelId;
    const staff = await Staff.find(filter).populate('userId', 'name email phone').populate('hostelId', 'name code');
    res.json({ success: true, data: staff });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createStaff = async (req, res) => {
  try {
    const { name, email, password, phone, role = 'warden', ...rest } = req.body;
    const user = await User.create({ name, email, password, phone, role });
    const staff = await Staff.create({ userId: user._id, ...rest });
    res.status(201).json({ success: true, data: staff, message: 'Staff member created' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
    res.json({ success: true, data: staff, message: 'Staff updated' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    await Staff.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Staff deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
