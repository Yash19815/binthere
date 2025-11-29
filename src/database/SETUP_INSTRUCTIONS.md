# BinThere Database Setup Instructions

This guide walks you through setting up the database for your BinThere application using AWS DynamoDB.

---

## 🚀 Quick Start (CloudFormation - Recommended)

### Option 1: AWS Console

1. **Open CloudFormation Console**
   - Go to: https://console.aws.amazon.com/cloudformation
   - Select your preferred region (e.g., us-east-1)

2. **Create Stack**
   - Click **"Create stack"** → **"With new resources (standard)"**
   - Choose **"Upload a template file"**
   - Upload: `/database/cloudformation-template.yaml`
   - Click **"Next"**

3. **Configure Stack**
   - **Stack name:** `BinThere-Database`
   - **Environment:** Choose `dev`, `staging`, or `prod`
   - Click **"Next"**

4. **Review and Create**
   - Review settings
   - Check **"I acknowledge that AWS CloudFormation might create IAM resources"**
   - Click **"Create stack"**

5. **Wait for Completion**
   - Wait 2-3 minutes for stack creation
   - Status should change to **CREATE_COMPLETE**

6. **Get Table Names**
   - Go to **"Outputs"** tab
   - Copy the table names (you'll need these for Lambda functions)

---

### Option 2: AWS CLI

```bash
# Navigate to your project directory
cd /path/to/binthere

# Deploy CloudFormation stack
aws cloudformation create-stack \
  --stack-name BinThere-Database \
  --template-body file://database/cloudformation-template.yaml \
  --parameters ParameterKey=Environment,ParameterValue=prod \
  --region us-east-1

# Wait for stack creation
aws cloudformation wait stack-create-complete \
  --stack-name BinThere-Database \
  --region us-east-1

# Get table names
aws cloudformation describe-stacks \
  --stack-name BinThere-Database \
  --region us-east-1 \
  --query 'Stacks[0].Outputs'
```

---

## 📋 Manual Setup (Alternative)

If you prefer to create tables manually:

### 1. Create Dustbins Table

```bash
aws dynamodb create-table \
  --table-name BinThere-Dustbins-prod \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=criticalStatus,AttributeType=S \
    AttributeName=criticalTimestamp,AttributeType=N \
    AttributeName=location,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes \
    "[
      {
        \"IndexName\": \"CriticalDustbins\",
        \"KeySchema\": [
          {\"AttributeName\":\"criticalStatus\",\"KeyType\":\"HASH\"},
          {\"AttributeName\":\"criticalTimestamp\",\"KeyType\":\"RANGE\"}
        ],
        \"Projection\": {\"ProjectionType\":\"ALL\"}
      },
      {
        \"IndexName\": \"LocationIndex\",
        \"KeySchema\": [
          {\"AttributeName\":\"location\",\"KeyType\":\"HASH\"},
          {\"AttributeName\":\"id\",\"KeyType\":\"RANGE\"}
        ],
        \"Projection\": {\"ProjectionType\":\"ALL\"}
      }
    ]"
```

### 2. Create AnalyticsHistory Table

```bash
aws dynamodb create-table \
  --table-name BinThere-AnalyticsHistory-prod \
  --attribute-definitions \
    AttributeName=compositeKey,AttributeType=S \
    AttributeName=timestamp,AttributeType=S \
    AttributeName=period,AttributeType=S \
  --key-schema \
    AttributeName=compositeKey,KeyType=HASH \
    AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes \
    "[
      {
        \"IndexName\": \"PeriodIndex\",
        \"KeySchema\": [
          {\"AttributeName\":\"period\",\"KeyType\":\"HASH\"},
          {\"AttributeName\":\"timestamp\",\"KeyType\":\"RANGE\"}
        ],
        \"Projection\": {\"ProjectionType\":\"ALL\"}
      }
    ]"
```

### 3. Create IoTSensorLogs Table

```bash
aws dynamodb create-table \
  --table-name BinThere-IoTSensorLogs-prod \
  --attribute-definitions \
    AttributeName=deviceId,AttributeType=S \
    AttributeName=timestamp,AttributeType=N \
  --key-schema \
    AttributeName=deviceId,KeyType=HASH \
    AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST

# Enable TTL (auto-delete logs after 90 days)
aws dynamodb update-time-to-live \
  --table-name BinThere-IoTSensorLogs-prod \
  --time-to-live-specification \
    "Enabled=true,AttributeName=ttl"
```

### 4. Create SystemConfig Table

```bash
aws dynamodb create-table \
  --table-name BinThere-SystemConfig-prod \
  --attribute-definitions \
    AttributeName=configKey,AttributeType=S \
  --key-schema \
    AttributeName=configKey,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

---

## 🌱 Seed Sample Data

### Using AWS Console

1. **Open DynamoDB Console**
   - Go to: https://console.aws.amazon.com/dynamodb
   - Select **"Tables"**

2. **Select Table**
   - Click on `BinThere-Dustbins-prod`
   - Click **"Explore table items"**

3. **Create Items**
   - Click **"Create item"**
   - Switch to **"JSON view"**
   - Copy data from `/database/seed-data.json`
   - Paste one dustbin object at a time
   - Click **"Create item"**

### Using AWS CLI

```bash
# Insert one dustbin
aws dynamodb put-item \
  --table-name BinThere-Dustbins-prod \
  --item '{
    "id": {"S": "001"},
    "name": {"S": "Dustbin #001"},
    "location": {"S": "Central Park North"},
    "overallFillLevel": {"N": "85"},
    "wetWasteFillLevel": {"N": "78"},
    "dryWasteFillLevel": {"N": "92"},
    "lastUpdated": {"S": "2025-10-27T10:35:00Z"},
    "criticalTimestamp": {"N": "1729854900000"},
    "criticalStatus": {"S": "CRITICAL"},
    "deviceId": {"S": "iot-device-001"},
    "batteryLevel": {"N": "85"},
    "sensorStatus": {"S": "active"},
    "createdAt": {"S": "2025-01-15T08:00:00Z"},
    "updatedAt": {"S": "2025-10-27T10:35:00Z"}
  }'

# Repeat for other dustbins...
```

### Using Batch Script (Recommended)

Create a Node.js script to batch insert data:

```javascript
// seed-database.js
const AWS = require('aws-sdk');
const seedData = require('./seed-data.json');

const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

async function seedDustbins() {
  for (const dustbin of seedData.tables.Dustbins) {
    await dynamodb.put({
      TableName: 'BinThere-Dustbins-prod',
      Item: dustbin
    }).promise();
    console.log(`Inserted dustbin ${dustbin.id}`);
  }
}

async function seedAnalytics() {
  const allData = [
    ...seedData.tables.AnalyticsHistory.lastWeek_aggregated,
    ...seedData.tables.AnalyticsHistory.dustbin_001_october,
    ...seedData.tables.AnalyticsHistory.september_aggregated
  ];
  
  for (const item of allData) {
    await dynamodb.put({
      TableName: 'BinThere-AnalyticsHistory-prod',
      Item: item
    }).promise();
    console.log(`Inserted analytics ${item.compositeKey}/${item.timestamp}`);
  }
}

async function seedSystemConfig() {
  for (const config of seedData.tables.SystemConfig) {
    await dynamodb.put({
      TableName: 'BinThere-SystemConfig-prod',
      Item: config
    }).promise();
    console.log(`Inserted config ${config.configKey}`);
  }
}

(async () => {
  console.log('Seeding Dustbins...');
  await seedDustbins();
  
  console.log('Seeding Analytics...');
  await seedAnalytics();
  
  console.log('Seeding System Config...');
  await seedSystemConfig();
  
  console.log('✅ Database seeded successfully!');
})();
```

Run the script:
```bash
npm install aws-sdk
node seed-database.js
```

---

## 🔍 Verify Setup

### Check Tables

```bash
# List all tables
aws dynamodb list-tables --region us-east-1

# Describe Dustbins table
aws dynamodb describe-table \
  --table-name BinThere-Dustbins-prod \
  --region us-east-1

# Scan Dustbins table (view all items)
aws dynamodb scan \
  --table-name BinThere-Dustbins-prod \
  --region us-east-1
```

### Query Critical Dustbins

```bash
aws dynamodb query \
  --table-name BinThere-Dustbins-prod \
  --index-name CriticalDustbins \
  --key-condition-expression "criticalStatus = :status" \
  --expression-attribute-values '{":status":{"S":"CRITICAL"}}' \
  --region us-east-1
```

---

## 🗑️ Delete/Cleanup

### Delete Stack (CloudFormation)

```bash
aws cloudformation delete-stack \
  --stack-name BinThere-Database \
  --region us-east-1
```

### Delete Individual Tables

```bash
aws dynamodb delete-table --table-name BinThere-Dustbins-prod
aws dynamodb delete-table --table-name BinThere-AnalyticsHistory-prod
aws dynamodb delete-table --table-name BinThere-IoTSensorLogs-prod
aws dynamodb delete-table --table-name BinThere-SystemConfig-prod
```

---

## 📊 Alternative: SQL Database (RDS)

If you prefer PostgreSQL/MySQL instead of DynamoDB:

1. **Create RDS Instance**
   - Go to AWS RDS Console
   - Create PostgreSQL 15 or MySQL 8.0 instance
   - Note down the endpoint and credentials

2. **Connect to Database**
   ```bash
   # PostgreSQL
   psql -h your-rds-endpoint.amazonaws.com -U admin -d binthere
   
   # MySQL
   mysql -h your-rds-endpoint.amazonaws.com -u admin -p
   ```

3. **Run SQL Schema**
   ```bash
   # PostgreSQL
   psql -h your-rds-endpoint.amazonaws.com -U admin -d binthere -f database/sql-schema.sql
   
   # MySQL
   mysql -h your-rds-endpoint.amazonaws.com -u admin -p binthere < database/sql-schema.sql
   ```

---

## 🔐 IAM Permissions

Your Lambda functions need these permissions:

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
        "arn:aws:dynamodb:us-east-1:*:table/BinThere-Dustbins-prod",
        "arn:aws:dynamodb:us-east-1:*:table/BinThere-Dustbins-prod/index/*",
        "arn:aws:dynamodb:us-east-1:*:table/BinThere-AnalyticsHistory-prod",
        "arn:aws:dynamodb:us-east-1:*:table/BinThere-AnalyticsHistory-prod/index/*"
      ]
    }
  ]
}
```

---

## 📝 Next Steps

1. ✅ **Set up DynamoDB tables** (using CloudFormation or manual)
2. ✅ **Seed sample data** (for testing)
3. ⏭️ **Create Lambda functions** (see `/lambda` directory - coming next)
4. ⏭️ **Set up API Gateway** (connect Lambda to REST endpoints)
5. ⏭️ **Configure IoT Core** (for sensor data ingestion)
6. ⏭️ **Update frontend `.env`** (with API Gateway URL)

---

## 💰 Cost Optimization Tips

- **Use On-Demand pricing** for development (no upfront costs)
- **Enable auto-scaling** for production workloads
- **Use TTL** on IoTSensorLogs to auto-delete old data
- **Monitor CloudWatch metrics** to detect anomalies
- **Set up billing alarms** to avoid surprises

---

## 🆘 Troubleshooting

### Error: Table Already Exists
```bash
# Delete the table first
aws dynamodb delete-table --table-name BinThere-Dustbins-prod
# Wait 30 seconds, then recreate
```

### Error: Insufficient Permissions
- Ensure your AWS IAM user has `dynamodb:*` permissions
- Or use `AdministratorAccess` policy (for testing only)

### Error: Region Not Found
- Specify region explicitly: `--region us-east-1`

---

**Last Updated:** October 27, 2025
