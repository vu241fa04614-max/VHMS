const Room = require('../models/Room');

exports.getRooms = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.hostelId) filter.hostelId = req.query.hostelId;
    if (req.query.blockId) filter.blockId = req.query.blockId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;
    const rooms = await Room.find(filter)
      .populate('hostelId', 'name code')
      .populate('blockId', 'name code')
      .sort({ roomNumber: 1 });
    res.json({ success: true, data: rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('hostelId', 'name code')
      .populate('blockId', 'name code');
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, data: room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({ success: true, data: room, message: 'Room created successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, data: room, message: 'Room updated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    await Room.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Room deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
