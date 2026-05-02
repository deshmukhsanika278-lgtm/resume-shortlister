const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const ResumeSubmission = require("../models/ResumeSubmission");

// In-memory submissions database (fallback if MongoDB not available)
let submissions = [
  {
    id: 1,
    candidateName: "John Doe",
    score: 85,
    missingSkills: ["Python", "Docker"],
    feedback: "Strong technical background",
    timestamp: new Date(Date.now() - 86400000),
  },
  {
    id: 2,
    candidateName: "Jane Smith",
    score: 72,
    missingSkills: ["AWS", "Kubernetes"],
    feedback: "Good experience in relevant areas",
    timestamp: new Date(Date.now() - 172800000),
  },
  {
    id: 3,
    candidateName: "Mike Johnson",
    score: 91,
    missingSkills: ["Machine Learning"],
    feedback: "Excellent technical skills",
    timestamp: new Date(Date.now() - 259200000),
  },
];

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    res.status(401).json({ message: "Invalid token" });
  }
};

// Get all submissions
router.get("/submissions", verifyToken, async (req, res) => {
  try {
    let data;
    
    // Try to get from MySQL if available
    try {
      data = await ResumeSubmission.findAll({ 
        order: [["createdAt", "DESC"]], 
        limit: 100 
      });
    } catch (dbErr) {
      // Fall back to in-memory data
      console.log("Using in-memory submissions");
      data = submissions.sort((a, b) => b.timestamp - a.timestamp);
    }

    res.json(data || []);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ message: "Failed to fetch submissions" });
  }
});

// Get analytics stats
router.get("/stats", verifyToken, async (req, res) => {
  try {
    let stats = {};

    try {
      // Try to get from MySQL
      const dbSubmissions = await ResumeSubmission.findAll();
      const { count: totalCandidates } = await ResumeSubmission.findAndCountAll({
        distinct: true,
        col: "candidateName"
      });
      
      stats = {
        totalSubmissions: dbSubmissions.length,
        avgScore: dbSubmissions.length
          ? Math.round(
              dbSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) /
                dbSubmissions.length
            )
          : 0,
        totalCandidates: totalCandidates,
        highPerformers: dbSubmissions.filter((s) => s.score >= 75).length,
      };
    } catch (dbErr) {
      // Fall back to in-memory data
      console.log("Using in-memory stats");
      stats = {
        totalSubmissions: submissions.length,
        avgScore: submissions.length
          ? Math.round(
              submissions.reduce((sum, s) => sum + (s.score || 0), 0) /
                submissions.length
            )
          : 0,
        totalCandidates: new Set(
          submissions.map((s) => s.candidateName)
        ).size,
        highPerformers: submissions.filter((s) => s.score >= 75).length,
      };
    }

    res.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// Add a new submission
router.post("/submissions", verifyToken, async (req, res) => {
  try {
    const {
      candidateName,
      score,
      missingSkills,
      feedback,
      jobDescription,
      resumeText,
      fileType,
    } = req.body;

    try {
      // Try to save to MySQL
      const newSubmission = await ResumeSubmission.create({
        candidateName,
        score,
        missingSkills,
        feedback,
        jobDescription,
        resumeText,
        fileType: fileType || "txt",
      });

      res.json({
        message: "Submission recorded",
        submission: newSubmission,
      });
    } catch (dbErr) {
      // Fall back to in-memory storage
      console.log("Saving to in-memory storage");
      const newSubmission = {
        id: submissions.length + 1,
        candidateName,
        score,
        missingSkills,
        feedback,
        timestamp: new Date(),
      };

      submissions.push(newSubmission);
      res.json({
        message: "Submission recorded",
        submission: newSubmission,
      });
    }
  } catch (error) {
    console.error("Error recording submission:", error);
    res.status(500).json({ message: "Failed to record submission" });
  }
});

module.exports = router;
