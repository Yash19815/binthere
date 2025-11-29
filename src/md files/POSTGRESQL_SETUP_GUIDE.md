# BinThere PostgreSQL Setup Guide

Complete guide for setting up PostgreSQL database for BinThere smart waste management system.

---

## Table of Contents

1. [Option 1: Self-Hosted PostgreSQL](#option-1-self-hosted-postgresql)
2. [Option 2: PostgreSQL Cloud Services](#option-2-postgresql-cloud-services)
3. [Backend API Setup](#backend-api-setup)
4. [Testing the API](#testing-the-api)
5. [Connecting Frontend to Backend](#connecting-frontend-to-backend)
6. [Troubleshooting](#troubleshooting)

---

## Option 1: Self-Hosted PostgreSQL

### A. Local PostgreSQL Installation

#### **Windows:**
1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the setup wizard
3. Remember your postgres user password
4. Default port: `5432`

#### **macOS:**
```bash
# Using Homebrew
brew install postgresql@16
brew services start postgresql@16

# Or using Postgres.app
# Download from https://postgresapp.com/
```

#### **Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### B. Create Database and User

```bash
# Access PostgreSQL shell
sudo -u postgres psql

# Or on Windows/Mac:
psql -U postgres
```

```sql
-- Create database
CREATE DATABASE binthere;

-- Create user
CREATE USER binthere_admin WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE binthere TO binthere_admin;

-- Connect to binthere database
\c binthere

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO binthere_admin;

-- Exit
\q
```

### C. Import Schema

```bash
# Navigate to the database directory
cd database

# Import the schema
psql -U binthere_admin -d binthere -f postgresql-schema.sql

# Or as postgres user:
sudo -u postgres psql -d binthere -f postgresql-schema.sql
```

### D. Verify Installation

```bash
psql -U binthere_admin -d binthere

# List tables
\dt

# Check dustbins table
SELECT * FROM dustbins;

# Exit
\q
```

---

## Option 2: PostgreSQL Cloud Services

### A. Neon (Recommended - Free Tier Available)

**Best for:** Serverless PostgreSQL with auto-scaling

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project named "BinThere"
3. Copy the connection string:
   ```
   postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/binthere
   ```
4. Import schema:
   ```bash
   psql "postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/binthere" -f database/postgresql-schema.sql
   ```

**Features:**
- ✅ Free tier: 0.5 GB storage
- ✅ Auto-scaling
- ✅ Branching (like Git for databases)
- ✅ No idle timeout

### B. Railway (Easy Deployment)

**Best for:** Full-stack deployment with database

1. Sign up at [railway.app](https://railway.app)
2. Click "New Project" → "Provision PostgreSQL"
3. Copy connection details from the "Connect" tab
4. Connection string format:
   ```
   postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
   ```
5. Import schema using the connection string

**Features:**
- ✅ $5 free credit monthly
- ✅ Easy backend deployment
- ✅ Automatic SSL
- ✅ Built-in monitoring

### C. Render

**Best for:** Free PostgreSQL with web service hosting

1. Sign up at [render.com](https://render.com)
2. Dashboard → "New" → "PostgreSQL"
3. Set database name: `binthere`
4. Copy the External Database URL:
   ```
   postgresql://username:password@dpg-xxx-a.oregon-postgres.render.com/binthere
   ```
5. Import schema

**Features:**
- ✅ Free tier available
- ✅ Automatic backups
- ✅ 90-day data retention
- ⚠️ Database spins down after 90 days of inactivity

### D. DigitalOcean Managed Databases

**Best for:** Production applications

1. Sign up at [digitalocean.com](https://digitalocean.com)
2. Create → Databases → PostgreSQL
3. Choose plan ($15/month minimum)
4. Copy connection string
5. Import schema

**Features:**
- ✅ Fully managed
- ✅ Automatic backups
- ✅ High availability
- ✅ Production-ready
- ❌ No free tier

### E. Heroku Postgres

**Best for:** Heroku-hosted applications

1. Sign up at [heroku.com](https://heroku.com)
2. Create app → Resources → Add-ons → "Heroku Postgres"
3. Free tier: "Hobby Dev"
4. Get connection string:
   ```bash
   heroku config:get DATABASE_URL -a your-app-name
   ```
5. Import schema

**Features:**
- ✅ Free tier: 10,000 rows
- ✅ Easy integration with Heroku apps
- ⚠️ 10,000 row limit on free tier

---

## Backend API Setup

### 1. Navigate to Backend Directory

```bash
cd backend/nodejs-express
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env file
nano .env  # or use any text editor
```

**Edit `.env` file:**

```env
NODE_ENV=development
PORT=3001

# Your PostgreSQL connection string
DATABASE_URL=postgresql://binthere_admin:your_password@localhost:5432/binthere

# Or for cloud services:
# DATABASE_URL=postgresql://username:password@your-cloud-host.com:5432/binthere

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Frontend URL (for CORS)
CORS_ORIGIN=http://localhost:5173
```

### 4. Test Database Connection

```bash
node -e "require('./config/database').testConnection()"
```

You should see: `✅ PostgreSQL connected: [timestamp]`

### 5. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

You should see:
```
╔════════════════════════════════════════════════════════╗
║          BinThere Backend API Server                  ║
╚════════════════════════════════════════════════════════╝
🚀 Server running on port 3001
🌍 Environment: development
💾 Database: Connected to PostgreSQL
📡 API Version: v1
🔗 Local: http://localhost:3001
📊 Health Check: http://localhost:3001/health
```

### 6. Test API Endpoints

Open browser or use curl:

```bash
# Health check
curl http://localhost:3001/health

# Get all dustbins
curl http://localhost:3001/api/dustbins

# Get analytics
curl http://localhost:3001/api/analytics?period=last-week

# Get notifications
curl http://localhost:3001/api/notifications
```

---

## Connecting Frontend to Backend

### 1. Update Frontend Environment Variables

In your frontend project root, create `.env` file:

```env
# Backend API URL
VITE_AWS_API_GATEWAY_URL=http://localhost:3001/api

# Leave AWS API Key empty (not using AWS anymore)
VITE_AWS_API_KEY=
```

### 2. Start Frontend Development Server

```bash
# In your frontend directory (root of BinThere project)
npm run dev
```

### 3. Test Integration

1. Open frontend: `http://localhost:5173`
2. Login with mock credentials
3. You should see real dustbin data from PostgreSQL!

---

## Deployment Options

### Option A: Deploy Backend to Railway

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app)
3. New Project → "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect Node.js and deploy
6. Add PostgreSQL service to your project
7. Environment variables are automatically set
8. Get your backend URL: `https://your-app.up.railway.app`
9. Update frontend `.env`:
   ```env
   VITE_AWS_API_GATEWAY_URL=https://your-app.up.railway.app/api
   ```

### Option B: Deploy Backend to Render

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repository
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. Add environment variables from `.env`
6. Connect to your PostgreSQL database (created earlier)
7. Deploy!
8. Get your backend URL: `https://your-app.onrender.com`

### Option C: Deploy Backend to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create binthere-backend

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=your-secret-key
heroku config:set CORS_ORIGIN=https://your-frontend-url.com

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

---

## Testing the API

### Using cURL

```bash
# Create a dustbin
curl -X POST http://localhost:3001/api/dustbins \
  -H "Content-Type: application/json" \
  -d '{"location": "Test Location"}'

# Update dustbin
curl -X PUT http://localhost:3001/api/dustbins/001 \
  -H "Content-Type: application/json" \
  -d '{"location": "New Location"}'

# Delete dustbins
curl -X DELETE http://localhost:3001/api/dustbins \
  -H "Content-Type: application/json" \
  -d '{"dustbinIds": ["008"]}'

# Simulate IoT update (fill level change)
curl -X PUT http://localhost:3001/api/dustbins/001/fill-level \
  -H "Content-Type: application/json" \
  -d '{"overallFillLevel": 85, "wetWasteFillLevel": 80, "dryWasteFillLevel": 90, "batteryLevel": 75}'
```

### Using Postman

1. Download [Postman](https://www.postman.com/downloads/)
2. Import the API endpoints:
   - `GET http://localhost:3001/api/dustbins`
   - `POST http://localhost:3001/api/dustbins`
   - `PUT http://localhost:3001/api/dustbins/:id`
   - `DELETE http://localhost:3001/api/dustbins`
   - `GET http://localhost:3001/api/analytics?period=last-week`
   - `GET http://localhost:3001/api/notifications`

---

## Troubleshooting

### Database Connection Issues

**Error: "ECONNREFUSED"**
```bash
# Check if PostgreSQL is running
# Linux/Mac:
sudo systemctl status postgresql

# Mac (Homebrew):
brew services list

# Windows: Check Services app
```

**Error: "password authentication failed"**
- Verify username and password in `.env`
- Check `pg_hba.conf` file (PostgreSQL config)
- Try resetting password:
  ```sql
  ALTER USER binthere_admin WITH PASSWORD 'new_password';
  ```

**Error: "database does not exist"**
```bash
# Create database
psql -U postgres -c "CREATE DATABASE binthere;"
```

### Port Already in Use

```bash
# Change PORT in .env file
PORT=3002

# Or kill process using port 3001
# Mac/Linux:
lsof -ti:3001 | xargs kill -9

# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### CORS Errors

Update `CORS_ORIGIN` in `.env`:
```env
# Multiple origins separated by comma
CORS_ORIGIN=http://localhost:5173,http://localhost:3000,https://yourdomain.com
```

### Schema Import Fails

```bash
# Check PostgreSQL version
psql --version

# BinThere requires PostgreSQL 12+
# If you have an older version, upgrade or use a cloud service
```

---

## Next Steps

1. ✅ **Authentication**: Update frontend to use `/api/auth/login` instead of mock auth
2. ✅ **Real-time Updates**: Add WebSocket support for live dustbin updates
3. ✅ **IoT Integration**: Connect physical sensors to send data to `/api/dustbins/:id/fill-level`
4. ✅ **Monitoring**: Add logging and error tracking (Sentry, LogRocket)
5. ✅ **Backups**: Set up automated database backups
6. ✅ **SSL**: Enable HTTPS for production deployment

---

## Support

For issues or questions:
- Check the `/backend/nodejs-express/README.md` file
- Review PostgreSQL logs: `tail -f /var/log/postgresql/postgresql-*.log`
- Test individual endpoints with `curl` or Postman
- Verify environment variables are set correctly

---

## Quick Reference

### PostgreSQL Commands
```bash
# Connect to database
psql -U binthere_admin -d binthere

# List databases
\l

# List tables
\dt

# Describe table
\d dustbins

# View data
SELECT * FROM dustbins;

# Exit
\q
```

### Backend Commands
```bash
# Start server
npm start

# Development mode
npm run dev

# Test database connection
node -e "require('./config/database').testConnection()"
```

### Environment Variable Template
```env
DATABASE_URL=postgresql://user:pass@host:5432/database
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
PORT=3001
```

---

**That's it! Your BinThere application is now using PostgreSQL! 🎉**
