const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const { getWorkingHoursByMonth } = require("../controllers/attendanceController");

// ✅ FIXED: Import protect middleware
const { protect } = require("../middlewares/authMiddleware");

router.post("/check-in", protect, attendanceController.checkIn);
router.post("/check-out", protect, attendanceController.checkOut);
router.get("/my", protect, attendanceController.getMyAttendance);
router.get("/all", protect, attendanceController.getAllAttendance);
router.get("/working-hours", protect, getWorkingHoursByMonth);


module.exports = router;
