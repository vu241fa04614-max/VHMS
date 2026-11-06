const MessMenu = require('../models/MessMenu');

exports.getCurrentMenu = async (req, res) => {
  try {
    const menu = await MessMenu.findOne({ hostelId: req.params.hostelId, isActive: true }).sort({ weekStartDate: -1 });
    res.json({ success: true, data: menu });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMenuHistory = async (req, res) => {
  try {
    const menus = await MessMenu.find({ hostelId: req.params.hostelId }).sort({ weekStartDate: -1 }).limit(10);
    res.json({ success: true, data: menus });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createMenu = async (req, res) => {
  try {
    const menu = await MessMenu.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: menu, message: 'Mess menu created' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateMenu = async (req, res) => {
  try {
    const menu = await MessMenu.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: menu, message: 'Mess menu updated' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
