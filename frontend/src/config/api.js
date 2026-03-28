// API configuration - centralized for easy environment management
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/auth/login`,
  
  // Suggestions endpoints
  ANALYZE_TEXT: `${API_BASE_URL}/suggestions`,
  ANALYZE_PDF: `${API_BASE_URL}/suggestions/analyze-pdf`,
  DOWNLOAD_PDF: `${API_BASE_URL}/suggestions/download`,
  
  // Admin endpoints
  GET_SUBMISSIONS: `${API_BASE_URL}/admin/submissions`,
  GET_STATS: `${API_BASE_URL}/admin/stats`,
};

export default API_ENDPOINTS;
