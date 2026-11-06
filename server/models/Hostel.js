const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ['boys', 'girls', 'mixed'], required: true },
  totalCapacity: { type: Number, required: true, default: 0 },
  totalRooms: { type: Number, default: 0 },
  totalBlocks: { type: Number, default: 0 },
  address: { type: String, trim: true },
  wardenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  contactPhone: { type: String, trim: true },
  contactEmail: { type: String, trim: true },
  facilities: [{ type: String }],
  description: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Hostel', hostelSchema);
