const Announcement = require('../models/Announcement');

exports.getAnnouncements = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.hostelId) filter.$or = [{ hostelId: req.query.hostelId }, { hostelId: null }];
    if (req.query.type) filter.type = req.query.type;
    const announcements = await Announcement.find(filter)
      .populate('publishedBy', 'name role')
      .sort({ isPinned: -1, publishedAt: -1 })
      .limit(50);
    res.json({ success: true, data: announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.create({ ...req.body, publishedBy: req.user._id });
    res.status(201).json({ success: true, data: announcement, message: 'Announcement published' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });
    res.json({ success: true, data: announcement, message: 'Announcement updated' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Announcement removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
