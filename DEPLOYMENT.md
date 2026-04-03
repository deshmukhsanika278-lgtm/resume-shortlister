# Deployment Guide - Share Your Project with a Single Link

## Option 1: Railway.app (Recommended - Easiest Full-Stack)

### Prerequisites
- GitHub account
- Railway account (https://railway.app)
- MongoDB Atlas account (https://www.mongodb.com/cloud/atlas)

### Step 1: Set Up MongoDB Atlas
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user
4. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/resume-shortlister`

### Step 2: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/resume-shortlister.git
git push -u origin main
```

### Step 3: Deploy Backend on Railway
1. Go to https://railway.app/dashboard
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `resume-shortlister` repository
4. Railway auto-detects Node.js backend
5. Add environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Generate a random secret (use `openssl rand -hex 32`)
   - `FRONTEND_URL`: Will add after frontend deployment
6. Railway auto-generates a public URL like: `https://resume-shortlister-production.up.railway.app`
7. Copy your backend URL

### Step 4: Deploy Frontend on Vercel
1. Go to https://vercel.com
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Framework: "Vite"
5. Environment Variables:
   - `VITE_API_BASE_URL`: `https://resume-shortlister-production.up.railway.app/api`
6. Deploy!
7. Get your frontend URL like: `https://resume-shortlister.vercel.app`

### Step 5: Update CORS on Backend
1. Go back to Railway dashboard
2. Update `FRONTEND_URL` environment variable to your Vercel URL
3. Railway auto-redeploys

### Your Shareable Link
**Frontend:** `https://resume-shortlister.vercel.app`

---

## Option 2: Render.com (Alternative)

### Step 1-2: Same as Railway (GitHub + MongoDB)

### Step 3: Deploy Backend on Render
1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Settings:
   - Name: `resume-shortlister-backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `cd backend && npm start`
   - Plan: Free
5. Add environment variables (same as Railway)
6. Deploy
7. Get URL like: `https://resume-shortlister-backend.onrender.com`

### Step 4: Deploy Frontend on Vercel (same as Railway)

---

## Option 3: Full Stack on Single Platform (Heroku Alternative)

Use **Fly.io** or **Replit** for everything in one place.

---

## Environment Variables Reference

### Backend (.env)
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/resume-shortlister
JWT_SECRET=your-random-secret-here
FRONTEND_URL=https://your-frontend-domain.com
PORT=5000
```

### Frontend (.env.local)
```
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

---

## Testing Your Deployment

Once deployed:
1. Visit your frontend URL
2. Try uploading a resume
3. Check that it processes correctly
4. Verify the backend calls work

---

## Troubleshooting

- **CORS Errors**: Check `FRONTEND_URL` environment variable matches your frontend domain
- **API Not Found (404)**: Ensure `VITE_API_BASE_URL` is correct
- **Database Connection**: Verify `MONGODB_URI` is accessible from Railway/Render
- **File Upload Issues**: Backend needs to write to `/tmp` on cloud platforms, not local `/uploads/`

#### Fix File Upload for Production
Update `backend/services/pdfExtractorService.js` or wherever files are stored to use `/tmp`:
```javascript
const uploadDir = process.env.NODE_ENV === 'production' ? '/tmp' : 'uploads';
```

---

## Share Your Link
You can now share: **`https://your-frontend-domain.com`**

That's it! Your entire project is live! 🚀
