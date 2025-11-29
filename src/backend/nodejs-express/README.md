# BinThere Backend API

Express.js + PostgreSQL backend for the BinThere Smart Waste Management system.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# 3. Run database migration
npm run migrate

# 4. Start server
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Dustbins
- `GET /api/dustbins` - Fetch all dustbins
- `GET /api/dustbins/:id` - Fetch single dustbin
- `POST /api/dustbins` - Add new dustbin
- `PUT /api/dustbins/:id` - Update dustbin location
- `DELETE /api/dustbins` - Remove dustbins
- `PUT /api/dustbins/:id/fill-level` - Update fill levels (IoT endpoint)

### Analytics
- `GET /api/analytics?period=last-week&dustbinId=001` - Fetch analytics data
- `GET /api/analytics/summary` - Fetch summary statistics
- `GET /api/analytics/trends?days=7` - Fetch waste trends

### Notifications
- `GET /api/notifications` - Fetch all critical notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/:id/resolve` - Mark as resolved
- `DELETE /api/notifications/:id` - Delete notification
- `GET /api/notifications/count` - Get unread count

### Health Check
- `GET /health` - Server health status

## Environment Variables

See `.env.example` for all configuration options.

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `CORS_ORIGIN` - Frontend URL(s) for CORS

## Development

```bash
# Development mode with auto-reload
npm run dev

# Run migration
npm run migrate

# Production mode
npm start
```

## Database

See `/backend/POSTGRESQL_SETUP_GUIDE.md` for complete database setup instructions including:
- Self-hosted PostgreSQL setup
- Cloud service configurations (Neon, Railway, Render, Supabase, etc.)
- Schema details and migrations
- Production deployment

## Testing

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test dustbins endpoint
curl http://localhost:3001/api/dustbins

# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@binthere.com","password":"admin123"}'
```

## Project Structure

```
nodejs-express/
├── config/
│   └── database.js          # PostgreSQL connection
├── routes/
│   ├── auth.js              # Authentication endpoints
│   ├── dustbins.js          # Dustbin CRUD endpoints
│   ├── analytics.js         # Analytics endpoints
│   └── notifications.js     # Notification endpoints
├── scripts/
│   └── migrate.js           # Database migration script
├── .env.example             # Environment template
├── package.json             # Dependencies
└── server.js                # Main server file
```

## Default Credentials

**Email:** `admin@binthere.com`  
**Password:** `admin123`

⚠️ **Change these immediately in production!**

## License

MIT
