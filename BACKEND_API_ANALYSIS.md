# Backend API Analysis

## Overview
The backend consists of three main route modules (suggestions, auth, admin) with middleware for authentication and file uploads. The server configures Express with JSON/URL parsing (10mb limit) and CORS for dev ports 5173-5176.

---

## 1. SUGGESTIONS ROUTES (`/api/suggestions`)

### POST `/api/suggestions` - Generate suggestions from text input
**Purpose:** Analyze resume text against job description and generate matching score/feedback

**Request Body:**
```json
{
  "resumeText": "string (required)",
  "jobDescription": "string (required)",
  "candidateName": "string (optional, defaults to 'Anonymous')"
}
```

**Validations:**
- ✅ `resumeText` must be provided → 400 error if missing
- ✅ `jobDescription` must be provided → 400 error if missing
- No length limits enforced in route (but service processes them)

**Response (Success):**
```json
{
  "success": true,
  "score": 0-100,
  "missingSkills": [],
  "weakSections": [],
  "formattingTips": [],
  "verdict": "string"
}
```

**Response (Errors):**
- 400: "Missing resumeText or jobDescription"
- 500: "Failed to generate suggestions"

**Side Effect:** Stores submission to MongoDB or in-memory array

---

### POST `/api/suggestions/analyze-pdf` - Generate suggestions from PDF upload
**Purpose:** Parse PDF file and analyze resume against job description

**Request Format:** `multipart/form-data`
```
Form Fields:
- resume: FILE (required, PDF only)
- jobDescription: string (required)
- candidateName: string (optional)
```

**Validations:**
- ✅ File MIME type must be `application/pdf` → 400 "Only PDF files are allowed" if wrong
- ✅ File must be provided → 400 "No PDF file uploaded"
- ✅ `jobDescription` must be provided → 400 "Missing jobDescription"
- ✅ PDF must be valid and extract text → 400 "Failed to parse PDF. Please ensure it's a valid PDF file."
- ✅ Extracted text must not be empty → 400 "Could not extract text from PDF. Use a text-based PDF."

**Response (Success):**
```json
{
  "success": true,
  "score": 0-100,
  "missingSkills": [],
  "weakSections": [],
  "formattingTips": [],
  "verdict": "string"
}
```

**Response (Errors):**
- 400: File-related errors (see validations above)
- 500: "Failed to analyze resume"

**Side Effect:** Stores submission to database

**⚠️ POTENTIAL ISSUES:**
- File upload uses `multer.memoryStorage()` (not disk) - large PDFs could cause memory issues
- PDF parsing could fail on image-based PDFs → 400 error returned correctly
- No file size limits set in multer configuration (inherits from express.json 10mb limit)

---

### POST `/api/suggestions/download` - Generate PDF feedback report
**Purpose:** Create downloadable PDF report with suggestions

**Request Body:**
```json
{
  "resumeText": "string (required)",
  "jobDescription": "string (required)",
  "candidateName": "string (optional)"
}
```

**Validations:**
- ❌ **NO REQUEST BODY VALIDATION** (unlike other endpoints)
- Service doesn't check field presence either
- Missing fields would pass through to suggestion service

**Response:**
- Success: PDF file as attachment (Content-Type: application/pdf)
- 500: "Failed to generate PDF"

**⚠️ CRITICAL ISSUE:**
- If `resumeText` or `jobDescription` are missing/null, the suggestion service will still be called
- This could cause unexpected behavior or 500 error instead of 400
- Should validate required fields before processing

---

## 2. AUTH ROUTES (`/api/auth`)

### POST `/api/auth/login` - Authenticate admin user
**Purpose:** Log in admin and return JWT token

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Validations:**
- ✅ `email` must be provided → 400 "Email and password are required"
- ✅ `password` must be provided → 400 "Email and password are required"
- Supports both MongoDB users and fallback in-memory users
- Password comparison uses bcrypt for DB users, plain text for fallback demo users

**Response (Success):**
```json
{
  "token": "JWT token string",
  "name": "string",
  "email": "string",
  "message": "Login successful" or "Login successful (demo mode)"
}
```

**Response (Errors):**
- 400: "Email and password are required"
- 401: "Invalid email or password"
- 500: "Login failed"

**⚠️ SECURITY ISSUE:**
- Fallback users have hardcoded credentials in source code
- Password checked as plain text in fallback mode, but bcrypt in DB mode
- Consider removing hardcoded credentials from production

---

## 3. ADMIN ROUTES (`/api/admin`) - Requires JWT Authentication

### GET `/api/admin/submissions` - Retrieve all resume submissions
**Purpose:** Get list of all analyzed resumes (admin dashboard)

**Authentication:** Required
- Header: `Authorization: Bearer <token>`

**Response (Success):**
```json
[
  {
    "id": "mongo ObjectId",
    "candidateName": "string",
    "score": 0-100,
    "missingSkills": ["array"],
    "weakSections": ["array"],
    "formattingTips": ["array"],
    "verdict": "string",
    "feedback": "string",
    "timestamp": "ISO date",
    "fileType": "txt|pdf"
  }
]
```

**Response (Errors):**
- 401: "Unauthorized" (no token in header)
- 401: "Invalid token" (token verification fails)
- 500: "Failed to fetch submissions"

**Fallback Behavior:** If MongoDB unavailable, returns in-memory array (max 100 from DB)

---

### GET `/api/admin/stats` - Retrieve dashboard statistics
**Purpose:** Get analytics about all submissions

**Authentication:** Required
- Header: `Authorization: Bearer <token>`

**Response (Success):**
```json
{
  "totalSubmissions": number,
  "avgScore": number (0-100, rounded),
  "totalCandidates": number,
  "highPerformers": number (score >= 75)
}
```

**Response (Errors):**
- 401: "Unauthorized" (no token)
- 401: "Invalid token"
- 500: "Failed to fetch stats"

---

### POST `/api/admin/submissions` - Manually record a submission
**Purpose:** Create new submission record (admin can manually add)

**Authentication:** Required
- Header: `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "candidateName": "string (required)",
  "score": number (0-100, required)",
  "missingSkills": ["array of strings"],
  "feedback": "string",
  "jobDescription": "string",
  "resumeText": "string",
  "fileType": "string ('txt' or 'pdf', defaults to 'txt')"
}
```

**Validations:**
- ✅ JWT token required
- ❌ **NO FIELD VALIDATION** in route (all fields optional at HTTP level)
- Model will enforce `candidateName` and `score` are required at DB level

**Response (Success):**
```json
{
  "message": "Submission recorded",
  "submission": { /* stored object */ }
}
```

**Response (Errors):**
- 401: "Unauthorized"
- 401: "Invalid token"
- 500: "Failed to record submission"

**⚠️ POTENTIAL ISSUE:**
- If MongoDB is unavailable, falls back to in-memory array
- Fallback doesn't validate required fields at route level (would silently store invalid data)
- Missing `score` or `candidateName` in DB mode would fail at model validation

---

## 4. REQUEST PARSING MIDDLEWARE

**Server Configuration:** [server.js](backend/server.js)
```javascript
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
```

**⚠️ POTENTIAL ISSUES WITH REQUEST PARSING:**
- JSON limit is 10mb - requests over this will be rejected with implicit 413 error
- No explicit error handlers for parsing failures → generic 500 errors
- No explicit error handler for malformed JSON
- Could result in unclear error messages to client

---

## PDF Service Issues

**File:** [services/pdfService.js](backend/services/pdfService.js)

**⚠️ CRITICAL MISMATCH:**
The PDF generation expects different field names than what the suggestion service returns:

**Expected by pdfService:**
```javascript
suggestions.ats_score          // but service returns: score
suggestions.ats_explanation    // not provided by service
suggestions.missing_skills     // but service returns: missingSkills (camelCase)
suggestions.weak_sections      // but service returns: weakSections (camelCase)
suggestions.formatting_tips    // but service returns: formattingTips (camelCase)
suggestions.overall_verdict    // but service returns: verdict
```

**Impact:**
- PDF generation will fail or produce empty/undefined values in the report
- This causes the `/api/suggestions/download` endpoint to produce broken PDFs

---

## 5. COMMON 400 ERROR CAUSES

| Endpoint | Cause | Prevention |
|----------|-------|-----------|
| `/suggestions` | Missing `resumeText` or `jobDescription` | Validate both fields present |
| `/analyze-pdf` | Non-PDF file uploaded | Check MIME type (already validated) |
| `/analyze-pdf` | No PDF file provided | Multer enforces this |
| `/analyze-pdf` | Missing `jobDescription` | Validate presence |
| `/analyze-pdf` | Invalid/image PDF | Try to extract text and validate non-empty |
| `/download` | **None - no validation!** | Should validate `resumeText` and `jobDescription` |
| `/login` | Missing `email` or `password` | Validate both fields present |
| Any request | JSON parsing failure | Ensure valid JSON in POST body |
| Any request | Request body > 10mb | Reduce payload size |
| Authenticated routes | Missing/invalid JWT token | Include `Authorization: Bearer <token>` header |

---

## Summary of Issues Found

### 🔴 Critical Issues:
1. **PDF service field name mismatch** - Breaks `/download` endpoint
2. **No validation in `/download` endpoint** - Will fail silently or crash
3. **Hardcoded credentials** in auth fallback (demo users exposed)

### 🟡 Minor Issues:
1. **No JSON parsing error handler** - Generic 500 errors
2. **No file size validation in multer** - Could cause 413 errors
3. **POST `/admin/submissions` missing field validation** - Allows invalid data in fallback mode

### ✅ Well-Handled:
- PDF MIME type validation
- JWT token verification
- Required field validation for login
- Database fallback mechanisms
