const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  registrationNumber: { type: String, required: true, unique: true, trim: true },
  rollNumber: { type: String, trim: true },
  department: { type: String, required: true, trim: true },
  year: { type: Number, required: true, min: 1, max: 4 },
  section: { type: String, trim: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  bloodGroup: { type: String, trim: true },
  nationality: { type: String, default: 'Indian', trim: true },
  aadharNumber: { type: String, trim: true },
  permanentAddress: {
    street: String, city: String, state: String, pincode: String, country: { type: String, default: 'India' }
  },
  parentName: { type: String, trim: true },
  parentPhone: { type: String, trim: true },
  parentEmail: { type: String, trim: true },
  emergencyContact: { type: String, trim: true },
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  allocationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Allocation' },
  admissionDate: { type: Date, default: Date.now },
  academicYear: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

studentSchema.index({ hostelId: 1 });

module.exports = mongoose.model('Student', studentSchema);
