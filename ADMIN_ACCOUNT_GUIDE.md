# 👤 HOW TO ADD A NEW ADMIN ACCOUNT

## Quick Overview

There are **3 ways** to add a new admin:

1. **Demo Admin** - Quick testing (no database)
2. **MongoDB Admin** - Production accounts (recommended)
3. **Direct MongoDB** - Advanced (complicated)

---

## ✨ OPTION 1: Demo Admin (Quick & Easy)

Use this for **quick testing only** - doesn't require database.

### Steps:

**1. Edit backend/routes/auth.js**

Find this section:
```javascript
const fallbackUsers = [
  {
    id: 1,
    email: "deshmukhsanika278@gmail.com",
    password: "Sanu029@",
    name: "Admin"
  },
  {
    id: 2,
    email: "admin@resume-shortlister.com",
    password: "admin123",
    name: "Demo Admin"
  }
  // ADD HERE ↓
];
```

**2. Add your new admin:**

```javascript
const fallbackUsers = [
  {
    id: 1,
    email: "deshmukhsanika278@gmail.com",
    password: "Sanu029@",
    name: "Admin"
  },
  {
    id: 2,
    email: "admin@resume-shortlister.com",
    password: "admin123",
    name: "Demo Admin"
  },
  {
    id: 3,
    email: "newadmin@example.com",
    password: "MyPassword123!",
    name: "Your Name Here"
  }
];
```

**3. Save file and restart backend**

**4. Login:**
```
Email: newadmin@example.com
Password: MyPassword123!
```

### ⚠️ Important:
- ❌ Passwords visible in code (not secure)
- ❌ Resets when server restarts
- ❌ Only for testing
- ✅ Use for quick demos only

---

## ⭐ OPTION 2: MongoDB Admin (Recommended for Production)

This creates **permanent, secure** admin accounts in the database.

### How It Works:

```
You send:     Email, Password, Name
              ↓
Backend API:  Hashes password with BCRYPT
              ↓
Storage:      Encrypted password in MongoDB
              ↓
Login:        System verifies hashed password
```

### Three Ways to Register:

### **Method A: Using PowerShell (Recommended)**

Best for adding **one admin** quickly.

**1. Open PowerShell**

**2. Run this command:**

```powershell
$body = @{
  name = "John Manager"
  email = "john@example.com"
  password = "SecurePass123!"
} | ConvertTo-Json

$response = Invoke-WebRequest `
  -Uri "https://resume-shortlister-1.onrender.com/api/auth/register-admin" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"

Write-Output $response.Content
```

**3. You'll get this response:**

```json
{
  "message": "Admin account created successfully",
  "admin": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Manager",
    "email": "john@example.com",
    "role": "admin",
    "createdAt": "2026-04-07T10:00:00.000Z"
  }
}
```

**4. Login with:**
```
Email: john@example.com
Password: SecurePass123!
```

---

### **Method B: Using curl (Linux/Mac)**

For **Linux, Mac, or WSL** users:

```bash
curl -X POST "https://resume-shortlister-1.onrender.com/api/auth/register-admin" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Manager",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

---

### **Method C: Using Frontend Dashboard (Future)**

We can create an **Admin Management page** where admins can add other admins without PowerShell.

Features would include:
- ✅ Create new admin accounts
- ✅ List all admins
- ✅ Disable/enable accounts
- ✅ Delete admins
- ✅ Change passwords

**Want this feature?** Ask and I'll build it!

---

## 🔑 Password Requirements

**Minimum:** 8 characters  
**Recommended:** Include:
- ✅ Uppercase letters: A-Z
- ✅ Lowercase letters: a-z
- ✅ Numbers: 0-9
- ✅ Special characters: !@#$%^&*

### Good Examples:
```
SecurePass123!
Manager@2026
Admin#NewPassword
MyApp2026!Secure
```

### Bad Examples:
```
12345678        ❌ Only numbers
password        ❌ Only lowercase
ADMIN123        ❌ Missing lowercase
Pass123         ❌ Less than 8 characters
```

---

## 🛡️ Security Best Practices

### ✅ DO:
- ✅ Use strong, unique passwords for each admin
- ✅ Change default demo passwords after setup
- ✅ Use production MongoDB for real admins
- ✅ Keep email updated for password recovery
- ✅ Logout when done
- ✅ Never share passwords

### ❌ DON'T:
- ❌ Use same password for multiple accounts
- ❌ Share admin credentials
- ❌ Leave fallback demo users in production
- ❌ Hardcode passwords in code
- ❌ Use simple passwords like "admin123"
- ❌ Leave sessions open

---

## 📊 Database Schema

Admins are stored in MongoDB:

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed with BCRYPT),
  role: String (enum: "admin", "super_admin"),
  active: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Example in Database:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Manager",
  "email": "john@example.com",
  "password": "$2a$10$N9qo8uLOickxz1jsJoSH.O7E9lPFKPZZQ4C09K8/cKc6.Jw7eN23W",
  "role": "admin",
  "active": true,
  "createdAt": "2026-04-07T10:00:00.000Z",
  "updatedAt": "2026-04-07T10:00:00.000Z"
}
```

**Note:** Password is **hashed** - original password never stored!

---

## 🔄 Workflow: Adding Multiple Admins

If you need to add **team of admins**:

**1. Create a PowerShell script** (`add-admins.ps1`):

```powershell
$admins = @(
  @{ name = "John Manager"; email = "john@company.com"; password = "John#Pass2026" },
  @{ name = "Sarah Lead"; email = "sarah@company.com"; password = "Sarah#Pass2026" },
  @{ name = "Mike Developer"; email = "mike@company.com"; password = "Mike#Pass2026" }
)

foreach ($admin in $admins) {
  $body = $admin | ConvertTo-Json
  
  Write-Host "Creating admin: $($admin.name)..."
  
  $response = Invoke-WebRequest `
    -Uri "https://resume-shortlister-1.onrender.com/api/auth/register-admin" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
  
  Write-Host "✅ Created: $($admin.email)" -ForegroundColor Green
  Start-Sleep -Seconds 2
}

Write-Host "`n✅ All admins created!" -ForegroundColor Green
```

**2. Run it:**
```powershell
.\add-admins.ps1
```

---

## ⚠️ Troubleshooting

### "Admin with this email already exists"
```
❌ Problem: You tried to register the same email twice

✅ Solution: Use a different email address
```

### "Password must be at least 8 characters"
```
❌ Problem: Password too short

✅ Solution: Use password with 8+ characters
  Example: MyPassword2026!
```

### "Failed to create admin account"
```
❌ Problem: MongoDB connection issue or server error

✅ Solutions:
  1. Check backend is running (Render dashboard)
  2. Verify MONGODB_URI environment variable
  3. Check MongoDB Atlas allows your IP
  4. Restart backend on Render
```

### "Invalid email or password" (during login)
```
❌ Problem: Wrong credentials

✅ Solutions:
  1. Check email spelling
  2. Verify password (case-sensitive)
  3. Make sure account was created successfully
  4. Check if account is active: true in database
```

---

## 📋 Checklist: Setting Up New Admin

- [ ] Decide: Demo or MongoDB admin?
- [ ] Prepare: Name, Email, Strong Password
- [ ] Register: Use PowerShell/curl command
- [ ] Verify: Check response shows success
- [ ] Test: Login with new credentials
- [ ] Confirm: Can see admin dashboard
- [ ] Document: Write down credentials (keep safe)
- [ ] Complete: Done!

---

## 🔗 Related Files

- **Backend Routes:** [`backend/routes/auth.js`](backend/routes/auth.js)
- **Admin Model:** [`backend/models/AdminUser.js`](backend/models/AdminUser.js)
- **Admin Dashboard:** [`frontend/src/pages/Admin.jsx`](frontend/src/pages/Admin.jsx)
- **Complete Guide:** [`ADMIN_GUIDE.md`](ADMIN_GUIDE.md)

---

## ❓ Questions?

**Q: Can I edit an admin's password?**
A: Not yet. You can delete and recreate with new password.

**Q: Can I make someone a super_admin?**
A: Yes, manually in MongoDB, change `role: "super_admin"`

**Q: What happens if I forget password?**
A: Currently no password reset. Contact your provider to reset.

**Q: Can multiple admins login?**
A: Yes! Each admin has unique email/password.

**Q: Is password stored in plain text?**
A: No! It's hashed with BCRYPT. Original password never stored.

---

## 🚀 Next Steps

1. **Add first admin** using PowerShell method above
2. **Test login** with the new credentials
3. **Use admin dashboard** to manage submissions
4. **Add more admins** as needed

---

**Last Updated:** April 7, 2026  
**Version:** 1.0
