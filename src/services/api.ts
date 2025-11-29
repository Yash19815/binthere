/**
 * BinThere API Service Layer
 * 
 * This file centralizes all API calls to AWS backend services.
 * Replace placeholder URLs with your actual AWS API Gateway endpoints.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Dustbin {
  id: string;
  name: string;
  location: string;
  overallFillLevel: number;
  wetWasteFillLevel: number;
  dryWasteFillLevel: number;
  lastUpdated: string;
  criticalTimestamp?: number; // Unix timestamp when dustbin became ≥80% full
  batteryLevel?: number; // Battery percentage (0-100)
  lastMaintenance?: string; // Last maintenance check date/time
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface GetDustbinsResponse {
  dustbins: Dustbin[];
}

export interface AddDustbinRequest {
  location: string;
}

export interface AddDustbinResponse {
  success: boolean;
  dustbin: Dustbin;
  message: string;
}

export interface UpdateDustbinRequest {
  location: string;
}

export interface UpdateDustbinResponse {
  success: boolean;
  dustbin: Dustbin;
  message: string;
}

export interface RemoveDustbinsRequest {
  dustbinIds: string[];
}

export interface RemoveDustbinsResponse {
  success: boolean;
  removed: string[];
  renumberedDustbins: Dustbin[];
  message: string;
}

export interface AnalyticsDataPoint {
  date: string; // Human-readable date (e.g., "Oct 21")
  wetWaste: number;
  dryWaste: number;
  timestamp: string; // ISO timestamp
}

export interface GetAnalyticsResponse {
  period: string;
  dustbinId?: string;
  data: AnalyticsDataPoint[];
}

export interface Notification {
  id: string;
  dustbinName: string;
  dustbinLocation: string;
  fillLevel: number;
  timestamp: string;
  criticalTimestamp: number;
}

export interface GetNotificationsResponse {
  notifications: Notification[];
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Backend API Base URL
 * 
 * PostgreSQL Backend Setup:
 * 1. Set up PostgreSQL database (see /backend/POSTGRESQL_SETUP_GUIDE.md)
 * 2. Run backend server (see /backend/nodejs-express/README.md)
 * 3. Set VITE_AWS_API_GATEWAY_URL to your backend URL
 * 
 * Example: http://localhost:3001/api (development)
 * Example: https://binthere-api.yourdomain.com/api (production)
 */
const API_BASE_URL = import.meta.env.VITE_AWS_API_GATEWAY_URL || '';

/**
 * API Key (Optional - not used with PostgreSQL backend)
 */
const API_KEY = import.meta.env.VITE_AWS_API_KEY || '';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generic fetch wrapper with error handling and AWS API Key injection
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Add API Key to headers if available
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(API_KEY && { 'x-api-key': API_KEY }),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || 
        errorData.error || 
        `HTTP Error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * GET /dustbins - Fetch all dustbins with current fill levels
 * 
 * AWS Lambda Operation:
 * - Queries DynamoDB for all dustbin records
 * - Returns current fill levels and last updated timestamps
 * - Includes criticalTimestamp for dustbins ≥80% full
 */
export async function fetchDustbins(): Promise<Dustbin[]> {
  const response = await apiFetch<GetDustbinsResponse>('/dustbins', {
    method: 'GET',
  });
  return response.dustbins;
}

/**
 * POST /dustbins - Add a new dustbin to the system
 * 
 * AWS Lambda Operation:
 * - Generates new dustbin ID (auto-incremented)
 * - Creates DynamoDB record with initial 0% fill levels
 * - Registers device in IoT Core (if physical sensor exists)
 * 
 * @param location - Physical location of the new dustbin
 */
export async function addDustbin(location: string): Promise<Dustbin> {
  const response = await apiFetch<AddDustbinResponse>('/dustbins', {
    method: 'POST',
    body: JSON.stringify({ location } as AddDustbinRequest),
  });
  return response.dustbin;
}

/**
 * PUT /dustbins/{id} - Update dustbin location
 * 
 * AWS Lambda Operation:
 * - Updates DynamoDB record for specified dustbin
 * - Only location field is editable (fill levels come from IoT sensors)
 * 
 * @param id - Dustbin ID to update
 * @param location - New location name
 */
export async function updateDustbin(id: string, location: string): Promise<Dustbin> {
  const response = await apiFetch<UpdateDustbinResponse>(`/dustbins/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ location } as UpdateDustbinRequest),
  });
  return response.dustbin;
}

/**
 * DELETE /dustbins - Remove one or more dustbins
 * 
 * AWS Lambda Operation:
 * - Deletes DynamoDB records for specified dustbins
 * - Renumbers remaining dustbins sequentially
 * - Deregisters IoT devices (if applicable)
 * 
 * @param dustbinIds - Array of dustbin IDs to remove
 */
export async function removeDustbins(dustbinIds: string[]): Promise<Dustbin[]> {
  const response = await apiFetch<RemoveDustbinsResponse>('/dustbins', {
    method: 'DELETE',
    body: JSON.stringify({ dustbinIds } as RemoveDustbinsRequest),
  });
  return response.renumberedDustbins;
}

/**
 * GET /analytics - Fetch historical fill count data for charts
 * 
 * AWS Lambda Operation:
 * - Queries DynamoDB/TimeStream for historical data
 * - Aggregates fill counts by time period
 * - Returns separate wet/dry waste counts per day
 * 
 * @param period - Time period ("last-week", "last-month", or "month-0" to "month-11")
 * @param dustbinId - Optional specific dustbin ID (omit for aggregated data)
 */
export async function fetchAnalyticsData(
  period: string,
  dustbinId?: string
): Promise<AnalyticsDataPoint[]> {
  const params = new URLSearchParams({ period });
  if (dustbinId) {
    params.append('dustbinId', dustbinId);
  }

  const response = await apiFetch<GetAnalyticsResponse>(
    `/analytics?${params.toString()}`,
    { method: 'GET' }
  );
  return response.data;
}

/**
 * GET /notifications - Fetch critical alerts for dustbins ≥80% full
 * 
 * AWS Lambda Operation:
 * - Queries DynamoDB for dustbins with fillLevel ≥ 80%
 * - Returns sorted by criticalTimestamp (newest first)
 * - Automatically updates when IoT sensors report new data
 */
export async function fetchNotifications(): Promise<Notification[]> {
  const response = await apiFetch<GetNotificationsResponse>('/notifications', {
    method: 'GET',
  });
  return response.notifications;
}

/**
 * POST /refresh - Manually trigger data refresh from IoT sensors
 * 
 * AWS Lambda Operation:
 * - Forces IoT Core to poll all connected dustbin sensors
 * - Updates DynamoDB with latest readings
 * - Returns updated dustbin data
 * 
 * Note: This is optional - real-time IoT updates happen automatically
 */
export async function refreshDustbinData(): Promise<Dustbin[]> {
  const response = await apiFetch<GetDustbinsResponse>('/refresh', {
    method: 'POST',
  });
  return response.dustbins;
}

// ============================================================================
// MOCK DATA FALLBACK (Development Mode)
// ============================================================================

/**
 * Check if running in development mode without AWS backend
 */
export const isUsingMockData = !import.meta.env.VITE_AWS_API_GATEWAY_URL;

/**
 * Mock data generator for local development
 * Remove this section once AWS backend is connected
 */
export const mockApi = {
  getDustbins: (): Dustbin[] => {
    // This matches your current mock data structure
    const maintenancePeriods = ['1 day ago', '3 days ago', '5 days ago', '1 week ago', '2 weeks ago'];
    
    return Array.from({ length: 8 }, (_, i) => {
      const id = String(i + 1).padStart(3, '0');
      const overallFill = Math.floor(Math.random() * 100);
      const wetFill = Math.max(0, overallFill + Math.floor(Math.random() * 20 - 10));
      const dryFill = Math.max(0, overallFill + Math.floor(Math.random() * 20 - 10));
      const battery = Math.floor(Math.random() * 100);
      
      return {
        id,
        name: `Dustbin #${id}`,
        location: ['Central Park North', 'Market District', 'Downtown Plaza', 'Shopping Mall'][i % 4],
        overallFillLevel: overallFill,
        wetWasteFillLevel: Math.min(100, wetFill),
        dryWasteFillLevel: Math.min(100, dryFill),
        lastUpdated: `${Math.floor(Math.random() * 60)} mins ago`,
        batteryLevel: battery,
        lastMaintenance: maintenancePeriods[i % maintenancePeriods.length],
        ...(overallFill >= 80 && { criticalTimestamp: Date.now() - Math.random() * 3600000 }),
      };
    });
  },
};

// ============================================================================
// EXPORT DEFAULT API CLIENT
// ============================================================================

export default {
  fetchDustbins,
  addDustbin,
  updateDustbin,
  removeDustbins,
  fetchAnalyticsData,
  fetchNotifications,
  refreshDustbinData,
};