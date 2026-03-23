const express = require("express");
const router = express.Router();
const { generateSuggestions } = require("../services/suggestionService");
const { generatePDF } = require("../services/pdfService");

// POST /api/suggestions
// Body: { resumeText: "...", jobDescription: "..." }
router.post("/", async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ 
        error: "Missing resumeText or jobDescription" 
      });
    }

    const suggestions = await generateSuggestions(resumeText, jobDescription);
    res.json({ success: true, suggestions });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate suggestions" });
  }
});

// POST /api/suggestions/download
// Body: { resumeText: "...", jobDescription: "...", candidateName: "..." }
router.post("/download", async (req, res) => {
  try {
    const { resumeText, jobDescription, candidateName } = req.body;

    const suggestions = await generateSuggestions(resumeText, jobDescription);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${candidateName}-feedback.pdf"`
    );

    generatePDF(suggestions, candidateName, res);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

module.exports = router;