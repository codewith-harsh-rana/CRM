const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: { type: String, required: true }, // YYYY-MM-DD
  checkIn: { type: String }, // HH:mm:ss
  checkOut: { type: String },
  duration: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
