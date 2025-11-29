# BinThere PostgreSQL Architecture

Visual representation of the complete BinThere system with PostgreSQL backend.

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BINTHERE SYSTEM                             │
│                    Smart Waste Management                           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────┐         ┌──────────────────┐         ┌────────────────┐
│   IoT SENSORS   │         │     FRONTEND     │         │    ADMINS      │
│                 │         │   React + Vite   │         │   Dashboard    │
│  ┌──────────┐   │         │                  │         │    Users       │
│  │ Dustbin  │   │         │  • Login Page    │         │                │
│  │ #001     │───┼────┐    │  • Dashboard     │◄────────┤  • View Stats  │
│  │ 85% Full │   │    │    │  • Analytics     │         │  • Add Dustbin │
│  └──────────┘   │    │    │  • Notifications │         │  • Monitor     │
│                 │    │    │  • Dark Mode     │         │                │
│  ┌──────────┐   │    │    └──────────────────┘         └────────────────┘
│  │ Dustbin  │   │    │             ▲
│  │ #002     │───┼────┤             │
│  │ 65% Full │   │    │             │ HTTPS/REST API
│  └──────────┘   │    │             │
│                 │    │             ▼
│  ┌──────────┐   │    │    ┌──────────────────────────────────┐
│  │ Dustbin  │   │    │    │      BACKEND API SERVER          │
│  │ #003     │───┼────┤    │     Express.js + Node.js         │
│  │ 45% Full │   │    │    │                                  │
│  └──────────┘   │    │    │  ┌────────────────────────────┐  │
│       ...       │    └───▶│  │   API ENDPOINTS            │  │
│                 │         │  │                            │  │
│  ┌──────────┐   │         │  │  /api/auth/login          │  │
│  │ Dustbin  │   │         │  │  /api/dustbins            │  │
│  │ #008     │───┼────────▶│  │  /api/analytics           │  │
│  │ 28% Full │   │         │  │  /api/notifications       │  │
│  └──────────┘   │         │  │                            │  │
└─────────────────┘         │  └────────────────────────────┘  │
                            │                                  │
                            │  ┌────────────────────────────┐  │
                            │  │   MIDDLEWARE               │  │
                            │  │                            │  │
                            │  │  • JWT Authentication      │  │
                            │  │  • CORS                    │  │
                            │  │  • Rate Limiting           │  │
                            │  │  • Compression             │  │
                            │  │  • Helmet Security         │  │
                            │  └────────────────────────────┘  │
                            │                                  │
                            └─────────────┬────────────────────┘
                                          │
                                          │ SQL Queries
                                          │
                                          ▼
                       ┌────────────────────────────────────────┐
                       │      POSTGRESQL DATABASE               │
                       │                                        │
                       │  ┌──────────────────────────────────┐  │
                       │  │  TABLES                          │  │
                       │  │                                  │  │
                       │  │  users                           │  │
                       │  │  ├─ id, email, password_hash     │  │
                       │  │  └─ name, role, last_login       │  │
                       │  │                                  │  │
                       │  │  dustbins                        │  │
                       │  │  ├─ id, name, location           │  │
                       │  │  ├─ overall_fill_level           │  │
                       │  │  ├─ wet_waste_fill_level         │  │
                       │  │  ├─ dry_waste_fill_level         │  │
                       │  │  ├─ battery_level                │  │
                       │  │  └─ critical_timestamp           │  │
                       │  │                                  │  │
                       │  │  dustbin_history                 │  │
                       │  │  ├─ id, dustbin_id               │  │
                       │  │  ├─ fill levels (wet/dry)        │  │
                       │  │  └─ timestamp                    │  │
                       │  │                                  │  │
                       │  │  notifications                   │  │
                       │  │  ├─ id, dustbin_id               │  │
                       │  │  ├─ fill_level                   │  │
                       │  │  └─ critical_timestamp           │  │
                       │  │                                  │  │
                       │  │  analytics_aggregates            │  │
                       │  │  audit_log                       │  │
                       │  └──────────────────────────────────┘  │
                       │                                        │
                       │  ┌──────────────────────────────────┐  │
                       │  │  FEATURES                        │  │
                       │  │                                  │  │
                       │  │  • Triggers (auto notifications) │  │
                       │  │  • Indexes (fast queries)        │  │
                       │  │  • Views (critical_dustbins)     │  │
                       │  │  • Functions (update timestamps) │  │
                       │  │  • Connection Pooling            │  │
                       │  └──────────────────────────────────┘  │
                       └────────────────────────────────────────┘
                                          │
                                          │ Cloud Hosting
                                          ▼
                       ┌────────────────────────────────────────┐
                       │     DEPLOYMENT OPTIONS                 │
                       │                                        │
                       │  • Neon (Serverless)                   │
                       │  • Supabase (Backend-as-a-Service)     │
                       │  • Railway (Full Stack)                │
                       │  • Render (Simple Hosting)             │
                       │  • DigitalOcean (Managed DB)           │
                       │  • AWS RDS (Enterprise)                │
                       │  • Heroku (Platform-as-a-Service)      │
                       └────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. Dustbin Data Update Flow

```
┌───────────┐                                              ┌──────────────┐
│ IoT Sensor│                                              │   Frontend   │
│           │                                              │   Dashboard  │
└─────┬─────┘                                              └──────┬───────┘
      │                                                           │
      │ 1. Send fill level data                                  │
      │    PUT /api/dustbins/:id/fill-level                      │
      │    { overallFillLevel: 85,                               │
      │      wetWasteFillLevel: 78,                              │
      │      dryWasteFillLevel: 92 }                            │
      │                                                           │
      ▼                                                           │
┌────────────────────────────────────┐                           │
│         Backend API                │                           │
│                                    │                           │
│  2. Validate data                  │                           │
│  3. Update dustbins table          │                           │
│     UPDATE dustbins SET            │                           │
│       overall_fill_level = 85      │                           │
│                                    │                           │
└──────────────┬─────────────────────┘                           │
               │                                                 │
               ▼                                                 │
┌────────────────────────────────────┐                           │
│      PostgreSQL Database           │                           │
│                                    │                           │
│  4. Trigger: log_dustbin_history() │                           │
│     INSERT INTO dustbin_history... │                           │
│                                    │                           │
│  5. Trigger: check if >= 80%       │                           │
│     If true:                       │                           │
│       INSERT INTO notifications... │                           │
│                                    │                           │
└──────────────┬─────────────────────┘                           │
               │                                                 │
               │ 6. Return updated data                          │
               └─────────────────────────────────────────────────▶
                                                                 │
                                                    7. Display update
                                                       Show notification
                                                       Update charts
```

### 2. User Login Flow

```
┌──────────┐                                              ┌──────────────┐
│ Admin    │                                              │  PostgreSQL  │
│ User     │                                              │  Database    │
└────┬─────┘                                              └──────────────┘
     │                                                           ▲
     │ 1. Enter credentials                                     │
     │    Email: admin@binthere.com                             │
     │    Password: admin123                                    │
     │                                                           │
     ▼                                                           │
┌──────────────────┐                                            │
│   Frontend       │                                            │
│   Login Page     │                                            │
└────┬─────────────┘                                            │
     │                                                           │
     │ 2. POST /api/auth/login                                  │
     │    { email, password }                                   │
     │                                                           │
     ▼                                                           │
┌────────────────────────────────────┐                          │
│         Backend API                │                          │
│                                    │    3. Query user         │
│  Validate email format             │─────────────────────────▶│
│                                    │                          │
│                                    │    SELECT * FROM users   │
│                                    │◀─────────────────────────│
│                                    │                          │
│  4. Compare password hash          │                          │
│     bcrypt.compare(password,       │                          │
│                   stored_hash)     │                          │
│                                    │                          │
│  5. Generate JWT token             │                          │
│     jwt.sign({ userId, email })    │    6. Update last_login  │
│                                    │─────────────────────────▶│
└──────────────┬─────────────────────┘                          │
               │                                                │
               │ 7. Return token + user data                    │
               │    { token, user: { name, email, role } }      │
               │                                                │
               ▼                                                │
          ┌──────────────────┐                                 │
          │   Frontend       │                                 │
          │                  │                                 │
          │  8. Store token  │                                 │
          │  9. Redirect to  │                                 │
          │     Dashboard    │                                 │
          └──────────────────┘                                 │
```

### 3. Analytics Query Flow

```
┌──────────────┐
│   Frontend   │
│   Dashboard  │
└──────┬───────┘
       │
       │ 1. User selects "Last Week"
       │    GET /api/analytics?period=last-week
       │
       ▼
┌────────────────────────────────────┐
│         Backend API                │
│                                    │
│  2. Parse query parameters         │
│     period = "last-week"           │
│                                    │
│  3. Build SQL query                │
│     SELECT DATE(timestamp) as date,│
│            AVG(wet_waste) as wet,  │
│            AVG(dry_waste) as dry   │
│     FROM dustbin_history           │
│     WHERE timestamp >= NOW() - 7d  │
│     GROUP BY DATE(timestamp)       │
│                                    │
└──────────────┬─────────────────────┘
               │
               ▼
┌────────────────────────────────────┐
│      PostgreSQL Database           │
│                                    │
│  4. Execute query with indexes     │
│     idx_history_timestamp used     │
│                                    │
│  5. Return aggregated data:        │
│     [                              │
│       { date: "Nov 05", wet: 65,   │
│         dry: 58 },                 │
│       { date: "Nov 06", wet: 72,   │
│         dry: 61 },                 │
│       ...                          │
│     ]                              │
│                                    │
└──────────────┬─────────────────────┘
               │
               │ 6. Format response
               │
               ▼
          ┌──────────────────┐
          │   Frontend       │
          │                  │
          │  7. Render chart │
          │     • X-axis: dates
          │     • Y-axis: fill %
          │     • Two lines:
          │       - Wet waste
          │       - Dry waste
          └──────────────────┘
```

### 4. Real-Time Notification Flow

```
┌───────────┐                                              ┌──────────────┐
│ Dustbin   │                                              │   Frontend   │
│ Sensor    │                                              │   Dashboard  │
└─────┬─────┘                                              └──────┬───────┘
      │                                                           │
      │ 1. Fill level crosses 80%                                │
      │    PUT /api/dustbins/:id/fill-level                      │
      │    { overallFillLevel: 82 }                             │
      │                                                           │
      ▼                                                           │
┌────────────────────────────────────┐                           │
│         Backend API                │                           │
│  2. Update dustbin record          │                           │
└──────────────┬─────────────────────┘                           │
               │                                                 │
               ▼                                                 │
┌────────────────────────────────────┐                           │
│      PostgreSQL Database           │                           │
│                                    │                           │
│  3. BEFORE UPDATE Trigger          │                           │
│     create_critical_notification() │                           │
│                                    │                           │
│     IF new_fill >= 80 AND          │                           │
│        old_fill < 80 THEN          │                           │
│                                    │                           │
│       INSERT INTO notifications    │                           │
│       (dustbin_id, fill_level,     │                           │
│        critical_timestamp)         │                           │
│       VALUES (...)                 │                           │
│                                    │                           │
│     END IF                         │                           │
│                                    │                           │
└──────────────┬─────────────────────┘                           │
               │                                                 │
               │ 4. Return success                               │
               └─────────────────────────────────────────────────▶
                                                                 │
                                                   5. Frontend polls
                                                      GET /api/notifications
                                                                 │
                                                   6. Show alert:
                                                      "Dustbin #004 is 82% full!"
```

---

## Database Schema Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE SCHEMA                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│       USERS          │
├──────────────────────┤
│ PK  id (UUID)        │
│     email (unique)   │
│     password_hash    │
│     name             │
│     role             │
│     created_at       │
│     last_login       │
└──────────────────────┘
           │
           │ (resolved_by)
           │
           ▼
┌──────────────────────┐        ┌──────────────────────┐
│   NOTIFICATIONS      │        │     DUSTBINS         │
├──────────────────────┤        ├──────────────────────┤
│ PK  id (UUID)        │   ┌───▶│ PK  id (VARCHAR)     │
│ FK  dustbin_id       │───┘    │     name             │
│     dustbin_name     │        │     location         │
│     dustbin_location │        │     overall_fill_lvl │
│     fill_level       │        │     wet_waste_lvl    │
│     critical_timestamp        │     dry_waste_lvl    │
│     is_read          │        │     battery_level    │
│     is_resolved      │        │     last_updated     │
│ FK  resolved_by      │        │     last_maintenance │
│     resolved_at      │        │     critical_timestamp
└──────────────────────┘        │     is_active        │
                                └──────────────────────┘
                                           │
                                           │
                                           ▼
                                ┌──────────────────────┐
                                │  DUSTBIN_HISTORY     │
                                ├──────────────────────┤
                                │ PK  id (SERIAL)      │
                                │ FK  dustbin_id       │
                                │     overall_fill_lvl │
                                │     wet_waste_lvl    │
                                │     dry_waste_lvl    │
                                │     battery_level    │
                                │     timestamp        │
                                └──────────────────────┘
                                           │
                                           │ (aggregated)
                                           ▼
                                ┌──────────────────────┐
                                │ ANALYTICS_AGGREGATES │
                                ├──────────────────────┤
                                │ PK  id (SERIAL)      │
                                │     date (DATE)      │
                                │ FK  dustbin_id       │
                                │     total_collections│
                                │     avg_fill_level   │
                                │     avg_wet_waste    │
                                │     avg_dry_waste    │
                                └──────────────────────┘

┌──────────────────────┐
│     AUDIT_LOG        │
├──────────────────────┤
│ PK  id (SERIAL)      │
│ FK  user_id          │
│     action           │
│     table_name       │
│     record_id        │
│     old_values       │
│     new_values       │
│     timestamp        │
└──────────────────────┘
```

---

## Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                      TECHNOLOGY STACK                       │
└─────────────────────────────────────────────────────────────┘

Frontend Layer
├─ React 18
├─ TypeScript
├─ Vite (Build Tool)
├─ Tailwind CSS 4.0
├─ Shadcn/UI Components
├─ Recharts (Analytics Graphs)
├─ Lucide Icons
└─ Sonner (Notifications)

Backend Layer
├─ Node.js 18+
├─ Express.js 4
├─ TypeScript/JavaScript
├─ JWT Authentication
├─ bcryptjs (Password Hashing)
├─ Helmet (Security)
├─ CORS
├─ Rate Limiting
└─ Compression

Database Layer
├─ PostgreSQL 12+
├─ pg (Node-Postgres)
├─ Connection Pooling
├─ Triggers & Functions
├─ Indexes
└─ Views

Deployment Options
├─ Frontend: Vercel, Netlify, Cloudflare Pages
├─ Backend: Railway, Render, Heroku
└─ Database: Neon, Supabase, DigitalOcean

Development Tools
├─ npm/yarn
├─ nodemon (Auto-reload)
├─ psql (PostgreSQL CLI)
├─ pgAdmin/DBeaver (GUI)
└─ Postman/curl (API Testing)
```

---

## API Endpoint Map

```
┌─────────────────────────────────────────────────────────────┐
│                        API ENDPOINTS                        │
└─────────────────────────────────────────────────────────────┘

Authentication
├─ POST   /api/auth/login            → User login
├─ POST   /api/auth/register         → User registration
├─ GET    /api/auth/me               → Get current user
└─ POST   /api/auth/logout           → User logout

Dustbins
├─ GET    /api/dustbins              → Fetch all dustbins
├─ GET    /api/dustbins/:id          → Fetch single dustbin
├─ POST   /api/dustbins              → Add new dustbin
├─ PUT    /api/dustbins/:id          → Update dustbin location
├─ DELETE /api/dustbins              → Remove dustbins (batch)
└─ PUT    /api/dustbins/:id/fill-level → Update fill levels (IoT)

Analytics
├─ GET    /api/analytics             → Fetch historical data
│         ?period=last-week
│         &dustbinId=001
├─ GET    /api/analytics/summary     → Dashboard statistics
└─ GET    /api/analytics/trends      → Waste trends
          ?days=7

Notifications
├─ GET    /api/notifications         → Fetch all notifications
├─ GET    /api/notifications/count   → Unread count
├─ PUT    /api/notifications/:id/read → Mark as read
├─ PUT    /api/notifications/:id/resolve → Mark as resolved
└─ DELETE /api/notifications/:id     → Delete notification

System
└─ GET    /health                    → Server health check
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                          │
└─────────────────────────────────────────────────────────────┘

Layer 1: Network Security
├─ HTTPS/TLS encryption
├─ CORS policy (specific origins)
├─ Rate limiting (100 req/15min)
└─ IP whitelisting (optional)

Layer 2: Application Security
├─ Helmet.js security headers
├─ JWT token authentication
├─ Password hashing (bcrypt, 10 rounds)
├─ Input validation
└─ SQL injection prevention (parameterized queries)

Layer 3: Database Security
├─ Connection pooling (limit connections)
├─ Read-only users for analytics
├─ Row-level security (optional)
├─ Encrypted connections (SSL)
└─ Regular backups

Layer 4: Access Control
├─ Role-based permissions (admin, viewer)
├─ JWT token expiration (24h)
├─ Session management
└─ Audit logging

Best Practices
├─ Environment variables (never commit .env)
├─ Strong JWT secrets (32+ chars)
├─ Password complexity requirements
├─ Regular security updates
└─ Monitoring and alerts
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 PRODUCTION DEPLOYMENT                       │
└─────────────────────────────────────────────────────────────┘

Option 1: Separate Services
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Vercel     │     │   Railway    │     │    Neon      │
│  (Frontend)  │────▶│  (Backend)   │────▶│ (PostgreSQL) │
│              │     │              │     │              │
│ yourdomain.  │     │ api.domain.  │     │ Cloud        │
│ com          │     │ com          │     │ Database     │
└──────────────┘     └──────────────┘     └──────────────┘

Option 2: Full Stack Platform
┌──────────────────────────────────────────────────────────┐
│                      RAILWAY                             │
│                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌────────────┐  │
│  │  Frontend   │    │  Backend    │    │ PostgreSQL │  │
│  │  Service    │───▶│  Service    │───▶│  Service   │  │
│  └─────────────┘    └─────────────┘    └────────────┘  │
│                                                          │
│  Auto-deployed from GitHub on push                      │
└──────────────────────────────────────────────────────────┘

Option 3: Self-Hosted (AWS/DigitalOcean)
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  CloudFront  │     │  EC2 + Nginx │     │  RDS/Managed │
│  (CDN)       │────▶│  (Server)    │────▶│  PostgreSQL  │
│              │     │              │     │              │
│  Static      │     │  PM2 + API   │     │  Dedicated   │
│  Assets      │     │  Server      │     │  Instance    │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

This architecture provides a complete, production-ready smart waste management system with:

✅ Real-time data updates
✅ Secure authentication
✅ Scalable database
✅ Fast analytics queries
✅ Automatic notifications
✅ Audit trail
✅ Easy deployment

**Ready to deploy? See `/QUICK_START_POSTGRESQL.md` to get started!**
