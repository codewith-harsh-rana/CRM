const mongoose = require("mongoose");

const salarySlipSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // your user model
    required: true,
  },
  month: { type: String, required: true }, // e.g. "June 2025"
  LPA: { type: Number, required: true }, // Annual salary
  totalWorkingHours: { type: Number, required: true },
  calculatedSalary: { type: Number }, // calculated monthly salary
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  rejectionReason: String,
}, { timestamps: true });

module.exports = mongoose.model("SalarySlip", salarySlipSchema);
