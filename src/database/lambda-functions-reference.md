# BinThere Lambda Functions Reference

This document provides templates for all AWS Lambda functions needed for the BinThere backend.

---

## 📋 Overview

| Function Name | Trigger | Purpose | Tables Used |
|--------------|---------|---------|-------------|
| `GetDustbins` | API Gateway GET /dustbins | Fetch all dustbins | Dustbins |
| `AddDustbin` | API Gateway POST /dustbins | Add new dustbin | Dustbins, SystemConfig |
| `UpdateDustbin` | API Gateway PUT /dustbins/{id} | Update location | Dustbins |
| `DeleteDustbins` | API Gateway DELETE /dustbins | Remove dustbins | Dustbins |
| `GetAnalytics` | API Gateway GET /analytics | Fetch graph data | AnalyticsHistory |
| `GetNotifications` | API Gateway GET /notifications | Fetch alerts | Dustbins |
| `ProcessIoTData` | IoT Rule | Process sensor data | Dustbins, IoTSensorLogs |
| `AggregateAnalytics` | EventBridge (daily) | Calculate analytics | AnalyticsHistory |

---

## 🔧 Function 1: GetDustbins

**File:** `lambda/get-dustbins.js`

```javascript
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const DUSTBINS_TABLE = process.env.DUSTBINS_TABLE_NAME;

exports.handler = async (event) => {
  try {
    // Scan all dustbins
    const result = await dynamodb.scan({
      TableName: DUSTBINS_TABLE
    }).promise();

    // Format response
    const dustbins = result.Items.map(item => ({
      id: item.id,
      name: item.name,
      location: item.location,
      overallFillLevel: item.overallFillLevel,
      wetWasteFillLevel: item.wetWasteFillLevel,
      dryWasteFillLevel: item.dryWasteFillLevel,
      lastUpdated: item.lastUpdated,
      batteryLevel: item.batteryLevel,
      lastMaintenance: item.lastMaintenance,
      ...(item.criticalTimestamp && { criticalTimestamp: item.criticalTimestamp })
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // Enable CORS
      },
      body: JSON.stringify({
        dustbins: dustbins
      })
    };
  } catch (error) {
    console.error('Error fetching dustbins:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Failed to fetch dustbins',
        message: error.message
      })
    };
  }
};
```

**Environment Variables:**
- `DUSTBINS_TABLE_NAME` = `BinThere-Dustbins-prod`

---

## 🔧 Function 2: AddDustbin

**File:** `lambda/add-dustbin.js`

```javascript
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const DUSTBINS_TABLE = process.env.DUSTBINS_TABLE_NAME;
const CONFIG_TABLE = process.env.CONFIG_TABLE_NAME;

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { location } = body;

    if (!location) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Location is required' })
      };
    }

    // Get next dustbin ID from config
    const configResult = await dynamodb.get({
      TableName: CONFIG_TABLE,
      Key: { configKey: 'dustbinCounter' }
    }).promise();

    const nextId = configResult.Item?.nextId || '001';
    const nextIdNum = parseInt(nextId) + 1;

    // Create new dustbin
    const newDustbin = {
      id: nextId,
      name: `Dustbin #${nextId}`,
      location: location,
      overallFillLevel: 0,
      wetWasteFillLevel: 0,
      dryWasteFillLevel: 0,
      lastUpdated: new Date().toISOString(),
      criticalStatus: 'NORMAL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Insert dustbin
    await dynamodb.put({
      TableName: DUSTBINS_TABLE,
      Item: newDustbin
    }).promise();

    // Update counter
    await dynamodb.put({
      TableName: CONFIG_TABLE,
      Item: {
        configKey: 'dustbinCounter',
        lastId: nextId,
        nextId: String(nextIdNum).padStart(3, '0')
      }
    }).promise();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        dustbin: newDustbin,
        message: 'Dustbin added successfully'
      })
    };
  } catch (error) {
    console.error('Error adding dustbin:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to add dustbin',
        message: error.message
      })
    };
  }
};
```

**Environment Variables:**
- `DUSTBINS_TABLE_NAME` = `BinThere-Dustbins-prod`
- `CONFIG_TABLE_NAME` = `BinThere-SystemConfig-prod`

---

## 🔧 Function 3: UpdateDustbin

**File:** `lambda/update-dustbin.js`

```javascript
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const DUSTBINS_TABLE = process.env.DUSTBINS_TABLE_NAME;

exports.handler = async (event) => {
  try {
    const dustbinId = event.pathParameters.id;
    const body = JSON.parse(event.body);
    const { location } = body;

    if (!location) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Location is required' })
      };
    }

    // Update dustbin
    const result = await dynamodb.update({
      TableName: DUSTBINS_TABLE,
      Key: { id: dustbinId },
      UpdateExpression: 'SET #loc = :location, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#loc': 'location'
      },
      ExpressionAttributeValues: {
        ':location': location,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    }).promise();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        dustbin: result.Attributes,
        message: 'Location updated successfully'
      })
    };
  } catch (error) {
    console.error('Error updating dustbin:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to update dustbin',
        message: error.message
      })
    };
  }
};
```

---

## 🔧 Function 4: DeleteDustbins

**File:** `lambda/delete-dustbins.js`

```javascript
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const DUSTBINS_TABLE = process.env.DUSTBINS_TABLE_NAME;

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { dustbinIds } = body;

    if (!dustbinIds || dustbinIds.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'dustbinIds array is required' })
      };
    }

    // Delete specified dustbins
    for (const id of dustbinIds) {
      await dynamodb.delete({
        TableName: DUSTBINS_TABLE,
        Key: { id }
      }).promise();
    }

    // Fetch remaining dustbins
    const result = await dynamodb.scan({
      TableName: DUSTBINS_TABLE
    }).promise();

    // Renumber remaining dustbins
    const sortedDustbins = result.Items.sort((a, b) => 
      parseInt(a.id) - parseInt(b.id)
    );

    const renumberedDustbins = [];
    for (let i = 0; i < sortedDustbins.length; i++) {
      const newId = String(i + 1).padStart(3, '0');
      const oldId = sortedDustbins[i].id;

      if (newId !== oldId) {
        // Delete old item
        await dynamodb.delete({
          TableName: DUSTBINS_TABLE,
          Key: { id: oldId }
        }).promise();

        // Create new item with updated ID
        const updatedDustbin = {
          ...sortedDustbins[i],
          id: newId,
          name: `Dustbin #${newId}`,
          updatedAt: new Date().toISOString()
        };

        await dynamodb.put({
          TableName: DUSTBINS_TABLE,
          Item: updatedDustbin
        }).promise();

        renumberedDustbins.push(updatedDustbin);
      } else {
        renumberedDustbins.push(sortedDustbins[i]);
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        removed: dustbinIds,
        renumberedDustbins: renumberedDustbins,
        message: `${dustbinIds.length} dustbin(s) removed and renumbered`
      })
    };
  } catch (error) {
    console.error('Error deleting dustbins:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to delete dustbins',
        message: error.message
      })
    };
  }
};
```

---

## 🔧 Function 5: GetAnalytics

**File:** `lambda/get-analytics.js`

```javascript
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const ANALYTICS_TABLE = process.env.ANALYTICS_TABLE_NAME;

exports.handler = async (event) => {
  try {
    const { period, dustbinId } = event.queryStringParameters || {};

    if (!period) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'period parameter is required' })
      };
    }

    // Determine query parameters
    const id = dustbinId || 'ALL';
    const { compositeKey, startDate, endDate } = parsePeriod(period, id);

    // Query analytics data
    const result = await dynamodb.query({
      TableName: ANALYTICS_TABLE,
      KeyConditionExpression: 'compositeKey = :key AND #ts BETWEEN :start AND :end',
      ExpressionAttributeNames: {
        '#ts': 'timestamp'
      },
      ExpressionAttributeValues: {
        ':key': compositeKey,
        ':start': startDate,
        ':end': endDate
      }
    }).promise();

    // Format response
    const data = result.Items.map(item => ({
      date: item.date,
      wetWaste: item.wetWasteFillCount,
      dryWaste: item.dryWasteFillCount,
      timestamp: item.timestamp
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        period: period,
        dustbinId: dustbinId,
        data: data
      })
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to fetch analytics',
        message: error.message
      })
    };
  }
};

function parsePeriod(period, dustbinId) {
  const today = new Date();
  let startDate, endDate;

  if (period === 'last-week') {
    startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    endDate = today;
  } else if (period === 'last-month') {
    startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    endDate = today;
  } else if (period.startsWith('month-')) {
    const monthIndex = parseInt(period.split('-')[1]);
    const year = today.getFullYear();
    const month = monthIndex + 1;
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0);
  }

  const periodKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
  
  return {
    compositeKey: `${dustbinId}#${periodKey}`,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
}
```

**Environment Variables:**
- `ANALYTICS_TABLE_NAME` = `BinThere-AnalyticsHistory-prod`

---

## 🔧 Function 6: GetNotifications

**File:** `lambda/get-notifications.js`

```javascript
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const DUSTBINS_TABLE = process.env.DUSTBINS_TABLE_NAME;

exports.handler = async (event) => {
  try {
    // Query critical dustbins using GSI
    const result = await dynamodb.query({
      TableName: DUSTBINS_TABLE,
      IndexName: 'CriticalDustbins',
      KeyConditionExpression: 'criticalStatus = :status',
      ExpressionAttributeValues: {
        ':status': 'CRITICAL'
      },
      ScanIndexForward: false // Newest first
    }).promise();

    // Format notifications
    const notifications = result.Items.map(item => ({
      id: item.id,
      dustbinName: item.name,
      dustbinLocation: item.location,
      fillLevel: item.overallFillLevel,
      timestamp: item.lastUpdated,
      criticalTimestamp: item.criticalTimestamp
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        notifications: notifications
      })
    };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to fetch notifications',
        message: error.message
      })
    };
  }
};
```

---

## 🔧 Function 7: ProcessIoTData

**File:** `lambda/process-iot-data.js`

```javascript
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const DUSTBINS_TABLE = process.env.DUSTBINS_TABLE_NAME;
const LOGS_TABLE = process.env.LOGS_TABLE_NAME;

exports.handler = async (event) => {
  try {
    // Parse IoT message
    const {
      deviceId,
      wetWasteFillLevel,
      dryWasteFillLevel,
      timestamp,
      batteryLevel,
      sensorStatus
    } = event;

    // Extract dustbin ID from device ID (e.g., "iot-device-001" → "001")
    const dustbinId = deviceId.split('-').pop();

    // Calculate overall fill level
    const overallFillLevel = Math.round((wetWasteFillLevel + dryWasteFillLevel) / 2);

    // Determine critical status
    const isCritical = overallFillLevel >= 80;
    const criticalStatus = isCritical ? 'CRITICAL' : 'NORMAL';

    // Update dustbin record
    const updateExpression = isCritical
      ? 'SET overallFillLevel = :overall, wetWasteFillLevel = :wet, dryWasteFillLevel = :dry, lastUpdated = :updated, batteryLevel = :battery, sensorStatus = :status, criticalStatus = :critical, criticalTimestamp = if_not_exists(criticalTimestamp, :criticalTime), updatedAt = :updatedAt'
      : 'SET overallFillLevel = :overall, wetWasteFillLevel = :wet, dryWasteFillLevel = :dry, lastUpdated = :updated, batteryLevel = :battery, sensorStatus = :status, criticalStatus = :critical, updatedAt = :updatedAt REMOVE criticalTimestamp';

    await dynamodb.update({
      TableName: DUSTBINS_TABLE,
      Key: { id: dustbinId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: {
        ':overall': overallFillLevel,
        ':wet': wetWasteFillLevel,
        ':dry': dryWasteFillLevel,
        ':updated': new Date(timestamp).toISOString(),
        ':battery': batteryLevel,
        ':status': sensorStatus,
        ':critical': criticalStatus,
        ...(isCritical && { ':criticalTime': Date.now() }),
        ':updatedAt': new Date().toISOString()
      }
    }).promise();

    // Log sensor reading
    await dynamodb.put({
      TableName: LOGS_TABLE,
      Item: {
        deviceId: deviceId,
        timestamp: Date.now(),
        dustbinId: dustbinId,
        wetWasteFillLevel: wetWasteFillLevel,
        dryWasteFillLevel: dryWasteFillLevel,
        batteryLevel: batteryLevel,
        sensorStatus: sensorStatus,
        ttl: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60) // 90 days TTL
      }
    }).promise();

    console.log(`Processed IoT data for dustbin ${dustbinId}`);
    return { success: true };
  } catch (error) {
    console.error('Error processing IoT data:', error);
    throw error;
  }
};
```

**IoT Rule SQL:**
```sql
SELECT * FROM 'binthere/dustbin/+/data'
```

**Environment Variables:**
- `DUSTBINS_TABLE_NAME` = `BinThere-Dustbins-prod`
- `LOGS_TABLE_NAME` = `BinThere-IoTSensorLogs-prod`

---

## 📦 Deployment Package

Create a `package.json` for each Lambda:

```json
{
  "name": "binthere-lambda",
  "version": "1.0.0",
  "description": "BinThere Lambda Functions",
  "dependencies": {
    "aws-sdk": "^2.1000.0"
  }
}
```

---

## 🚀 Deployment Commands

```bash
# Create deployment package
cd lambda
npm install
zip -r get-dustbins.zip get-dustbins.js node_modules/

# Deploy to AWS
aws lambda create-function \
  --function-name BinThere-GetDustbins \
  --runtime nodejs18.x \
  --role arn:aws:iam::ACCOUNT_ID:role/BinThereExecutionRole \
  --handler get-dustbins.handler \
  --zip-file fileb://get-dustbins.zip \
  --environment Variables="{DUSTBINS_TABLE_NAME=BinThere-Dustbins-prod}"
```

---

**Last Updated:** October 27, 2025
