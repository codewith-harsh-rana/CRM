const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

exports.isSuperAdmin = (req, res, next) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Only SuperAdmin allowed" });
  }
  next();
};

// Optional HR-only middleware
exports.isHR = (req, res, next) => {
  if (req.user.role !== "hr") {
    return res.status(403).json({ message: "Only HR can perform this action" });
  }
  next();
};

exports.isSuperAdminOrHR = (req, res, next) => {
  if (req.user.role === "hr" || req.user.role === "superadmin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied" });
  }
};

// middlewares/roleMiddleware.js
// This middleware checks if the user is superadmin by verifying the token and role
exports.allowRoles = (...roles) => {
  return (req, res, next) => {
    // If superadmin is a static role, always allow if role is superadmin
    if (req.user && req.user.role === "superadmin") {
      return next();
    }
    // Otherwise, check if the user's role is in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: Role not allowed" });
    }
    next();
  };
};

