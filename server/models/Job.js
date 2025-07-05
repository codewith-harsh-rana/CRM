const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
    },
    location: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["full-time", "part-time", "internship", "contract", "remote"],
      default: "full-time",
    },
    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },
    salary: {
      type: Number,
      required: [true, "Salary is required"],
    },
    experience: {
      type: String,
      required: [true, "Experience is required"],
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
    },
    skills: {
      type: [String],
      default: [],
    },
    education: {
      type: String,
      default: "Not specified",
    },
    benefits: {
      type: [String],
      default: [],
    },
    deadline: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // HR user reference
      required: true,
    },
    appliedBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        appliedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
