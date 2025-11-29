# BinThere - DynamoDB Database Schema

## 📊 Overview

This document defines the DynamoDB table structures for the BinThere smart waste management system.

---

## 🗄️ Table 1: Dustbins

**Table Name:** `BinThere-Dustbins`

**Purpose:** Stores current state of all dustbins with real-time fill levels

### Primary Key Structure
- **Partition Key:** `id` (String) - Dustbin ID (e.g., "001", "002")
- **No Sort Key** - Each dustbin has a unique ID

### Attributes

| Attribute Name | Type | Required | Description | Example |
|----------------|------|----------|-------------|---------|
| `id` | String | ✅ | Unique dustbin identifier | "001" |
| `name` | String | ✅ | Display name | "Dustbin #001" |
| `location` | String | ✅ | Physical location | "Central Park North" |
| `overallFillLevel` | Number | ✅ | Overall fill percentage (0-100) | 85 |
| `wetWasteFillLevel` | Number | ✅ | Wet waste fill % (0-100) | 78 |
| `dryWasteFillLevel` | Number | ✅ | Dry waste fill % (0-100) | 92 |
| `lastUpdated` | String | ✅ | ISO 8601 timestamp | "2025-10-27T10:35:00Z" |
| `criticalTimestamp` | Number | ❌ | Unix timestamp when ≥80% | 1729854900000 |
| `deviceId` | String | ❌ | IoT device/thing name | "iot-device-001" |
| `batteryLevel` | Number | ❌ | Sensor battery % (0-100) | 85 |
| `sensorStatus` | String | ❌ | "active", "inactive", "error" | "active" |
| `latitude` | Number | ❌ | GPS latitude | 40.7829 |
| `longitude` | Number | ❌ | GPS longitude | -73.9654 |
| `installDate` | String | ❌ | Installation date | "2025-01-15" |
| `lastMaintenance` | String | ❌ | Last maintenance date | "2025-10-01" |
| `createdAt` | String | ✅ | Record creation timestamp | "2025-01-15T08:00:00Z" |
| `updatedAt` | String | ✅ | Last update timestamp | "2025-10-27T10:35:00Z" |

### Global Secondary Indexes (GSI)

#### GSI-1: CriticalDustbins
**Purpose:** Query all critical dustbins (≥80% full) for notifications

- **Partition Key:** `criticalStatus` (String) - "CRITICAL" or "NORMAL"
- **Sort Key:** `criticalTimestamp` (Number) - Unix timestamp
- **Projected Attributes:** ALL

**Use Case:**
```javascript
// Query all critical dustbins sorted by when they became critical
const params = {
  TableName: 'BinThere-Dustbins',
  IndexName: 'CriticalDustbins',
  KeyConditionExpression: 'criticalStatus = :status',
  ExpressionAttributeValues: {
    ':status': 'CRITICAL'
  },
  ScanIndexForward: false // Newest first
};
```

#### GSI-2: LocationIndex
**Purpose:** Query dustbins by location

- **Partition Key:** `location` (String)
- **Sort Key:** `id` (String)
- **Projected Attributes:** ALL

### Sample Item

```json
{
  "id": "001",
  "name": "Dustbin #001",
  "location": "Central Park North",
  "overallFillLevel": 85,
  "wetWasteFillLevel": 78,
  "dryWasteFillLevel": 92,
  "lastUpdated": "2025-10-27T10:35:00Z",
  "criticalTimestamp": 1729854900000,
  "criticalStatus": "CRITICAL",
  "deviceId": "iot-device-001",
  "batteryLevel": 85,
  "sensorStatus": "active",
  "latitude": 40.7829,
  "longitude": -73.9654,
  "installDate": "2025-01-15",
  "lastMaintenance": "2025-10-01",
  "createdAt": "2025-01-15T08:00:00Z",
  "updatedAt": "2025-10-27T10:35:00Z"
}
```

---

## 🗄️ Table 2: AnalyticsHistory

**Table Name:** `BinThere-AnalyticsHistory`

**Purpose:** Stores historical fill count data for analytics graphs

### Primary Key Structure
- **Partition Key:** `compositeKey` (String) - Format: "dustbinId#period" (e.g., "001#2025-10", "ALL#2025-10")
- **Sort Key:** `timestamp` (String) - ISO 8601 date (e.g., "2025-10-21")

### Attributes

| Attribute Name | Type | Required | Description | Example |
|----------------|------|----------|-------------|---------|
| `compositeKey` | String | ✅ | Partition key: "dustbinId#period" | "001#2025-10" |
| `timestamp` | String | ✅ | ISO date string (YYYY-MM-DD) | "2025-10-21" |
| `dustbinId` | String | ✅ | Dustbin ID or "ALL" for aggregated | "001" |
| `period` | String | ✅ | Year-month (YYYY-MM) | "2025-10" |
| `date` | String | ✅ | Human-readable date | "Oct 21" |
| `wetWasteFillCount` | Number | ✅ | Number of times wet waste filled | 5 |
| `dryWasteFillCount` | Number | ✅ | Number of times dry waste filled | 4 |
| `totalFillCount` | Number | ✅ | Total fill events | 9 |
| `avgWetFillLevel` | Number | ❌ | Average wet waste % for day | 75 |
| `avgDryFillLevel` | Number | ❌ | Average dry waste % for day | 68 |
| `maxWetFillLevel` | Number | ❌ | Peak wet waste % | 92 |
| `maxDryFillLevel` | Number | ❌ | Peak dry waste % | 85 |
| `emptyingEvents` | Number | ❌ | Number of times emptied | 2 |
| `createdAt` | String | ✅ | Record creation timestamp | "2025-10-21T23:59:59Z" |

### Global Secondary Indexes (GSI)

#### GSI-1: PeriodIndex
**Purpose:** Query all dustbins for a specific time period

- **Partition Key:** `period` (String) - "2025-10"
- **Sort Key:** `timestamp` (String)
- **Projected Attributes:** ALL

**Use Case:**
```javascript
// Get all dustbin data for October 2025
const params = {
  TableName: 'BinThere-AnalyticsHistory',
  IndexName: 'PeriodIndex',
  KeyConditionExpression: 'period = :period',
  ExpressionAttributeValues: {
    ':period': '2025-10'
  }
};
```

### Sample Items

```json
// Individual dustbin data
{
  "compositeKey": "001#2025-10",
  "timestamp": "2025-10-21",
  "dustbinId": "001",
  "period": "2025-10",
  "date": "Oct 21",
  "wetWasteFillCount": 5,
  "dryWasteFillCount": 4,
  "totalFillCount": 9,
  "avgWetFillLevel": 75,
  "avgDryFillLevel": 68,
  "maxWetFillLevel": 92,
  "maxDryFillLevel": 85,
  "emptyingEvents": 2,
  "createdAt": "2025-10-21T23:59:59Z"
}

// Aggregated data (all dustbins combined)
{
  "compositeKey": "ALL#2025-10",
  "timestamp": "2025-10-21",
  "dustbinId": "ALL",
  "period": "2025-10",
  "date": "Oct 21",
  "wetWasteFillCount": 40,
  "dryWasteFillCount": 35,
  "totalFillCount": 75,
  "createdAt": "2025-10-21T23:59:59Z"
}
```

---

## 🗄️ Table 3: IoTSensorLogs (Optional)

**Table Name:** `BinThere-IoTSensorLogs`

**Purpose:** Raw sensor data logs for troubleshooting and detailed analysis

### Primary Key Structure
- **Partition Key:** `deviceId` (String) - IoT device ID
- **Sort Key:** `timestamp` (Number) - Unix timestamp

### Attributes

| Attribute Name | Type | Required | Description | Example |
|----------------|------|----------|-------------|---------|
| `deviceId` | String | ✅ | IoT device identifier | "iot-device-001" |
| `timestamp` | Number | ✅ | Unix timestamp (milliseconds) | 1729854900000 |
| `dustbinId` | String | ✅ | Associated dustbin ID | "001" |
| `wetWasteFillLevel` | Number | ✅ | Wet waste sensor reading | 78 |
| `dryWasteFillLevel` | Number | ✅ | Dry waste sensor reading | 92 |
| `batteryLevel` | Number | ❌ | Battery percentage | 85 |
| `sensorStatus` | String | ❌ | Sensor health status | "active" |
| `temperature` | Number | ❌ | Ambient temperature (°C) | 25.5 |
| `humidity` | Number | ❌ | Humidity percentage | 60 |
| `signalStrength` | Number | ❌ | WiFi/cellular signal (dBm) | -65 |
| `ttl` | Number | ✅ | Auto-delete after 90 days | 1737590900 |

### Time-to-Live (TTL)
- **TTL Attribute:** `ttl`
- **Purpose:** Automatically delete logs older than 90 days to reduce costs
- **Configuration:** Enable TTL on the `ttl` attribute

### Sample Item

```json
{
  "deviceId": "iot-device-001",
  "timestamp": 1729854900000,
  "dustbinId": "001",
  "wetWasteFillLevel": 78,
  "dryWasteFillLevel": 92,
  "batteryLevel": 85,
  "sensorStatus": "active",
  "temperature": 25.5,
  "humidity": 60,
  "signalStrength": -65,
  "ttl": 1737590900
}
```

---

## 🗄️ Table 4: SystemConfig (Optional)

**Table Name:** `BinThere-SystemConfig`

**Purpose:** Store system-wide configuration and settings

### Primary Key Structure
- **Partition Key:** `configKey` (String) - Configuration identifier
- **No Sort Key**

### Sample Items

```json
// Notification settings
{
  "configKey": "notifications",
  "criticalThreshold": 80,
  "warningThreshold": 60,
  "emailAlerts": true,
  "smsAlerts": false,
  "alertRecipients": ["admin@binthere.com"]
}

// Analytics settings
{
  "configKey": "analytics",
  "dataRetentionDays": 365,
  "aggregationInterval": "daily",
  "enablePredictiveAnalytics": true
}

// Next available dustbin ID
{
  "configKey": "dustbinCounter",
  "lastId": "008",
  "nextId": "009"
}
```

---

## 📈 Capacity Planning

### Read/Write Capacity Units

| Table | Read (RCU) | Write (RCU) | Notes |
|-------|------------|-------------|-------|
| Dustbins | 5 | 5 | Low traffic, ~8 items |
| AnalyticsHistory | 10 | 10 | Daily aggregations |
| IoTSensorLogs | 10 | 25 | High write volume from sensors |
| SystemConfig | 1 | 1 | Rarely accessed |

**Recommendation:** Start with **On-Demand** pricing mode for all tables to optimize costs.

---

## 🔍 Query Patterns

### Pattern 1: Get All Dustbins
```javascript
const params = {
  TableName: 'BinThere-Dustbins'
};
const result = await dynamoDB.scan(params).promise();
```

### Pattern 2: Get Critical Dustbins (Notifications)
```javascript
const params = {
  TableName: 'BinThere-Dustbins',
  IndexName: 'CriticalDustbins',
  KeyConditionExpression: 'criticalStatus = :status',
  ExpressionAttributeValues: {
    ':status': 'CRITICAL'
  },
  ScanIndexForward: false
};
```

### Pattern 3: Get Analytics for Last Week (Aggregated)
```javascript
const params = {
  TableName: 'BinThere-AnalyticsHistory',
  KeyConditionExpression: 'compositeKey = :key AND #ts BETWEEN :start AND :end',
  ExpressionAttributeNames: {
    '#ts': 'timestamp'
  },
  ExpressionAttributeValues: {
    ':key': 'ALL#2025-10',
    ':start': '2025-10-21',
    ':end': '2025-10-27'
  }
};
```

### Pattern 4: Get Analytics for Specific Dustbin
```javascript
const params = {
  TableName: 'BinThere-AnalyticsHistory',
  KeyConditionExpression: 'compositeKey = :key',
  ExpressionAttributeValues: {
    ':key': '001#2025-10'
  }
};
```

---

## 🛠️ Lambda Functions Required

| Function | Trigger | Purpose | Tables Used |
|----------|---------|---------|-------------|
| `ProcessIoTData` | IoT Rule | Process sensor readings, update dustbins | Dustbins, IoTSensorLogs |
| `GenerateNotifications` | IoT Rule | Create alerts for critical dustbins | Dustbins |
| `AggregateAnalytics` | EventBridge (daily) | Calculate daily analytics | AnalyticsHistory |
| `GetDustbins` | API Gateway | Fetch all dustbins | Dustbins |
| `AddDustbin` | API Gateway | Create new dustbin | Dustbins, SystemConfig |
| `UpdateDustbin` | API Gateway | Update dustbin location | Dustbins |
| `DeleteDustbins` | API Gateway | Remove and renumber dustbins | Dustbins |
| `GetAnalytics` | API Gateway | Fetch analytics data | AnalyticsHistory |
| `GetNotifications` | API Gateway | Fetch critical alerts | Dustbins |

---

## 💰 Cost Estimation (Monthly)

**Assumptions:**
- 8 dustbins
- 10 sensor readings per dustbin per hour
- 100 API calls per day
- On-Demand pricing (us-east-1)

| Component | Cost |
|-----------|------|
| DynamoDB (Dustbins) | ~$0.50 |
| DynamoDB (AnalyticsHistory) | ~$1.50 |
| DynamoDB (IoTSensorLogs) | ~$8.00 |
| Lambda Executions | ~$2.00 |
| API Gateway | ~$1.00 |
| IoT Core | ~$5.00 |
| **Total** | **~$18/month** |

---

## 📝 Notes

- Use **composite keys** for efficient querying in AnalyticsHistory
- Enable **TTL** on IoTSensorLogs to auto-delete old data
- Use **GSI** for secondary access patterns to avoid expensive scans
- Consider **DynamoDB Streams** for real-time notifications
- Enable **Point-in-Time Recovery** for production tables

---

**Last Updated:** October 27, 2025
