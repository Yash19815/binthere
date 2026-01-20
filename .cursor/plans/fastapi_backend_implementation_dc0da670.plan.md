---
name: FastAPI Backend Implementation
overview: Create a complete Python FastAPI backend for BinThere Smart Waste Management system with PostgreSQL database, JWT authentication, real-time IoT data handling, analytics, and notifications.
todos:
  - id: setup-project
    content: Create FastAPI project structure with folders and config files
    status: pending
  - id: database-models
    content: Create SQLAlchemy ORM models matching PostgreSQL schema
    status: pending
  - id: pydantic-schemas
    content: Define Pydantic schemas for request/response validation
    status: pending
  - id: auth-system
    content: Implement JWT authentication with bcrypt password hashing
    status: pending
  - id: dustbins-api
    content: Build dustbins CRUD endpoints with renumbering logic
    status: pending
  - id: analytics-api
    content: Implement analytics endpoints with time-series queries
    status: pending
  - id: notifications-api
    content: Create notifications endpoints for critical alerts
    status: pending
  - id: middleware-setup
    content: Configure CORS, rate limiting, and security middleware
    status: pending
  - id: testing-setup
    content: Set up pytest with async tests and test database
    status: pending
  - id: documentation
    content: Add README with setup instructions and API examples
    status: pending
---

# FastAPI Backend for BinThere

## Overview

Build a production-ready FastAPI backend to replace the existing Node.js backend at [`src/backend/nodejs-express`](src/backend/nodejs-express). The system manages smart dustbins with real-time monitoring, analytics, and critical alerts.

## Architecture Analysis

**Current System:**

- **Frontend**: React + TypeScript (Vite)
- **Backend**: Node.js/Express + PostgreSQL
- **Database**: PostgreSQL with triggers, views, and audit logs
- **Key Features**: 
  - Real-time IoT sensor data ingestion
  - JWT authentication
  - Analytics with time-series data
  - Critical notifications (≥80% fill level)
  - Automatic dustbin renumbering on deletion

**Target FastAPI Implementation:**

- Replace Node.js backend with Python FastAPI
- Maintain PostgreSQL schema compatibility
- Keep all existing API endpoints
- Add performance improvements (async operations)
- Enhanced real-time capabilities (WebSockets)

## Database Schema

Uses the existing PostgreSQL schema at [`src/database/postgresql-schema.sql`](src/database/postgresql-schema.sql):

- **users**: Admin authentication (bcrypt + JWT)
- **dustbins**: Master bin data (id, location, fill levels, battery)
- **dustbin_history**: Time-series analytics data
- **notifications**: Critical alerts (auto-created via trigger)
- **analytics_aggregates**: Pre-computed daily stats
- **audit_log**: CRUD operation tracking

## API Endpoints to Implement

### 1. Authentication (`/api/auth`)

- `POST /login` - Email/password → JWT token
- `POST /register` - Create new admin user
- `GET /me` - Get current user profile (protected)
- `POST /logout` - Logout (token invalidation)

### 2. Dustbins CRUD (`/api/dustbins`)

- `GET /dustbins` - List all active dustbins
- `GET /dustbins/{id}` - Get single dustbin details
- `POST /dustbins` - Add new dustbin (auto-generates ID)
- `PUT /dustbins/{id}` - Update dustbin location
- `DELETE /dustbins` - Batch delete + renumber remaining bins
- `PUT /dustbins/{id}/fill-level` - IoT endpoint for sensor updates

### 3. Analytics (`/api/analytics`)

- `GET /analytics` - Historical data (last-week, last-month, month-0 to month-11)
  - Query params: `period`, `dustbinId` (optional)
- `GET /analytics/summary` - Dashboard stats (total bins, critical count, averages)
- `GET /analytics/trends` - Waste trends over X days

### 4. Notifications (`/api/notifications`)

- `GET /notifications` - Get unresolved critical alerts
- `GET /notifications/count` - Unread notification count
- `PUT /notifications/{id}/read` - Mark as read
- `PUT /notifications/{id}/resolve` - Mark as resolved
- `DELETE /notifications/{id}` - Delete notification

### 5. Health Check

- `GET /health` - Server + DB status check

## Technology Stack

```mermaid
graph LR
    Frontend[React Frontend] --> API[FastAPI Backend]
    API --> DB[(PostgreSQL)]
    API --> Auth[JWT Tokens]
    IoT[IoT Sensors] --> API
    API --> WS[WebSocket Real-time]
```

**Core Dependencies:**

- **FastAPI** - Web framework
- **Uvicorn** - ASGI server
- **SQLAlchemy 2.0** - Async ORM
- **Asyncpg** - PostgreSQL async driver
- **Pydantic** - Data validation
- **python-jose** - JWT handling
- **passlib + bcrypt** - Password hashing
- **python-multipart** - Form data
- **python-dotenv** - Environment config
- **slowapi** - Rate limiting
- **python-cors** - CORS middleware

**Development Dependencies:**

- **Alembic** - Database migrations
- **pytest** - Testing
- **pytest-asyncio** - Async tests
- **httpx** - API testing

## Project Structure

```
src/backend/fastapi/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app + middleware
│   ├── config.py               # Environment configuration
│   ├── database.py             # SQLAlchemy setup + async session
│   ├── models/                 # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── dustbin.py
│   │   ├── notification.py
│   │   └── analytics.py
│   ├── schemas/                # Pydantic request/response models
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── dustbin.py
│   │   ├── notification.py
│   │   └── analytics.py
│   ├── api/                    # Route handlers
│   │   ├── __init__.py
│   │   ├── deps.py             # Dependency injection (auth, DB)
│   │   ├── auth.py
│   │   ├── dustbins.py
│   │   ├── analytics.py
│   │   └── notifications.py
│   ├── core/                   # Core utilities
│   │   ├── __init__.py
│   │   ├── security.py         # JWT + password hashing
│   │   └── exceptions.py       # Custom exceptions
│   └── utils/                  # Helper functions
│       ├── __init__.py
│       └── logger.py
├── alembic/                    # Database migrations
│   ├── versions/
│   └── env.py
├── tests/
│   ├── __init__.py
│   ├── test_auth.py
│   ├── test_dustbins.py
│   └── test_analytics.py
├── .env.example
├── requirements.txt
├── alembic.ini
└── README.md
```

## Key Implementation Details

### 1. Authentication Flow

- Bcrypt password hashing (compatible with Node.js bcryptjs)
- JWT tokens with HS256 algorithm
- Bearer token in Authorization header
- Middleware dependency injection for protected routes

### 2. Database Design

- Async SQLAlchemy 2.0 with asyncpg driver
- Reuse existing PostgreSQL schema (no migration needed)
- Database triggers handle:
  - Auto-create notifications when fill level ≥ 80%
  - Log fill level changes to history table
  - Update timestamps automatically

### 3. IoT Data Ingestion

- `/dustbins/{id}/fill-level` endpoint for sensors
- Validates fill levels (0-100%)
- Automatic notification creation via DB trigger
- Historical data logging
- Optional: WebSocket broadcast for real-time updates

### 4. Analytics Processing

- Time-series queries on `dustbin_history` table
- Dynamic date range calculation (last-week, month-X)
- Per-dustbin or system-wide aggregation
- Pre-aggregated data in `analytics_aggregates` table

### 5. Real-Time Features (Optional Enhancement)

- WebSocket endpoint: `/ws/dustbins`
- Broadcast fill level updates to connected clients
- Notification alerts pushed to frontend

### 6. Security Features

- Rate limiting (100 requests per 15 minutes)
- CORS configuration
- Helmet-style security headers
- Input validation via Pydantic
- SQL injection prevention (parameterized queries)
- Password requirements (min 8 chars)

### 7. Error Handling

- Global exception handlers
- Structured error responses
- Request logging with correlation IDs
- Development vs. production error detail levels

## Environment Configuration

Required environment variables:

```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/binthere

# Security
JWT_SECRET=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRES_IN_MINUTES=1440

# Server
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_MAX_REQUESTS=100

# Environment
ENVIRONMENT=development
LOG_LEVEL=info
```

## Data Flow Diagram

```mermaid
sequenceDiagram
    participant IoT as IoT Sensor
    participant API as FastAPI Backend
    participant DB as PostgreSQL
    participant Frontend as React App
    
    IoT->>API: PUT /dustbins/001/fill-level
    API->>DB: UPDATE dustbins SET fill_level=85
    DB->>DB: Trigger: Create notification (≥80%)
    DB->>DB: Trigger: Log to dustbin_history
    DB-->>API: Updated dustbin data
    API-->>IoT: 200 OK
    
    Frontend->>API: GET /notifications
    API->>DB: Query notifications table
    DB-->>API: Critical alerts
    API-->>Frontend: JSON response
    
    Frontend->>API: GET /analytics?period=last-week
    API->>DB: Query dustbin_history
    DB-->>API: Historical data
    API-->>Frontend: Chart data
```

## Migration Strategy

1. **Parallel Deployment**: Run FastAPI alongside Node.js
2. **Test with Frontend**: Point Vite env var to FastAPI port
3. **Validate**: Ensure identical API responses
4. **Switch**: Update `VITE_AWS_API_GATEWAY_URL`
5. **Monitor**: Check logs and error rates

## Testing Strategy

- Unit tests for auth, CRUD operations
- Integration tests for API endpoints
- Database transaction tests
- Mock IoT sensor data injection
- Load testing for concurrent sensor updates

## Performance Optimizations

- Async database operations (concurrent queries)
- Database connection pooling
- Pre-aggregated analytics data
- Index optimization on frequently queried fields
- Response caching for analytics (optional)
- Batch insert for historical data

## Documentation

- Auto-generated Swagger UI at `/docs`
- ReDoc at `/redoc`
- OpenAPI 3.0 schema at `/openapi.json`
- README with setup instructions
- API endpoint examples

## Deployment Considerations

- **Development**: `uvicorn app.main:app --reload`
- **Production**: Gunicorn + Uvicorn workers
- **Docker**: Multi-stage build with Python 3.11+
- **AWS**: EC2, ECS, Lambda (Mangum adapter), or App Runner
- **Database**: Use existing PostgreSQL (Neon, Railway, RDS)
- **Environment**: `.env` file or secrets manager

## Advantages Over Node.js Backend

1. **Performance**: Async operations, faster JSON serialization
2. **Type Safety**: Pydantic models catch errors at runtime
3. **Documentation**: Auto-generated interactive API docs
4. **Python Ecosystem**: Easy ML/AI integration for predictive analytics
5. **Cleaner Code**: Less boilerplate, dependency injection
6. **Testing**: Excellent async test support