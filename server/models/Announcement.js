const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['general', 'urgent', 'maintenance', 'event', 'fee'], default: 'general' },
  targetAudience: { type: String, enum: ['all', 'students', 'wardens', 'staff'], default: 'all' },
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' }, // null = all hostels
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  publishedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  isPinned: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  attachments: [{ type: String }],
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
