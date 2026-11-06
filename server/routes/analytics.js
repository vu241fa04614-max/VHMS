const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Student = require('../models/Student');
const Room = require('../models/Room');
const Outpass = require('../models/Outpass');
const Complaint = require('../models/Complaint');
const Fee = require('../models/Fee');
const Hostel = require('../models/Hostel');
const ActivityLog = require('../models/ActivityLog');

router.use(protect, authorize('super_admin', 'admin', 'warden'));

router.get('/dashboard', async (req, res) => {
  try {
    const hostelFilter = req.user.role === 'warden' && req.user.hostelId ? { hostelId: req.user.hostelId } : {};
    const [
      totalStudents, rooms, pendingOutpasses, pendingComplaints,
      feeStats, hostelsCount, recentActivity
    ] = await Promise.all([
      Student.countDocuments({ ...hostelFilter, isActive: true }),
      Room.find(hostelFilter.hostelId ? { hostelId: hostelFilter.hostelId, isActive: true } : { isActive: true }),
      Outpass.countDocuments({ ...hostelFilter, status: 'pending' }),
      Complaint.countDocuments({ ...hostelFilter, status: 'pending' }),
      Fee.aggregate([
        { $match: hostelFilter.hostelId ? { hostelId: hostelFilter.hostelId } : {} },
        { $group: { _id: null, totalFee: { $sum: '$totalFee' }, paidAmount: { $sum: '$paidAmount' } } }
      ]),
      Hostel.countDocuments({ isActive: true }),
      ActivityLog.find({}).sort({ createdAt: -1 }).limit(10).populate('userId', 'name role')
    ]);

    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
    const availableRooms = rooms.filter(r => r.status === 'available').length;
    const totalCapacity = rooms.reduce((s, r) => s + r.capacity, 0);
    const totalOccupied = rooms.reduce((s, r) => s + r.currentOccupancy, 0);
    const feeCollection = feeStats[0]?.paidAmount || 0;
    const totalFeeAssessed = feeStats[0]?.totalFee || 0;
    const outstandingFees = Math.max(0, totalFeeAssessed - feeCollection);

    res.json({
      success: true,
      data: {
        totalStudents,
        totalRooms,
        occupiedRooms,
        availableRooms,
        totalCapacity,
        totalOccupied,
        occupancyRate: totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0,
        pendingOutpasses,
        pendingComplaints,
        feeCollection,
        outstandingFees,
        totalHostels: hostelsCount,
        recentActivity
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/occupancy', async (req, res) => {
  try {
    const hostels = await Hostel.find({ isActive: true });
    const data = await Promise.all(hostels.map(async (h) => {
      const rooms = await Room.find({ hostelId: h._id, isActive: true });
      const capacity = rooms.reduce((s, r) => s + r.capacity, 0);
      const occupied = rooms.reduce((s, r) => s + r.currentOccupancy, 0);
      return {
        hostelName: h.name,
        capacity,
        occupied,
        available: Math.max(0, capacity - occupied)
      };
    }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/complaints-by-category', async (req, res) => {
  try {
    const data = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
