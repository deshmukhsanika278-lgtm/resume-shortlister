# Quick Start Guide

## ⚡ Starting the Application

### Step 1: Start Backend Server
```bash
cd backend
node server.js
```
✅ Backend will run at: **http://localhost:5000**

### Step 2: Start Frontend Development Server
```bash
cd frontend
npm run dev
```
✅ Frontend will run at: **http://localhost:5173**

### Step 3: Open in Browser
Navigate to: **http://localhost:5173**

---

## 🎯 Test the Application

### Test as a User:
1. Go to Home Page
2. Click "Get Started"
3. Enter your name
4. Upload a .txt file with your resume
5. Paste a job description
6. Click "Analyze Resume"
7. View your AI-powered score and recommendations
8. Download PDF (optional)

### Test as Admin:
1. Go to Home Page
2. Click "Admin Login"
3. Enter credentials:
   - **Email:** `admin@resume-shortlister.com`
   - **Password:** `admin123`
4. Click "Try Demo Account" button (auto-fills form)
5. Explore the dashboard:
   - **Overview Tab** - See key metrics
   - **Submissions Tab** - Click on any submission for details
   - **Score Predictor Tab** - View analytics and predictions

---

## 📋 Sample Resume for Testing

Save this as `sample_resume.txt`:

```
JOHN DOE
john.doe@email.com | (555) 123-4567
LinkedIn: linkedin.com/in/johndoe | GitHub: github.com/johndoe

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years developing scalable web applications. 
Proficient in full-stack development using React, Node.js, and cloud technologies. 
Proven track record of leading cross-functional teams and delivering high-impact projects.

EXPERIENCE

Senior Software Engineer | Tech Company Inc | Jan 2022 - Present
• Led development of microservices architecture, increasing system scalability by 300%
• Implemented CI/CD pipelines using Jenkins and Docker, reducing deployment time by 60%
• Mentored team of 4 junior developers and conducted code reviews
• Optimized database queries, improving application performance by 45%

Full Stack Developer | StartUp Co | Jun 2019 - Dec 2021
• Built responsive web applications using React, Node.js, and MongoDB
• Designed RESTful APIs serving 1M+ daily requests
• Implemented automated testing suite with 85% code coverage
• Collaborated with product team to deliver features on schedule

SKILLS
Languages: JavaScript, Python, Java, SQL
Frontend: React, Vue.js, HTML5, CSS3, Webpack
Backend: Node.js, Express, Django, REST APIs
Databases: MongoDB, PostgreSQL, Redis
DevOps: Docker, Kubernetes, AWS, CI/CD
Tools: Git, Jira, Agile, Linux

EDUCATION
Bachelor of Science in Computer Science
University Name | May 2019

CERTIFICATIONS
AWS Solutions Architect Associate - 2023
Docker Certified Associate - 2022
```

### Sample Job Description:
```
We're looking for a Senior Software Engineer to join our team!

Requirements:
- 5+ years of software development experience
- Proficiency in React and Node.js
- Experience with microservices architecture
- Knowledge of Docker and Kubernetes
- Experience with CI/CD pipelines
- Cloud platform experience (AWS/GCP)
- Strong problem-solving skills
- Excellent communication

Responsibilities:
- Develop scalable backend services
- Build responsive frontend applications
- Mentor junior team members
- Optimize system performance
- Collaborate with cross-functional teams
```

---

## ✅ Verification Checklist

After starting both servers, verify:

- [ ] Frontend loads at http://localhost:5173
- [ ] Home page displays with Welcome content
- [ ] "Get Started" button navigates to /analyze
- [ ] "Admin Login" button navigates to /login
- [ ] Can upload .txt file on Upload page
- [ ] Can login with demo credentials on Login page
- [ ] Admin dashboard shows submissions and stats
- [ ] Resume can be analyzed and scored
- [ ] PDF download works

---

## 🎨 Pages Available

| Page | URL | Description |
|------|-----|-------------|
| Home/Welcome | `/` | Landing page with feature highlights |
| Login | `/login` | Admin authentication |
| Resume Analysis | `/analyze` | Upload and analyze resumes |
| Admin Dashboard | `/admin` | View submissions and analytics |

---

## 🔄 Restarting Services

### If Frontend needs restart:
```bash
cd frontend
Ctrl+C  (stop current process)
npm run dev
```

### If Backend needs restart:
```bash
cd backend
Ctrl+C  (stop current process)
node server.js
```

---

## 🆘 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Frontend won't connect to backend | Check backend is running on port 5000 |
| Upload fails | Use .txt files only, max 10MB |
| Login fails | Verify email and password, try demo account |
| No submissions showing in admin | Submit a resume first to generate data |
| Styles not loading | Clear browser cache and reload |

---

## 📚 Project Structure

```
resume-shortlister/
├── frontend/                  # React + Vite application
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── styles/           # CSS files for each page
│   │   └── App.jsx           # Router configuration
│   └── package.json
├── backend/                   # Express.js server
│   ├── routes/               # API endpoints
│   ├── services/             # Business logic
│   ├── models/               # Data models
│   └── server.js             # Main server file
├── FEATURES.md               # Detailed feature documentation
└── QUICKSTART.md             # This file
```

---

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [React Router](https://reactrouter.com)
- [REST API Best Practices](https://restfulapi.net)

---

**Happy Testing! 🚀**

For detailed documentation, see `FEATURES.md`
