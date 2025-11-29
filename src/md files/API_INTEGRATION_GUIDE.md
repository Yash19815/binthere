# BinThere - AWS API Integration Guide

## 📋 Overview

This guide explains how to connect your BinThere frontend application to AWS backend services. The application is designed to work with AWS IoT Core for sensor data and AWS API Gateway + Lambda for REST API operations.

---

## 🏗️ Architecture Diagram

```
┌─────────────────┐
│  Dustbin IoT    │ (Wet/Dry Sensors)
│    Devices      │
└────────┬────────┘
         │ MQTT (AWS IoT Core)
         ↓
┌─────────────────────────────────────────────────┐
│           AWS IoT Core                          │
│  - Receives sensor data (fill levels)          │
│  - Triggers Lambda on new readings             │
└────────┬────────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────────────┐
│         AWS Lambda Functions                    │
│  - Process IoT data                             │
│  - Calculate overall fill levels                │
│  - Generate notifications for ≥80%             │
│  - Handle CRUD operations                       │
└────────┬────────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────────────┐
│          Amazon DynamoDB                        │
│  Tables:                                        │
│  - Dustbins (current state)                     │
│  - AnalyticsHistory (time-series data)          │
│  - Notifications (critical alerts)              │
└────────┬────────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────────────┐
│         AWS API Gateway                         │
│  Endpoints:                                     │
│  - GET    /dustbins                             │
│  - POST   /dustbins                             │
│  - PUT    /dustbins/{id}                        │
│  - DELETE /dustbins                             │
│  - GET    /analytics                            │
│  - GET    /notifications                        │
└────────┬────────────────────────────────────────┘
         │ HTTPS
         ↓
┌─────────────────────────────────────────────────┐
│     BinThere React Frontend                     │
│  (/services/api.ts)                             │
└─────────────────────────────────────────────────┘
```

---

## 🔑 API Keys & Credentials

### **Frontend Credentials** (Required)

| Credential | Purpose | Where to Store | Used By |
|------------|---------|----------------|---------|
| **AWS API Gateway URL** | Base URL for all API calls | `.env` → `VITE_AWS_API_GATEWAY_URL` | All API functions |
| **API Key** (optional) | Authenticate API requests | `.env` → `VITE_AWS_API_KEY` | HTTP header: `x-api-key` |

### **Backend Credentials** (AWS Lambda Only - NOT in frontend)

| Credential | Purpose | Where to Store |
|------------|---------|----------------|
| **AWS Access Key ID** | Lambda access to AWS services | Lambda environment variables |
| **AWS Secret Access Key** | Lambda authentication | Lambda environment variables |
| **DynamoDB Table Names** | Database table references | Lambda environment variables |
| **IoT Endpoint** | AWS IoT Core connection | Lambda environment variables |

### **IoT Device Credentials** (Hardware Only)

| Credential | Purpose | Where to Store |
|------------|---------|----------------|
| **Device Certificate** | IoT device authentication | Embedded in sensor hardware |
| **Private Key** | IoT device encryption | Embedded in sensor hardware |
| **Root CA Certificate** | AWS IoT Core trust chain | Embedded in sensor hardware |

---

## 🔌 API Endpoints & Operations

### **1. GET /dustbins** - Fetch All Dustbins

**Frontend Function:** `fetchDustbins()`

**AWS Lambda Operation:**
```
1. Query DynamoDB "Dustbins" table
2. Return all dustbin records with current fill levels
3. Include criticalTimestamp for bins ≥80% full
```

**Request:**
```http
GET /dustbins HTTP/1.1
Host: {api-id}.execute-api.{region}.amazonaws.com
x-api-key: {your-api-key}
```

**Response:**
```json
{
  "dustbins": [
    {
      "id": "001",
      "name": "Dustbin #001",
      "location": "Central Park North",
      "overallFillLevel": 85,
      "wetWasteFillLevel": 78,
      "dryWasteFillLevel": 92,
      "lastUpdated": "2025-10-27T10:35:00Z",
      "batteryLevel": 85,
      "lastMaintenance": "2025-10-24T08:00:00Z",
      "criticalTimestamp": 1729854900000
    }
  ]
}
```

**DynamoDB Query:**
```javascript
const params = {
  TableName: 'BinThere-Dustbins',
};
await dynamoDB.scan(params);
```

---

### **2. POST /dustbins** - Add New Dustbin

**Frontend Function:** `addDustbin(location)`

**AWS Lambda Operation:**
```
1. Generate new dustbin ID (auto-increment)
2. Create DynamoDB record with 0% initial fill
3. Optionally register IoT device certificate
4. Return new dustbin object
```

**Request:**
```http
POST /dustbins HTTP/1.1
Content-Type: application/json

{
  "location": "City Hall Plaza"
}
```

**Response:**
```json
{
  "success": true,
  "dustbin": {
    "id": "009",
    "name": "Dustbin #009",
    "location": "City Hall Plaza",
    "overallFillLevel": 0,
    "wetWasteFillLevel": 0,
    "dryWasteFillLevel": 0,
    "lastUpdated": "2025-10-27T10:40:00Z"
  },
  "message": "Dustbin added successfully"
}
```

---

### **3. PUT /dustbins/{id}** - Update Dustbin Location

**Frontend Function:** `updateDustbin(id, location)`

**AWS Lambda Operation:**
```
1. Query DynamoDB for dustbin by ID
2. Update only the location field
3. Return updated dustbin object
```

**Request:**
```http
PUT /dustbins/001 HTTP/1.1
Content-Type: application/json

{
  "location": "New Location Name"
}
```

---

### **4. DELETE /dustbins** - Remove Dustbins

**Frontend Function:** `removeDustbins(dustbinIds)`

**AWS Lambda Operation:**
```
1. Delete specified dustbins from DynamoDB
2. Renumber remaining dustbins sequentially (001, 002, 003...)
3. Deregister IoT devices (if applicable)
4. Return renumbered dustbin list
```

**Request:**
```http
DELETE /dustbins HTTP/1.1
Content-Type: application/json

{
  "dustbinIds": ["005", "007"]
}
```

**Response:**
```json
{
  "success": true,
  "removed": ["005", "007"],
  "renumberedDustbins": [ /* updated list */ ],
  "message": "2 dustbins removed and renumbered"
}
```

---

### **5. GET /analytics** - Fetch Graph Data

**Frontend Function:** `fetchAnalyticsData(period, dustbinId?)`

**AWS Lambda Operation:**
```
1. Query DynamoDB "AnalyticsHistory" table
2. Filter by time period (last-week, last-month, specific month)
3. Optionally filter by specific dustbin ID
4. Aggregate daily fill counts (wet vs dry)
5. Return time-series data
```

**Request:**
```http
GET /analytics?period=last-week&dustbinId=001 HTTP/1.1
```

**Response:**
```json
{
  "period": "last-week",
  "dustbinId": "001",
  "data": [
    {
      "date": "Oct 21",
      "wetWaste": 5,
      "dryWaste": 4,
      "timestamp": "2025-10-21T00:00:00Z"
    },
    {
      "date": "Oct 22",
      "wetWaste": 6,
      "dryWaste": 5,
      "timestamp": "2025-10-22T00:00:00Z"
    }
  ]
}
```

**Query Parameters:**
- `period`: `"last-week"`, `"last-month"`, or `"month-0"` to `"month-11"`
- `dustbinId`: Optional specific dustbin (omit for aggregated data)

---

### **6. GET /notifications** - Fetch Critical Alerts

**Frontend Function:** `fetchNotifications()`

**AWS Lambda Operation:**
```
1. Query DynamoDB for dustbins with fillLevel ≥ 80%
2. Sort by criticalTimestamp (newest first)
3. Return notification objects
```

**Request:**
```http
GET /notifications HTTP/1.1
```

**Response:**
```json
{
  "notifications": [
    {
      "id": "001",
      "dustbinName": "Dustbin #001",
      "dustbinLocation": "Central Park North",
      "fillLevel": 85,
      "timestamp": "2025-10-27T10:35:00Z",
      "criticalTimestamp": 1729854900000
    }
  ]
}
```

---

## 🗄️ DynamoDB Table Schemas

### **Table: BinThere-Dustbins**

```javascript
{
  id: "001",                          // Partition Key (String)
  name: "Dustbin #001",
  location: "Central Park North",
  overallFillLevel: 85,
  wetWasteFillLevel: 78,
  dryWasteFillLevel: 92,
  lastUpdated: "2025-10-27T10:35:00Z",
  criticalTimestamp: 1729854900000,  // TTL Index for auto-cleanup
  deviceId: "iot-device-001",        // IoT Core Thing Name
  batteryLevel: 85,
  sensorStatus: "active"
}
```

### **Table: BinThere-AnalyticsHistory**

```javascript
{
  dustbinId: "001",                  // Partition Key (String)
  timestamp: "2025-10-21T00:00:00Z", // Sort Key (String)
  date: "Oct 21",
  wetWasteFillCount: 5,
  dryWasteFillCount: 4,
  totalFillCount: 9
}
```

---

## 🛠️ Setup Instructions

### **Step 1: Configure Environment Variables**

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your AWS API Gateway URL:
   ```env
   VITE_AWS_API_GATEWAY_URL=https://abc123.execute-api.us-east-1.amazonaws.com/prod
   ```

3. (Optional) Add API Key if enabled:
   ```env
   VITE_AWS_API_KEY=your-api-key-here
   ```

### **Step 2: Test API Connection**

The `/services/api.ts` file includes a mock data fallback. To test:

```typescript
import api, { isUsingMockData } from './services/api';

// Check if using real AWS or mock data
console.log('Using mock data:', isUsingMockData);

// Fetch dustbins
const dustbins = await api.fetchDustbins();
console.log('Dustbins:', dustbins);
```

### **Step 3: Replace Mock Data in Components**

Once AWS is configured, update your components to use the API:

**Example: App.tsx**
```typescript
import { useEffect, useState } from 'react';
import api from './services/api';
import type { Dustbin } from './services/api';

function App() {
  const [dustbins, setDustbins] = useState<Dustbin[]>([]);
  
  useEffect(() => {
    loadDustbins();
  }, []);
  
  async function loadDustbins() {
    try {
      const data = await api.fetchDustbins();
      setDustbins(data);
    } catch (error) {
      console.error('Failed to fetch dustbins:', error);
      // Handle error (show toast, etc.)
    }
  }
  
  return (
    // Your components
  );
}
```

---

## 🔄 IoT Data Flow

### **How Sensor Data Reaches Frontend:**

```
1. IoT Sensor detects fill level change
   ↓
2. Publishes MQTT message to AWS IoT Core
   Topic: "binthere/dustbin/{deviceId}/data"
   ↓
3. IoT Rule triggers Lambda function
   ↓
4. Lambda calculates overallFillLevel = (wet + dry) / 2
   ↓
5. Lambda updates DynamoDB "Dustbins" table
   ↓
6. If fillLevel ≥ 80%, create notification record
   ↓
7. Frontend polls GET /dustbins every 30 seconds
   OR uses WebSocket for real-time updates
```

### **Sample IoT MQTT Payload:**

```json
{
  "deviceId": "001",
  "wetWasteFillLevel": 78,
  "dryWasteFillLevel": 92,
  "timestamp": "2025-10-27T10:35:00Z",
  "batteryLevel": 85,
  "sensorStatus": "active"
}
```

---

## 🚀 Next Steps

1. ✅ **Set up AWS API Gateway** with the 6 endpoints listed above
2. ✅ **Create Lambda functions** to handle each endpoint
3. ✅ **Configure DynamoDB tables** with proper indexes
4. ✅ **Set up IoT Core** for sensor device management (if using hardware)
5. ✅ **Update `.env`** with your actual AWS credentials
6. ✅ **Integrate API calls** into your React components

---

## 📞 Support

For AWS setup questions:
- AWS IoT Core: https://docs.aws.amazon.com/iot/
- API Gateway: https://docs.aws.amazon.com/apigateway/
- Lambda Functions: https://docs.aws.amazon.com/lambda/
- DynamoDB: https://docs.aws.amazon.com/dynamodb/

---

## 📝 Notes

- **Security**: Never commit `.env` file to version control
- **CORS**: Ensure API Gateway has CORS enabled for your frontend domain
- **Rate Limiting**: Consider implementing rate limiting on API Gateway
- **Monitoring**: Use CloudWatch for Lambda logs and API Gateway metrics
- **Costs**: Monitor AWS usage to avoid unexpected charges

---

**Last Updated:** October 27, 2025
