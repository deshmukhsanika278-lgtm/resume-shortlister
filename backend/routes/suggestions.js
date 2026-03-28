const express = require("express");
const router = express.Router();
const multer = require("multer");
const pdfParse = require("pdf-parse");
const { generateSuggestions } = require("../services/suggestionService");
const { generatePDF } = require("../services/pdfService");
const ResumeSubmission = require("../models/ResumeSubmission");

// Configure multer for PDF uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // Accept based on MIME type OR file extension
    const isPDF = file.mimetype === "application/pdf" || 
                  file.mimetype === "application/x-pdf" ||
                  file.originalname.toLowerCase().endsWith(".pdf");
    
    if (isPDF) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// In-memory submissions for admin dashboard (fallback)
let allSubmissions = [];

// Helper function to save submission
const saveSubmission = async (submissionData) => {
  try {
    const newSubmission = new ResumeSubmission(submissionData);
    await newSubmission.save();
    return newSubmission;
  } catch (dbErr) {
    console.log("💾 Saving to in-memory storage");
    const submission = {
      id: allSubmissions.length + 1,
      ...submissionData,
    };
    allSubmissions.push(submission);
    return submission;
  }
};

// POST /api/suggestions - Analyze text resume
router.post("/", async (req, res) => {
  try {
    const { resumeText, jobDescription, candidateName } = req.body;

    // Validate inputs
    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: resumeText and jobDescription"
      });
    }

    // Generate suggestions
    const suggestions = await generateSuggestions(resumeText, jobDescription);

    // Save to database
    const submissionData = {
      candidateName: candidateName || "Anonymous",
      score: suggestions.score || 0,
      missingSkills: suggestions.missingSkills || [],
      weakSections: suggestions.weakSections || [],
      formattingTips: suggestions.formattingTips || [],
      verdict: suggestions.verdict || "",
      jobDescription: jobDescription.substring(0, 500),
      resumeText: resumeText.substring(0, 2000),
      fileType: "txt",
      feedback: suggestions.verdict || "",
      timestamp: new Date(),
    };

    await saveSubmission(submissionData);

    res.json({
      success: true,
      score: suggestions.score,
      missingSkills: suggestions.missingSkills,
      weakSections: suggestions.weakSections,
      formattingTips: suggestions.formattingTips,
      verdict: suggestions.verdict
    });
  } catch (err) {
    console.error("❌ Error in POST /suggestions:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to analyze resume: " + err.message
    });
  }
});

// POST /api/suggestions/analyze-pdf - Analyze PDF resume
router.post("/analyze-pdf", (req, res, next) => {
  upload.single("resume")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message || "File upload failed. Please ensure it's a valid PDF file."
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No PDF file uploaded"
      });
    }

    const { jobDescription, candidateName } = req.body;

    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        error: "Missing jobDescription in request"
      });
    }

    // Extract text from PDF
    let resumeText = "";
    try {
      const pdfData = await pdfParse(req.file.buffer);
      resumeText = pdfData.text;
    } catch (pdfErr) {
      return res.status(400).json({
        success: false,
        error: "Failed to parse PDF. Make sure it's a text-based PDF (not an image-only PDF). Error: " + pdfErr.message
      });
    }

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Could not extract any text from PDF. Please use a text-based PDF, not an image-only scanned document."
      });
    }

    // Generate suggestions
    const suggestions = await generateSuggestions(resumeText, jobDescription);

    // Save to database
    const submissionData = {
      candidateName: candidateName || "Anonymous",
      score: suggestions.score || 0,
      missingSkills: suggestions.missingSkills || [],
      weakSections: suggestions.weakSections || [],
      formattingTips: suggestions.formattingTips || [],
      verdict: suggestions.verdict || "",
      jobDescription: jobDescription.substring(0, 500),
      resumeText: resumeText.substring(0, 2000),
      fileType: "pdf",
      feedback: suggestions.verdict || "",
      timestamp: new Date(),
    };

    await saveSubmission(submissionData);

    res.json({
      success: true,
      score: suggestions.score,
      missingSkills: suggestions.missingSkills,
      weakSections: suggestions.weakSections,
      formattingTips: suggestions.formattingTips,
      verdict: suggestions.verdict,
      resumeText: resumeText.substring(0, 500) // Return for PDF download
    });
  } catch (err) {
    console.error("❌ Error in POST /analyze-pdf:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to analyze resume: " + err.message
    });
  }
});

// POST /api/suggestions/download - Download PDF report
router.post("/download", async (req, res) => {
  try {
    const { resumeText, jobDescription, candidateName } = req.body;

    if (!resumeText || !jobDescription || !candidateName) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields for PDF download"
      });
    }

    const suggestions = await generateSuggestions(resumeText, jobDescription);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${candidateName}-analysis.pdf"`
    );

    generatePDF(suggestions, candidateName, res);
  } catch (err) {
    console.error("❌ Error in POST /download:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to generate PDF: " + err.message
    });
  }
});

// Export for admin routes
router.getSubmissions = () => allSubmissions;

module.exports = router;