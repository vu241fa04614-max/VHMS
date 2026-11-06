const mongoose = require('mongoose');

const messMenuSchema = new mongoose.Schema({
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
  weekStartDate: { type: Date, required: true },
  menu: {
    monday:    { breakfast: String, lunch: String, snacks: String, dinner: String },
    tuesday:   { breakfast: String, lunch: String, snacks: String, dinner: String },
    wednesday: { breakfast: String, lunch: String, snacks: String, dinner: String },
    thursday:  { breakfast: String, lunch: String, snacks: String, dinner: String },
    friday:    { breakfast: String, lunch: String, snacks: String, dinner: String },
    saturday:  { breakfast: String, lunch: String, snacks: String, dinner: String },
    sunday:    { breakfast: String, lunch: String, snacks: String, dinner: String },
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('MessMenu', messMenuSchema);
