// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { approveUser, suspendUser, getAllUsers } = require("../controllers/authController");

router.get("/users", getAllUsers);
router.put("/users/:id/approve", approveUser);
router.put("/users/:id/suspend", suspendUser);

module.exports = router;
