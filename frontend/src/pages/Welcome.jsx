import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Welcome.css";

export default function Welcome() {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "How does the ATS scoring work?",
      answer:
        "Our AI-powered system analyzes your resume against the job description you provide, scoring compatibility based on keyword matches, skills alignment, experience relevance, and formatting optimization. Higher scores indicate better ATS compatibility.",
    },
    {
      id: 2,
      question: "Can I compare multiple resumes at once?",
      answer:
        "Yes! Our Compare feature lets you upload 2-5 resumes for the same job position to see which candidates have the best ATS alignment. Perfect for recruiters and hiring managers.",
    },
    {
      id: 3,
      question: "What file formats are supported?",
      answer:
        "We support both PDF and plain text (.txt) resume formats. Files must be under 10MB. Simply drag and drop or browse to upload your resume.",
    },
    {
      id: 4,
      question: "Is my data secure?",
      answer:
        "Your resume data is processed securely and kept confidential. We use industry-standard encryption and do not share your information with third parties.",
    },
    {
      id: 5,
      question: "Can I download the analysis report?",
      answer:
        "Yes! After analysis, you can download a detailed PDF report containing your ATS score, missing skills, weak sections, and formatting recommendations.",
    },
    {
      id: 6,
      question: "How accurate is the analysis?",
      answer:
        "Our AI model is trained on thousands of job postings and resumes to provide highly accurate insights. While no system is 100% perfect, we provide actionable recommendations to improve your resume.",
    },
  ];

  const useCases = [
    {
      icon: "👨‍💼",
      title: "Job Seekers",
      description:
        "Optimize your resume before applying to maximize chances of getting through ATS screening",
    },
    {
      icon: "👩‍💻",
      title: "Recruiters",
      description:
        "Screen multiple resumes quickly and objectively with AI-powered ATS scoring",
    },
    {
      icon: "🏢",
      title: "HR Managers",
      description:
        "Streamline hiring process and identify the best-matched candidates efficiently",
    },
    {
      icon: "🎓",
      title: "Career Counselors",
      description:
        "Guide students and clients with data-driven resume improvement recommendations",
    },
  ];

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        {/* Header */}
        <div className="welcome-header">
          <h1>Resume Shortlister</h1>
          <p className="tagline">AI-Powered Resume Analysis & Shortlisting System</p>
          <p className="subtitle">
            Optimize your resume for ATS and stand out from the competition
          </p>
        </div>

        {/* Hero Section */}
        <div className="welcome-hero">
          <div className="hero-text">
            <h2>Get Your Resume Analyzed in Seconds</h2>
            <p>
              Upload your resume and job description to receive AI-powered insights,
              ATS compatibility analysis, and actionable recommendations to improve your
              chances of landing your dream job.
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
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Compare Resumes</h3>
              <p>Compare 2-5 resumes side-by-side for any position</p>
            </div>
          </div>
        </div>

        {/* Main CTA Buttons */}
        <div className="welcome-actions">
          <button className="btn btn-primary" onClick={() => navigate("/analyze")}>
            Analyze Your Resume
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/compare")}
          >
            Compare Resumes
          </button>
          <button className="btn btn-outline" onClick={() => navigate("/login")}>
            Admin Login
          </button>
        </div>

        {/* Key Features Section */}
        <section className="key-features-section">
          <h2>Why Choose Resume Shortlister?</h2>

          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-number">1</div>
              <h4>AI-Powered Analysis</h4>
              <p>
                Our advanced algorithms analyze your resume against job requirements to
                provide accurate ATS compatibility scores and recommendations.
              </p>
            </div>

            <div className="feature-item">
              <div className="feature-number">2</div>
              <h4>Instant Results</h4>
              <p>
                Get comprehensive analysis results in seconds. No waiting, no hidden fees,
                just immediate actionable insights to improve your resume.
              </p>
            </div>

            <div className="feature-item">
              <div className="feature-number">3</div>
              <h4>Detailed Feedback</h4>
              <p>
                Receive specific recommendations for missing skills, weak sections,
                formatting improvements, and overall verdict on ATS compatibility.
              </p>
            </div>

            <div className="feature-item">
              <div className="feature-number">4</div>
              <h4>Multi-Resume Comparison</h4>
              <p>
                Compare up to 5 resumes simultaneously to identify the best match for a
                job position. Perfect for making hiring decisions.
              </p>
            </div>

            <div className="feature-item">
              <div className="feature-number">5</div>
              <h4>PDF Export</h4>
              <p>
                Download your analysis as a professional PDF report. Share with mentors,
                recruiters, or keep for your records.
              </p>
            </div>

            <div className="feature-item">
              <div className="feature-number">6</div>
              <h4>Secure & Confidential</h4>
              <p>
                Your data is encrypted and never shared. We prioritize your privacy and
                maintain the highest security standards.
              </p>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="use-cases-section">
          <h2>Who Uses Resume Shortlister?</h2>
          <div className="use-cases-grid">
            {useCases.map((useCase, index) => (
              <div key={index} className="use-case-card">
                <div className="use-case-icon">{useCase.icon}</div>
                <h4>{useCase.title}</h4>
                <p>{useCase.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="how-it-works-section">
          <h2>How It Works</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h4>Upload Resume</h4>
              <p>Provide your resume in PDF or TXT format</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">2</div>
              <h4>Enter Job Description</h4>
              <p>Paste the target job description</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">3</div>
              <h4>Get Analysis</h4>
              <p>Receive AI-powered insights and score</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">4</div>
              <h4>Improve & Download</h4>
              <p>Follow recommendations and export report</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-container">
            {faqs.map((faq) => (
              <div key={faq.id} className="faq-item">
                <button
                  className="faq-question"
                  onClick={() =>
                    setExpandedFaq(expandedFaq === faq.id ? null : faq.id)
                  }
                >
                  <span>{faq.question}</span>
                  <span className="faq-toggle">
                    {expandedFaq === faq.id ? "−" : "+"}
                  </span>
                </button>
                {expandedFaq === faq.id && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="stat-card">
            <div className="stat-number">10K+</div>
            <p>Resumes Analyzed</p>
          </div>
          <div className="stat-card">
            <div className="stat-number">95%</div>
            <p>Accuracy Rate</p>
          </div>
          <div className="stat-card">
            <div className="stat-number">50+</div>
            <p>Industries Served</p>
          </div>
          <div className="stat-card">
            <div className="stat-number">24/7</div>
            <p>Available Service</p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <h2>Ready to Optimize Your Resume?</h2>
          <p>
            Join thousands of job seekers who have improved their ATS scores and landing
            more interviews
          </p>
          <div className="cta-buttons">
            <button className="btn btn-primary btn-large" onClick={() => navigate("/analyze")}>
              Start Analysis
            </button>
            <button
              className="btn btn-secondary btn-large"
              onClick={() => navigate("/compare")}
            >
              Compare Resumes
            </button>
          </div>
        </section>

        {/* Footer */}
        <div className="welcome-footer">
          <p>
            © 2024 Resume Shortlister. Helping you land your dream job with AI-powered
            resume analysis.
          </p>
        </div>
      </div>
    </div>
  );
}
