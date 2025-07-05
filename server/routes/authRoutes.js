const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  createStaff,
  loginSuperAdmin,
  getAllStaff,
  updateStaff,
  deleteStaff,
  updateStaffStatus,
  loginUserProfile, 
} = require("../controllers/authController");

const { protect, isSuperAdmin } = require("../middlewares/authMiddleware");

// User Register & Login
router.post("/register", registerUser);
router.post("/login", loginUser);

// Super Admin Login
router.post("/superadmin/login", loginSuperAdmin);

// Create Staff (HR/Developer)
router.post("/create-staff", protect, isSuperAdmin, createStaff);

// Get All HR & Developer Staff
router.get("/staff", protect, isSuperAdmin, getAllStaff);

// Update Staff
router.put("/staff/:id", protect, isSuperAdmin, updateStaff);

// Delete Staff
router.delete("/staff/:id", protect, isSuperAdmin, deleteStaff);

router.put("/staff/:id/status", protect, isSuperAdmin, updateStaffStatus);

router.get("/profile", protect, loginUserProfile); // secure this route

module.exports = router;
