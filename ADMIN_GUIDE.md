# 📊 ADMIN PAGE GUIDE

> Complete guide to understanding and using the admin dashboard for managing resume submissions

---

# TABLE OF CONTENTS
1. [Admin Dashboard Overview](#admin-dashboard-overview)
2. [Demo Accounts (Pre-Built)](#demo-accounts)
3. [How to Login](#how-to-login)
4. [Dashboard Tabs & Features](#dashboard-tabs--features)
5. [Create Real Admin Accounts](#create-real-admin-account)
6. [Admin Features Explained](#admin-features-explained)
7. [Permissions & Security](#permissions--security)

---

# ADMIN DASHBOARD OVERVIEW

## What is the Admin Dashboard?

The **Admin Dashboard** is a control center where you (as an administrator) can:
- ✅ View all resume submissions
- ✅ See candidate analysis scores
- ✅ Track statistics and metrics
- ✅ Search & filter candidates
- ✅ View detailed feedback

**Access URL:** 
```
https://resume-shortlister-d2hp.vercel.app/login

(Then navigate to admin after login)
```

---

## Admin vs Regular Users

| Feature | Regular User | Admin |
|---------|--------------|-------|
| Upload resumes | ✅ Yes | ✅ Yes |
| View own analysis | ✅ Yes | ✅ Yes |
| See all submissions | ❌ No | ✅ Yes |
| View statistics | ❌ No | ✅ Yes |
| Search candidates | ❌ No | ✅ Yes |
| Download reports | ❌ No | ✅ Yes (in future) |

---

# DEMO ACCOUNTS

## What is a Demo Account?

**Demo accounts** are pre-built accounts for testing. They:
- ✅ Work immediately (no setup needed)
- ✅ Contain sample data
- ✅ Allow you to test admin features
- ✅ Don't require creating in database

Used for:
- Quick testing
- Portfolio demonstrations
- Showing functionality to clients
- Development/testing environment

---

## Demo Accounts Available

### **Demo Account #1 (Main Admin)**

```
Email:    deshmukhsanika278@gmail.com
Password: Sanu029@
Role:     Admin (Super Admin in system)
```

**This is the PRIMARY demo account** - Use this to test all features!

---

### **Demo Account #2 (Secondary Admin)**

```
Email:    admin@resume-shortlister.com
Password: admin123
Role:     Admin
```

**Backup demo account** - For testing multiple logins or if you need a second account

---

## How Demo Accounts Work

```javascript
// Located in backend/routes/auth.js
const fallbackUsers = [
  {
    email: "deshmukhsanika278@gmail.com",
    password: "Sanu029@",
    name: "Admin"
  },
  {
    email: "admin@resume-shortlister.com",
    password: "admin123",
    name: "Demo Admin"
  }
];
```

These are **hardcoded** (stored in code, not database) as a fallback when:
- MongoDB is down
- Authentication system fails
- Quick testing is needed

---

## When to Use Demo Accounts

✅ **USE FOR:**
- Quick testing (first time)
- Portfolio/demo videos
- Showing functionality
- Quick testing of features

❌ **DON'T USE FOR:**
- Real production data
- Permanent credentials
- Sharing with teams
- Real admin work

---

# HOW TO LOGIN

## Step 1: Go to Login Page

1. **Open your app:** https://resume-shortlister-d2hp.vercel.app
2. You'll see a **Welcome page** with navigation
3. Click **"Login"** button (or go to `/login`)

You'll see:

```
╔════════════════════════════════════════╗
║  Resume Shortlister Login              ║
║                                        ║
║  Email or Username                     ║
║  [deshmukhsanika278@gmail.com    ]    ║
║                                        ║
║  Password                              ║
║  [••••••••••••••••••••••         ]    ║
║                                        ║
║  ☑ Remember this device               ║
║                                        ║
║  [ Login ]  button                     ║
║  [ Sign Up ]  link                     ║
╚════════════════════════════════════════╝
```

---

## Step 2: Enter Demo Credentials

**Use one of the demo accounts:**

```
Email:    deshmukhsanika278@gmail.com
Password: Sanu029@
```

Or:

```
Email:    admin@resume-shortlister.com
Password: admin123
```

---

## Step 3: Click Login

Click **[ Login ]** button.

---

## Step 4: Redirected to Admin Dashboard

After successful login:

```
╔════════════════════════════════════════╗
║  📊 Admin Dashboard                    ║
║                                        ║
║  Welcome, Admin                        ║
║  [ Logout ] button                     ║
║                                        ║
║  TABS:                                 ║
║  [ Overview ] [ Submissions ] [...]    ║
║                                        ║
║  STATS:                                ║
║  Total: 100 | Average: 80 | ...       ║
╚════════════════════════════════════════╝
```

✅ **You're now in the Admin Dashboard!**

---

# DASHBOARD TABS & FEATURES

The admin dashboard has **3 main sections:**

---

## TAB 1: OVERVIEW

### What You See

```
┌─────────────────────────────────────────────┐
│  STATISTICS CARDS                           │
│                                             │
│  ┌──────────────┐  ┌──────────────┐       │
│  │ Total Subs   │  │ Average      │       │
│  │ 100          │  │ 80.5/100     │       │
│  └──────────────┘  └──────────────┘       │
│                                             │
│  ┌──────────────┐  ┌──────────────┐       │
│  │ Total        │  │ Highest      │       │
│  │ Candidates   │  │ Score        │       │
│  │ 100          │  │ 95           │       │
│  └──────────────┘  └──────────────┘       │
│                                             │
│  CHART (if available)                       │
│  Sample data visualization                 │
└─────────────────────────────────────────────┘
```

### Buttons on Overview Tab

**[Refresh Data]**
- Updates statistics
- Fetches latest submissions
- Clears cached data

---

## TAB 2: SUBMISSIONS

### What You See

**A table showing all submitted resumes:**

```
┌──────────────────────────────────────────────────────────┐
│  SEARCH & FILTER CONTROLS                                │
│                                                          │
│  Search: [John Doe             ]  [Clear]               │
│  Sort By: [Recent ▼]  [Highest Score ▼]  [Refresh]    │
│                                                          │
├────────────────────────────────────────────────────────┤
│ SUBMISSIONS TABLE                                        │
│                                                          │
│ # │ Candidate Name │ Score │ Skills │ Action            │
│───┼────────────────┼───────┼────────┼─────────────────│
│ 1 │ John Doe       │  85   │ 8/10   │ [View Details]  │
│ 2 │ Jane Smith     │  72   │ 6/10   │ [View Details]  │
│ 3 │ Mike Johnson   │  91   │ 9/10   │ [View Details]  │
│ 4 │ ...            │  ...  │ ...    │ ...             │
└────────────────────────────────────────────────────────┘
```

### Buttons & Controls on Submissions Tab

**[Search Box]**
- **What it does:** Filter candidates by name
- **Example:** Type "John" → Shows only John's submissions
- **Case-insensitive:** "john" = "JOHN" = "John"

**[Sort By Dropdown]** - Multiple options:

| Option | What It Does | Example |
|--------|-------------|---------|
| Recent | Newest first | Latest uploads appear at top |
| Oldest | Oldest first | Shows first submissions |
| Highest Score | 95 first | Best candidates first |
| Lowest Score | 40 first | Candidates needing work |

**[Clear]**
- Clears search box
- Shows all submissions

**[Refresh]**
- Fetches latest data
- Updates scores
- Refreshes timestamps

**[View Details]**
- Shows full submission details
- Displays feedback
- Shows missing skills
- Recommendations

---

## TAB 3: SAMPLE DATA TABLE (For Testing)

```
┌──────────────────────────────────────────────┐
│  DEMO DATA                                   │
│                                              │
│  This shows sample/fallback data when:       │
│  • MongoDB is not connected                  │
│  • No real submissions yet                   │
│  • Testing the dashboard                     │
│                                              │
│  Sample entries:                             │
│  1. John Doe - Score: 85                    │
│  2. Jane Smith - Score: 72                  │
│  3. Mike Johnson - Score: 91                │
└──────────────────────────────────────────────┘
```

---

# CREATE REAL ADMIN ACCOUNT

## Why Create Real Admin Accounts?

**Demo accounts are temporary.** For production:
- ✅ Create accounts for actual admins
- ✅ Unique passwords per person
- ✅ Track who accessed what
- ✅ Revoke access when needed
- ✅ Secure storage in database

---

## How to Create a New Admin Account

### **Method 1: Using MongoDB Directly**

**Step 1: Go to MongoDB Atlas**

1. Open: https://cloud.mongodb.com
2. Click Database → Browse Collections
3. Select your `resume-shortlister` database
4. Click Collections tab
5. Find `adminusers` collection

---

**Step 2: Insert a New Document**

Click **[ Insert Document ]**

Paste this JSON:

```json
{
  "name": "Your Name",
  "email": "youradmin@example.com",
  "password": "YOUR_PASSWORD_HASHED",
  "role": "admin",
  "active": true,
  "createdAt": new Date()
}
```

⚠️ **Problem:** Password is hashed! You can't just paste a password.

---

### **Method 2: Using an API Tool (Easier)**

**PowerShell Example:**

```powershell
# Register new admin (if endpoint exists)
$body = @{
  email = "neoadmin@example.com"
  password = "SecurePassword123!"
  name = "New Admin"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://resume-shortlister-1.onrender.com/api/auth/register" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

---

### **Method 3: Create via Backend (Recommended)**

Add a registration endpoint to `backend/routes/auth.js`:

```javascript
// POST /api/auth/register-admin
router.post("/register-admin", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existingUser = await AdminUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Create new admin user
    const newAdmin = new AdminUser({
      name,
      email,
      password,  // Automatically hashed by pre-save hook
      role: "admin",
      active: true
    });

    await newAdmin.save();

    res.json({
      message: "Admin account created successfully",
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Failed to create admin account" });
  }
});
```

---

## How Admin Passwords Are Stored

**Your password is HASHED (encrypted), not stored as plain text:**

```
User enters:   "MyPassword123!"
              ↓
           BCRYPT (encryption)
              ↓
Stored as:   "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/tvC"
              ↓ (when user logins, backend compares the hash)
```

This means:
- ✅ Even database admins can't see passwords
- ✅ Hackers can't read passwords if database is stolen
- ✅ More secure than plain text

---

## Password Requirements

For strong security, use:
- ✅ At least 8 characters
- ✅ Mix of uppercase & lowercase
- ✅ Numbers (0-9)
- ✅ Special characters (!@#$%^&*)

**Good password:** `MySecureAdmin@2024`
**Bad password:** `admin123`

---

# ADMIN FEATURES EXPLAINED

## Feature 1: VIEW SUBMISSIONS

### What It Shows

For each submitted resume:

```
┌─────────────────────────────────────────┐
│ SUBMISSION DETAILS                      │
│                                         │
│ Candidate Name:  John Doe               │
│ Score:           85/100                 │
│ Missing Skills:  Python, Docker         │
│ Feedback:        Strong technical bcg   │
│ Submitted Date:  Apr 3, 2024 10:30 AM  │
│                                         │
│ [ View Full Analysis ]                  │
│ [ Download Report ]  (future feature)   │
└─────────────────────────────────────────┘
```

### How to Use

1. Click **Submissions** tab
2. Find candidate in table
3. Click **[ View Details ]** button
4. See full analysis

---

## Feature 2: SEARCH & FILTER

### Search by Name

```
Search: [Jo]
        ↓
Results: John Doe, Joseph Smith
         (all candidates with "Jo")
```

### Filter by Score

Sort dropdown options:
- **Highest Score First** → Interview top candidates
- **Lowest Score First** → Identify candidates needing help

---

## Feature 3: STATISTICS

### What Stats Show

| Statistic | Meaning | Use Case |
|-----------|---------|----------|
| Total Submissions | How many resumes uploaded | Track volume |
| Average Score | Mean score of all candidates | See quality level |
| Highest Score | Best candidate score | Identify top talent |
| Total Candidates | Unique people submitted | Team size |

---

## Feature 4: SAMPLE DATA

### Why Sample Data Exists

When you first login:
- You see 3 demo submissions (John, Jane, Mike)
- These are **test data**
- Help you understand how the dashboard works
- Disappear when real submissions come in

### Demo Sample Data

```
Submission 1:
Name: John Doe
Score: 85
Missing: Python, Docker
Age: 3 days ago

Submission 2:
Name: Jane Smith
Score: 72
Missing: AWS, Kubernetes
Age: 6 days ago

Submission 3:
Name: Mike Johnson
Score: 91
Missing: Machine Learning
Age: 10 days ago
```

---

# PERMISSIONS & SECURITY

## Admin Roles

Your system supports **2 role types:**

| Role | Permissions | Creates | Can Delete |
|------|-------------|---------|-----------|
| admin | View submissions, stats, search | Demo data | No |
| super_admin | All admin perms | Real admin accounts | Yes |

Both demo accounts are currently **"admin"** role.

---

## Authentication Token

When you login:

```
Frontend sends:  email + password
                      ↓
Backend verifies password using BCRYPT
                      ↓
Backend generates JWT token (valid 7 days)
                      ↓ 
Token stored in browser localStorage
                      ↓
Token used for all future requests
```

**Token expires after 7 days** → Need to login again

---

## Session Management

**Logout button:**
```javascript
handleLogout = () => {
  localStorage.removeItem("authToken");      // Delete token
  localStorage.removeItem("adminName");      // Delete name
  navigate("/");                              // Go to home
}
```

After logout:
- ✅ All tokens deleted
- ✅ Can't access admin page
- ✅ Need to login again

---

## Security Best Practices

✅ **DO:**
- Use strong passwords (8+ chars, mix of types)
- Change demo password after first login
- Create unique accounts per admin
- Logout when done
- Never share login credentials

❌ **DON'T:**
- Use "admin123" or similar weak passwords
- Share admin account with multiple people
- Store passwords in browser bookmarks
- Leave admin page open unattended
- Use same password across systems

---

# TROUBLESHOOTING

## Login Doesn't Work

**Error: "Invalid email or password"**
```
Cause: Wrong credentials
Fix:   Check demo account credentials
       Email: deshmukhsanika278@gmail.com
       Password: Sanu029@
```

**Error: "No authentication token found"**
```
Cause: Session expired (7 days)
Fix:   Login again with your credentials
```

---

## Can't See Submissions

**Problem: Dashboard shows "0 submissions"**
```
Cause 1: No one has uploaded resumes yet
Fix:     Go to Upload page and submit a resume

Cause 2: MongoDB not connected
Fix:     Check Render backend logs
         Verify MONGODB_URI variable

Cause 3: API token invalid
Fix:     Logout and login again
```

---

## Dashboard Loads Slowly

**Problem: "Dashboard data loading..." takes forever**
```
Cause: Backend is sleeping (15 min inactivity)
Fix:   Wait 30-60 seconds for backend to wake up
       Then refresh dashboard
```

---

# FULL WORKFLOW EXAMPLE

## Scenario: Reviewing Job Applications

**Step 1: Login**
```
Go to: /login
Email: deshmukhsanika278@gmail.com
Password: Sanu029@
Click: [ Login ]
```

**Step 2: View Dashboard**
```
You see: 100 submissions, avg score 80.5
```

**Step 3: Find Top Candidates**
```
Click: Submissions tab
Sort By: Highest Score
See: Mike Johnson (91), Sarah Lee (88), John Doe (85)
```

**Step 4: Search Specific Candidate**
```
Search: [ Mike Johnson ]
Filter: Shows only Mike's submission
```

**Step 5: View Details**
```
Click: [ View Details ]
See: Score 91, Missing: Machine Learning
Feedback: "Excellent technical skills"
```

**Step 6: Make Decision**
```
✅ Interview Mike Johnson - Top candidate!
```

**Step 7: Logout**
```
Click: [ Logout ]
Redirected to home page
Session ends
```

---

# QUICK REFERENCE

## Demo Accounts

```
Account 1:
Email: deshmukhsanika278@gmail.com
Password: Sanu029@

Account 2:
Email: admin@resume-shortlister.com
Password: admin123
```

## Admin Dashboard URL
```
https://resume-shortlister-d2hp.vercel.app/login
(after login, redirects to dashboard)
```

## Admin Tabs

| Tab | Purpose | Shows |
|-----|---------|-------|
| Overview | Statistics | Stats cards & charts |
| Submissions | Candidate list | All submissions with filters |
| Sample Data | Test data | Demo entries (if no real data) |

## Key Buttons

| Button | What It Does |
|--------|-------------|
| [ Refresh ] | Update data from server |
| [ Search ] | Filter by candidate name |
| [ Sort By ] | Arrange by score/date |
| [ View Details ] | See full submission |
| [ Logout ] | Sign out & end session |

---

## What's the Difference?

| Feature | Demo Account | Real Admin Account |
|---------|--------------|-------------------|
| Purpose | Quick testing | Production use |
| Storage | Hardcoded | MongoDB database |
| Password | Plain text | Hashed (bcrypt) |
| Can delete | No | Yes (if super_admin) |
| Expiry | None | None* |
| Security | Low | High |

*Actually no expiry, but Login tokens expire after 7 days

---

**Questions about admin features? Let me know!** 🚀
