import { useNavigate } from "react-router-dom";
import "../styles/Welcome.css";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <div className="welcome-header">
          <h1>Resume Shortlister</h1>
          <p className="tagline">AI-Powered Resume Analysis & Shortlisting System</p>
        </div>

        <div className="welcome-hero">
          <div className="hero-text">
            <h2>Get Your Resume Analyzed in Seconds</h2>
            <p>
              Upload your resume and job description to receive AI-powered insights, 
              ATS compatibility analysis, and actionable recommendations to improve your chances.
            </p>
          </div>
          <div className="hero-features">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Smart Analysis</h3>
              <p>Get detailed ATS score and compatibility metrics</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Targeted Insights</h3>
              <p>Identify missing skills and weak sections</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✨</div>
              <h3>Actionable Tips</h3>
              <p>Get formatting and content recommendations</p>
            </div>
          </div>
        </div>

        <div className="welcome-actions">
          <button 
            className="btn btn-primary"
            onClick={() => navigate("/analyze")}
          >
            Get Started
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate("/login")}
          >
            Admin Login
          </button>
        </div>

        <div className="welcome-footer">
          <p>Process your resume now and unlock better job opportunities!</p>
        </div>
      </div>
    </div>
  );
}
