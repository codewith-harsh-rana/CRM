const SalarySlip = require("../models/SalarySlip");
const User = require("../models/User");
const Attendance = require("../models/Attendance");

exports.generateSalarySlip = async (req, res) => {
  const { staffId, month, LPA } = req.body; // no need to pass totalWorkingHours from frontend

  try {
    const existing = await SalarySlip.findOne({ staffId, month });
    if (existing) {
      return res.status(400).json({ message: "Salary slip already generated" });
    }

    // Get month start and end
    const monthStart = new Date(`${month} 01`);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    // Fetch attendance of that month
    const attendances = await Attendance.find({
      staffId,
      date: {
        $gte: monthStart.toISOString().split("T")[0],
        $lt: monthEnd.toISOString().split("T")[0],
      },
    });

    let totalSeconds = 0;
    attendances.forEach((record) => {
      if (record.checkIn && record.checkOut) {
        const inTime = new Date(`1970-01-01T${record.checkIn}Z`);
        const outTime = new Date(`1970-01-01T${record.checkOut}Z`);
        const duration = (outTime - inTime) / 1000;
        if (duration > 0) totalSeconds += duration;
      }
    });

    const totalWorkingHours = Math.round((totalSeconds / 3600) * 100) / 100;

    const perHourRate = LPA / 12 / 30 / 8;
    const calculatedSalary = Math.round(perHourRate * totalWorkingHours);

    const slip = new SalarySlip({
      staffId,
      month,
      LPA,
      totalWorkingHours,
      calculatedSalary,
    });

    await slip.save();

    res.status(201).json({
      message: "Salary slip generated successfully",
      slip,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating salary slip" });
  }
};

exports.getAllSlips = async (req, res) => {
  try {
    const slips = await SalarySlip.find().populate("staffId", "name email role");
    res.json(slips);
  } catch {
    res.status(500).json({ message: "Failed to fetch slips" });
  }
};

exports.getMySlips = async (req, res) => {
  try {
    const slips = await SalarySlip.find({ staffId: req.user.id });
    res.json(slips);
  } catch {
    res.status(500).json({ message: "Failed to load slips" });
  }
};

exports.updateSlipStatus = async (req, res) => {
  const { slipId } = req.params;
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const slip = await SalarySlip.findById(slipId);
    if (!slip) {
      return res.status(404).json({ message: "Slip not found" });
    }

    slip.status = status;
    await slip.save();

    res.json({
      message: `Slip ${status} successfully`,
      slip,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating slip status" });
  }
};




