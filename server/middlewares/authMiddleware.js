const jwt = require("jsonwebtoken");

// Protect route: Ensure token is valid and attach user info to `req.user`
exports.protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // decoded contains id and role
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Allow access only if role matches one of allowed roles
exports.allowRoles = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    console.log("User Role =>", userRole); // Debug

    // Always allow superadmin
    if (userRole === "superadmin") return next();
    if (userRole === "hr") return next();
    if (userRole === "developer") return next();

    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: "Access denied: Role not allowed" });
    }

    next();
  };
};

// SuperAdmin only
exports.isSuperAdmin = (req, res, next) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Only SuperAdmin allowed" });
  }
  next();
};

// HR only
exports.isHR = (req, res, next) => {
  if (req.user.role !== "hr") {
    return res.status(403).json({ message: "Only HR allowed" });
  }
  next();
};

// SuperAdmin or HR
exports.isSuperAdminOrHR = (req, res, next) => {
  if (req.user.role === "superadmin" || req.user.role === "hr") {
    return next();
  }
  return res.status(403).json({ message: "Access denied: Not HR or SuperAdmin" });
};
