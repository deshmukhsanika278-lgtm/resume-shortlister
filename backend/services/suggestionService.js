const Anthropic = require("@anthropic-ai/sdk");
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function generateSuggestions(resumeText, jobDescription) {
  const prompt = `
You are an expert resume reviewer and career coach.

Here is a candidate's resume:
---
${resumeText}
---

Here is the job description they are applying for:
---
${jobDescription}
---

Analyse the resume and provide structured feedback in this exact JSON format:
{
  "ats_score": <number 0-100>,
  "ats_explanation": "<1 sentence why this score>",
  "missing_skills": ["skill1", "skill2", "skill3"],
  "weak_sections": [
    { "section": "Summary", "issue": "...", "suggestion": "..." },
    { "section": "Experience", "issue": "...", "suggestion": "..." }
  ],
  "formatting_tips": ["tip1", "tip2", "tip3"],
  "overall_verdict": "<2-3 sentence overall assessment>"
}

Return ONLY the JSON. No extra text.
`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = message.content[0].text;
  return JSON.parse(raw);
}

module.exports = { generateSuggestions };