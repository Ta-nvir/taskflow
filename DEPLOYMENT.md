# Deployment Guide — Railway 🚂

## Step 1: Push code to GitHub

```bash
git init
git add .
git commit -m "Initial commit: TaskFlow app"
git branch -M main
git remote add origin https://github.com/Ta-nvir/taskflow.git
git push -u origin main
```

---

## Step 2: Deploy Backend on Railway

1. Go to [railway.app](https://railway.app) → **New Project**
2. Click **"Deploy from GitHub repo"** → select `Ta-nvir/taskflow`
3. Set **Root Directory** to `backend`
4. Railway will auto-detect Node.js

### Add MySQL Database
1. In your Railway project → **"+ New"** → **"Database"** → **MySQL**
2. Railway auto-sets `MYSQL_URL` — note the individual variables

### Set Backend Environment Variables
In Railway → your backend service → **Variables** tab:

```
PORT=5000
DB_HOST=<from Railway MySQL MYSQLHOST>
DB_USER=<from Railway MySQL MYSQLUSER>
DB_PASSWORD=<from Railway MySQL MYSQLPASSWORD>
DB_NAME=<from Railway MySQL MYSQLDATABASE>
DB_PORT=<from Railway MySQL MYSQLPORT>
JWT_SECRET=your_very_long_random_secret_string_here
FRONTEND_URL=https://your-frontend.up.railway.app
```

### Run Schema Migration
In Railway → backend service → **"New" → "Railway CLI"** or use the built-in shell:
```bash
node -e "
const mysql = require('mysql2/promise');
const fs = require('fs');
const pool = mysql.createPool({host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME, port: process.env.DB_PORT});
const schema = fs.readFileSync('./config/schema.sql', 'utf8');
pool.query(schema).then(() => { console.log('Schema created!'); process.exit(0); });
"
```

Or simply copy the contents of `backend/config/schema.sql` and run it in Railway's MySQL console.

---

## Step 3: Deploy Frontend on Railway

1. In same Railway project → **"+ New"** → **"GitHub Repo"** → select `Ta-nvir/taskflow` again
2. Set **Root Directory** to `frontend`
3. Add environment variable:
```
REACT_APP_API_URL=https://your-backend.up.railway.app/api
```
4. Deploy!

---

## Step 4: Update CORS

Once frontend is deployed, update your backend `FRONTEND_URL` env var to the actual Railway frontend URL.

---

## ✅ Your app is live!

- Frontend: `https://taskflow-frontend.up.railway.app`
- Backend: `https://taskflow-backend.up.railway.app`
- API Health: `https://taskflow-backend.up.railway.app/api/health`
