const Job = require("../models/Job");
const Application = require("../models/Application");

// ✅ Create Job (HR only)
exports.createJob = async (req, res) => {
  try {
    const {
      title, description, location, type, salary,
      experience, companyName, skills, education,
      benefits, deadline,
    } = req.body;

    const job = await Job.create({
      title,
      description,
      location,
      type,
      salary,
      experience,
      companyName,
      skills,
      education,
      benefits,
      deadline,
      createdBy: req.user.id,
    });

    res.status(201).json({ message: "Job created successfully", job });
  } catch (error) {
    res.status(500).json({ message: "Failed to create job", error });
  }
};

// ✅ HR: Get all their jobs
exports.getHRJobs = async (req, res) => {
  try {
    const { keyword, location, type, status } = req.query;
    const query = { createdBy: req.user.id };

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { companyName: { $regex: keyword, $options: "i" } },
      ];
    }

    if (location) query.location = location;
    if (type) query.type = type;
    if (status) query.status = status;

    const jobs = await Job.find(query).sort("-createdAt");
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch jobs", error });
  }
};

// ✅ USER: Get all active jobs
exports.getAllJobsForUsers = async (req, res) => {
  try {
    const { keyword, location, type, companyName, minSalary } = req.query;
    const query = { status: "active" };

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { companyName: { $regex: keyword, $options: "i" } },
      ];
    }

    if (location) query.location = location;
    if (type) query.type = type;
    if (companyName) query.companyName = companyName;
    if (minSalary) query.salary = { $gte: Number(minSalary) };

    const jobs = await Job.find(query).sort("-createdAt");
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch jobs", error });
  }
};

// ✅ Update Job (HR only)
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      { new: true }
    );

    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json({ message: "Job updated successfully", job });
  } catch (error) {
    res.status(500).json({ message: "Failed to update job", error });
  }
};

// ✅ Delete Job (HR only)
exports.deleteJob = async (req, res) => {
  try {
    const deleted = await Job.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!deleted) return res.status(404).json({ message: "Job not found" });
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete job", error });
  }
};

// ✅ Single Job By ID
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: "Failed to get job", error });
  }
};

// ✅ Apply to Job (User)
exports.applyToJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobId = req.params.id;
    const resume = req.file ? req.file.filename : null; // Store filename only

    if (!resume) {
      return res.status(400).json({ message: "Resume is required" });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const alreadyApplied = await Application.findOne({ userId, jobId });
    if (alreadyApplied)
      return res.status(400).json({ message: "Already applied." });

    const application = new Application({ userId, jobId, resume });
    await application.save();

    res.status(201).json({ message: "Applied successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

// ✅ Get Applied Jobs (User)
exports.getAppliedJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    const applications = await Application.find({ userId }).populate("jobId");

    const appliedJobs = applications.map((app) => {
      const job = app.jobId;
      return {
        _id: job._id,
        title: job.title,
        companyName: job.companyName,
        location: job.location,
        type: job.type,
        deadline: job.deadline,
        status: job.status,
        appliedAt: app.createdAt,
      };
    });

    res.status(200).json(appliedJobs);
  } catch (error) {
    console.error("Error fetching applied jobs", error);
    res.status(500).json({ message: "Failed to fetch applied jobs" });
  }
};

// ✅ Get all applicants for a specific job (HR & SuperAdmin)
exports.getApplicantsByJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Get applications for the job
    const applications = await Application.find({ jobId }).populate("userId");

    const applicants = applications.map((app) => ({
      _id: app.userId._id,
      name: app.userId.name,
      email: app.userId.email,
      phone: app.userId.phone,
      position: job.title,
      resume: `resumes/${app.resume}`,

    }));

    res.status(200).json({ applicants });
  } catch (err) {
    console.error("Error fetching applicants:", err);
    res.status(500).json({ message: "Failed to fetch applicants" });
  }
};
