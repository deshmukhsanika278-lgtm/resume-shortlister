import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { notify } from "../utils/notifications";
import { API_ENDPOINTS } from "../config/api";
import "../styles/Admin.css";

export default function Admin() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    avgScore: 0,
    totalCandidates: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    checkAuth();
    fetchDashboardData();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("authToken");
    const name = localStorage.getItem("adminName");
    if (!token) {
      navigate("/login");
      return;
    }
    setAdminName(name || "Admin");
  };

  const fetchDashboardData = async () => {
    try {
      setError("");
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        setError("No authentication token found");
        notify.error("Session expired. Please login again.");
        return;
      }
      
      const headers = { Authorization: `Bearer ${token}` };

      const [submissionsRes, statsRes] = await Promise.all([
        axios.get(API_ENDPOINTS.GET_SUBMISSIONS, { headers }),
        axios.get(API_ENDPOINTS.GET_STATS, { headers }),
      ]);

      setSubmissions(submissionsRes.data || []);
      setStats(statsRes.data || {});
      notify.success("Dashboard data loaded!");
    } catch (err) {
      console.error("Failed to fetch data:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to load dashboard data";
      setError(errorMsg);
      notify.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("adminName");
    notify.info("Logged out successfully");
    navigate("/");
  };

  const getFilteredAndSortedSubmissions = () => {
    let filtered = submissions.filter((sub) =>
      sub.candidateName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return (new Date(b.timestamp) || 0) - (new Date(a.timestamp) || 0);
        case "oldest":
          return (new Date(a.timestamp) || 0) - (new Date(b.timestamp) || 0);
        case "highest_score":
          return (b.score || 0) - (a.score || 0);
        case "lowest_score":
          return (a.score || 0) - (b.score || 0);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const LoadingSkeleton = () => (
    <div className="skeleton-grid">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="skeleton-card"></div>
      ))}
    </div>
  );


  const averageScore = submissions.length 
    ? (submissions.reduce((sum, s) => sum + (s.score || 0), 0) / submissions.length).toFixed(1)
    : 0;

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="header-content">
          <h1>📊 Admin Dashboard</h1>
          <div className="user-info">
            <span className="welcome-text">Welcome, {adminName}</span>
            <button 
              className="btn btn-secondary" 
              onClick={handleLogout}
              aria-label="Logout from admin"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="admin-content">
        <nav className="admin-tabs" role="tablist">
          <button
            className={`tab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
            role="tab"
            aria-selected={activeTab === "overview"}
          >
            Overview
          </button>
          <button
            className={`tab ${activeTab === "submissions" ? "active" : ""}`}
            onClick={() => setActiveTab("submissions")}
            role="tab"
            aria-selected={activeTab === "submissions"}
          >
            Submissions
          </button>
          <button
            className={`tab ${activeTab === "predictor" ? "active" : ""}`}
            onClick={() => setActiveTab("predictor")}
            role="tab"
            aria-selected={activeTab === "predictor"}
          >
            Score Predictor
          </button>
        </nav>

        {error && (
          <div className="error-banner" role="alert">
            <span>⚠️ {error}</span>
            <button 
              className="retry-btn"
              onClick={() => {
                setLoading(true);
                fetchDashboardData();
              }}
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="tab-content">
            <LoadingSkeleton />
          </div>
        ) : (
          <>
            {activeTab === "overview" && (
              <div className="tab-content">
                <div className="stats-grid">
                  {loading ? (
                    <LoadingSkeleton />
                  ) : (
                    <>
                      <div className="stat-card">
                        <h3>Total Submissions</h3>
                        <p className="stat-value">{submissions.length}</p>
                      </div>
                      <div className="stat-card">
                        <h3>Average ATS Score</h3>
                        <p className="stat-value">
                          {submissions.length > 0
                            ? (submissions.reduce((sum, s) => sum + (s.score || 0), 0) / submissions.length).toFixed(1)
                            : 0}%
                        </p>
                      </div>
                      <div className="stat-card">
                        <h3>Unique Candidates</h3>
                        <p className="stat-value">
                          {new Set(submissions.map((s) => s.candidateName)).size}
                        </p>
                      </div>
                      <div className="stat-card">
                        <h3>High Performers (75+)</h3>
                        <p className="stat-value">
                          {submissions.filter((s) => (s.score || 0) >= 75).length}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className="chart-section">
                  <h2>Recent Submissions</h2>
                  {submissions.length > 0 ? (
                    <div className="submissions-list mini">
                      {submissions.slice(0, 5).map((sub, idx) => (
                        <div key={idx} className="submission-item">
                          <div className="sub-info">
                            <p className="candidate-name">{sub.candidateName}</p>
                            <p className="submission-date">
                              {new Date(sub.timestamp || Date.now()).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="score-badge">
                            <span
                              className="score"
                              style={{
                                backgroundColor:
                                  sub.score >= 70
                                    ? "var(--success)"
                                    : sub.score >= 50
                                    ? "var(--warning)"
                                    : "var(--error)",
                              }}
                            >
                              {sub.score || 0}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-state">No submissions yet</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "submissions" && (
              <div className="tab-content">
                <div className="submissions-section">
                  <div className="submissions-header">
                    <h2>All Submissions</h2>
                    {!selectedSubmission && submissions.length > 0 && (
                      <div className="search-sort-bar">
                        <input
                          type="text"
                          placeholder="🔍 Search by candidate name..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="search-input"
                          aria-label="Search submissions by candidate name"
                        />
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="sort-select"
                          aria-label="Sort submissions"
                        >
                          <option value="recent">Most Recent</option>
                          <option value="oldest">Oldest First</option>
                          <option value="highest_score">Highest Score</option>
                          <option value="lowest_score">Lowest Score</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {selectedSubmission ? (
                    <div className="submission-detail">
                      <button
                        className="link-btn"
                        onClick={() => setSelectedSubmission(null)}
                        aria-label="Back to submissions list"
                      >
                        ← Back
                      </button>
                      <h3>{selectedSubmission.candidateName}</h3>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <label>ATS Score</label>
                          <p className="detail-value">{selectedSubmission.score || 0}%</p>
                        </div>
                        <div className="detail-item">
                          <label>Submitted</label>
                          <p className="detail-value">
                            {new Date(
                              selectedSubmission.timestamp || Date.now()
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="detail-section">
                        <h4>Missing Skills</h4>
                        {(selectedSubmission.missingSkills || []).length > 0 ? (
                          <ul>
                            {(selectedSubmission.missingSkills || []).map((skill, i) => (
                              <li key={i}>{skill}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="empty-state">No missing skills</p>
                        )}
                      </div>
                      <div className="detail-section">
                        <h4>Feedback</h4>
                        <p>
                          {selectedSubmission.feedback || "No feedback available"}
                        </p>
                      </div>
                    </div>
                  ) : submissions.length > 0 ? (
                    <div className="submissions-list">
                      {getFilteredAndSortedSubmissions().length > 0 ? (
                        getFilteredAndSortedSubmissions().map((sub, idx) => (
                          <div
                            key={idx}
                            className="submission-item clickable"
                            onClick={() => setSelectedSubmission(sub)}
                            role="button"
                            tabIndex={0}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") setSelectedSubmission(sub);
                            }}
                          >
                            <div className="sub-info">
                              <p className="candidate-name">{sub.candidateName}</p>
                              <p className="submission-date">
                                {new Date(sub.timestamp || Date.now()).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="score-badge">
                              <span
                                className="score"
                                style={{
                                  backgroundColor:
                                    sub.score >= 70
                                      ? "var(--success)"
                                      : sub.score >= 50
                                      ? "var(--warning)"
                                      : "var(--error)",
                                }}
                              >
                                {sub.score || 0}%
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="empty-state">
                          No submissions found for "{searchQuery}"
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="empty-state">No submissions yet</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "predictor" && (
              <div className="tab-content">
                <div className="predictor-section">
                  <h2>Score Predictor & Analytics</h2>
                  {submissions.length > 0 ? (
                    <div className="predictor-info">
                      <h3>Resume Score Analysis</h3>
                      <p>Based on {submissions.length} submissions:</p>
                      <div className="predictor-stats">
                        <div className="stat-row">
                          <span>Average Score:</span>
                          <strong>
                            {(submissions.reduce((sum, s) => sum + (s.score || 0), 0) /
                              submissions.length).toFixed(1)}
                            %
                          </strong>
                        </div>
                        <div className="stat-row">
                          <span>Highest Score:</span>
                          <strong>
                            {Math.max(...submissions.map((s) => s.score || 0), 0)}%
                          </strong>
                        </div>
                        <div className="stat-row">
                          <span>Lowest Score:</span>
                          <strong>
                            {Math.min(...submissions.map((s) => s.score || 0), 0)}%
                          </strong>
                        </div>
                        <div className="stat-row">
                          <span>Score Distribution:</span>
                          <div className="distribution">
                            <div className="dist-item">
                              <span>90-100:</span>
                              <strong>
                                {submissions.filter((s) => (s.score || 0) >= 90).length}
                              </strong>
                            </div>
                            <div className="dist-item">
                              <span>70-89:</span>
                              <strong>
                                {submissions.filter(
                                  (s) => (s.score || 0) >= 70 && (s.score || 0) < 90
                                ).length}
                              </strong>
                            </div>
                            <div className="dist-item">
                              <span>50-69:</span>
                              <strong>
                                {submissions.filter(
                                  (s) => (s.score || 0) >= 50 && (s.score || 0) < 70
                                ).length}
                              </strong>
                            </div>
                            <div className="dist-item">
                              <span>&lt;50:</span>
                              <strong>
                                {submissions.filter((s) => (s.score || 0) < 50).length}
                              </strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="empty-state">No data available for analysis</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
