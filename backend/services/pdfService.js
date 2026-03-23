const PDFDocument = require("pdfkit");

function generatePDF(suggestions, candidateName, res) {
  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  // Header
  doc.fontSize(22)
    .font("Helvetica-Bold")
    .text("Resume Feedback Report", { align: "center" });
  doc.fontSize(13)
    .font("Helvetica")
    .text(`Candidate: ${candidateName}`, { align: "center" });
  doc.moveDown(1.5);

  // ATS Score
  doc.fontSize(16).font("Helvetica-Bold").fillColor("#333").text("ATS Score");
  doc.fontSize(36).fillColor("#2563EB")
    .text(`${suggestions.ats_score}/100`, { align: "center" });
  doc.fontSize(12).fillColor("#555")
    .font("Helvetica").text(suggestions.ats_explanation);
  doc.moveDown(1);

  // Missing Skills
  doc.fontSize(16).font("Helvetica-Bold").fillColor("#DC2626").text("Missing Skills");
  suggestions.missing_skills.forEach(skill => {
    doc.fontSize(12).font("Helvetica").fillColor("#333").text(`  • ${skill}`);
  });
  doc.moveDown(1);

  // Weak Sections
  doc.fontSize(16).font("Helvetica-Bold").fillColor("#D97706").text("Sections to Improve");
  suggestions.weak_sections.forEach(s => {
    doc.fontSize(13).font("Helvetica-Bold").fillColor("#333").text(s.section);
    doc.fontSize(11).font("Helvetica").fillColor("#555")
      .text(`Issue: ${s.issue}`)
      .text(`Suggestion: ${s.suggestion}`);
    doc.moveDown(0.5);
  });
  doc.moveDown(1);

  // Formatting Tips
  doc.fontSize(16).font("Helvetica-Bold").fillColor("#059669").text("Formatting Tips");
  suggestions.formatting_tips.forEach(tip => {
    doc.fontSize(12).font("Helvetica").fillColor("#333").text(`  • ${tip}`);
  });
  doc.moveDown(1);

  // Overall Verdict
  doc.fontSize(16).font("Helvetica-Bold").fillColor("#333").text("Overall Assessment");
  doc.fontSize(12).font("Helvetica").fillColor("#333")
    .text(suggestions.overall_verdict);

  doc.end();
}

module.exports = { generatePDF };