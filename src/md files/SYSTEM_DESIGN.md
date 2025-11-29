# BinThere - System Design Documentation

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Architecture Overview](#system-architecture-overview)
3. [Technology Stack](#technology-stack)
4. [AWS Services Integration](#aws-services-integration)
5. [User Flow & Journey](#user-flow--journey)
6. [Authentication System](#authentication-system)
7. [Application Architecture](#application-architecture)
8. [Data Flow Architecture](#data-flow-architecture)
9. [Real-Time Monitoring System](#real-time-monitoring-system)
10. [Database Design](#database-design)
11. [API Layer](#api-layer)
12. [Frontend Components](#frontend-components)
13. [Security Architecture](#security-architecture)
14. [Deployment Architecture](#deployment-architecture)
15. [Scalability & Performance](#scalability--performance)
16. [Monitoring & Logging](#monitoring--logging)

---

## Executive Summary

**BinThere** is a smart waste management admin web application designed to monitor dustbin fill levels and waste classification in real-time. The system provides administrators with comprehensive insights into waste collection operations through an intuitive dashboard, analytics, and notification system.

### Key Features
- Real-time dustbin monitoring with color-coded fill level indicators
- Dual-waste type analytics (Wet vs Dry waste)
- Dynamic notification system with CRUD operations
- Environmental green color palette with consistent thresholds
- Dark mode support across all components
- Responsive design for desktop and mobile devices

### Color Thresholds
- **Green (0-60%)**: Optimal fill level
- **Yellow/Orange (60-80%)**: Warning level
- **Red (80%+)**: Critical level requiring immediate attention

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BinThere System Architecture                  │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────────────────────────┐
│   End Users      │         │         AWS Cloud Infrastructure      │
│  (Admins)        │         │                                       │
└────────┬─────────┘         │  ┌─────────────────────────────────┐ │
         │                   │  │   CloudFront (CDN)              │ │
         │                   │  │   - Static Asset Delivery       │ │
         │                   │  │   - SSL/TLS Termination         │ │
         │                   │  └──────────────┬──────────────────┘ │
         │                   │                 │                     │
         │                   │  ┌──────────────▼──────────────────┐ │
         │                   │  │   S3 Bucket                     │ │
         └───────────────────┼─▶│   - React SPA Hosting           │ │
                             │  │   - Static Assets               │ │
                             │  └──────────────┬──────────────────┘ │
                             │                 │                     │
                             │  ┌──────────────▼──────────────────┐ │
                             │  │   API Gateway (REST/WebSocket)  │ │
                             │  │   - Request Routing             │ │
                             │  │   - Authentication              │ │
                             │  │   - Rate Limiting               │ │
                             │  └──────────────┬──────────────────┘ │
                             │                 │                     │
                             │  ┌──────────────▼──────────────────┐ │
                             │  │   AWS Cognito                   │ │
                             │  │   - User Authentication         │ │
                             │  │   - JWT Token Management        │ │
                             │  │   - User Pool                   │ │
                             │  └─────────────────────────────────┘ │
                             │                                       │
                             │  ┌─────────────────────────────────┐ │
                             │  │   Lambda Functions              │ │
                             │  │   - Dustbin CRUD Operations     │ │
                             │  │   - Notification Management     │ │
                             │  │   - Analytics Processing        │ │
                             │  │   - Real-time Data Processing   │ │
                             │  └──────────────┬──────────────────┘ │
                             │                 │                     │
                             │  ┌──────────────▼──────────────────┐ │
                             │  │   DynamoDB                      │ │
                             │  │   - Dustbins Table              │ │
                             │  │   - Notifications Table         │ │
                             │  │   - WasteData Table             │ │
                             │  │   - Users Table                 │ │
                             │  └─────────────────────────────────┘ │
                             │                                       │
                             │  ┌─────────────────────────────────┐ │
                             │  │   IoT Core                      │ │
                             │  │   - Device Communication        │ │
                             │  │   - MQTT Broker                 │ │
                             │  │   - Real-time Updates           │ │
                             │  └─────────────────────────────────┘ │
                             │                                       │
                             │  ┌─────────────────────────────────┐ │
                             │  │   CloudWatch                    │ │
                             │  │   - Application Logs            │ │
                             │  │   - Metrics & Alarms            │ │
                             │  │   - Performance Monitoring      │ │
                             │  └─────────────────────────────────┘ │
                             │                                       │
                             └───────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                        IoT Devices (Smart Dustbins)                   │
│   - Ultrasonic Sensors (Fill Level)                                  │
│   - Weight Sensors (Waste Classification)                            │
│   - ESP32/Arduino Controllers                                        │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS v4.0
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React
- **Charts**: Recharts
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Dark Mode**: CSS Custom Properties + React Context

### Backend (AWS Services)
- **Compute**: AWS Lambda (Serverless)
- **API**: Amazon API Gateway (REST & WebSocket)
- **Authentication**: AWS Cognito
- **Database**: Amazon DynamoDB
- **IoT**: AWS IoT Core
- **Storage**: Amazon S3
- **CDN**: Amazon CloudFront

### DevOps & Monitoring
- **Logging**: AWS CloudWatch
- **Deployment**: AWS CloudFormation
- **CI/CD**: AWS CodePipeline + CodeBuild
- **Monitoring**: CloudWatch Metrics & Alarms

---

## AWS Services Integration

### 1. **Amazon Cognito** - Authentication & User Management
**Purpose**: Secure user authentication and authorization

**Features**:
- User registration and login
- JWT token generation and validation
- Multi-factor authentication (MFA) support
- Password policies and recovery
- User pool for admin management

**Integration Points**:
- Login page authentication
- API Gateway authorizer
- Token refresh mechanism

**Configuration**:
```yaml
UserPool:
  - Pool Name: binthere-admin-pool
  - MFA: Optional
  - Password Policy: Minimum 8 characters, uppercase, lowercase, numbers
  - Attributes: email, name, phone_number
```

---

### 2. **AWS IoT Core** - Real-Time Device Communication
**Purpose**: Connect and manage smart dustbin devices

**Features**:
- MQTT message broker for device-to-cloud communication
- Device shadow for state management
- Real-time fill level updates
- Secure device authentication with X.509 certificates

**MQTT Topics**:
```
dustbins/{dustbinId}/telemetry    - Fill level, weight, status updates
dustbins/{dustbinId}/shadow       - Device state synchronization
dustbins/alerts                   - Critical fill level alerts
```

**Data Flow**:
```
Smart Dustbin → IoT Core (MQTT) → IoT Rules → Lambda → DynamoDB → WebSocket → Frontend
```

---

### 3. **Amazon API Gateway** - API Management
**Purpose**: RESTful API and WebSocket management

**REST API Endpoints**:
```
POST   /auth/login              - User authentication
GET    /dustbins                - List all dustbins
GET    /dustbins/{id}           - Get dustbin details
POST   /dustbins                - Create new dustbin
PUT    /dustbins/{id}           - Update dustbin
DELETE /dustbins/{id}           - Delete dustbin
GET    /notifications           - Get notifications
POST   /notifications           - Create notification
DELETE /notifications/{id}      - Delete notification
GET    /analytics               - Get waste analytics data
```

**WebSocket API**:
```
$connect    - Establish WebSocket connection
$disconnect - Close connection
$default    - Handle real-time updates
```

**Features**:
- Request/response validation
- Rate limiting (1000 requests per minute)
- CORS configuration
- API key management
- Request throttling

---

### 4. **AWS Lambda** - Serverless Compute
**Purpose**: Business logic execution

**Lambda Functions**:

1. **AuthHandler**
   - Function: User login validation
   - Runtime: Node.js 18.x
   - Memory: 256 MB
   - Timeout: 10 seconds

2. **DustbinCRUD**
   - Function: CRUD operations for dustbins
   - Runtime: Node.js 18.x
   - Memory: 512 MB
   - Timeout: 30 seconds

3. **NotificationManager**
   - Function: Notification CRUD and alerts
   - Runtime: Node.js 18.x
   - Memory: 256 MB
   - Timeout: 15 seconds

4. **AnalyticsProcessor**
   - Function: Process and aggregate waste data
   - Runtime: Node.js 18.x
   - Memory: 1024 MB
   - Timeout: 60 seconds

5. **IoTDataHandler**
   - Function: Process IoT device telemetry
   - Trigger: IoT Rules Engine
   - Runtime: Node.js 18.x
   - Memory: 512 MB
   - Timeout: 30 seconds

6. **WebSocketManager**
   - Function: Manage WebSocket connections
   - Runtime: Node.js 18.x
   - Memory: 256 MB
   - Timeout: 30 seconds

---

### 5. **Amazon DynamoDB** - NoSQL Database
**Purpose**: Scalable data storage

**Tables**:

1. **Dustbins Table**
   - Primary Key: dustbinId (String)
   - Attributes: location, fillLevel, wasteType, status, lastUpdated
   - GSI: location-index (for location-based queries)

2. **Notifications Table**
   - Primary Key: notificationId (String)
   - Sort Key: timestamp (Number)
   - Attributes: message, type, isRead, dustbinId

3. **WasteData Table**
   - Primary Key: dataId (String)
   - Sort Key: timestamp (Number)
   - Attributes: dustbinId, wetWaste, dryWaste, fillLevel
   - GSI: dustbinId-timestamp-index

4. **Users Table**
   - Primary Key: userId (String)
   - Attributes: email, name, role, createdAt

**Features**:
- Auto-scaling for read/write capacity
- Point-in-time recovery
- DynamoDB Streams for real-time updates
- TTL for automatic data expiration (notifications)

---

### 6. **Amazon S3** - Static Hosting
**Purpose**: Host React application

**Bucket Configuration**:
```
Bucket Name: binthere-web-app
Access: Public (via CloudFront only)
Versioning: Enabled
Encryption: AES-256
```

**Content**:
- index.html (entry point)
- JavaScript bundles
- CSS files
- Static assets (images, fonts)

---

### 7. **Amazon CloudFront** - Content Delivery
**Purpose**: Global content distribution

**Features**:
- SSL/TLS certificate (ACM)
- GZIP compression
- Edge caching
- Custom error pages
- Origin failover

**Cache Behavior**:
- HTML: No cache (must-revalidate)
- JS/CSS: Cache for 1 year (versioned files)
- Images: Cache for 1 month

---

### 8. **Amazon CloudWatch** - Monitoring & Logging
**Purpose**: Application monitoring and observability

**Metrics**:
- Lambda execution duration
- API Gateway request count
- DynamoDB read/write capacity
- IoT message count
- Error rates

**Alarms**:
- High fill level (80%+) - SNS notification
- Lambda errors > threshold
- DynamoDB throttling
- API Gateway 5xx errors

**Log Groups**:
```
/aws/lambda/AuthHandler
/aws/lambda/DustbinCRUD
/aws/lambda/NotificationManager
/aws/lambda/AnalyticsProcessor
/aws/lambda/IoTDataHandler
/aws/apigateway/binthere-api
```

---

### 9. **Amazon SNS** - Notification Service
**Purpose**: Alert notifications

**Topics**:
- critical-dustbin-alerts (Email/SMS to admins)
- system-health-alerts (Email to DevOps)

**Subscriptions**:
- Email notifications for critical fill levels
- SMS alerts for urgent issues

---

### 10. **AWS CloudFormation** - Infrastructure as Code
**Purpose**: Automated infrastructure deployment

**Stacks**:
- Network stack (VPC, subnets, security groups)
- Database stack (DynamoDB tables)
- Compute stack (Lambda functions)
- API stack (API Gateway, Cognito)
- Frontend stack (S3, CloudFront)

---

## User Flow & Journey

### Complete User Journey Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER JOURNEY                               │
└─────────────────────────────────────────────────────────────────────┘

1. Application Access
   │
   ├──▶ User opens web application (https://binthere.example.com)
   │
   ├──▶ CloudFront serves React SPA from S3
   │
   └──▶ Application loads with Login Page

2. Authentication Flow
   │
   ├──▶ User enters credentials (email + password)
   │
   ├──▶ Frontend validates input
   │
   ├──▶ POST /auth/login → API Gateway → Lambda → Cognito
   │
   ├──▶ Cognito validates credentials
   │
   ├──▶ Returns JWT tokens (ID token, Access token, Refresh token)
   │
   ├──▶ Tokens stored in localStorage
   │
   └──▶ Redirect to Dustbins Overview Dashboard

3. Dashboard Initialization
   │
   ├──▶ Header loads with user info + notification bell
   │
   ├──▶ GET /dustbins (with JWT in Authorization header)
   │
   ├──▶ API Gateway validates JWT with Cognito Authorizer
   │
   ├──▶ Lambda queries DynamoDB for dustbin data
   │
   ├──▶ Returns array of dustbins with fill levels
   │
   ├──▶ Dustbin cards render with color-coded indicators
   │
   └──▶ Tips carousel loads at bottom

4. Real-Time Monitoring (Active Session)
   │
   ├──▶ WebSocket connection established to API Gateway
   │
   ├──▶ Smart Dustbin sends telemetry via IoT Core (MQTT)
   │
   ├──▶ IoT Rule triggers Lambda function
   │
   ├──▶ Lambda updates DynamoDB
   │
   ├──▶ Lambda sends update via WebSocket to connected clients
   │
   ├──▶ Frontend receives real-time update
   │
   ├──▶ Dustbin card updates without page refresh
   │
   └──▶ If critical level (80%+), notification created

5. Notification System
   │
   ├──▶ Notification bell shows count badge
   │
   ├──▶ User clicks bell → Notification panel opens
   │
   ├──▶ GET /notifications → Lambda → DynamoDB
   │
   ├──▶ Notifications displayed with timestamps
   │
   ├──▶ User clicks notification → Opens dustbin detail modal
   │
   └──▶ User deletes notification → DELETE /notifications/{id}

6. Dustbin Detail View
   │
   ├──▶ User clicks dustbin card
   │
   ├──▶ Modal opens with detailed information
   │
   ├──▶ Vertical progress bar shows fill level
   │
   ├──▶ Location, waste type, last updated displayed
   │
   ├──▶ Edit/Delete buttons available
   │
   └──▶ User closes modal → Returns to overview

7. Analytics View
   │
   ├──▶ User navigates to Analytics (if implemented)
   │
   ├──▶ GET /analytics → Lambda → DynamoDB (WasteData table)
   │
   ├──▶ Lambda aggregates data by time period
   │
   ├──▶ Returns dual-line chart data (Wet vs Dry waste)
   │
   ├──▶ Recharts renders interactive graph
   │
   └──▶ Dynamic date display updates based on selection

8. CRUD Operations
   │
   ├──▶ Add Dustbin:
   │    ├──▶ User clicks "Add Dustbin" button
   │    ├──▶ Dialog opens with form
   │    ├──▶ User fills: location, wasteType, capacity
   │    ├──▶ POST /dustbins → Lambda → DynamoDB
   │    └──▶ Success toast + dustbin list refreshes
   │
   ├──▶ Edit Dustbin:
   │    ├──▶ User clicks edit in detail modal
   │    ├──▶ Dialog pre-populates with current data
   │    ├──▶ User modifies fields
   │    ├──▶ PUT /dustbins/{id} → Lambda → DynamoDB
   │    └──▶ Success toast + data refreshes
   │
   └──▶ Delete Dustbin:
        ├──▶ User clicks delete with confirmation
        ├──▶ DELETE /dustbins/{id} → Lambda → DynamoDB
        └──▶ Success toast + dustbin removed from UI

9. Dark Mode Toggle
   │
   ├──▶ User clicks moon/sun icon in header
   │
   ├──▶ Theme preference stored in localStorage
   │
   ├──▶ CSS custom properties update
   │
   └──▶ All components re-render with dark theme

10. Session Management
    │
    ├──▶ JWT expires after 1 hour (configurable)
    │
    ├──▶ Refresh token used to get new access token
    │
    ├──▶ If refresh fails → User logged out
    │
    └──▶ Redirect to Login Page

11. Logout Flow
    │
    ├──▶ User clicks account menu → Logout
    │
    ├──▶ WebSocket connection closed
    │
    ├──▶ JWT tokens cleared from localStorage
    │
    ├──▶ POST /auth/logout (optional - revoke token)
    │
    ├──▶ Cognito invalidates tokens
    │
    └──▶ Redirect to Login Page
```

---

## Authentication System

### Authentication Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     Authentication Flow                           │
└──────────────────────────────────────────────────────────────────┘

┌─────────────┐
│  User Input │
│ Email + Pwd │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Frontend        │
│ Validation      │
│ - Email format  │
│ - Pwd length    │
└──────┬──────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ API Call: POST /auth/login              │
│ Headers: Content-Type: application/json │
│ Body: { email, password }               │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────┐
│ API Gateway     │
│ - CORS check    │
│ - Rate limiting │
└──────┬──────────┘
       │
       ▼
┌─────────────────────────────┐
│ Lambda: AuthHandler         │
│ 1. Validate input           │
│ 2. Call Cognito API         │
│ 3. Initiate auth flow       │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ AWS Cognito                 │
│ 1. Verify credentials       │
│ 2. Check user status        │
│ 3. Generate JWT tokens      │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Response                    │
│ {                           │
│   idToken: "eyJ...",        │
│   accessToken: "eyJ...",    │
│   refreshToken: "eyJ...",   │
│   expiresIn: 3600,          │
│   user: {                   │
│     id, email, name         │
│   }                         │
│ }                           │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Frontend                    │
│ 1. Store tokens in          │
│    localStorage             │
│ 2. Set auth context         │
│ 3. Redirect to dashboard    │
└─────────────────────────────┘
```

### Token Management

**ID Token**: Contains user identity claims (email, name, role)
**Access Token**: Used for API authorization
**Refresh Token**: Used to obtain new access tokens

**Token Storage**:
```typescript
localStorage.setItem('idToken', idToken);
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);
```

**Token Refresh Flow**:
```
1. Access token expires (1 hour)
2. API call returns 401 Unauthorized
3. Frontend intercepts 401
4. Calls refresh endpoint with refresh token
5. Receives new access token
6. Retries original API call
7. If refresh fails → Logout user
```

### Protected Routes

All API endpoints (except /auth/login) require valid JWT:

```typescript
Authorization: Bearer <accessToken>
```

API Gateway Cognito Authorizer validates:
- Token signature
- Token expiration
- User pool membership
- Token issuer

---

## Application Architecture

### Component Hierarchy

```
App.tsx (Root Component)
│
├── Login Page (Unauthenticated)
│   ├── Login Form
│   ├── Password Input
│   └── Submit Button
│
└── Authenticated App
    │
    ├── Header
    │   ├── Logo
    │   ├── Dark Mode Toggle
    │   ├── Notification Bell
    │   │   └── Notification Panel (Dropdown)
    │   └── Account Menu
    │       ├── Profile Info
    │       ├── Settings
    │       └── Logout
    │
    ├── Dustbins Overview (Main Dashboard)
    │   ├── Search/Filter Controls
    │   ├── Add Dustbin Button
    │   ├── Dustbin Cards Grid
    │   │   └── Dustbin Card (×N)
    │   │       ├── Status Indicator
    │   │       ├── Fill Level Progress Bar
    │   │       ├── Location Info
    │   │       └── Click → Detail Modal
    │   └── Tips Carousel
    │       └── Tip Cards (Swipeable)
    │
    ├── Dustbin Detail Modal (Dialog)
    │   ├── Vertical Progress Bar
    │   ├── Dustbin Information
    │   ├── Last Updated Timestamp
    │   ├── Edit Button → Manage Dialog
    │   └── Delete Button → Confirmation
    │
    ├── Manage Dustbin Dialog (Create/Edit)
    │   ├── Form Fields
    │   │   ├── Location (Text Input)
    │   │   ├── Waste Type (Select)
    │   │   └── Capacity (Number Input)
    │   ├── Submit Button
    │   └── Cancel Button
    │
    └── Analytics Graph (Optional Component)
        ├── Date Range Selector
        ├── Dual-line Chart (Recharts)
        │   ├── Wet Waste Line (Green)
        │   └── Dry Waste Line (Blue)
        └── Legend
```

### State Management

**Global State** (via React Context):
- `authContext`: User authentication state, tokens
- `themeContext`: Dark mode preference

**Local State** (component-level):
- `dustbins`: Array of dustbin objects
- `notifications`: Array of notification objects
- `selectedDustbin`: Currently viewed dustbin
- `isLoading`: Loading states
- `error`: Error messages

### Data Fetching Pattern

```typescript
useEffect(() => {
  const fetchDustbins = async () => {
    try {
      setLoading(true);
      const response = await api.getDustbins();
      setDustbins(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  fetchDustbins();
}, []);
```

---

## Data Flow Architecture

### Real-Time Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    Real-Time Data Pipeline                        │
└──────────────────────────────────────────────────────────────────┘

Smart Dustbin (IoT Device)
│
├── Sensors collect data every 5 minutes:
│   ├── Ultrasonic sensor → Fill level (cm)
│   ├── Weight sensor → Waste weight (kg)
│   └── Classifier → Waste type (Wet/Dry)
│
├── ESP32 controller processes data
│
└── Publishes MQTT message
    │
    ▼
AWS IoT Core (MQTT Broker)
│
├── Topic: dustbins/{dustbinId}/telemetry
│
├── Message Payload:
│   {
│     "dustbinId": "DB001",
│     "fillLevel": 75,
│     "wasteType": "Dry",
│     "weight": 12.5,
│     "timestamp": 1698765432000,
│     "location": "Building A - Floor 1"
│   }
│
└── IoT Rule Engine triggers
    │
    ▼
AWS Lambda (IoTDataHandler)
│
├── Validates data
│
├── Calculates fill percentage
│
├── Determines status (Normal/Warning/Critical)
│
├── Updates DynamoDB (Dustbins table)
│
├── Inserts record in WasteData table (analytics)
│
├── IF fillLevel >= 80%:
│   ├── Creates notification in Notifications table
│   └── Publishes to SNS topic (email/SMS alert)
│
└── Sends WebSocket message to connected clients
    │
    ▼
API Gateway (WebSocket)
│
├── Broadcasts to all connected admin clients
│
└── Message: { type: 'DUSTBIN_UPDATE', data: {...} }
    │
    ▼
Frontend (React App)
│
├── WebSocket handler receives message
│
├── Updates local state (dustbins array)
│
├── React re-renders affected components
│
├── Dustbin card updates:
│   ├── Progress bar fills to new level
│   ├── Color changes based on threshold
│   └── "Last Updated" timestamp refreshes
│
└── If new notification:
    ├── Bell icon shows updated count
    └── Toast notification appears
```

### REST API Data Flow

```
User Action (e.g., Add Dustbin)
│
├── User fills form in Manage Dustbin Dialog
│
├── Clicks "Add Dustbin" button
│
└── Frontend validation
    │
    ▼
API Request
│
├── POST /dustbins
│
├── Headers:
│   ├── Authorization: Bearer {accessToken}
│   └── Content-Type: application/json
│
└── Body:
    {
      "location": "Building B - Floor 2",
      "wasteType": "Wet",
      "capacity": 100
    }
    │
    ▼
API Gateway
│
├── CORS validation
│
├── Cognito Authorizer validates JWT
│
└── Routes to Lambda
    │
    ▼
Lambda (DustbinCRUD)
│
├── Input validation
│
├── Generates unique dustbinId
│
├── Creates DynamoDB item:
│   {
│     "dustbinId": "DB012",
│     "location": "Building B - Floor 2",
│     "wasteType": "Wet",
│     "capacity": 100,
│     "fillLevel": 0,
│     "status": "Active",
│     "createdAt": 1698765432000,
│     "lastUpdated": 1698765432000
│   }
│
├── Puts item in DynamoDB
│
└── Returns response
    │
    ▼
Frontend
│
├── Receives success response
│
├── Shows success toast notification
│
├── Closes dialog
│
├── Refreshes dustbins list
│
└── New dustbin card appears in grid
```

---

## Real-Time Monitoring System

### WebSocket Connection Management

```typescript
// WebSocket connection lifecycle

1. Connection Establishment
   ├── User logs in successfully
   ├── Frontend initiates WebSocket connection
   ├── wss://api.binthere.example.com/ws
   ├── Connection request includes JWT token
   ├── API Gateway validates token
   ├── Lambda (WebSocketManager) stores connectionId
   └── Connection established

2. Active Connection
   ├── Heartbeat/ping every 30 seconds
   ├── Server responds with pong
   ├── Listens for real-time updates
   └── Handles reconnection on disconnect

3. Message Handling
   ├── Receives message from server
   ├── Parses JSON payload
   ├── Updates local state based on message type:
   │   ├── DUSTBIN_UPDATE → Update dustbin data
   │   ├── NEW_NOTIFICATION → Add to notifications
   │   └── DUSTBIN_DELETED → Remove from list
   └── Triggers UI re-render

4. Connection Closure
   ├── User logs out
   ├── Send disconnect message
   ├── Lambda removes connectionId from store
   └── WebSocket connection closed
```

### Monitoring Dashboard Features

1. **Live Fill Level Updates**
   - Progress bars animate on data changes
   - Color transitions (green → yellow → red)
   - Timestamp updates in real-time

2. **Alert System**
   - Critical level notifications (80%+)
   - Visual indicators (red pulse effect)
   - Sound alerts (optional)
   - Browser push notifications (optional)

3. **Status Indicators**
   - Online/Offline status for each dustbin
   - Last seen timestamp
   - Connection quality indicator

---

## Database Design

### DynamoDB Tables Schema

#### 1. Dustbins Table

```yaml
Table Name: BinThere-Dustbins
Primary Key: dustbinId (String)

Attributes:
  - dustbinId: String (Partition Key)
  - location: String
  - wasteType: String (Wet | Dry | Mixed)
  - capacity: Number (in liters)
  - fillLevel: Number (percentage 0-100)
  - status: String (Active | Inactive | Maintenance)
  - deviceId: String (IoT device identifier)
  - latitude: Number
  - longitude: Number
  - lastUpdated: Number (Unix timestamp)
  - createdAt: Number (Unix timestamp)

Global Secondary Index:
  - GSI Name: location-index
  - Partition Key: location
  - Sort Key: lastUpdated

Example Item:
{
  "dustbinId": "DB001",
  "location": "Building A - Floor 1",
  "wasteType": "Dry",
  "capacity": 120,
  "fillLevel": 75,
  "status": "Active",
  "deviceId": "ESP32-001",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "lastUpdated": 1698765432000,
  "createdAt": 1698700000000
}
```

#### 2. Notifications Table

```yaml
Table Name: BinThere-Notifications
Primary Key: notificationId (String)
Sort Key: timestamp (Number)

Attributes:
  - notificationId: String (Partition Key)
  - timestamp: Number (Sort Key, Unix timestamp)
  - message: String
  - type: String (Alert | Info | Warning | Error)
  - isRead: Boolean
  - dustbinId: String (Reference to Dustbins table)
  - severity: String (Low | Medium | High | Critical)
  - ttl: Number (Time to live - auto-delete after 30 days)

Global Secondary Index:
  - GSI Name: dustbin-index
  - Partition Key: dustbinId
  - Sort Key: timestamp

Example Item:
{
  "notificationId": "NOTIF-12345",
  "timestamp": 1698765432000,
  "message": "Dustbin DB001 is 85% full - immediate collection required",
  "type": "Alert",
  "isRead": false,
  "dustbinId": "DB001",
  "severity": "Critical",
  "ttl": 1701357432
}
```

#### 3. WasteData Table

```yaml
Table Name: BinThere-WasteData
Primary Key: dataId (String)
Sort Key: timestamp (Number)

Attributes:
  - dataId: String (Partition Key, format: dustbinId#timestamp)
  - timestamp: Number (Sort Key, Unix timestamp)
  - dustbinId: String
  - wetWaste: Number (kg)
  - dryWaste: Number (kg)
  - totalWaste: Number (kg)
  - fillLevel: Number (percentage)
  - collectionStatus: String (Pending | Collected)

Global Secondary Index:
  - GSI Name: dustbinId-timestamp-index
  - Partition Key: dustbinId
  - Sort Key: timestamp

Example Item:
{
  "dataId": "DB001#1698765432000",
  "timestamp": 1698765432000,
  "dustbinId": "DB001",
  "wetWaste": 0,
  "dryWaste": 12.5,
  "totalWaste": 12.5,
  "fillLevel": 75,
  "collectionStatus": "Pending"
}
```

#### 4. Users Table

```yaml
Table Name: BinThere-Users
Primary Key: userId (String)

Attributes:
  - userId: String (Partition Key, Cognito User ID)
  - email: String
  - name: String
  - role: String (Admin | Operator | Viewer)
  - phoneNumber: String
  - createdAt: Number (Unix timestamp)
  - lastLogin: Number (Unix timestamp)
  - preferences: Map
    - theme: String (light | dark)
    - notifications: Boolean
    - language: String

Example Item:
{
  "userId": "cognito-user-123",
  "email": "admin@binthere.com",
  "name": "John Doe",
  "role": "Admin",
  "phoneNumber": "+1234567890",
  "createdAt": 1698700000000,
  "lastLogin": 1698765432000,
  "preferences": {
    "theme": "dark",
    "notifications": true,
    "language": "en"
  }
}
```

### Data Retention Policy

- **Dustbins**: Retained indefinitely (active records)
- **Notifications**: Auto-delete after 30 days (TTL)
- **WasteData**: Retained for 1 year (analytics)
- **Users**: Retained while account is active

---

## API Layer

### API Service (`/services/api.ts`)

```typescript
// Centralized API service with typed responses

import { 
  Dustbin, 
  Notification, 
  WasteDataPoint,
  ApiResponse 
} from '../types/api.types';

const API_BASE_URL = 'https://api.binthere.example.com';

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Dustbin APIs
  async getDustbins(): Promise<ApiResponse<Dustbin[]>> {
    const response = await fetch(`${API_BASE_URL}/dustbins`, {
      headers: this.getAuthHeaders()
    });
    return response.json();
  }

  async getDustbinById(id: string): Promise<ApiResponse<Dustbin>> {
    const response = await fetch(`${API_BASE_URL}/dustbins/${id}`, {
      headers: this.getAuthHeaders()
    });
    return response.json();
  }

  async createDustbin(data: Partial<Dustbin>): Promise<ApiResponse<Dustbin>> {
    const response = await fetch(`${API_BASE_URL}/dustbins`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  }

  // Notification APIs
  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      headers: this.getAuthHeaders()
    });
    return response.json();
  }

  // Analytics APIs
  async getWasteAnalytics(period: string): Promise<ApiResponse<WasteDataPoint[]>> {
    const response = await fetch(
      `${API_BASE_URL}/analytics?period=${period}`,
      { headers: this.getAuthHeaders() }
    );
    return response.json();
  }
}

export const api = new ApiService();
```

### Type Definitions (`/types/api.types.ts`)

```typescript
export interface Dustbin {
  dustbinId: string;
  location: string;
  wasteType: 'Wet' | 'Dry' | 'Mixed';
  capacity: number;
  fillLevel: number;
  status: 'Active' | 'Inactive' | 'Maintenance';
  lastUpdated: number;
  latitude?: number;
  longitude?: number;
}

export interface Notification {
  notificationId: string;
  timestamp: number;
  message: string;
  type: 'Alert' | 'Info' | 'Warning' | 'Error';
  isRead: boolean;
  dustbinId: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface WasteDataPoint {
  timestamp: number;
  wetWaste: number;
  dryWaste: number;
  totalWaste: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
```

---

## Frontend Components

### Key Component Details

#### 1. **Dustbin Card** (`dustbin-card.tsx`)
- Displays individual dustbin information
- Color-coded progress bar based on fill level
- Click handler to open detail modal
- Real-time updates via WebSocket
- Responsive design for mobile/desktop

#### 2. **Dustbin Detail Modal** (`dustbin-detail-modal.tsx`)
- Vertical progress bar visualization
- Full dustbin information display
- Edit and Delete action buttons
- Last updated timestamp
- Responsive modal overlay

#### 3. **Header** (`header.tsx`)
- BinThere logo/branding
- Dark mode toggle button
- Notification bell with badge count
- Account menu dropdown
- Sticky positioning

#### 4. **Notification System**
- Bell icon with unread count badge
- Dropdown panel with notification list
- Mark as read functionality
- Delete individual notifications
- Timestamp formatting (relative time)

#### 5. **Analytics Graph** (`analytics-graph.tsx`)
- Recharts dual-line chart
- Wet waste (green line)
- Dry waste (blue line)
- Responsive chart sizing
- Interactive tooltips
- Dark mode support

#### 6. **Tips Carousel** (`tips-carousel.tsx`)
- Swipeable tip cards
- Environmental waste management tips
- Auto-play with manual controls
- Responsive card layout

---

## Security Architecture

### Security Layers

```
┌──────────────────────────────────────────────────────────────┐
│                    Security Architecture                      │
└──────────────────────────────────────────────────────────────┘

Layer 1: Network Security
├── CloudFront with AWS Shield (DDoS protection)
├── SSL/TLS encryption (HTTPS only)
├── WAF (Web Application Firewall) rules
│   ├── SQL injection protection
│   ├── XSS protection
│   └── Rate limiting
└── VPC with private subnets for Lambda

Layer 2: Authentication & Authorization
├── AWS Cognito User Pools
├── JWT token-based authentication
├── Token expiration (1 hour for access tokens)
├── Refresh token rotation
└── Role-based access control (RBAC)

Layer 3: API Security
├── API Gateway with Cognito Authorizer
├── Request validation (schema validation)
├── CORS configuration (whitelist domains)
├── API key management
└── Throttling (1000 req/min per user)

Layer 4: Data Security
├── DynamoDB encryption at rest (AES-256)
├── Data encryption in transit (TLS 1.2+)
├── IAM policies (least privilege)
├── VPC endpoints for private communication
└── Backup encryption

Layer 5: IoT Security
├── X.509 certificate authentication
├── Device policies (per-device permissions)
├── Secure MQTT over TLS
└── Certificate rotation

Layer 6: Application Security
├── Input validation on frontend
├── XSS prevention (React auto-escaping)
├── CSRF protection (token-based)
├── Content Security Policy (CSP) headers
└── Secrets management (AWS Secrets Manager)
```

### Security Best Practices

1. **No Hardcoded Credentials**: All secrets in AWS Secrets Manager
2. **Principle of Least Privilege**: IAM roles with minimal permissions
3. **Regular Security Audits**: AWS Config compliance checks
4. **Logging & Monitoring**: CloudWatch logs for security events
5. **Data Sanitization**: Input validation on all user inputs
6. **Secure Headers**: X-Frame-Options, X-Content-Type-Options

---

## Deployment Architecture

### Deployment Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│                    CI/CD Pipeline                             │
└──────────────────────────────────────────────────────────────┘

Developer
│
├── Git push to main branch (GitHub/GitLab/Bitbucket)
│
└── Triggers AWS CodePipeline
    │
    ▼
Source Stage (AWS CodePipeline)
│
├── Pulls code from repository
│
└── Triggers CodeBuild
    │
    ▼
Build Stage (AWS CodeBuild)
│
├── Install dependencies (npm install)
│
├── Run tests (npm test)
│
├── Build React app (npm run build)
│
├── Run security scans (npm audit)
│
└── Create deployment artifacts
    │
    ▼
Deploy Stage
│
├── Frontend Deployment:
│   ├── Upload build files to S3 bucket
│   ├── Invalidate CloudFront cache
│   └── Verify deployment
│
├── Backend Deployment (Lambda):
│   ├── Package Lambda functions
│   ├── Update Lambda function code
│   └── Run smoke tests
│
└── Infrastructure Updates:
    ├── Apply CloudFormation stack changes
    ├── Update DynamoDB tables (if schema changed)
    └── Update API Gateway configurations
    │
    ▼
Post-Deployment
│
├── Run integration tests
│
├── Health checks
│
├── CloudWatch alarms activated
│
└── Send notification (SNS → Slack/Email)
```

### Environment Strategy

```
Development Environment
├── Separate AWS account
├── Lower capacity DynamoDB tables
├── Reduced Lambda memory/timeout
└── Domain: dev.binthere.example.com

Staging Environment
├── Production-like setup
├── Same AWS services
├── Integration testing
└── Domain: staging.binthere.example.com

Production Environment
├── Full capacity provisioning
├── Auto-scaling enabled
├── Multi-region (optional)
└── Domain: binthere.example.com
```

---

## Scalability & Performance

### Scalability Strategy

```
Component-Level Scalability:

1. Frontend (S3 + CloudFront)
   ├── Global edge locations (low latency)
   ├── Automatic scaling (no limits)
   └── Cost: Pay per request

2. API Gateway
   ├── Auto-scales to handle any traffic
   ├── Throttling limits: 10,000 req/sec (adjustable)
   └── Regional endpoints for low latency

3. Lambda Functions
   ├── Auto-scales: 1 to 1000+ concurrent executions
   ├── Reserved concurrency for critical functions
   └── Provisioned concurrency for consistent performance

4. DynamoDB
   ├── On-Demand billing mode (auto-scaling)
   ├── Global tables for multi-region
   ├── DAX (DynamoDB Accelerator) for caching
   └── Read/write capacity auto-adjusts

5. WebSocket Connections
   ├── API Gateway WebSocket handles 10,000+ connections
   ├── Connection state stored in DynamoDB
   └── Lambda fan-out for broadcasting
```

### Performance Optimizations

```
Frontend Performance:
├── Code splitting (React.lazy)
├── Lazy loading images
├── Minification and bundling
├── Tree shaking (remove unused code)
├── Gzip compression via CloudFront
└── Service Worker for offline capability

Backend Performance:
├── Lambda cold start optimization:
│   ├── Smaller bundle sizes
│   ├── Provisioned concurrency for critical functions
│   └── Connection pooling for DynamoDB
├── DynamoDB query optimization:
│   ├── Use GSI for efficient queries
│   ├── Batch operations (BatchGetItem)
│   └── Consistent read only when necessary
└── Caching:
    ├── API Gateway caching (TTL: 5 minutes)
    ├── CloudFront edge caching
    └── Browser caching (Cache-Control headers)
```

### Load Testing Targets

- **Concurrent Users**: 1,000+
- **API Response Time**: < 200ms (p99)
- **WebSocket Message Latency**: < 100ms
- **Dashboard Load Time**: < 2 seconds
- **Real-time Update Latency**: < 500ms

---

## Monitoring & Logging

### CloudWatch Monitoring

```
Key Metrics to Monitor:

1. Application Metrics
   ├── API Gateway:
   │   ├── Request count (by endpoint)
   │   ├── 4xx errors (client errors)
   │   ├── 5xx errors (server errors)
   │   ├── Latency (p50, p99)
   │   └── Integration latency
   │
   ├── Lambda:
   │   ├── Invocation count
   │   ├── Error count and rate
   │   ├── Duration (execution time)
   │   ├── Throttles
   │   ├── Concurrent executions
   │   └── Memory utilization
   │
   ├── DynamoDB:
   │   ├── ConsumedReadCapacityUnits
   │   ├── ConsumedWriteCapacityUnits
   │   ├── UserErrors (validation errors)
   │   ├── SystemErrors (service errors)
   │   └── Throttled requests
   │
   └── IoT Core:
       ├── PublishIn.Success
       ├── RulesExecuted
       └── Failure.PublishIn

2. Business Metrics
   ├── Active dustbins count
   ├── Critical fill level alerts (80%+)
   ├── Average fill level across all dustbins
   ├── Waste collection frequency
   └── User login/logout events

3. Infrastructure Metrics
   ├── CloudFront cache hit ratio
   ├── S3 bucket size
   ├── NAT Gateway traffic (if in VPC)
   └── Data transfer costs
```

### Alarms & Alerts

```
Critical Alarms (PagerDuty/SNS):
├── Lambda error rate > 5% (5 min)
├── API Gateway 5xx rate > 1% (5 min)
├── DynamoDB throttling events
├── IoT device disconnection > 10 devices
└── Lambda function duration > timeout - 10s

Warning Alarms (Email/Slack):
├── API Gateway latency > 1 second (p99)
├── Lambda concurrent executions > 80% of limit
├── DynamoDB capacity > 80% utilized
├── Dustbin fill level > 80% (business alert)
└── CloudFront 4xx rate > 10%
```

### Log Aggregation

```
CloudWatch Logs Insights Queries:

1. Find errors in Lambda functions:
   fields @timestamp, @message
   | filter @message like /ERROR/
   | sort @timestamp desc
   | limit 100

2. API latency analysis:
   fields @timestamp, requestId, latency
   | filter latency > 1000
   | stats avg(latency), max(latency), count() by endpoint

3. Dustbin critical alerts:
   fields @timestamp, dustbinId, fillLevel
   | filter fillLevel >= 80
   | sort @timestamp desc
```

### Distributed Tracing

- **AWS X-Ray**: End-to-end request tracing
  - Trace API requests through API Gateway → Lambda → DynamoDB
  - Identify bottlenecks
  - Visualize service map
  - Analyze latency distribution

---

## Cost Optimization

### Estimated Monthly Costs

```
Assumptions: 100 dustbins, 10 admin users, 1M API requests/month

Service Breakdown:

1. Compute
   ├── Lambda: $5-10 (1M requests, 512MB avg)
   └── API Gateway: $3.50 (1M REST requests)

2. Storage
   ├── DynamoDB: $25-50 (on-demand, 10GB storage)
   ├── S3: $1-2 (web hosting, <10GB)
   └── CloudWatch Logs: $5-10 (30-day retention)

3. Data Transfer
   ├── CloudFront: $10-20 (10GB/month)
   └── IoT Core: $5 (100 devices, 5-min intervals)

4. Other Services
   ├── Cognito: Free (under 50K MAU)
   ├── Route 53: $0.50 (hosted zone)
   └── ACM: Free (SSL certificate)

Total Estimated Cost: $50-120/month

Cost Optimization Tips:
├── Use DynamoDB on-demand for variable traffic
├── Set CloudWatch log retention to 7-30 days
├── Enable S3 lifecycle policies (delete old builds)
├── Use Lambda reserved concurrency judiciously
└── Implement CloudFront caching aggressively
```

---

## Future Enhancements

### Roadmap

**Phase 1: Core Features** (Complete)
- ✅ Authentication system
- ✅ Dustbin monitoring dashboard
- ✅ Real-time updates
- ✅ Notification system
- ✅ Dark mode

**Phase 2: Advanced Analytics** (Next)
- 📊 Predictive analytics (ML-based fill level predictions)
- 📈 Historical trend analysis
- 🗺️ Geographic heat maps
- 📱 Mobile app (React Native)

**Phase 3: Automation** (Future)
- 🤖 Automated collection route optimization
- 🚛 Integration with waste collection vehicles
- 📧 Automated email reports (weekly/monthly)
- 🔔 SMS alerts for critical situations

**Phase 4: IoT Expansion** (Future)
- 🌡️ Temperature sensors (fire detection)
- 👃 Odor sensors (waste freshness)
- 📹 Camera integration (visual verification)
- 🔒 Smart locks (secure access)

**Phase 5: Sustainability** (Future)
- ♻️ Carbon footprint tracking
- 🌱 Recycling rate analytics
- 🏆 Gamification (waste reduction goals)
- 📊 ESG reporting for enterprises

---

## Conclusion

BinThere is a comprehensive, cloud-native smart waste management solution built on AWS serverless architecture. The system provides real-time monitoring, intelligent analytics, and scalable infrastructure to optimize waste collection operations.

### Key Takeaways

✅ **Serverless Architecture**: Cost-effective and infinitely scalable  
✅ **Real-Time Monitoring**: WebSocket-based live updates  
✅ **Secure by Design**: Multi-layer security with AWS best practices  
✅ **User-Friendly**: Intuitive dashboard with dark mode support  
✅ **IoT-Enabled**: Seamless integration with smart dustbin devices  
✅ **Production-Ready**: Complete with CI/CD, monitoring, and logging  

### Technology Highlights

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: AWS Lambda + API Gateway + DynamoDB
- **IoT**: AWS IoT Core with MQTT protocol
- **Auth**: AWS Cognito with JWT tokens
- **Deployment**: CloudFormation Infrastructure as Code
- **Monitoring**: CloudWatch + X-Ray for observability

---

## Appendix

### Useful Links

- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [AWS IoT Core Documentation](https://docs.aws.amazon.com/iot/latest/developerguide/)
- [API Gateway WebSocket APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api.html)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)

### Contact & Support

- **Project Repository**: (Add GitHub link)
- **Documentation**: (Add docs site)
- **Support Email**: support@binthere.example.com

---

**Document Version**: 1.0  
**Last Updated**: October 29, 2025  
**Author**: BinThere Development Team
