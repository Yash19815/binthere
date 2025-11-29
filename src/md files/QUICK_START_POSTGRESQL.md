# BinThere PostgreSQL Quick Start

Get your BinThere application connected to PostgreSQL in under 10 minutes.

---

## 🚀 Super Quick Start (Development)

### Step 1: Choose Your Database (Pick One)

#### Option A: Neon (Recommended - Free, 2 minutes)
1. Go to https://neon.tech
2. Sign up with GitHub
3. Create project "BinThere"
4. Copy the connection string

#### Option B: Supabase (Free, 3 minutes)
1. Go to https://supabase.com
2. Sign up
3. Create new project
4. Go to Settings → Database → Copy URI

#### Option C: Railway (Free $5 credit, 2 minutes)
1. Go to https://railway.app
2. Sign up
3. New Project → Add PostgreSQL
4. Copy DATABASE_URL from Variables

#### Option D: Local PostgreSQL (5 minutes)
```bash
# macOS
brew install postgresql@15
brew services start postgresql@15
createdb binthere

# Ubuntu/Debian
sudo apt install postgresql
sudo -u postgres createdb binthere

# Docker
docker run --name binthere-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=binthere \
  -p 5432:5432 -d postgres:15
```

---

### Step 2: Set Up Backend (5 minutes)

```bash
# Navigate to backend directory
cd backend/nodejs-express

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env and add your database URL
nano .env
```

**Add this to .env:**
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=your-connection-string-here
JWT_SECRET=your-random-secret-key
CORS_ORIGIN=http://localhost:5173
```

**Generate JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### Step 3: Create Database Tables

```bash
# Run migration script (creates all tables and seed data)
npm run migrate
```

**You should see:**
```
✅ Connected successfully
✅ Schema loaded
✅ Database schema created successfully
📦 Seed data inserted:
   • 8 dustbins
   • 1 users
   • 5760 history records
```

---

### Step 4: Start Backend Server

```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

**Verify it's running:**
Open http://localhost:3001/health

---

### Step 5: Connect Frontend

**In your frontend project root**, create `.env`:

```env
VITE_AWS_API_GATEWAY_URL=http://localhost:3001/api
```

**Start your frontend:**
```bash
npm run dev
```

---

### Step 6: Test It Out

1. **Open your app:** http://localhost:5173
2. **Login with:**
   - Email: `admin@binthere.com`
   - Password: `admin123`
3. **Check the data** - you should see 8 dustbins with real data
4. **Try adding a dustbin** - it should persist after page refresh
5. **Check notifications** - critical dustbins should show alerts

---

## ✅ Verification Checklist

- [ ] Backend server running on http://localhost:3001
- [ ] Health check returns "connected"
- [ ] Frontend can login
- [ ] Dustbins load from database
- [ ] Can add/edit/delete dustbins
- [ ] Data persists after page refresh
- [ ] Notifications show up for full dustbins
- [ ] Analytics graph shows historical data

---

## 🐛 Troubleshooting

### "Connection refused"
**Problem:** Can't connect to database

**Solution:**
```bash
# Check if PostgreSQL is running
pg_isready

# Start it
# macOS: brew services start postgresql@15
# Linux: sudo systemctl start postgresql
# Docker: docker start binthere-postgres
```

### "Authentication failed"
**Problem:** Wrong credentials

**Solution:**
- Double-check DATABASE_URL in `.env`
- Make sure password is correct
- For cloud services, check IP whitelist

### "Database does not exist"
**Problem:** Database not created

**Solution:**
```bash
createdb binthere
# or
psql postgres -c "CREATE DATABASE binthere;"
```

### "Port 3001 already in use"
**Problem:** Something else using the port

**Solution:**
```bash
# Find what's using it
lsof -i :3001

# Kill it
kill -9 <PID>

# Or use different port
PORT=3002 npm start
```

### "Cannot find module"
**Problem:** Dependencies not installed

**Solution:**
```bash
cd backend/nodejs-express
npm install
```

### Migration fails
**Problem:** Tables already exist

**Solution:**
```bash
# Connect to database
psql $DATABASE_URL

# Drop and recreate schema
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
\q

# Run migration again
npm run migrate
```

---

## 🧪 Test Your Setup

### Test Backend Endpoints

```bash
# Health check
curl http://localhost:3001/health

# Get dustbins
curl http://localhost:3001/api/dustbins

# Get analytics
curl "http://localhost:3001/api/analytics?period=last-week"

# Get notifications
curl http://localhost:3001/api/notifications

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@binthere.com","password":"admin123"}'
```

### Test Database Direct

```bash
# Connect to database
psql $DATABASE_URL

# List tables
\dt

# View dustbins
SELECT id, name, location, overall_fill_level FROM dustbins;

# Count history records
SELECT COUNT(*) FROM dustbin_history;

# View notifications
SELECT * FROM notifications;

# Exit
\q
```

---

## 📚 What Got Created

### Database Tables
- `users` - Admin accounts
- `dustbins` - Master dustbin list
- `dustbin_history` - Time-series fill level data
- `notifications` - Critical alerts
- `analytics_aggregates` - Pre-computed stats
- `audit_log` - Change tracking

### Seed Data
- **8 dustbins** with various fill levels
- **1 admin user** (admin@binthere.com / admin123)
- **5,760 history records** (30 days, every 6 hours)
- **Notifications** for dustbins ≥80% full

### Backend API Endpoints
- `POST /api/auth/login` - Login
- `GET /api/dustbins` - Get all dustbins
- `POST /api/dustbins` - Add dustbin
- `PUT /api/dustbins/:id` - Update dustbin
- `DELETE /api/dustbins` - Remove dustbins
- `GET /api/analytics` - Get analytics data
- `GET /api/notifications` - Get notifications

---

## 🔐 Security Note

**Default credentials:**
- Email: `admin@binthere.com`
- Password: `admin123`

**⚠️ IMPORTANT:** Change this immediately!

**Update password in database:**
```bash
psql $DATABASE_URL

-- Generate new password hash (use bcryptjs)
-- Replace with your own hashed password
UPDATE users 
SET password_hash = '$2b$10$newHashedPasswordHere' 
WHERE email = 'admin@binthere.com';
```

**Or create new admin:**
```bash
# Use the registration endpoint
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your.email@example.com",
    "password": "YourSecurePassword123!",
    "name": "Your Name"
  }'
```

---

## 📈 Next Steps

### Development
- [ ] Change default admin password
- [ ] Add more test dustbins
- [ ] Customize locations
- [ ] Test all CRUD operations

### Production
- [ ] Deploy backend (Railway, Render, or Heroku)
- [ ] Upgrade database to paid tier
- [ ] Set up custom domain
- [ ] Enable SSL/HTTPS
- [ ] Set up monitoring
- [ ] Configure automated backups

### Advanced
- [ ] Connect real IoT sensors
- [ ] Set up email notifications
- [ ] Add more admin users
- [ ] Customize analytics
- [ ] Add data export features

---

## 📖 Documentation

- **Full Setup Guide:** `/backend/POSTGRESQL_SETUP_GUIDE.md`
- **Cloud Comparison:** `/backend/CLOUD_SERVICES_COMPARISON.md`
- **Backend API Docs:** `/backend/nodejs-express/README.md`
- **Database Schema:** `/database/postgresql-schema.sql`

---

## 💡 Tips

### Connection Strings Format

```
postgresql://username:password@host:port/database

Examples:
postgresql://postgres:mypass@localhost:5432/binthere
postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/binthere
postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres
```

### Environment Variables

**Development (.env):**
```env
DATABASE_URL=postgresql://localhost:5432/binthere
CORS_ORIGIN=http://localhost:5173
```

**Production (.env):**
```env
DATABASE_URL=postgresql://cloud-provider-url/binthere
CORS_ORIGIN=https://yourdomain.com
NODE_ENV=production
```

### Viewing Logs

```bash
# Backend logs
npm start

# Database logs (cloud services)
# Check provider dashboard

# PostgreSQL logs (self-hosted)
tail -f /usr/local/var/log/postgresql@15.log  # macOS
sudo tail -f /var/log/postgresql/postgresql-15-main.log  # Linux
```

---

## 🎉 Success!

If you've made it here, you now have:
✅ PostgreSQL database running
✅ Backend API server running
✅ Frontend connected to real data
✅ Full CRUD functionality
✅ Real-time notifications
✅ Historical analytics

**Your BinThere app is now using PostgreSQL! 🗑️📊**

---

## ❓ Need Help?

1. Check the troubleshooting section above
2. Review `/backend/POSTGRESQL_SETUP_GUIDE.md`
3. Check backend logs: `npm start`
4. Test database connection: `psql $DATABASE_URL`
5. Verify environment variables: `env | grep DATABASE`

---

**Happy monitoring! 🚮✨**
