const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ✅ USER Register (only for normal users)
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user", // default role
    });

    res.status(201).json({
      message: "User registered successfully",
      user: { ...newUser.toObject(), password: undefined },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ LOGIN (All roles with status validation)
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Reject if suspended or rejected
    if (user.status === "suspended") {
      return res
        .status(403)
        .json({ message: "Your account is suspended. Contact admin." });
    }

    if (user.status === "rejected") {
      return res
        .status(403)
        .json({ message: "Your account is rejected. Access denied." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: { ...user.toObject(), password: undefined },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ SUPERADMIN creates HR or DEVELOPER
exports.createStaff = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!["hr", "developer"].includes(role)) {
      return res
        .status(400)
        .json({ message: "Invalid role. Only HR or Developer allowed." });
    }

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const staff = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      message: `${role} created successfully`,
      staff: { ...staff.toObject(), password: undefined },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// ✅ SUPERADMIN hardcoded login
exports.loginSuperAdmin = async (req, res) => {
  const { email, password } = req.body;

  const superAdminEmail = "superadmin@crm.com";
  const superAdminPassword = "superadmin123"; // Should be hashed in real app

  if (email === superAdminEmail && password === superAdminPassword) {
    const token = jwt.sign(
      { id: "superadmin-id", role: "superadmin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "SuperAdmin login success",
      token,
      user: { role: "superadmin", email },
    });
  }

  return res.status(401).json({ message: "Invalid SuperAdmin credentials" });
};

// ✅ GET all staff (HR/Developer)
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await User.find({
      role: { $in: ["hr", "developer"] },
    }).select("-password");

    res.status(200).json({ staff });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch staff members", error });
  }
};

// ✅ UPDATE staff by ID
exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const updated = await User.findByIdAndUpdate(
      id,
      { name, email, role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updated)
      return res.status(404).json({ message: "Staff not found" });

    res.json({ message: "Staff updated", staff: updated });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error });
  }
};

// ✅ DELETE staff by ID
exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);

    if (!deleted)
      return res.status(404).json({ message: "Staff not found" });

    res.json({ message: "Staff deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Deletion failed", error });
  }
};

// ✅ Update staff status: active, suspended, rejected
exports.updateStaffStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "suspended", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: `User status updated to ${status}`,
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.loginUserProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json({ user });
};

