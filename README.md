# Resume Shortlister

A comprehensive resume analysis platform with AI-powered scoring, PDF support, and admin dashboard.

## 🎯 Features

### ✅ User Features
- **Resume Upload**: Upload resumes in `.txt` or `.pdf` format
- **AI Analysis**: Get instant ATS score and detailed feedback
- **Job Description Matching**: Submit job description for tailored analysis
- **PDF Report**: Download analysis results as PDF
- **Multiple File Formats**: Support for both text and PDF resumes

### ✅ Admin Features
- **Admin Dashboard**: Secure login with demo credentials
- **Submissions View**: Track all resume submissions with scores
- **Analytics Overview**: View total submissions, average scores, unique candidates
- **Score Predictor**: Analyze potential scores for different candidates
- **Detailed Insights**: Review missing skills, weak sections, formatting tips

### ✅ Technical Features
- **MongoDB Support**: Persistent data storage with graceful in-memory fallback
- **PDF Processing**: Automatic text extraction from PDF files
- **JWT Authentication**: Secure admin access with token-based auth
- **Password Hashing**: Bcrypt-based password security
- **Environment Configuration**: Centralized API endpoints and secrets

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB (optional - app runs in-memory without it)
- npm or yarn

### Installation

#### Clone and Install Dependencies

```bash
# Backend setup
cd backend
npm install

# Frontend setup
cd ../frontend
npm install
```

#### Environment Configuration

**Backend (.env)**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/resume-shortlister
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ANTHROPIC_API_KEY=your-api-key-here
```

**Frontend (.env.local)**
```
VITE_API_BASE_URL=http://localhost:5000/api
```

### Running the Application

#### Terminal 1: Backend Server
```bash
cd backend
npm start
# Backend running at http://localhost:5000
```

#### Terminal 2: Frontend Development Server
```bash
cd frontend
npm run dev
# Frontend running at http://localhost:5173
```

## 📝 Demo Credentials

**Admin Login:**
- Email: `admin@resume-shortlister.com`
- Password: `admin123`

## 🗂️ Project Structure

```
resume-shortlister/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection setup
│   ├── models/
│   │   ├── ResumeSubmission.js # Resume data schema
│   │   └── AdminUser.js        # Admin user schema
│   ├── routes/
│   │   ├── auth.js             # Authentication endpoints
│   │   ├── suggestions.js       # Resume analysis endpoints
│   │   └── admin.js            # Dashboard endpoints
│   ├── services/
│   │   ├── suggestionService.js # ATS scoring algorithm
│   │   └── pdfService.js        # PDF generation service
│   ├── server.js               # Express server setup
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── config/
│   │   │   └── api.js          # Centralized API endpoints
│   │   ├── pages/
│   │   │   ├── Welcome.jsx      # Landing page
│   │   │   ├── Login.jsx        # Admin login
│   │   │   ├── Upload.jsx       # Resume analysis page
│   │   │   └── Admin.jsx        # Dashboard
│   │   ├── styles/
│   │   ├── App.jsx              # Router configuration
│   │   └── main.jsx             # Entry point
│   ├── package.json
│   └── vite.config.js
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login

### Resume Analysis
- `POST /api/suggestions` - Analyze text resume
- `POST /api/suggestions/analyze-pdf` - Analyze PDF resume
- `POST /api/suggestions/download` - Download PDF report

### Admin Dashboard
- `GET /api/admin/submissions` - Get all submissions
- `GET /api/admin/stats` - Get dashboard statistics

## 📊 Database Models

### ResumeSubmission
- candidateName
- email
- score (0-100)
- missingSkills
- weakSections
- formattingTips
- verdict
- jobDescription
- resumeText
- fileType (txt/pdf)
- feedback
- timestamp

### AdminUser
- name
- email (unique)
- password (bcrypt hashed)
- role (admin/super_admin)
- active
- createdAt

## 🔐 Security Features

- JWT token-based authentication
- Password hashing with bcryptjs
- CORS configuration for frontend-backend communication
- Secure environment variable management
- Authorization headers for protected routes

## 📱 Workflow

1. **User uploads resume** → Platform accepts `.txt` or `.pdf` files
2. **Job description provided** → User enters target job description
3. **AI analysis performed** → Generates ATS score and detailed feedback
4. **Results displayed** → Shows score, missing skills, formatting tips
5. **PDF report generated** → User can download analysis as PDF
6. **Data persisted** → Submissions stored in MongoDB (or in-memory)
7. **Admin tracks submissions** → View analytics and individual submissions

## 🛠️ Technologies Used

### Backend
- Express 5.2
- Node.js
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- Bcryptjs
- pdf-parse (PDF text extraction)
- PDFKit (PDF report generation)
- Multer (file uploads)

### Frontend
- React 19
- React Router 7
- Axios
- Vite
- CSS3

## 📈 Features Roadmap

- [ ] Batch resume processing
- [ ] Real-time notifications
- [ ] Advanced comparison analytics
- [ ] Custom scoring templates
- [ ] User account system
- [ ] Export reports in multiple formats

## 🐛 Troubleshooting

### Frontend won't connect to backend
- Verify backend is running on `http://localhost:5000`
- Check `.env.local` has correct `VITE_API_BASE_URL`
- Check browser console for CORS errors

### PDF upload fails
- Ensure PDF is text-based (not image-only)
- Try a different PDF file
- Check file size (should be under 10MB)

### MongoDB connection fails
- App will fall back to in-memory storage
- Check MongoDB is running (if using local)
- Verify `MONGODB_URI` in `.env`

## 📄 License

This project is part of the resume-shortlister portfolio.

---

Built with ❤️ for better resume analysis.
