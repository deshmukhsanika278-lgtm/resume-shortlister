import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { notify } from "../utils/notifications";
import { API_ENDPOINTS } from "../config/api";
import "../styles/Compare.css";

const MAX_JOB_DESC_LENGTH = 3000;
const MIN_CANDIDATES = 2;
const MAX_CANDIDATES = 5;

export default function Compare() {
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState("");
  const [candidates, setCandidates] = useState([
    { id: 1, name: "", file: null, results: null },
    { id: 2, name: "", file: null, results: null },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [comparisonResults, setComparisonResults] = useState(null);
  const [nextId, setNextId] = useState(3);

  const isValidFileType = (file) => {
    return (
      file.type === "text/plain" ||
      file.type === "application/pdf" ||
      file.name.endsWith(".txt") ||
      file.name.endsWith(".pdf")
    );
  };

  const validateName = (name) => {
    if (!name.trim()) return "Name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    return "";
  };

  const handleFileUpload = (e, candidateId) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        notify.error("File size must be less than 10MB");
        return;
      }
      if (isValidFileType(file)) {
        setCandidates(
          candidates.map((c) =>
            c.id === candidateId ? { ...c, file } : c
          )
        );
        setFieldErrors({
          ...fieldErrors,
          [`file-${candidateId}`]: "",
        });
      } else {
        notify.error("Only .txt or .pdf files are allowed");
        setFieldErrors({
          ...fieldErrors,
          [`file-${candidateId}`]: "Invalid file type",
        });
      }
    }
  };

  const handleDragDrop = (e, candidateId) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload({ target: { files: [file] } }, candidateId);
    }
  };

  const handleBrowseClick = (candidateId) => {
    document.getElementById(`file-input-${candidateId}`).click();
  };

  const updateCandidateName = (candidateId, name) => {
    setCandidates(
      candidates.map((c) =>
        c.id === candidateId ? { ...c, name } : c
      )
    );
    setFieldErrors({
      ...fieldErrors,
      [`name-${candidateId}`]: "",
    });
  };

  const addCandidate = () => {
    if (candidates.length < MAX_CANDIDATES) {
      setCandidates([
        ...candidates,
        { id: nextId, name: "", file: null, results: null },
      ]);
      setNextId(nextId + 1);
    }
  };

  const removeCandidate = (candidateId) => {
    if (candidates.length > MIN_CANDIDATES) {
      setCandidates(candidates.filter((c) => c.id !== candidateId));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!jobDescription.trim()) {
      errors.jobDescription = "Job description is required";
    } else if (jobDescription.trim().length < 20) {
      errors.jobDescription = "Job description must be at least 20 characters";
    }

    candidates.forEach((candidate) => {
      const nameErr = validateName(candidate.name);
      if (nameErr) errors[`name-${candidate.id}`] = nameErr;

      if (!candidate.file)
        errors[`file-${candidate.id}`] = "Resume file required";
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCompare = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      notify.error("Please fill in all fields correctly");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Prepare data for batch analysis
      const candidatesData = [];

      for (let candidate of candidates) {
        let resumeText = "";

        if (
          candidate.file.type === "application/pdf" ||
          candidate.file.name.endsWith(".pdf")
        ) {
          const formData = new FormData();
          formData.append("resume", candidate.file);
          formData.append("jobDescription", jobDescription);
          formData.append("candidateName", candidate.name);

          const response = await axios.post(
            API_ENDPOINTS.ANALYZE_PDF,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
          resumeText = response.data.resumeText || "";
        } else {
          resumeText = await candidate.file.text();
        }

        candidatesData.push({
          candidateName: candidate.name,
          resumeText,
        });
      }

      // Call batch compare endpoint
      const response = await axios.post(API_ENDPOINTS.BATCH_COMPARE, {
        jobDescription,
        candidates: candidatesData,
      });

      if (response.data && response.data.success) {
        setComparisonResults(response.data);
        notify.success("Comparison complete!");
      } else {
        const errorMsg =
          response.data?.error || "Comparison failed without error details";
        setError(errorMsg);
        notify.error(errorMsg);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Comparison failed. Please check your input and try again.";
      setError(errorMsg);
      notify.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setComparisonResults(null);
    setCandidates([
      { id: 1, name: "", file: null, results: null },
      { id: 2, name: "", file: null, results: null },
    ]);
    setJobDescription("");
    setFieldErrors({});
    setNextId(3);
  };

  const getSortedCandidates = () => {
    if (!comparisonResults || !comparisonResults.results) return [];
    return [...comparisonResults.results].sort((a, b) => b.score - a.score);
  };

  const getRankBadge = (score) => {
    if (score >= 80) return { class: "excellent", text: "Excellent" };
    if (score >= 60) return { class: "good", text: "Good" };
    if (score >= 40) return { class: "fair", text: "Fair" };
    return { class: "poor", text: "Poor" };
  };

  return (
    <div className="compare-container">
      <div className="compare-content">
        {!comparisonResults ? (
          <>
            <div className="compare-header">
              <h2>Compare Multiple Resumes</h2>
              <p>Upload 2-5 resumes to compare ATS scores and find the best match</p>
            </div>

            {error && (
              <div className="error-message" role="alert">
                <span>⚠️ {error}</span>
              </div>
            )}

            <form onSubmit={handleCompare} className="compare-form" noValidate>
              {/* Job Description */}
              <div className="form-group">
                <div className="label-with-counter">
                  <label htmlFor="jobDescription">
                    Job Description <span className="required">*</span>
                  </label>
                  <span className="char-counter">
                    {jobDescription.length} / {MAX_JOB_DESC_LENGTH}
                  </span>
                </div>
                <textarea
                  id="jobDescription"
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_JOB_DESC_LENGTH) {
                      setJobDescription(e.target.value);
                      if (fieldErrors.jobDescription)
                        setFieldErrors({
                          ...fieldErrors,
                          jobDescription: "",
                        });
                    }
                  }}
                  rows="6"
                  aria-invalid={!!fieldErrors.jobDescription}
                  aria-describedby={
                    fieldErrors.jobDescription ? "job-error" : undefined
                  }
                  className={fieldErrors.jobDescription ? "error" : ""}
                />
                {fieldErrors.jobDescription && (
                  <span id="job-error" className="field-error">
                    {fieldErrors.jobDescription}
                  </span>
                )}
              </div>

              {/* Candidates Section */}
              <div className="candidates-section">
                <div className="section-header">
                  <h3>Candidates ({candidates.length}/{MAX_CANDIDATES})</h3>
                  {candidates.length < MAX_CANDIDATES && (
                    <button
                      type="button"
                      className="btn btn-small btn-secondary"
                      onClick={addCandidate}
                    >
                      + Add Candidate
                    </button>
                  )}
                </div>

                <div className="candidates-grid">
                  {candidates.map((candidate, index) => (
                    <div
                      key={candidate.id}
                      className="candidate-card"
                    >
                      <div className="candidate-number">
                        Candidate {index + 1}
                      </div>

                      {/* Name */}
                      <div className="form-group">
                        <label htmlFor={`name-${candidate.id}`}>
                          Name <span className="required">*</span>
                        </label>
                        <input
                          id={`name-${candidate.id}`}
                          type="text"
                          placeholder="Enter candidate name"
                          value={candidate.name}
                          onChange={(e) =>
                            updateCandidateName(candidate.id, e.target.value)
                          }
                          aria-invalid={!!fieldErrors[`name-${candidate.id}`]}
                          className={
                            fieldErrors[`name-${candidate.id}`] ? "error" : ""
                          }
                        />
                        {fieldErrors[`name-${candidate.id}`] && (
                          <span className="field-error">
                            {fieldErrors[`name-${candidate.id}`]}
                          </span>
                        )}
                      </div>

                      {/* File Upload */}
                      <div className="form-group">
                        <label>
                          Resume <span className="required">*</span>
                        </label>
                        <div
                          className={`file-drop-zone ${
                            candidate.file ? "has-file" : ""
                          }`}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => handleDragDrop(e, candidate.id)}
                        >
                          {candidate.file ? (
                            <div className="file-selected">
                              <p className="file-icon">✓</p>
                              <p className="file-name">{candidate.file.name}</p>
                              <p className="file-size">
                                {(candidate.file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          ) : (
                            <>
                              <p className="drag-text">📄 Drag resume here</p>
                              <p className="divider">or</p>
                            </>
                          )}
                          <input
                            id={`file-input-${candidate.id}`}
                            type="file"
                            accept=".txt,.pdf"
                            onChange={(e) =>
                              handleFileUpload(e, candidate.id)
                            }
                            className="file-input"
                          />
                          <button
                            type="button"
                            className="btn btn-secondary btn-small"
                            onClick={() =>
                              handleBrowseClick(candidate.id)
                            }
                          >
                            Browse
                          </button>
                        </div>
                        {fieldErrors[`file-${candidate.id}`] && (
                          <span className="field-error">
                            {fieldErrors[`file-${candidate.id}`]}
                          </span>
                        )}
                      </div>

                      {/* Remove Button */}
                      {candidates.length > MIN_CANDIDATES && (
                        <button
                          type="button"
                          className="btn btn-remove"
                          onClick={() => removeCandidate(candidate.id)}
                          title="Remove candidate"
                        >
                          ✕ Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary btn-large"
                  disabled={loading}
                >
                  {loading ? "Analyzing..." : "Compare Resumes"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="results-header">
              <h2>Comparison Results</h2>
              <button
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Compare Another Group
              </button>
            </div>

            {/* Comparison Summary */}
            <div className="comparison-summary">
              <div className="summary-card">
                <h3>Candidates Ranked by ATS Score</h3>
                <div className="candidates-ranking">
                  {getSortedCandidates().map((result, index) => {
                    const badge = getRankBadge(result.score);
                    return (
                      <div key={result.candidateName} className="ranking-item">
                        <div className="ranking-position">#{index + 1}</div>
                        <div className="ranking-name">{result.candidateName}</div>
                        <div className={`ranking-score score-${badge.class}`}>
                          {result.score}%
                        </div>
                        <div className={`ranking-badge badge-${badge.class}`}>
                          {badge.text}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Detailed Comparison */}
            <div className="detailed-comparison">
              <h3>Detailed Analysis</h3>
              <div className="comparison-cards-grid">
                {getSortedCandidates().map((result) => {
                  const badge = getRankBadge(result.score);
                  return (
                    <div key={result.candidateName} className="comparison-card">
                      <div className={`card-header header-${badge.class}`}>
                        <h4>{result.candidateName}</h4>
                        <div className={`score score-${badge.class}`}>
                          {result.score}%
                        </div>
                      </div>

                      <div className="card-content">
                        {result.verdict && (
                          <div className="verdict-section">
                            <strong>Verdict:</strong>
                            <p>{result.verdict}</p>
                          </div>
                        )}

                        {result.missingSkills && result.missingSkills.length > 0 && (
                          <div className="missing-skills">
                            <strong>⚠️ Missing Skills:</strong>
                            <ul>
                              {result.missingSkills.map((skill, i) => (
                                <li key={i}>{skill}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {result.weakSections && result.weakSections.length > 0 && (
                          <div className="weak-sections">
                            <strong>📋 Weak Sections:</strong>
                            <ul>
                              {result.weakSections.map((section, i) => (
                                <li key={i}>{section}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {result.formattingTips && result.formattingTips.length > 0 && (
                          <div className="formatting-tips">
                            <strong>✨ Formatting Tips:</strong>
                            <ul>
                              {result.formattingTips.map((tip, i) => (
                                <li key={i}>{tip}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Back Button */}
            <div className="results-footer">
              <button
                className="btn btn-secondary"
                onClick={() => navigate("/")}
              >
                Back to Home
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
