// controllers/adminController.js
const User = require("../models/User");

exports.getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" });
  res.json({ users });
};

exports.approveUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { status: "approved" });
  res.json({ message: "User approved" });
};

exports.suspendUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { status: "suspended" });
  res.json({ message: "User suspended" });
};
