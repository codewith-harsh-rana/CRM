const express = require("express");
const router = express.Router();
const jobCtrl = require("../controllers/jobController");
const { protect, isHR, isSuperAdminOrHR   } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadResume");

// ✅ USER routes
router.get("/all", protect, jobCtrl.getAllJobsForUsers);
router.get("/view/:id", protect, jobCtrl.getJobById);
router.get("/my-applications", protect, jobCtrl.getAppliedJobs);
router.post("/apply/:id", protect, upload.single("resume"), jobCtrl.applyToJob);

// ✅ HR routes
router.post("/", protect, isHR, jobCtrl.createJob);
router.get("/", protect, isHR, jobCtrl.getHRJobs);
router.put("/:id", protect, isHR, jobCtrl.updateJob);
router.delete("/:id", protect, isHR, jobCtrl.deleteJob);
router.get("/applicants/:jobId", protect, isHR, jobCtrl.getApplicantsByJob);

// ✅ SuperAdmin route (Single, Correct)
router.get("/superadmin/applicants/:jobId", protect, isSuperAdminOrHR, jobCtrl.getApplicantsByJob);

module.exports = router;
