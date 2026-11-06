const Block = require('../models/Block');

exports.getBlocks = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.hostelId) filter.hostelId = req.query.hostelId;
    const blocks = await Block.find(filter).populate('hostelId', 'name code').sort({ name: 1 });
    res.json({ success: true, data: blocks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBlock = async (req, res) => {
  try {
    const block = await Block.findById(req.params.id).populate('hostelId', 'name code');
    if (!block) return res.status(404).json({ success: false, message: 'Block not found' });
    res.json({ success: true, data: block });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createBlock = async (req, res) => {
  try {
    const block = await Block.create(req.body);
    res.status(201).json({ success: true, data: block, message: 'Block created successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateBlock = async (req, res) => {
  try {
    const block = await Block.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!block) return res.status(404).json({ success: false, message: 'Block not found' });
    res.json({ success: true, data: block, message: 'Block updated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteBlock = async (req, res) => {
  try {
    await Block.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Block deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
