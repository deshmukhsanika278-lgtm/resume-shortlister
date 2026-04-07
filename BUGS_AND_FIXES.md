# 🐛 COMMON BUGS & HOW TO FIX THEM

> Complete guide to understanding and fixing issues with your deployed resume-shortlister app

---

# TABLE OF CONTENTS
1. [Backend Auto-Sleep (Render)](#1-backend-auto-sleep)
2. [Cold Starts](#2-cold-starts)
3. [File Upload Issues](#3-file-upload-issues)
4. [Database Connection Errors](#4-database-connection-errors)
5. [Memory/Performance Issues](#5-memory--performance-issues)
6. [CORS Errors](#6-cors-errors)
7. [Timeout Issues](#7-timeout-issues)
8. [Vercel Build Failures](#8-vercel-build-failures)
9. [Environment Variable Issues](#9-environment-variable-issues)
10. [PDF Processing Errors](#10-pdf-processing-errors)

---

# 1. BACKEND AUTO-SLEEP
## (Render Free Tier)

### 🔴 **The Problem:**

```
✓ Your backend is running fine
    ↓ (15 minutes of inactivity passes)
✗ Backend goes to sleep to save resources
    ↓ (user tries to use app)
⏳ First request takes 30-60 seconds to wake up
    ↓ (if timeout < 30 sec, request fails)
✗ "Server timeout" or "net::ERR_INTERNET_DISCONNECTED" error
```

**Why it happens:**
- Render free tier auto-hibernates services after 15 min of inactivity
- First "wake-up" request has to start the server (slow)
- Subsequent requests are fast

**When it occurs:**
- First use after 15+ minutes
- Late night (low traffic)
- Testing after long breaks

### ✅ **Solutions:**

#### **Solution 1: Keep-Alive Service (BEST)**

Create a simple service that "pings" your backend every 10 minutes:

**Create file:** `backend/keep-alive.js`

```javascript
const https = require("https");

const BACKEND_URL = process.env.RENDER_EXTERNAL_URL || "http://localhost:5000";
const INTERVAL = 10 * 60 * 1000; // Every 10 minutes

setInterval(() => {
  console.log("🔔 Keep-alive ping...");
  https.get(BACKEND_URL, (res) => {
    console.log(`✅ Pinged - Status: ${res.statusCode}`);
  }).on("error", (err) => {
    console.error("❌ Ping failed:", err.message);
  });
}, INTERVAL);

console.log("🕐 Keep-alive service started");
```

**Update `package.json` start script:**

```json
{
  "scripts": {
    "start": "node keep-alive.js & node server.js",
    "dev": "node server.js"
  }
}
```

This keeps your backend awake 24/7! ✅

---

#### **Solution 2: Wake Up Before Using**

Before using your app, make a test request to wake it:

**PowerShell command:**
```powershell
Invoke-WebRequest -Uri "https://resume-shortlister-1.onrender.com" -TimeoutSec 60
```

Wait for response, then use your app. ✅

---

#### **Solution 3: Use Paid Tier**

Upgrade to Render Starter ($7/month):
- No auto-sleep
- Better performance
- 2GB RAM

**Not needed for portfolio/testing, only for production.**

---

### 🔍 **How to Detect:**

**Browser Console Error:**
```
net::ERR_INTERNET_DISCONNECTED
or
Request timeout after 30 seconds
```

**Fix:** Wait 30-60 seconds, then refresh page. ✅

---

# 2. COLD STARTS

### 🔴 **The Problem:**

Your backend takes a long time to start (20-30 seconds) because:
- Node.js process is spun up
- Dependencies are loaded
- MongoDB connection established
- All happening in parallel

```
Time taken: 
5 sec  - Start Node process
10 sec - Load dependencies
15 sec - Connect to MongoDB
= 20-30 seconds total
```

### ✅ **Solutions:**

#### **Solution 1: Optimize Dependencies**

Remove unused packages from `package.json`:

**Check what you're using:**
```powershell
cd c:\Users\sanik\Desktop\resume-shortlister\backend
npm list --depth=0  # Shows all dependencies
```

Remove unused ones:
```powershell
npm uninstall unused-package-name
```

Smaller bundle = faster startup ✅

---

#### **Solution 2: Lazy Load Heavy Libraries**

Only require large libraries when needed:

**BAD (loads immediately):**
```javascript
const pdfParse = require("pdf-parse");  // 5MB, loaded at start

app.post("/api/suggestions/analyze-pdf", (req, res) => {
  // use pdfParse
});
```

**GOOD (loads on demand):**
```javascript
app.post("/api/suggestions/analyze-pdf", (req, res) => {
  const pdfParse = require("pdf-parse");  // Only loaded when needed
  // use pdfParse
});
```

This shaves off 3-5 seconds! ✅

---

#### **Solution 3: Use Render "Starter" Plan**

Paid tier has faster CPU/better performance.

Not necessary for your current traffic level.

---

### 🔍 **How to Detect:**

Check **Render logs:**
1. Go to Render dashboard
2. Click your service
3. Look at "Logs" tab
4. See startup times

---

# 3. FILE UPLOAD ISSUES

### 🔴 **The Problem:**

**Issue 1: "413 Payload Too Large"**
```
Error: File upload exceeds size limit
Cause: File > 10MB (your limit)
```

**Issue 2: "UnsupportedFileType"**
```
Error: Only PDF files allowed
Cause: User uploaded non-PDF file
```

**Issue 3: "Can't read file system"**
```
Error: /uploads/ directory doesn't exist
Cause: Render uses ephemeral storage (deleted on restart)
```

### ✅ **Solutions:**

#### **Solution 1: Fix File Storage**

On Render, `/uploads/` folder is deleted on restart. Use `/tmp/` instead:

**Update `backend/routes/suggestions.js`:**

```javascript
// OLD (doesn't work on Render)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");  // ❌ Gets deleted on Render
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// NEW (works on Render)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.NODE_ENV === "production" ? "/tmp" : "uploads/";
    cb(null, uploadDir);  // ✅ /tmp persists during request
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
```

**In your backend `.env` file add:**
```
NODE_ENV=production
```

---

#### **Solution 2: Increase File Size Limit**

If users want to upload >10MB files:

```javascript
const upload = multer({
  storage: multer.memoryStorage(),  // Load into memory instead
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});
```

⚠️ **Warning:** Large files in memory can cause crashes. Keep it reasonable (20MB max).

---

#### **Solution 3: Better Error Messages**

Help users understand what went wrong:

```javascript
router.post("/analyze-pdf", (req, res) => {
  upload(req, res, (err) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "File too large (max 10MB)" });
    }
    if (err.message.includes("Only PDF")) {
      return res.status(400).json({ error: "Only PDF files allowed" });
    }
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Process file
  });
});
```

---

### 🔍 **How to Detect:**

**Browser Console Shows:**
```
413 - Payload Too Large
400 - Bad Request + "Only PDF files allowed"
500 - Something went wrong (check backend logs)
```

---

# 4. DATABASE CONNECTION ERRORS

### 🔴 **The Problem:**

**Error 1: "ECONNREFUSED"**
```
Error: connect ECONNREFUSED ::1:27017
Cause: MongoDB URI pointing to localhost instead of MongoDB Atlas
```

**Error 2: "Authentication failed"**
```
Error: authentication failed
Cause: Wrong MongoDB password in MONGODB_URI
```

**Error 3: "MongoNetworkError"**
```
Error: connection timeout
Cause: MongoDB Atlas IP whitelist doesn't include Render's IP
```

### ✅ **Solutions:**

#### **Solution 1: Verify MongoDB URI**

Check your Render environment variable:

1. Go to Render dashboard
2. Click your service
3. Go to "Variables" tab
4. Check `MONGODB_URI` - should look like:

```
mongodb+srv://resumeuser:PASSWORD@cluster0.mongodb.net/resume-shortlister?retryWrites=true&w=majority
```

**WRONG versions:**
```
❌ mongodb://localhost:27017  (local MongoDB)
❌ mongodb+srv://resumeuser@cluster0...  (missing password)
❌ mongodb+srv://:PASSWORD@cluster0...  (missing username)
```

---

#### **Solution 2: Fix Authentication**

If password has special characters, it needs URL encoding:

**Example password:** `hc5TyKXM@Xw-YP`

**URL encoded:** `hc5TyKXM%40Xw-YP` (@ becomes %40)

Use this tool: https://www.urlencoder.org/

---

#### **Solution 3: Whitelist Render's IP**

Render's IPs change, so whitelist all:

1. Go to MongoDB Atlas
2. Network Access (left menu)
3. Edit the IP whitelist rule
4. Set to: `0.0.0.0/0` (allow all IPs)

⚠️ This is less secure but necessary for cloud services.

---

#### **Solution 4: Test Connection**

Add logging to see connection status:

**In `backend/config/db.js`:**

```javascript
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    console.log("MONGODB_URI:", process.env.MONGODB_URI?.substring(0, 50) + "...");
    // Continue without DB (fallback)
  }
};
```

Check Render logs for the connection message.

---

### 🔍 **How to Detect:**

**Render Logs Show:**
```
❌ MongoDB Error: connect ECONNREFUSED
or
❌ MongoDB Error: authentication failed
or
⚠️ Running without database - using in-memory storage
```

---

# 5. MEMORY / PERFORMANCE ISSUES

### 🔴 **The Problem:**

**Issue 1: "JavaScript heap out of memory"**
```
Error: FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed
Cause: Processing too many large files at once
Reason: Render free tier = 512MB RAM
```

**Issue 2: "Service crashed"**
```
Status: Crashed - 137
Cause: Out of memory (OOMKilled)
```

**Issue 3: "Slow responses"**
```
Requests taking 30+ seconds
Cause: Running out of available memory
```

### ✅ **Solutions:**

#### **Solution 1: Reduce Memory Usage**

Process PDFs in streams instead of loading whole file:

**BAD (loads entire file into memory):**
```javascript
const fileBuffer = req.file.buffer;  // Entire file in RAM
const pdfData = await pdfParse(fileBuffer);  // ❌ Memory spike
```

**GOOD (streams the data):**
```javascript
const pdfData = await pdfParse(req.file.buffer, {
  max: 0,  // Load only needed pages
  version: "v2"
});
```

---

#### **Solution 2: Limit Concurrent Requests**

Use a queue to process one file at a time:

**Install package:**
```powershell
npm install p-queue
```

**Use it:**
```javascript
const PQueue = require("p-queue").default;
const queue = new PQueue({ concurrency: 1 });

router.post("/analyze-pdf", (req, res) => {
  queue.add(async () => {
    // Process one file at a time
    const result = await processPDF(req.file);
    res.json(result);
  });
});
```

This prevents memory spikes! ✅

---

#### **Solution 3: Clean Up Temp Files**

Delete uploaded files after processing to free memory:

```javascript
const fs = require("fs");
const path = require("path");

const result = await processFile(req.file);

// Delete file after processing
if (req.file.path) {
  fs.unlink(req.file.path, (err) => {
    if (err) console.error("Cleanup error:", err);
  });
}
```

---

#### **Solution 4: Upgrade to Paid Tier**

Render Starter = 2GB RAM (4x more)

Current limit:
- Free: 512MB
- Starter: 2GB
- Standard: 4GB

Only upgrade if hitting limits consistently.

---

### 🔍 **How to Detect:**

**Render Logs Show:**
```
❌ FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed
❌ FATAL ERROR: JavaScript heap out of memory
or
Service Status: Crashed
```

---

# 6. CORS ERRORS

### 🔴 **The Problem:**

```
Error: "No 'Access-Control-Allow-Origin' header"
Cause: Frontend and backend not properly configured for each other
```

**Happens when:**
- `FRONTEND_URL` on Render is wrong/missing
- Frontend URL changed (migrated to new domain)
- Browser makes request from different origin

### ✅ **Solutions:**

#### **Solution 1: Verify CORS Configuration**

**On Render, check:**
1. Backend Variables
2. `FRONTEND_URL` should be: `https://resume-shortlister-d2hp.vercel.app`
   (WITHOUT `/api` at the end)

**Your backend code checks this:**
```javascript
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  ...
  process.env.FRONTEND_URL || ""
];

app.use(cors({ origin: allowedOrigins }));
```

---

#### **Solution 2: Update After Domain Change**

If you change your frontend domain:

1. Get new frontend URL
2. Go to Render dashboard
3. Update `FRONTEND_URL` variable
4. Render auto-redeploys ✅

---

#### **Solution 3: Allow Multiple Domains**

If you want to support multiple frontends:

**Update `backend/server.js`:**

```javascript
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://resume-shortlister-d2hp.vercel.app",
  "https://yourdomain.com",  // Add more here
  process.env.FRONTEND_URL || ""
].filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
```

---

### 🔍 **How to Detect:**

**Browser Console Shows:**
```
XMLHttpRequest blocked by CORS policy
No 'Access-Control-Allow-Origin' header
```

---

# 7. TIMEOUT ISSUES

### 🔴 **The Problem:**

**Error: "Request timeout"**
```
Cause: Backend taking > 30 seconds to respond
Example: Large PDF processing takes 45 seconds
```

**Why it happens:**
- Analyze PDF endpoint processing takes time
- MongoDB query is slow
- Backend was sleeping (waking up takes 30 sec)

### ✅ **Solutions:**

#### **Solution 1: Increase Timeout**

**In frontend (`src/config/api.js` or axios config):**

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 60000,  // 60 seconds (default is 30 seconds)
});

export default api;
```

---

#### **Solution 2: Optimize Processing**

Make PDF analysis faster:

```javascript
// Use limited page processing for large PDFs
const pdfData = await pdfParse(fileBuffer, {
  max: 10,  // Only process first 10 pages
});
```

---

#### **Solution 3: Show Loading State**

Let users know the app is working:

```jsx
const [analyzing, setAnalyzing] = useState(false);
const [progress, setProgress] = useState("Analyzing...");

const handleAnalyze = async () => {
  setAnalyzing(true);
  setProgress("Extracting PDF...");
  
  try {
    const response = await api.post("/suggestions/analyze-pdf", formData);
    // success
  } finally {
    setAnalyzing(false);
  }
};

return (
  <>
    <button disabled={analyzing}>
      {analyzing ? `⏳ ${progress}` : "Analyze Resume"}
    </button>
  </>
);
```

---

#### **Solution 4: Server-Side Timeout Increase**

**In `backend/server.js`:**

```javascript
const express = require("express");
const app = express();

// Increase timeout for long operations
app.use((req, res, next) => {
  res.setTimeout(120000, () => {  // 120 seconds
    res.status(408).json({ error: "Request timeout" });
  });
  next();
});
```

---

### 🔍 **How to Detect:**

**Browser Shows:**
```
Request timeout after 30 seconds
or
net::ERR_INCOMPLETE_CHUNKED_ENCODING
```

---

# 8. VERCEL BUILD FAILURES

### 🔴 **The Problem:**

**Error: "Build failed"**
```
Vercel failed to build your frontend
Deploy shows red ❌
```

**Common causes:**
- Build command failed
- Dependencies not installed
- Environment variables missing
- Code errors (TypeScript/Syntax)

### ✅ **Solutions:**

#### **Solution 1: Check Build Logs**

1. Go to Vercel dashboard
2. Click your project
3. Click "Deployments"
4. Click the failed deployment
5. See error message

Most common:
```
❌ ENOENT: no such file or directory
Cause: Frontend root directory not set to "frontend"

❌ Cannot find module '@vitejs/plugin-react'
Cause: npm install didn't run
```

---

#### **Solution 2: Verify Project Settings**

On Vercel:
1. Settings → General
2. **Root Directory:** Should be `frontend`
3. **Framework:** Should be `Vite`
4. **Build Command:** Should be `npm run build`
5. **Output Directory:** Should be `dist`

---

#### **Solution 3: Fix Environment Variables**

**Add if missing:**
1. Settings → Environment Variables
2. Add `VITE_API_BASE_URL`
3. Value: `https://resume-shortlister-1.onrender.com/api`

---

#### **Solution 4: Test Build Locally**

Before pushing to GitHub:

```powershell
cd c:\Users\sanik\Desktop\resume-shortlister\frontend
npm install
npm run build
```

If it works locally, it will work on Vercel. ✅

---

### 🔍 **How to Detect:**

**Vercel Dashboard Shows:**
```
❌ Failed - View logs for details
or
Deployment status: Error
```

---

# 9. ENVIRONMENT VARIABLE ISSUES

### 🔴 **The Problem:**

**Frontend can't connect to backend:**
```
Cause: VITE_API_BASE_URL not set or wrong value
Frontend uses: http://localhost:5000/api (local default)
But backend is at: https://resume-shortlister-1.onrender.com/api
```

### ✅ **Solutions:**

#### **Solution 1: Verify Variables on Vercel**

1. Vercel dashboard → Project → Settings
2. Environment Variables
3. Check `VITE_API_BASE_URL`
4. Must be: `https://resume-shortlister-1.onrender.com/api`

---

#### **Solution 2: Check Backend Variables on Render**

1. Render dashboard
2. Your backend service
3. Variables tab
4. Check all 4 are set:
   - `MONGODB_URI` ✅ (full connection string)
   - `JWT_SECRET` ✅ (random string)
   - `FRONTEND_URL` ✅ (your Vercel frontend URL)
   - `PORT` ✅ (should be 10000 or auto-assigned)

---

#### **Solution 3: Local Testing**

**Create `frontend/.env.local`:**
```
VITE_API_BASE_URL=https://resume-shortlister-1.onrender.com/api
```

Test locally:
```powershell
cd frontend
npm run dev
```

Visit `http://localhost:5173` and test.

---

#### **Solution 4: After Changing Variables**

1. Update variable on Render/Vercel
2. **Wait for redeploy** (2-3 minutes)
3. **Hard refresh browser** (Ctrl+Shift+R)
4. Clear browser cache if still issues

---

### 🔍 **How to Detect:**

**Check browser console (F12):**
```
POST http://localhost:5000/api/suggestions/analyze-pdf 404
↑ Using local URL instead of Render URL
```

---

# 10. PDF PROCESSING ERRORS

### 🔴 **The Problem:**

**Error: "Can't read PDF"**
```
Error: Failed to extract text from PDF
Cause: PDF is corrupted or uses special encoding
```

**Error: "Text extraction failed"**
```
Error: could not extract text from PDF
Cause: PDF is image-only (scanned document)
Reason: Your app doesn't use OCR
```

### ✅ **Solutions:**

#### **Solution 1: Better Error Messages**

Tell user what's wrong:

```javascript
try {
  const pdfData = await pdfParse(fileBuffer);
  if (!pdfData.text || pdfData.text.trim().length === 0) {
    return res.status(400).json({
      error: "PDF doesn't contain extractable text. Try a different PDF or check it's not a scanned image."
    });
  }
} catch (error) {
  return res.status(400).json({
    error: `PDF processing failed: ${error.message}`
  });
}
```

---

#### **Solution 2: Support Scanned PDFs (Optional)**

Currently, your app only supports **text PDFs**. 

To support **scanned PDFs** (image-based):
- Use OCR (Optical Character Recognition)
- You already have `tesseract.js` in dependencies!
- But it's slower and more CPU intensive

**Implementation:**
```javascript
const Tesseract = require("tesseract.js");

// If text extraction fails, try OCR
if (!pdfData.text) {
  const result = await Tesseract.recognize(imageBuffer, "eng");
  const text = result.data.text;
}
```

⚠️ This is slow and might timeout on free tier.

---

#### **Solution 3: File Size Check**

Reject PDFs that are too large to process:

```javascript
if (req.file.size > 10 * 1024 * 1024) {
  return res.status(413).json({
    error: "PDF too large (max 10MB)"
  });
}
```

---

#### **Solution 4: User Instructions**

Help users pick correct PDFs:

```
✅ Works best with:
- Text-based PDFs (created from Word/Google Docs)
- PDFs < 10MB
- Resumes in English

❌ Doesn't work well with:
- Scanned/image-based PDFs
- PDFs with complex formatting
- Very long documents (100+ pages)
```

---

# 📊 QUICK REFERENCE TABLE

| Issue | Error Message | Quick Fix |
|-------|---------------|-----------|
| Backend sleeping | `net::ERR_INTERNET_DISCONNECTED` | Wait 30 sec, refresh |
| Wrong API URL | `404 /suggestions/analyze-pdf` | Add `/api` to VITE_API_BASE_URL |
| CORS blocked | `No 'Access-Control-Allow-Origin'` | Update FRONTEND_URL on Render |
| No database | `Running without database` | Check MONGODB_URI on Render |
| Large file | `413 Payload Too Large` | Use file < 10MB |
| Slow response | `Request timeout` | Wait (processing takes time) or increase timeout |
| Build failed | `❌ Failed` | Check Vercel build logs |
| Bad PDF | `Can't extract text` | Use text-based PDF, not scanned image |

---

# 🚨 EMERGENCY DEBUGGING

### **Backend is Down:**

```powershell
# Wake it up
Invoke-WebRequest -Uri "https://resume-shortlister-1.onrender.com" -TimeoutSec 60

# Wait 30 seconds
# Try again
```

### **App Shows Errors:**

```
1. Press F12 (open console)
2. See the error message
3. Search for the error in this guide
4. Follow the solution
```

### **Variable Changed, Not Working:**

```
1. Update variable on Render/Vercel
2. Click "Save"
3. Wait 2-3 minutes for redeploy
4. Hard refresh browser (Ctrl+Shift+R)
5. Clear browser cache (F12 → Application → Clear Storage)
6. Try again
```

### **Still Not Working:**

```
1. Check Render logs (Backend issue)
2. Check Vercel logs (Frontend issue)
3. Check browser console (F12)
4. Copy exact error message
5. Search error on Google
```

---

# 💡 PREVENTION TIPS

✅ **Monitor your deployments:**
- Vercel dashboard - check for failed deployments
- Render dashboard - check logs regularly
- Browser console - watch for errors

✅ **Keep things updated:**
- Push code to GitHub regularly
- Test locally before deploying
- Don't change environment variables without testing

✅ **Use logging:**
- Add console.log in critical functions
- Check logs on Render/Vercel dashboards
- Helps diagnose issues faster

✅ **Test thoroughly:**
- Upload different file types
- Try edge cases (very large files, special characters)
- Test on mobile browsers too
- Use network throttling (F12 → Network → "Slow 3G")

---

## 🎯 Most Common Issue: Backend Auto-Sleep

**Prevention:** Use the keep-alive service (Solution 1 in section 1)

**Quick fix:** Run the wake-up command before using the app

**Upgrade option:** Pay $7/month for Render Starter (no sleep)

---

**Questions about any of these issues? Let me know!** 🚀
