const express = require("express");
const router = express.Router();
const {
  generateSalarySlip,
  updateSlipStatus,
  getAllSlips,
  getMySlips
} = require("../controllers/salarySlipController");

const {
  protect,
  allowRoles
} = require("../middlewares/authMiddleware");

// ✅ SuperAdmin generates
router.post("/", protect, allowRoles(["superadmin"]), generateSalarySlip);

// ✅ SuperAdmin approves/rejects
router.put("/status/:slipId", protect, allowRoles(["superadmin"]), updateSlipStatus);

// ✅ Dev views own slips
router.get("/my", protect, allowRoles(["developer"]), getMySlips);

// ✅ HR/Superadmin can view all slips
router.get("/all", protect, allowRoles(["hr", "superadmin"]), getAllSlips);

module.exports = router;
