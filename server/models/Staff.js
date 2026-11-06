const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId: { type: String, required: true, unique: true, trim: true },
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
  designation: { type: String, required: true, trim: true },
  department: { type: String, trim: true },
  joiningDate: { type: Date },
  qualification: { type: String, trim: true },
  experience: { type: Number, default: 0 },
  salary: { type: Number },
  emergencyContact: { type: String, trim: true },
  address: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
