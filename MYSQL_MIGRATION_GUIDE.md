# MongoDB to MySQL Migration Guide

This guide will help you migrate your Resume Shortlister application from MongoDB to MySQL using a free tier database service.

## Overview

We've successfully converted your database from MongoDB (NoSQL) to MySQL (SQL) using Sequelize ORM. All models, routes, and database logic have been updated.

### Changes Made:
- ✅ Replaced Mongoose with Sequelize ORM
- ✅ Converted MongoDB models to Sequelize models
- ✅ Updated all database queries
- ✅ Updated dependencies (package.json)
- ✅ Maintained fallback in-memory storage for robustness

---

## Free Tier MySQL Options

Choose one of these free tier providers:

### 1. **PlanetScale** (Recommended)
- **Free Tier**: 10 GB storage, perfect for small projects
- **URL**: https://planetscale.com
- **Setup**: 5 minutes
- **Pros**: MySQL-compatible, easiest setup, good performance
- **Database Connection**: Standard MySQL connection string

### 2. **Render**
- **Free Tier**: 0.5 GB storage
- **URL**: https://render.com
- **Setup**: 10 minutes
- **Pros**: One-click deployment, integrated with Express apps
- **Database Connection**: MySQL connection string

### 3. **Railway**
- **Free Tier**: Limited free tier (pay as you go)
- **URL**: https://railway.app
- **Setup**: 5 minutes
- **Pros**: Simple deployment, good for Render compatibility

### 4. **AWS RDS Free Tier**
- **Free Tier**: 750 hours/month for 12 months (t3.micro)
- **URL**: https://aws.amazon.com/rds/free/
- **Setup**: 15 minutes
- **Pros**: Very reliable, scalable
- **Cons**: More complex setup

### 5. **Aiven (Free Trial)**
- **Free Tier**: 30 days free trial
- **URL**: https://aiven.io
- **Setup**: 10 minutes

---

## Step-by-Step Setup Instructions

### Option A: Using PlanetScale (Easiest)

#### 1. Create PlanetScale Account
1. Go to https://planetscale.com and sign up
2. Create a new database
3. Click on "Connect" and select "MySQL Command Line Client"

#### 2. Get Connection Credentials
1. Click on "Passwords" tab
2. Create a new password and copy the connection details
3. You'll get a connection string like:
```
mysql://[username]:[password]@[host]/[database]
```

#### 3. Configure Your Environment
Create/update `.env` file in the `backend/` directory:
```env
# MySQL Database Configuration
DB_HOST=your-planetscale-host.mysql.database.azure.com
DB_USER=your_username
DB_PASSWORD=your_password
DB_PORT=3306
DB_NAME=resume_shortlister

# Existing Variables
JWT_SECRET=your-secret-key
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_API_KEY=your-google-key
NODE_ENV=production
```

#### 4. Install Dependencies
```bash
cd backend
npm install
```

#### 5. Start Your Server
```bash
npm start
```

---

### Option B: Using Render

#### 1. Create Render Account
1. Go to https://render.com and sign up
2. Go to Dashboard → MySQL
3. Click "New SQL Database"
4. Choose MySQL
5. Set database name: `resume_shortlister`

#### 2. Get Connection Credentials
1. After creation, click on your database
2. Copy the connection string from "Connections"
3. Parse the connection details (host, user, password)

#### 3. Configure Environment
Create `.env` in `backend/`:
```env
DB_HOST=your-render-host
DB_USER=postgres
DB_PASSWORD=your_password
DB_PORT=3306
DB_NAME=resume_shortlister

JWT_SECRET=your-secret-key
NODE_ENV=production
```

#### 4. Deploy
Follow Render's deployment guide to connect your GitHub repo.

---

### Option C: Using Railway

#### 1. Create Railway Account
1. Go to https://railway.app
2. Connect GitHub account
3. Create new project from repo

#### 2. Add MySQL Database
1. Click "Add Service" → "Database" → "MySQL"
2. Railway will create the database automatically

#### 3. Environment Variables
Railway automatically generates `DATABASE_URL`. Update your `.env`:
```env
# From Railway Environment
DB_HOST=${{MYSQL.PRIVATE_URL}}
DB_USER=root
DB_PASSWORD=${{MYSQL_PASSWORD}}
DB_PORT=3306
DB_NAME=railway

JWT_SECRET=your-secret-key
```

---

## Environment Variables (.env)

Place this in `backend/.env`:

```env
# Database Configuration
DB_HOST=your-host-here
DB_USER=your-username
DB_PASSWORD=your-password
DB_PORT=3306
DB_NAME=resume_shortlister

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-this

# AI API Keys
ANTHROPIC_API_KEY=your-key-here
GOOGLE_API_KEY=your-key-here

# Application
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

---

## Local Development Setup

### 1. Install MySQL Locally (Optional)

#### Windows:
```bash
# Using Chocolatey
choco install mysql

# Or download from: https://dev.mysql.com/downloads/mysql/
```

#### Mac:
```bash
brew install mysql
brew services start mysql

# Secure installation
mysql_secure_installation
```

#### Linux (Ubuntu):
```bash
sudo apt-get install mysql-server
sudo mysql_secure_installation
```

### 2. Create Local Database
```bash
mysql -u root -p

# In MySQL shell:
CREATE DATABASE resume_shortlister;
CREATE USER 'resume_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON resume_shortlister.* TO 'resume_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Update Local .env
```env
DB_HOST=localhost
DB_USER=resume_user
DB_PASSWORD=password123
DB_PORT=3306
DB_NAME=resume_shortlister

JWT_SECRET=dev-secret-key
NODE_ENV=development
```

### 4. Install Dependencies and Start
```bash
cd backend
npm install
npm run dev
```

---

## Data Migration (If You Had Existing MongoDB Data)

If you have existing data in MongoDB, follow these steps:

### 1. Export MongoDB Data
```bash
mongoexport -d resume-shortlister -c adminusers -o adminusers.json
mongoexport -d resume-shortlister -c resumesubmissions -o resumesubmissions.json
```

### 2. Convert JSON to MySQL Format
The JSON structure should already be compatible. The data will be automatically created when you run the app.

### 3. Manual Migration Script
```javascript
// scripts/migrate.js
const AdminUser = require('./models/AdminUser');
const ResumeSubmission = require('./models/ResumeSubmission');

const fs = require('fs');

async function migrate() {
  // Load JSON files
  const admins = JSON.parse(fs.readFileSync('adminusers.json', 'utf8'));
  const submissions = JSON.parse(fs.readFileSync('resumesubmissions.json', 'utf8'));
  
  // Insert admins (don't include _id, let MySQL auto-generate)
  for (let admin of admins) {
    delete admin._id;
    await AdminUser.create(admin);
  }
  
  // Insert submissions
  for (let submission of submissions) {
    delete submission._id;
    await ResumeSubmission.create(submission);
  }
  
  console.log('Migration complete!');
}

migrate();
```

Run: `node scripts/migrate.js`

---

## API Changes (If Any)

No API changes needed! All endpoints work exactly the same:
- `POST /api/auth/login` - Still works
- `POST /api/auth/register-admin` - Still works
- `GET /api/admin/submissions` - Still works
- `GET /api/admin/stats` - Still works
- `POST /api/admin/submissions` - Still works
- `POST /api/suggestions` - Still works
- `POST /api/suggestions/analyze-pdf` - Still works

---

## Testing the Connection

### 1. Test Database Connection
```bash
cd backend

# Create test-db.js
cat > test-db.js << 'EOF'
const { sequelize } = require('./config/db');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error);
    process.exit(1);
  }
})();
EOF

node test-db.js
```

### 2. Test with API
```bash
# Start server
npm run dev

# In another terminal
curl -X POST http://localhost:3000/api/suggestions \
  -H "Content-Type: application/json" \
  -d '{
    "resumeText": "Experienced developer with 5 years of experience",
    "jobDescription": "Senior developer needed",
    "candidateName": "John Doe"
  }'
```

---

## Troubleshooting

### Connection Error: "Access Denied"
- Check database credentials in `.env`
- Verify host is correct (e.g., PlanetScale host, Render host)
- Check firewall/whitelist settings

### Connection Error: "No Such Host"
- Verify `DB_HOST` is correct
- Try using IP address instead of hostname
- Check internet connection

### "Table Already Exists"
- Sequelize will auto-create on first run
- If you need to reset: Drop the database and recreate

### Performance Issues
- Ensure your indexes are created: `DB_ENGINE=InnoDB`
- For PlanetScale: Use connection pooling

### Port Issues
- MySQL default: 3306
- Check if port is open/accessible
- For remote: Ensure firewall allows connections

---

## Database Schema

### AdminUser Table
```sql
CREATE TABLE AdminUsers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'super_admin') DEFAULT 'admin',
  active BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### ResumeSubmission Table
```sql
CREATE TABLE ResumeSubmissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  candidateName VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  score INT CHECK (score >= 0 AND score <= 100),
  missingSkills JSON,
  weakSections JSON,
  formattingTips JSON,
  verdict TEXT,
  jobDescription LONGTEXT,
  resumeText LONGTEXT,
  fileType ENUM('txt', 'pdf') DEFAULT 'txt',
  feedback LONGTEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_candidateName (candidateName),
  INDEX idx_createdAt (createdAt),
  INDEX idx_score (score)
);
```

---

## Deployment Guide

### Deploying to Render
1. Connect GitHub repo to Render
2. Set environment variables in Render dashboard
3. Add MySQL database service
4. Deploy automatically on push

### Deploying to Railway
1. Connect GitHub
2. Set environment variables
3. Railway handles MySQL automatically
4. Deploy on commit

### Deploying to Heroku (Legacy)
1. Update `Procfile` (already done)
2. Set environment variables: `heroku config:set DB_HOST=...`
3. `git push heroku main`

---

## Support & Next Steps

- All existing functionality maintained
- Fallback in-memory storage still available
- No breaking changes to API
- Ready for production deployment

### Quick Checklist
- [ ] Choose database provider (PlanetScale recommended)
- [ ] Create account and database
- [ ] Copy connection credentials
- [ ] Update `.env` file
- [ ] Run `npm install`
- [ ] Test with `npm run dev`
- [ ] Deploy to production

---

## Questions?

Refer to:
- [Sequelize Documentation](https://sequelize.org/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [PlanetScale Docs](https://planetscale.com/docs)
