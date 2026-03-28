// Advanced resume scoring and analysis service
async function generateSuggestions(resumeText, jobDescription) {
  try {
    console.log("Generating AI-powered suggestions...");

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Calculate ATS score based on resume quality and job match
    const score = calculateATSScore(resumeText, jobDescription);
    const missingSkills = extractMissingSkills(resumeText, jobDescription);
    const weakSections = analyzeWeakSections(resumeText);
    const formattingTips = generateFormattingTips(resumeText);
    const verdict = generateVerdict(score, missingSkills);

    return {
      score,
      missingSkills,
      weakSections,
      formattingTips,
      verdict,
    };
  } catch (err) {
    console.error("Suggestion generation error:", err);
    throw err;
  }
}

// Calculate ATS score (0-100)
function calculateATSScore(resumeText, jobDescription) {
  let score = 50; // Base score

  const resumeLower = resumeText.toLowerCase();
  const jobLower = jobDescription.toLowerCase();

  // Extract keywords from job description
  const jobKeywords = jobLower
    .split(/[^\w]+/)
    .filter((w) => w.length > 3 && !isCommonWord(w));

  // Check keyword match (30 points max)
  const matchedKeywords = jobKeywords.filter((keyword) =>
    resumeLower.includes(keyword)
  ).length;
  const keywordScore = Math.min(30, (matchedKeywords / jobKeywords.length) * 30);
  score += keywordScore;

  // Check for key sections (15 points max)
  const sections = [
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
  ];
  const hasSection = sections.filter((s) => resumeLower.includes(s)).length;
  score += (hasSection / sections.length) * 15;

  // Check resume length and structure (10 points)
  if (resumeText.split("\n").length > 10) score += 5;
  if (resumeText.length > 500) score += 5;

  // Check for achievements/metrics (15 points)
  const achievementPatterns = [
    /increased?[\s\w]+\d+%/gi,
    /improved?[\s\w]+\d+%/gi,
    /generated?[\s\w]+\$[\d,]+/gi,
    /awarded?|won/gi,
    /led|managed|oversaw/gi,
  ];

  const achievements = achievementPatterns.filter((pattern) =>
    pattern.test(resumeText)
  ).length;
  score += Math.min(15, achievements * 3);

  // Penalize for common issues (max -10 points)
  if (resumeLower.includes("objective") && resumeText.length < 100)
    score -= 3;
  if (!resumeLower.match(/\d{4}/)) score -= 2; // No years
  if (resumeText.split("\n").length < 5) score -= 5; // Too short

  return Math.max(0, Math.min(100, Math.round(score)));
}

// Extract missing skills
function extractMissingSkills(resumeText, jobDescription) {
  const resumeLower = resumeText.toLowerCase();
  const jobLower = jobDescription.toLowerCase();

  const technicalSkills = [
    "python",
    "java",
    "javascript",
    "react",
    "node",
    "docker",
    "kubernetes",
    "aws",
    "gcp",
    "azure",
    "sql",
    "mongodb",
    "git",
    "cicd",
    "jenkins",
    "terraform",
    "ansible",
    "c++",
    "golang",
    "rust",
    "scala",
    "spark",
    "hadoop",
    "tensorflow",
    "pytorch",
    "machine learning",
    "deep learning",
    "nlp",
    "computer vision",
    "agile",
    "scrum",
    "kafka",
    "redis",
    "elasticsearch",
    "nginx",
    "apache",
  ];

  const missing = technicalSkills.filter(
    (skill) => jobLower.includes(skill) && !resumeLower.includes(skill)
  );

  return missing.slice(0, 5); // Return top 5 missing skills
}

// Analyze weak sections
function analyzeWeakSections(resumeText) {
  const sections = [];

  // Check for weak summary
  if (!resumeText.toLowerCase().includes("summary")) {
    sections.push("Missing or weak professional summary section");
  }

  // Check for weak experience description
  if (
    !resumeText.match(/increased|improved|optimized|led|managed|designed/i) ||
    resumeText.split("\n").filter((l) => l.includes("•") || l.includes("-"))
      .length < 3
  ) {
    sections.push(
      "Experience section lacks quantified achievements and strong action verbs"
    );
  }

  // Check for skills section
  if (!resumeText.toLowerCase().includes("skill")) {
    sections.push("Missing dedicated skills section");
  }

  // Check for specific formatting issues
  if (!resumeText.includes("\n") || resumeText.split("\n").length < 8) {
    sections.push(
      "Resume appears poorly formatted with inadequate structure"
    );
  }

  // Check for education
  if (
    !resumeText.toLowerCase().match(/degree|bachelor|master|phd|diploma/)
  ) {
    sections.push("Education section missing or unclear");
  }

  return sections.slice(0, 4); // Return top 4 weak sections
}

// Generate formatting tips
function generateFormattingTips(resumeText) {
  const tips = [];

  if (!resumeText.match(/^\s*\d{4}\s*-\s*\d{4}/m)) {
    tips.push(
      "Include date ranges (YYYY-YYYY) for all positions and education"
    );
  }

  if (resumeText.split("\n").length > 50) {
    tips.push("Consider condensing to improve readability (aim for 1-2 pages)");
  }

  if (!resumeText.match(/[\w.-]+@[\w.-]+/)) {
    tips.push("Include a professional email address");
  }

  if (!resumeText.match(/\+?1?[-.\s]?\(?[\d]{3}\)?[-.\s]?[\d]{3}[-.\s]?[\d]{4}/)) {
    tips.push("Include a phone number in a standard format");
  }

  if (!resumeText.match(/linkedin|github|portfolio/i)) {
    tips.push(
      "Add links to LinkedIn, GitHub, or portfolio website for recruiters"
    );
  }

  if (
    !resumeText.match(
      /[A-Z][a-z]+\s+[A-Z][a-z]+|[A-Z][a-z]+\s+[A-Z]\.\s+[A-Z][a-z]+/
    )
  ) {
    tips.push("Use consistent name capitalization and formatting");
  }

  return tips;
}

// Generate overall verdict
function generateVerdict(score, missingSkills) {
  if (score >= 80) {
    return `Excellent resume! Your ATS score of ${score}% indicates strong alignment with job requirements. Focus on "${missingSkills[0] || "continuing"}" to further boost your candidacy.`;
  } else if (score >= 70) {
    return `Good resume! Your ATS score of ${score}% shows solid match. Adding skills like "${missingSkills.slice(0, 2).join(", ")}" would significantly improve your chances.`;
  } else if (score >= 60) {
    return `Fair resume with some work needed. Your ATS score is ${score}%. Prioritize adding "${missingSkills[0]}" and restructuring your experience with quantified achievements.`;
  } else {
    return `Your resume needs significant improvement. ATS score: ${score}%. Add the missing skills "${missingSkills.slice(0, 3).join(", ")}" and restructure to highlight achievements with metrics.`;
  }
}

// Helper: Check if word is common
function isCommonWord(word) {
  const common = [
    "the",
    "and",
    "or",
    "is",
    "are",
    "has",
    "have",
    "with",
    "from",
    "that",
    "this",
    "which",
    "will",
    "your",
    "must",
    "should",
    "could",
    "would",
    "role",
  ];
  return common.includes(word);
}

module.exports = { generateSuggestions };