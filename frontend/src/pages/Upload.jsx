import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { notify } from "../utils/notifications";
import { API_ENDPOINTS } from "../config/api";
import "../styles/Upload.css";

export default function Upload() {
  const navigate = useNavigate();
  const [candidateName, setCandidateName] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  
  const MAX_JOB_DESC_LENGTH = 3000;

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

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        notify.error("File size must be less than 10MB");
        setResumeFile(null);
        return;
      }
      if (isValidFileType(file)) {
        setResumeFile(file);
        setFieldErrors({ ...fieldErrors, resume: "" });
      } else {
        notify.error("Only .txt or .pdf files are allowed");
        setResumeFile(null);
        setFieldErrors({ ...fieldErrors, resume: "Invalid file type" });
      }
    }
  };

  const handleDragDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload({ target: { files: [file] } });
    }
  };

  const handleBrowseClick = () => {
    document.getElementById("resume-file-input").click();
  };

  const validateForm = () => {
    const errors = {};
    
    const nameErr = validateName(candidateName);
    if (nameErr) errors.name = nameErr;
    
    if (!resumeFile) errors.resume = "Please upload a resume file";
    
    if (!jobDescription.trim()) {
      errors.jobDescription = "Job description is required";
    } else if (jobDescription.trim().length < 20) {
      errors.jobDescription = "Job description must be at least 20 characters";
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      notify.error("Please fill in all fields correctly");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let response;

      if (resumeFile.type === "application/pdf" || resumeFile.name.endsWith(".pdf")) {
        const formData = new FormData();
        formData.append("resume", resumeFile);
        formData.append("jobDescription", jobDescription);
        formData.append("candidateName", candidateName);

        response = await axios.post(
          API_ENDPOINTS.ANALYZE_PDF,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else {
        const resumeText = await resumeFile.text();

        response = await axios.post(
          API_ENDPOINTS.ANALYZE_TEXT,
          {
            resumeText,
            jobDescription,
            candidateName,
          }
        );
      }

      // Check if response has success flag
      if (response.data && response.data.success) {
        setResults(response.data);
        notify.success("Analysis complete!");
      } else {
        // Handle response without success flag or success=false
        const errorMsg = response.data?.error || "Analysis failed without error details";
        setError(errorMsg);
        notify.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = 
        err.response?.data?.error || 
        err.response?.data?.message || 
        err.message || 
        "Analysis failed. Please check your input and try again.";
      setError(errorMsg);
      notify.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!results || !resumeFile) return;

    try {
      let resumeTextForDownload = "";
      
      if (resumeFile.type === "application/pdf" || resumeFile.name.endsWith(".pdf")) {
        resumeTextForDownload = results.resumeText || "";
      } else {
        resumeTextForDownload = await resumeFile.text();
      }
      
      const response = await axios.post(
        API_ENDPOINTS.DOWNLOAD_PDF,
        {
          resumeText: resumeTextForDownload,
          jobDescription,
          candidateName,
        },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${candidateName}-analysis.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      notify.success("PDF downloaded successfully!");
    } catch (err) {
      notify.error("Failed to download PDF");
    }
  };

  const resetForm = () => {
    setResults(null);
    setCandidateName("");
    setResumeFile(null);
    setJobDescription("");
    setFieldErrors({});
  };


  return (
    <div className="upload-container">
      <div className="upload-content">
        {!results ? (
          <>
            <div className="upload-header">
              <h2>Resume Analysis</h2>
              <p>Upload your resume and job description to get AI-powered insights</p>
            </div>

            {error && (
              <div className="error-message" role="alert">
                <span>⚠️ {error}</span>
              </div>
            )}

            <form onSubmit={handleAnalyze} className="upload-form" noValidate>
              {/* Name Field */}
              <div className="form-group">
                <label htmlFor="candidateName">
                  Candidate Name <span className="required">*</span>
                </label>
                <input
                  id="candidateName"
                  type="text"
                  placeholder="Enter your full name"
                  value={candidateName}
                  onChange={(e) => {
                    setCandidateName(e.target.value);
                    if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: "" });
                  }}
                  aria-invalid={!!fieldErrors.name}
                  aria-describedby={fieldErrors.name ? "name-error" : undefined}
                  className={fieldErrors.name ? "error" : ""}
                />
                {fieldErrors.name && (
                  <span id="name-error" className="field-error">
                    {fieldErrors.name}
                  </span>
                )}
              </div>

              {/* File Upload */}
              <div className="form-group">
                <label>
                  Resume File (.txt or .pdf) <span className="required">*</span>
                </label>
                <div
                  className={`file-drop-zone ${resumeFile ? "has-file" : ""}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDragDrop}
                  role="region"
                  aria-label="File drop zone"
                >
                  {resumeFile ? (
                    <div className="file-selected">
                      <p className="file-icon">✓</p>
                      <p className="file-name">{resumeFile.name}</p>
                      <p className="file-size">
                        {(resumeFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="drag-text">📄 Drag and drop your resume here</p>
                      <p className="divider">or</p>
                    </>
                  )}
                  <input
                    id="resume-file-input"
                    type="file"
                    accept=".txt,.pdf"
                    onChange={handleFileUpload}
                    className="file-input"
                    aria-label="Upload resume file"
                  />
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={handleBrowseClick}
                  >
                    Browse Files
                  </button>
                </div>
                {fieldErrors.resume && (
                  <span className="field-error">{fieldErrors.resume}</span>
                )}
              </div>

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
                        setFieldErrors({ ...fieldErrors, jobDescription: "" });
                    }
                  }}
                  rows="6"
                  aria-invalid={!!fieldErrors.jobDescription}
                  aria-describedby={fieldErrors.jobDescription ? "job-desc-error" : undefined}
                  className={fieldErrors.jobDescription ? "error" : ""}
                />
                {fieldErrors.jobDescription && (
                  <span id="job-desc-error" className="field-error">
                    {fieldErrors.jobDescription}
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`btn btn-primary ${loading ? "loading" : ""}`}
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Analyzing...
                  </>
                ) : (
                  "Analyze Resume"
                )}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="results-header">
              <h2>Analysis Results for {candidateName}</h2>
              <button
                className="link-btn"
                onClick={resetForm}
                aria-label="Analyze another resume"
              >
                ← Analyze Another Resume
              </button>
            </div>

            <div className="results-content">
              <div className="score-card">
                <h3>ATS Score</h3>
                <div className="score-circle" style={{
                  background: `conic-gradient(
                    var(--success) 0% ${results.score || 0}%,
                    var(--border) ${results.score || 0}% 100%
                  )`
                }}>
                  <span className="score-text">{results.score || 0}%</span>
                </div>
                <p className="score-label">
                  {(results.score || 0) >= 70
                    ? "✓ Good Match"
                    : (results.score || 0) >= 50
                    ? "~ Fair Match"
                    : "✗ Needs Improvement"}
                </p>
              </div>

              <div className="results-section">
                <h3>Missing Skills</h3>
                {(results.missingSkills || []).length > 0 ? (
                  <ul className="skills-list">
                    {(results.missingSkills || []).map((skill, i) => (
                      <li key={i}>
                        <span className="skill-tag">{skill}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-data">No missing skills detected!</p>
                )}
              </div>

              <div className="results-section">
                <h3>Sections to Improve</h3>
                {(results.weakSections || []).length > 0 ? (
                  <ul className="improvements-list">
                    {(results.weakSections || []).map((section, i) => (
                      <li key={i}>{section}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-data">All sections look good!</p>
                )}
              </div>

              <div className="results-section">
                <h3>Formatting Tips</h3>
                {(results.formattingTips || []).length > 0 ? (
                  <ul className="tips-list">
                    {(results.formattingTips || []).map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-data">No formatting issues found!</p>
                )}
              </div>

              <div className="results-section">
                <h3>Overall Assessment</h3>
                <p className="assessment">{results.verdict || "No assessment available"}</p>
              </div>

              <div className="results-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleDownloadPDF}
                  aria-label="Download analysis as PDF"
                >
                  📥 Download as PDF
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={resetForm}
                  aria-label="Analyze another resume"
                >
                  ← Back
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}