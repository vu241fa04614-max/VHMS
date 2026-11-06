const Allocation = require('../models/Allocation');
const Room = require('../models/Room');
const Student = require('../models/Student');

exports.getAllocations = async (req, res) => {
  try {
    const filter = {};
    if (req.query.hostelId) filter.hostelId = req.query.hostelId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.roomId) filter.roomId = req.query.roomId;
    const allocations = await Allocation.find(filter)
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email' } })
      .populate('hostelId', 'name code')
      .populate('blockId', 'name code')
      .populate('roomId', 'roomNumber floor')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: allocations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createAllocation = async (req, res) => {
  try {
    const { studentId, roomId, hostelId, blockId, bedNumber, academicYear } = req.body;
    // Check for existing active allocation
    const existingAllocation = await Allocation.findOne({ studentId, status: 'active' });
    if (existingAllocation) {
      return res.status(400).json({ success: false, message: 'Student already has an active room allocation' });
    }
    // Check room capacity
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    if (room.currentOccupancy >= room.capacity) {
      return res.status(400).json({ success: false, message: 'Room is at full capacity' });
    }
    if (room.status === 'maintenance') {
      return res.status(400).json({ success: false, message: 'Room is under maintenance' });
    }
    const allocation = await Allocation.create({ studentId, roomId, hostelId, blockId, bedNumber, academicYear, allocatedBy: req.user._id });
    // Update room occupancy
    room.currentOccupancy += 1;
    room.status = room.currentOccupancy >= room.capacity ? 'occupied' : 'partially_occupied';
    await room.save();
    // Update student record
    await Student.findByIdAndUpdate(studentId, { roomId, hostelId, allocationId: allocation._id });
    res.status(201).json({ success: true, data: allocation, message: 'Room allocated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.vacateAllocation = async (req, res) => {
  try {
    const allocation = await Allocation.findById(req.params.id);
    if (!allocation) return res.status(404).json({ success: false, message: 'Allocation not found' });
    allocation.status = 'vacated';
    allocation.vacatingDate = new Date();
    allocation.remarks = req.body.remarks;
    await allocation.save();
    // Update room occupancy
    const room = await Room.findById(allocation.roomId);
    if (room) {
      room.currentOccupancy = Math.max(0, room.currentOccupancy - 1);
      room.status = room.currentOccupancy === 0 ? 'available' : 'partially_occupied';
      await room.save();
    }
    // Update student record
    await Student.findByIdAndUpdate(allocation.studentId, { $unset: { roomId: 1, allocationId: 1 } });
    res.json({ success: true, message: 'Room vacated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateAllocation = async (req, res) => {
  try {
    const allocation = await Allocation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: allocation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
