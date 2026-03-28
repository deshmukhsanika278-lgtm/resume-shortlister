const mongoose = require("mongoose");

const resumeSubmissionSchema = new mongoose.Schema(
  {
    candidateName: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      sparse: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    missingSkills: [String],
    weakSections: [String],
    formattingTips: [String],
    verdict: String,
    jobDescription: String,
    resumeText: String,
    fileType: {
      type: String,
      enum: ["txt", "pdf"],
      default: "txt",
    },
    feedback: String,
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

// Create index for analytics queries
resumeSubmissionSchema.index({ timestamp: -1 });
resumeSubmissionSchema.index({ score: -1 });

module.exports = mongoose.model("ResumeSubmission", resumeSubmissionSchema);
