const Hostel = require('../models/Hostel');
const Room = require('../models/Room');
const Student = require('../models/Student');

exports.getHostels = async (req, res) => {
  try {
    const hostels = await Hostel.find({ isActive: true }).populate('wardenId', 'name email phone');
    // Enrich with live stats
    const enriched = await Promise.all(hostels.map(async (h) => {
      const [rooms, students] = await Promise.all([
        Room.find({ hostelId: h._id, isActive: true }),
        Student.countDocuments({ hostelId: h._id, isActive: true })
      ]);
      const totalCapacity = rooms.reduce((s, r) => s + r.capacity, 0);
      const totalOccupied = rooms.reduce((s, r) => s + r.currentOccupancy, 0);
      return { ...h.toObject(), liveStats: { totalRooms: rooms.length, totalCapacity, totalOccupied, available: totalCapacity - totalOccupied, students } };
    }));
    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getHostel = async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id).populate('wardenId', 'name email phone');
    if (!hostel) return res.status(404).json({ success: false, message: 'Hostel not found' });
    res.json({ success: true, data: hostel });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createHostel = async (req, res) => {
  try {
    const hostel = await Hostel.create(req.body);
    res.status(201).json({ success: true, data: hostel, message: 'Hostel created successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateHostel = async (req, res) => {
  try {
    const hostel = await Hostel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!hostel) return res.status(404).json({ success: false, message: 'Hostel not found' });
    res.json({ success: true, data: hostel, message: 'Hostel updated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteHostel = async (req, res) => {
  try {
    await Hostel.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Hostel deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
