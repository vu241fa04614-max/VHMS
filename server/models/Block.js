const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true },
  floors: { type: Number, required: true, default: 1 },
  totalRooms: { type: Number, default: 0 },
  description: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

blockSchema.index({ hostelId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Block', blockSchema);
