const Attendance = require("../models/Attendance");
const moment = require("moment");
const User = require("../models/User");

// Developer Check-In
exports.checkIn = async (req, res) => {
  try {
    if (req.user.role !== "developer") {
      return res.status(403).json({ message: "Only developers can check in." });
    }

    const staffId = req.user.id;
    const date = moment().format("YYYY-MM-DD");

    const existing = await Attendance.findOne({ staffId, date });
    if (existing) return res.status(400).json({ message: "Already checked in today." });

    const attendance = await Attendance.create({
      staffId,
      date,
      checkIn: moment().format("HH:mm:ss"),
    });

    res.status(200).json({ message: "Checked in", attendance });
  } catch (err) {
    res.status(500).json({ message: "Check-in error", error: err.message });
  }
};

// Developer Check-Out
exports.checkOut = async (req, res) => {
  try {
    if (req.user.role !== "developer") {
      return res.status(403).json({ message: "Only developers can check out." });
    }

    const staffId = req.user.id;
    const date = moment().format("YYYY-MM-DD");

    const attendance = await Attendance.findOne({ staffId, date });
    if (!attendance || attendance.checkOut) {
      return res.status(400).json({ message: "Check-in not found or already checked out." });
    }

    const checkIn = moment(attendance.checkIn, "HH:mm:ss");
    const checkOut = moment();
    const duration = moment.utc(checkOut.diff(checkIn)).format("HH:mm:ss");

    attendance.checkOut = checkOut.format("HH:mm:ss");
    attendance.duration = duration;
    await attendance.save();

    res.status(200).json({ message: "Checked out", attendance });
  } catch (err) {
    res.status(500).json({ message: "Check-out error", error: err.message });
  }
};

// HR or Superadmin: View all developers' attendance
exports.getAllAttendance = async (req, res) => {
  try {
    if (!["hr", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const attendance = await Attendance.find()
      .populate({
        path: "staffId",
        match: { role: "developer" }, // only developer role
        select: "name email role",
      })
      .sort({ createdAt: -1 });

    // Filter out nulls in case non-developer data slipped
    const filtered = attendance.filter((entry) => entry.staffId !== null);

    res.status(200).json(filtered);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch", error: err.message });
  }
};

// Developer: View Own Attendance
exports.getMyAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ staffId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(attendance);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch", error: err.message });
  }
};

exports.getWorkingHoursByMonth = async (req, res) => {
  const { staffId, month } = req.query; // month in format YYYY-MM
  try {
    const records = await Attendance.find({ staffId });
    const totalHours = records
      .filter((rec) => rec.date.startsWith(month))
      .reduce((acc, rec) => acc + parseFloat(rec.duration || 0), 0);

    res.json({ totalHours: totalHours || 0 });
  } catch {
    res.status(500).json({ message: "Failed to get hours" });
  }
};