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

The backend exposes the following REST API endpoints:

- **Authentication:** `/api/auth/login`, `/api/auth/register`, `/api/auth/me`
- **Dustbins:** `/api/dustbins` (GET, POST, PUT, DELETE)
- **Analytics:** `/api/analytics`, `/api/analytics/summary`, `/api/analytics/trends`
- **Notifications:** `/api/notifications` (GET, PUT, DELETE)
- **Health Check:** `/health`

See `src/backend/nodejs-express/README.md` for complete API documentation.

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
