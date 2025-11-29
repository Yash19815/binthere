# BinThere Database Structure

Complete database architecture for the BinThere smart waste management system.

---

## 🎯 Choose Your Database

BinThere supports both **PostgreSQL** (recommended) and **AWS DynamoDB**:

### PostgreSQL (Recommended) ⭐
- **Best for:** Most use cases, development, production
- **Advantages:** Simpler setup, lower cost, standard SQL, better tooling
- **Setup Time:** 10 minutes
- **Cost:** Free tier available (Neon, Supabase)

**👉 [Start with PostgreSQL Setup Guide](/QUICK_START_POSTGRESQL.md)**

### AWS DynamoDB (Advanced)
- **Best for:** AWS-native deployments, extreme scale, serverless architecture
- **Advantages:** Serverless, auto-scaling, AWS integration
- **Setup Time:** 30-60 minutes
- **Cost:** Pay per request

**👉 See DynamoDB files in this directory**

---

## 📁 Files in This Directory

### PostgreSQL Implementation (New!)
| File | Purpose |
|------|---------|
| `postgresql-schema.sql` | Complete PostgreSQL schema with triggers, indexes, views, and seed data |

### AWS DynamoDB Implementation (Original)
| File | Purpose |
|------|---------|
| `dynamodb-schema.md` | Detailed DynamoDB table schemas with indexes and query patterns |
| `cloudformation-template.yaml` | AWS CloudFormation template for automated table creation |
| `sql-schema.sql` | Legacy SQL schema (see postgresql-schema.sql for updated version) |
| `seed-data.json` | Sample data for testing and development |
| `SETUP_INSTRUCTIONS.md` | Step-by-step setup guide for AWS deployment |
| `lambda-functions-reference.md` | Lambda function code templates for all API endpoints |

---

## 🚀 Quick Start Guides

### For PostgreSQL (Recommended)
1. **[10-Minute Quick Start](/QUICK_START_POSTGRESQL.md)** - Get started immediately
2. **[Complete Setup Guide](/backend/POSTGRESQL_SETUP_GUIDE.md)** - Full documentation
3. **[Cloud Provider Comparison](/backend/CLOUD_SERVICES_COMPARISON.md)** - Choose your database host
4. **[Architecture Diagrams](/backend/ARCHITECTURE_DIAGRAM.md)** - Understand the system

### For AWS DynamoDB
1. See `SETUP_INSTRUCTIONS.md` in this directory
2. Use CloudFormation template for automated setup
3. Deploy Lambda functions from reference guide

---

## 📊 Database Comparison

| Feature | PostgreSQL | DynamoDB |
|---------|-----------|----------|
| **Setup Time** | 10 minutes | 30-60 minutes |
| **Cost (Development)** | Free | Free (limited) |
| **Cost (Production)** | $15-25/month | Variable (pay-per-request) |
| **SQL Support** | Full SQL | NoSQL only |
| **Tooling** | Excellent (psql, pgAdmin, etc.) | Limited |
| **Learning Curve** | Low (standard SQL) | Medium (DynamoDB specific) |
| **Scaling** | Manual (but sufficient) | Automatic |
| **Real-time** | Via polling or websockets | Via DynamoDB Streams |
| **Best For** | Most applications | AWS-native, extreme scale |

---

## 🗄️ Database Tables Overview

### **1. Dustbins Table**
**Purpose:** Current state of all dustbins with real-time fill levels

**Key Attributes:**
- `id` (PK): Dustbin identifier (e.g., "001")
- `location`: Physical location
- `overallFillLevel`, `wetWasteFillLevel`, `dryWasteFillLevel`: Fill percentages (0-100)
- `criticalTimestamp`: When dustbin became ≥80% full
- `lastUpdated`: Last sensor reading timestamp

**Indexes:**
- Primary Key: `id`
- GSI-1 `CriticalDustbins`: Query by `criticalStatus` + `criticalTimestamp`
- GSI-2 `LocationIndex`: Query by `location`

**Used By:**
- GET /dustbins - Fetch all dustbins
- POST /dustbins - Add new dustbin
- PUT /dustbins/{id} - Update location
- DELETE /dustbins - Remove dustbins
- GET /notifications - Fetch critical alerts

---

### **2. AnalyticsHistory Table**
**Purpose:** Historical fill count data for analytics graphs

**Key Attributes:**
- `compositeKey` (PK): "dustbinId#period" (e.g., "001#2025-10", "ALL#2025-10")
- `timestamp` (SK): ISO date (e.g., "2025-10-21")
- `wetWasteFillCount`, `dryWasteFillCount`: Daily fill counts

**Indexes:**
- Primary Key: `compositeKey` + `timestamp`
- GSI-1 `PeriodIndex`: Query by `period` + `timestamp`

**Used By:**
- GET /analytics - Fetch graph data for dashboard

---

### **3. IoTSensorLogs Table** (Optional)
**Purpose:** Raw sensor data logs for troubleshooting

**Key Attributes:**
- `deviceId` (PK): IoT device identifier
- `timestamp` (SK): Unix timestamp
- `wetWasteFillLevel`, `dryWasteFillLevel`: Sensor readings
- `ttl`: Auto-delete after 90 days

**Indexes:**
- Primary Key: `deviceId` + `timestamp`

**Used By:**
- ProcessIoTData Lambda - Stores raw sensor readings

---

### **4. SystemConfig Table** (Optional)
**Purpose:** System-wide configuration and settings

**Key Attributes:**
- `configKey` (PK): Configuration identifier
- `configValue`: JSON configuration data

**Used By:**
- AddDustbin Lambda - Auto-increment dustbin IDs
- System settings management

---

## 🔄 Data Flow

```
┌─────────────────┐
│  IoT Sensors    │ (Dustbin Hardware)
│  - Wet sensor   │
│  - Dry sensor   │
└────────┬────────┘
         │ MQTT Message
         │ {deviceId, wetLevel, dryLevel, timestamp}
         ↓
┌─────────────────────────────────────────┐
│       AWS IoT Core                      │
│  Topic: binthere/dustbin/+/data         │
└────────┬────────────────────────────────┘
         │ IoT Rule triggers Lambda
         ↓
┌─────────────────────────────────────────┐
│  Lambda: ProcessIoTData                 │
│  1. Calculate overall = (wet+dry)/2     │
│  2. Update Dustbins table               │
│  3. Set criticalStatus if ≥80%          │
│  4. Log to IoTSensorLogs                │
└────────┬────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│       DynamoDB: Dustbins                │
│  - Real-time dustbin states             │
│  - Critical alerts (≥80%)               │
└────────┬────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│  Lambda: AggregateAnalytics             │
│  (Triggered daily by EventBridge)       │
│  1. Query IoTSensorLogs                 │
│  2. Calculate daily fill counts         │
│  3. Insert into AnalyticsHistory        │
└────────┬────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│    DynamoDB: AnalyticsHistory           │
│  - Daily aggregated fill counts         │
│  - Per-dustbin and overall data         │
└─────────────────────────────────────────┘
```

---

## 🔌 API Endpoints → Database Operations

### **GET /dustbins**
```
Lambda: GetDustbins
↓
DynamoDB Scan: Dustbins table
↓
Return all dustbins with current fill levels
```

### **POST /dustbins**
```
Lambda: AddDustbin
↓
1. Get next ID from SystemConfig table
2. Put new item in Dustbins table
3. Update counter in SystemConfig
↓
Return new dustbin object
```

### **PUT /dustbins/{id}**
```
Lambda: UpdateDustbin
↓
DynamoDB Update: Dustbins table
  - Update location field only
↓
Return updated dustbin
```

### **DELETE /dustbins**
```
Lambda: DeleteDustbins
↓
1. Delete specified dustbins from Dustbins table
2. Scan remaining dustbins
3. Renumber sequentially (001, 002, 003...)
4. Delete old items, insert renumbered items
↓
Return renumbered dustbin list
```

### **GET /analytics**
```
Lambda: GetAnalytics
↓
DynamoDB Query: AnalyticsHistory table
  - Filter by period (last-week, last-month, month-N)
  - Filter by dustbinId (optional)
↓
Return time-series data [{date, wetWaste, dryWaste}]
```

### **GET /notifications**
```
Lambda: GetNotifications
↓
DynamoDB Query: Dustbins table (CriticalDustbins GSI)
  - Filter by criticalStatus = "CRITICAL"
  - Sort by criticalTimestamp (newest first)
↓
Return critical alerts
```

---

## 📊 Query Patterns & Performance

### Pattern 1: Fetch All Dustbins
**Operation:** Scan  
**Cost:** Low (8 items)  
**Performance:** ~50ms  
**Usage:** Dashboard overview, refresh button

### Pattern 2: Get Critical Dustbins
**Operation:** Query on GSI (CriticalDustbins)  
**Cost:** Very Low  
**Performance:** ~20ms  
**Usage:** Notifications bell, alerts

### Pattern 3: Get Analytics for Last Week
**Operation:** Query on composite key  
**Cost:** Low  
**Performance:** ~30ms  
**Usage:** Analytics graph default view

### Pattern 4: Get Analytics by Month
**Operation:** Query on GSI (PeriodIndex)  
**Cost:** Low  
**Performance:** ~40ms  
**Usage:** Analytics graph month selector

---

## 🔑 Required AWS Permissions

### Lambda Execution Role Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/BinThere-Dustbins-prod",
        "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/BinThere-Dustbins-prod/index/*",
        "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/BinThere-AnalyticsHistory-prod",
        "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/BinThere-AnalyticsHistory-prod/index/*",
        "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/BinThere-IoTSensorLogs-prod",
        "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/BinThere-SystemConfig-prod"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:REGION:ACCOUNT_ID:*"
    }
  ]
}
```

---

## 💰 Cost Estimation (Monthly)

**Assumptions:**
- 8 dustbins
- 10 sensor readings per dustbin per hour (1,920 writes/day)
- 100 API calls per day (dashboard views)
- On-Demand pricing (us-east-1)

### DynamoDB Costs
| Table | Reads/Month | Writes/Month | Storage | Cost |
|-------|-------------|--------------|---------|------|
| Dustbins | 3,000 | 100 | 1 MB | $0.50 |
| AnalyticsHistory | 3,000 | 240 | 5 MB | $1.50 |
| IoTSensorLogs | 100 | 57,600 | 100 MB | $8.00 |
| SystemConfig | 100 | 10 | <1 MB | $0.10 |

**Total DynamoDB:** ~$10/month

### Other AWS Costs
- Lambda executions: ~$2/month
- API Gateway: ~$1/month
- IoT Core: ~$5/month

**Total Estimated Cost:** ~$18/month

---

## 🚀 Quick Setup Guide

### Step 1: Deploy Database
```bash
aws cloudformation create-stack \
  --stack-name BinThere-Database \
  --template-body file://database/cloudformation-template.yaml \
  --parameters ParameterKey=Environment,ParameterValue=prod \
  --region us-east-1
```

### Step 2: Seed Sample Data
```bash
# Run the seed script (see seed-data.json)
node seed-database.js
```

### Step 3: Deploy Lambda Functions
```bash
# See lambda-functions-reference.md for deployment commands
```

### Step 4: Configure API Gateway
```bash
# Connect Lambda functions to API endpoints
# See API_INTEGRATION_GUIDE.md
```

### Step 5: Update Frontend
```bash
# Add API Gateway URL to .env
echo "VITE_AWS_API_GATEWAY_URL=https://your-api.execute-api.us-east-1.amazonaws.com/prod" >> .env
```

---

## 🔄 Data Retention & Cleanup

### IoTSensorLogs
- **TTL Enabled:** Yes
- **Retention:** 90 days
- **Auto-cleanup:** DynamoDB TTL automatically deletes expired items

### AnalyticsHistory
- **Retention:** 365 days (configurable)
- **Cleanup:** Manual or scheduled Lambda

### Dustbins
- **Retention:** Permanent (until manually deleted)

---

## 🆘 Troubleshooting

### Issue: "Table does not exist"
**Solution:** Verify table names in Lambda environment variables match actual table names

### Issue: "AccessDeniedException"
**Solution:** Check Lambda execution role has DynamoDB permissions

### Issue: "ProvisionedThroughputExceededException"
**Solution:** Switch to On-Demand billing mode or increase provisioned capacity

### Issue: "ValidationException: One or more parameter values were invalid"
**Solution:** Verify all required attributes are provided in Put/Update operations

---

## 📚 Additional Resources

- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [Lambda Function Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [IoT Core Documentation](https://docs.aws.amazon.com/iot/latest/developerguide/)
- [API Gateway CORS Configuration](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors.html)

---

## 📝 Next Steps

1. ✅ Review database schema (`dynamodb-schema.md`)
2. ✅ Deploy tables using CloudFormation (`SETUP_INSTRUCTIONS.md`)
3. ✅ Seed sample data (`seed-data.json`)
4. ⏭️ Create Lambda functions (`lambda-functions-reference.md`)
5. ⏭️ Set up API Gateway endpoints
6. ⏭️ Configure IoT Core rules (if using physical sensors)
7. ⏭️ Update frontend `.env` with API Gateway URL
8. ⏭️ Test API integration with Postman/curl

---

**Created:** October 27, 2025  
**Version:** 1.0  
**Maintained by:** BinThere Development Team