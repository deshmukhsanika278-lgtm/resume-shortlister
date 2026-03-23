const { generateSuggestions } = require("../services/suggestionService");

class ResumeAnalysis {
  constructor(candidateName, resumeText, jobDescription) {
    this.candidateName = candidateName;
    this.resumeText = resumeText;
    this.jobDescription = jobDescription;
    this.suggestions = null;
    this.atsScore = null;
  }

  async analyse() {
    this.suggestions = await generateSuggestions(
      this.resumeText,
      this.jobDescription
    );
    this.atsScore = this.suggestions.ats_score;
    return this;
  }

  toReport() {
    return {
      name: this.candidateName,
      score: this.atsScore,
      feedback: this.suggestions,
    };
  }
}

module.exports = ResumeAnalysis;