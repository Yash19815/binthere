# Smart Dustbin Monitoring Dashboard

A web application for real-time monitoring of dustbin fill levels, showing an interactive dashboard and sending alerts when any bin reaches a critical threshold.

## Features

- Real-time visualization of dustbin fill levels (cards, charts, and maps).
- Configurable critical threshold (for example, alert when a bin is above 80% full).
- Visual alerts on the dashboard and optional notifications (email, SMS, or push) for critical bins.
- Historical data view for each bin (fill level trends over time).
- Role-based access (e.g., admin for configuration, operator for monitoring).

## Architecture

- Frontend: ReactJS single-page application consuming REST/GraphQL APIs.
- Backend API: Python service (for example, Flask or FastAPI) running on AWS to expose bin data, authentication, and alert logic.
- Database: PostgreSQL storing bin metadata, sensor readings, and alert logs.
- IoT / Sensor Layer: Microcontroller (ESP8266/ESP32, Arduino, etc.) sending fill-level readings to the backend or cloud broker.
- Messaging (optional): MQTT or HTTP used for ingesting sensor data.

## Getting Started

### Prerequisites

- Node.js and npm (or yarn) installed for the React frontend.
- Python 3 and a virtual environment tool for the backend.
- A running PostgreSQL database instance.
- Sensor devices or a simulator that can POST or publish bin readings.

### Installation

1. Clone the repository.
2. For the backend:
   - Go to the backend folder.
   - Create and activate a Python virtual environment.
   - Install dependencies (for example, `pip install -r requirements.txt`).
3. For the frontend:
   - Go to the frontend folder.
   - Install dependencies with `npm install` or `yarn install`.
4. Create an `.env` file:
   - Backend: include database URL, AWS credentials, and other secrets.
   - Frontend: include API base URL and any public configuration.

### Running the App

1. Start the PostgreSQL database and ensure connection details match the backend configuration.
2. Start the backend API server (for example, `uvicorn main:app --reload` or `flask run`).
3. Start the frontend dev server (for example, `npm start` or `npm run dev` in the frontend directory).
4. Open the dashboard in a browser (usually `http://localhost:3000` or similar).

## Data Flow

- Dustbin sensors measure distance/level and compute the fill percentage.
- Each device periodically sends readings containing `binId`, `fillLevel`, `timestamp`, and optional `location`.
- The backend validates and stores readings in PostgreSQL, then updates cached latest status per bin.
- The ReactJS dashboard fetches current and historical data from the Python backend to render charts, maps, and status cards.
- If `fillLevel` exceeds the configured critical threshold, an alert is created and notifications are sent.

## Alert Logic

- A critical level threshold (default 80%) determines when a bin is marked as “Critical”.
- Optionally include hysteresis or debounce (for example, require several consecutive readings above threshold) to avoid false alerts.
- Alerts can trigger:
  - Dashboard status change (red highlight, warning icon).
  - Email/SMS/push notification to operators.

## Dashboard Views

- Overview: Cards summarizing number of bins, bins in warning/critical state, and last update time.
- Map View: Geographical distribution of bins colored by status (OK, Warning, Critical).
- Bin Detail: Per-bin history chart, last readings, and configuration (name, location, threshold).
- Alerts View: List and filter of past alerts with timestamps and resolution status.

## Configuration

- Thresholds can be changed globally or per bin via the admin settings panel.
- Notification channels (email, SMS, push) and providers can be configured via environment variables or an admin UI.
- Polling interval or WebSocket/MQTT subscription settings are configurable to balance freshness and load.

## Technologies Used

- Frontend: ReactJS.
- Backend: Python (for example, Flask or FastAPI) deployed on AWS.
- Database: PostgreSQL.
- IoT: ESP8266/ESP32/Arduino with ultrasonic sensor or similar for level detection.
- Messaging/Cloud: AWS services (for example, API Gateway, Lambda or EC2, RDS for PostgreSQL, and optional IoT Core or MQTT broker).

## Roadmap

- Add predictive fill-level forecasting using basic analytics or machine learning.
- Implement route optimization for collection trucks based on critical bins.
- Add multi-tenant support for different municipalities or organizations.

## License

Describe your chosen license here (for example, MIT, Apache-2.0, or proprietary), respecting all dependencies and third-party components.
