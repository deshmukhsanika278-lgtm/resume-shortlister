const express = require("express");
const router = express.Router();
const multer = require("multer");
const { generateSuggestions } = require("../services/suggestionService");
const { generatePDF } = require("../services/pdfService");
const { extractTextFromPDF } = require("../services/pdfExtractorService");
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

    // Extract text from PDF (handles both text-based and image-based PDFs)
    console.log("🔄 Processing PDF with enhanced extractor...");
    const resumeText = await extractTextFromPDF(req.file.buffer);

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Could not extract any text from PDF. Please ensure the file is readable."
      });
    }

    console.log(`✅ PDF processed successfully: ${resumeText.length} characters extracted`);

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

// POST /api/suggestions/batch-compare - Compare multiple resumes
router.post("/batch-compare", async (req, res) => {
  try {
    const { jobDescription, candidates } = req.body;

    // Validate inputs
    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: jobDescription"
      });
    }

    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Missing or invalid candidates array. Provide at least 2 candidates."
      });
    }

    if (candidates.length < 2 || candidates.length > 5) {
      return res.status(400).json({
        success: false,
        error: "Please provide between 2 and 5 candidates for comparison"
      });
    }

    // Validate each candidate
    for (let candidate of candidates) {
      if (!candidate.candidateName || !candidate.resumeText) {
        return res.status(400).json({
          success: false,
          error: "Each candidate must have candidateName and resumeText"
        });
      }
    }

    // Analyze all resumes in parallel
    const analysisPromises = candidates.map(async (candidate) => {
      const suggestions = await generateSuggestions(candidate.resumeText, jobDescription);
      return {
        candidateName: candidate.candidateName,
        score: suggestions.score || 0,
        missingSkills: suggestions.missingSkills || [],
        weakSections: suggestions.weakSections || [],
        formattingTips: suggestions.formattingTips || [],
        verdict: suggestions.verdict || "",
      };
    });

    const results = await Promise.all(analysisPromises);

    // Save each submission to database
    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      const result = results[i];

      const submissionData = {
        candidateName: candidate.candidateName,
        score: result.score,
        missingSkills: result.missingSkills,
        weakSections: result.weakSections,
        formattingTips: result.formattingTips,
        verdict: result.verdict,
        jobDescription: jobDescription.substring(0, 500),
        resumeText: candidate.resumeText.substring(0, 2000),
        fileType: "txt",
        feedback: result.verdict || "",
        timestamp: new Date(),
      };

      await saveSubmission(submissionData);
    }

    res.json({
      success: true,
      results: results,
      totalCandidates: results.length,
      bestMatch: results.reduce((best, current) => 
        current.score > best.score ? current : best
      )
    });
  } catch (err) {
    console.error("❌ Error in POST /batch-compare:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to compare resumes: " + err.message
    });
  }
});

// Export for admin routes
router.getSubmissions = () => allSubmissions;

module.exports = router;