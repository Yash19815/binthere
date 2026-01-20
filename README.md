# Smart Dustbin Monitoring Dashboard

A web application for real-time monitoring of dustbin fill levels, showing an interactive dashboard and sending alerts when any bin reaches a critical threshold.

## Features

- Real-time visualization of dustbin fill levels (cards, charts, and maps).
- Configurable critical threshold (for example, alert when a bin is above 80% full).
- Visual alerts on the dashboard and optional notifications (email, SMS, or push) for critical bins.
- Historical data view for each bin (fill level trends over time).
- Role-based access (e.g., admin for configuration, operator for monitoring).

## Architecture

- Frontend: ReactJS single-page application consuming REST APIs.
- Backend API: Node.js/Express service running on AWS to expose bin data, authentication, and alert logic.
- Database: PostgreSQL storing bin metadata, sensor readings, and alert logs.
- IoT / Sensor Layer: Microcontroller (ESP8266/ESP32, Arduino, etc.) sending fill-level readings to the backend or cloud broker.
- Messaging (optional): MQTT or HTTP used for ingesting sensor data.

## Getting Started

### Prerequisites

- Node.js 18+ and npm (or yarn) installed for both frontend and backend.
- A running PostgreSQL database instance (local or cloud-hosted like AWS RDS, Neon, or Supabase).
- Sensor devices or a simulator that can POST or publish bin readings.

### Installation

1. Clone the repository.
2. For the backend:
   - Navigate to `src/backend/nodejs-express/`
   - Install dependencies: `npm install`
   - Create a `.env` file with your database credentials:
     ```env
     DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require
     JWT_SECRET=your-secret-key
     PORT=3001
     ```
3. For the frontend:
   - Go to the frontend folder.
   - Install dependencies with `npm install` or `yarn install`.
4. Configure environment variables:
   - Backend: See `src/backend/nodejs-express/.env` for all available options.
   - Frontend: include API base URL and any public configuration.

### Running the App

1. **Start PostgreSQL database** and ensure connection details match the backend `.env` configuration.

2. **Initialize the database** (first time only):
   ```bash
   cd src/backend/nodejs-express
   npm run migrate
   ```

3. **Start the backend API server**:
   ```bash
   cd src/backend/nodejs-express
   npm start
   ```
   Server will run on `http://localhost:3001`

4. **Start the frontend dev server**:
   ```bash
   npm run dev
   ```
   Dashboard will open at `http://localhost:5173`

5. **Test the API**:
   ```bash
   curl http://localhost:3001/health
   ```

**Default Login Credentials:**
- Email: `admin@binthere.com`
- Password: `admin123`
- ⚠️ Change these in production!

## Data Flow

- Dustbin sensors measure distance/level and compute the fill percentage.
- Each device periodically sends readings containing `binId`, `fillLevel`, `timestamp`, and optional `location`.
- The backend validates and stores readings in PostgreSQL, then updates cached latest status per bin.
- The ReactJS dashboard fetches current and historical data from the Node.js/Express backend to render charts, maps, and status cards.
- If `fillLevel` exceeds the configured critical threshold (80%), an alert is automatically created via database triggers and notifications are sent.

## Alert Logic

- A critical level threshold (default 80%) determines when a bin is marked as “Critical”.
- Optionally include hysteresis or debounce (for example, require several consecutive readings above threshold) to avoid false alerts.
- Alerts can trigger:
  - Dashboard status change (red highlight, warning icon).
  - Email/SMS/push notification to operators.

## API Endpoints

The backend exposes a comprehensive REST API running on `http://localhost:3001` (default).

### Base URL
```
http://localhost:3001
```

---

### 🏠 General Endpoints

#### Get API Information
```http
GET /
```

**Response:**
```json
{
  "message": "BinThere API Server",
  "version": "v1",
  "endpoints": {
    "health": "/health",
    "auth": "/api/auth",
    "dustbins": "/api/dustbins",
    "analytics": "/api/analytics",
    "notifications": "/api/notifications"
  }
}
```

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "database": "connected",
  "version": "v1"
}
```

---

### 🔐 Authentication Endpoints (`/api/auth`)

#### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "admin@binthere.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@binthere.com",
    "name": "Admin User",
    "role": "admin"
  },
  "message": "Login successful"
}
```

#### Register
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin"
  },
  "message": "Registration successful"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "admin@binthere.com",
    "name": "Admin User",
    "role": "admin",
    "created_at": "2024-01-15T08:00:00.000Z",
    "last_login": "2024-01-20T10:30:00.000Z"
  }
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 🗑️ Dustbin Endpoints (`/api/dustbins`)

#### Get All Dustbins
```http
GET /api/dustbins
```

**Response:**
```json
{
  "success": true,
  "dustbins": [
    {
      "id": "001",
      "name": "Dustbin #001",
      "location": "Central Park North",
      "overallFillLevel": 85,
      "wetWasteFillLevel": 78,
      "dryWasteFillLevel": 92,
      "batteryLevel": 85,
      "lastUpdated": "15 mins ago",
      "lastMaintenance": "3 days ago"
    }
  ]
}
```

#### Get Single Dustbin
```http
GET /api/dustbins/:id
```

**Example:** `GET /api/dustbins/001`

**Response:**
```json
{
  "success": true,
  "dustbin": {
    "id": "001",
    "name": "Dustbin #001",
    "location": "Central Park North",
    "overallFillLevel": 85,
    "wetWasteFillLevel": 78,
    "dryWasteFillLevel": 92,
    "batteryLevel": 85,
    "lastUpdated": "2024-01-20T10:30:00.000Z",
    "lastMaintenance": "2024-01-17T10:30:00.000Z"
  }
}
```

#### Add New Dustbin
```http
POST /api/dustbins
```

**Request Body:**
```json
{
  "location": "Downtown Plaza"
}
```

**Response:**
```json
{
  "success": true,
  "dustbin": {
    "id": "009",
    "name": "Dustbin #009",
    "location": "Downtown Plaza",
    "overallFillLevel": 0,
    "wetWasteFillLevel": 0,
    "dryWasteFillLevel": 0,
    "batteryLevel": 100,
    "lastUpdated": "0 mins ago",
    "lastMaintenance": "Just now"
  },
  "message": "Dustbin #009 added successfully"
}
```

#### Update Dustbin Location
```http
PUT /api/dustbins/:id
```

**Request Body:**
```json
{
  "location": "New Location Name"
}
```

**Response:**
```json
{
  "success": true,
  "dustbin": { /* updated dustbin data */ },
  "message": "Dustbin #001 updated successfully"
}
```

#### Update Fill Levels (IoT Endpoint)
```http
PUT /api/dustbins/:id/fill-level
```

**Request Body:**
```json
{
  "overallFillLevel": 85,
  "wetWasteFillLevel": 80,
  "dryWasteFillLevel": 90,
  "batteryLevel": 75
}
```

**Response:**
```json
{
  "success": true,
  "dustbin": { /* updated dustbin data */ },
  "message": "Fill levels updated successfully"
}
```

#### Delete Dustbins (Batch)
```http
DELETE /api/dustbins
```

**Request Body:**
```json
{
  "dustbinIds": ["003", "005"]
}
```

**Response:**
```json
{
  "success": true,
  "removed": ["003", "005"],
  "renumberedDustbins": [ /* remaining dustbins with new IDs */ ],
  "message": "2 dustbin(s) removed successfully"
}
```

---

### 📊 Analytics Endpoints (`/api/analytics`)

#### Get Analytics Data
```http
GET /api/analytics?period={period}&dustbinId={id}
```

**Query Parameters:**
- `period` (required): `last-week`, `last-month`, `month-0` to `month-11`
- `dustbinId` (optional): Filter by specific dustbin

**Example:** `GET /api/analytics?period=last-week&dustbinId=001`

**Response:**
```json
{
  "success": true,
  "period": "last-week",
  "dustbinId": "001",
  "data": [
    {
      "date": "Jan 14",
      "wetWaste": 65,
      "dryWaste": 72,
      "timestamp": "2024-01-14T00:00:00.000Z"
    }
  ]
}
```

#### Get Summary Statistics
```http
GET /api/analytics/summary
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "total_dustbins": 8,
    "critical_count": 2,
    "warning_count": 3,
    "normal_count": 3,
    "avg_fill_level": 62.50,
    "avg_battery_level": 78.25
  }
}
```

#### Get Waste Trends
```http
GET /api/analytics/trends?days={days}
```

**Query Parameters:**
- `days` (optional, default: 7): Number of days to analyze

**Example:** `GET /api/analytics/trends?days=30`

**Response:**
```json
{
  "success": true,
  "days": 30,
  "trends": [
    {
      "date": "2024-01-20",
      "avg_fill": 65,
      "avg_wet": 60,
      "avg_dry": 70,
      "active_dustbins": 8
    }
  ]
}
```

---

### 🔔 Notification Endpoints (`/api/notifications`)

#### Get All Notifications
```http
GET /api/notifications
```

**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "id": "uuid",
      "dustbinId": "001",
      "dustbinName": "Dustbin #001",
      "dustbinLocation": "Central Park North",
      "fillLevel": 85,
      "criticalTimestamp": 1705747800000,
      "isRead": false,
      "isResolved": false
    }
  ]
}
```

#### Get Unread Count
```http
GET /api/notifications/count
```

**Response:**
```json
{
  "success": true,
  "count": 3
}
```

#### Mark as Read
```http
PUT /api/notifications/:id/read
```

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

#### Mark as Resolved
```http
PUT /api/notifications/:id/resolve
```

**Request Body:**
```json
{
  "userId": "user-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification resolved successfully"
}
```

#### Delete Notification
```http
DELETE /api/notifications/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

### 📝 Notes

- All endpoints return JSON responses
- Authentication endpoints return JWT tokens valid for 24 hours
- Protected endpoints require `Authorization: Bearer {token}` header
- All timestamps are in ISO 8601 format
- HTTP status codes: 200 (success), 201 (created), 400 (bad request), 401 (unauthorized), 404 (not found), 500 (server error)

For more details, see `src/backend/nodejs-express/README.md`.

## Dashboard Views

- Overview: Cards summarizing number of bins, bins in warning/critical state, and last update time.
- Map View: Geographical distribution of bins colored by status (OK, Warning, Critical).
- Bin Detail: Per-bin history chart, last readings, and configuration (name, location, threshold).
- Alerts View: List and filter of past alerts with timestamps and resolution status.

## Configuration

- Thresholds can be changed globally or per bin via the admin settings panel.
- Notification channels (email, SMS, push) and providers can be configured via environment variables or an admin UI.
- Polling interval or WebSocket/MQTT subscription settings are configurable to balance freshness and load.

## Troubleshooting

### Database Connection Issues

**Error: "self-signed certificate in certificate chain"**
- The backend automatically handles SSL for AWS RDS and cloud databases
- If issues persist, check that your DATABASE_URL includes `?sslmode=require`

**Error: "password authentication failed"**
- Verify your database credentials in the `.env` file
- AWS RDS typically uses username `postgres` (not `postgresql`)
- Ensure the database `Binthere` exists, or create it first

**Database not initialized**
- Run `npm run migrate` to create all tables and seed initial data
- This will create 8 sample dustbins and a default admin user

### Port Conflicts
- Backend runs on port 3001 by default (change with `PORT` in `.env`)
- Frontend runs on port 5173 by default (Vite default)

## Technologies Used

- **Frontend:** ReactJS with Vite
- **Backend:** Node.js 18+ with Express.js
- **Database:** PostgreSQL (AWS RDS, Neon, Supabase, or self-hosted)
- **Authentication:** JWT (JSON Web Tokens) with bcrypt password hashing
- **Security:** Helmet.js, CORS, Rate Limiting
- **IoT:** ESP8266/ESP32/Arduino with ultrasonic sensor or similar for level detection
- **Cloud/Deployment:** AWS services (EC2, RDS for PostgreSQL, optional IoT Core or MQTT broker)

## Roadmap

- Add predictive fill-level forecasting using basic analytics or machine learning.
- Implement route optimization for collection trucks based on critical bins.
- Add multi-tenant support for different municipalities or organizations.

## License

Describe your chosen license here (for example, MIT, Apache-2.0, or proprietary), respecting all dependencies and third-party components.
