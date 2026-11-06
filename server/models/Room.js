const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
  blockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Block', required: true },
  roomNumber: { type: String, required: true, trim: true },
  floor: { type: Number, required: true, default: 0 },
  capacity: { type: Number, required: true, default: 2 },
  currentOccupancy: { type: Number, default: 0 },
  type: { type: String, enum: ['single', 'double', 'triple', 'dormitory'], default: 'double' },
  status: { type: String, enum: ['available', 'occupied', 'partially_occupied', 'maintenance'], default: 'available' },
  amenities: [{ type: String }],
  monthlyFee: { type: Number, default: 0 },
  description: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

roomSchema.index({ hostelId: 1, roomNumber: 1 }, { unique: true });

roomSchema.virtual('availableBeds').get(function () {
  return this.capacity - this.currentOccupancy;
});

module.exports = mongoose.model('Room', roomSchema);
