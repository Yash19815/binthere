/**
 * BinThere API Type Definitions
 * 
 * Centralized type definitions for API requests and responses
 */

// ============================================================================
// CORE ENTITIES
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

export interface Notification {
  id: string;
  dustbinName: string;
  dustbinLocation: string;
  fillLevel: number;
  timestamp: string;
  criticalTimestamp: number;
}

export interface AnalyticsDataPoint {
  date: string; // Human-readable date (e.g., "Oct 21")
  wetWaste: number;
  dryWaste: number;
  timestamp: string; // ISO timestamp
}

// ============================================================================
// API REQUEST TYPES
// ============================================================================

export interface AddDustbinRequest {
  location: string;
}

export interface UpdateDustbinRequest {
  location: string;
}

export interface RemoveDustbinsRequest {
  dustbinIds: string[];
}

export interface AnalyticsQueryParams {
  period: string; // "last-week", "last-month", "month-0" to "month-11"
  dustbinId?: string; // Optional: specific dustbin or omit for aggregated
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface GetDustbinsResponse {
  dustbins: Dustbin[];
}

export interface AddDustbinResponse {
  success: boolean;
  dustbin: Dustbin;
  message: string;
}

export interface UpdateDustbinResponse {
  success: boolean;
  dustbin: Dustbin;
  message: string;
}

export interface RemoveDustbinsResponse {
  success: boolean;
  removed: string[];
  renumberedDustbins: Dustbin[];
  message: string;
}

export interface GetAnalyticsResponse {
  period: string;
  dustbinId?: string;
  data: AnalyticsDataPoint[];
}

export interface GetNotificationsResponse {
  notifications: Notification[];
}

// ============================================================================
// IOT SENSOR DATA (Backend Reference)
// ============================================================================

/**
 * Data format sent by IoT dustbin sensors to AWS IoT Core
 * This is for backend reference only - frontend doesn't receive this directly
 */
export interface IoTSensorPayload {
  deviceId: string; // Matches dustbin ID
  wetWasteFillLevel: number; // 0-100
  dryWasteFillLevel: number; // 0-100
  timestamp: string; // ISO timestamp
  batteryLevel?: number; // Optional: sensor battery percentage
  sensorStatus?: 'active' | 'inactive' | 'error'; // Sensor health status
  temperature?: number; // Optional: ambient temperature
  humidity?: number; // Optional: humidity (for waste decomposition tracking)
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type TimePeriod = 
  | 'last-week' 
  | 'last-month' 
  | 'month-0' 
  | 'month-1' 
  | 'month-2' 
  | 'month-3' 
  | 'month-4' 
  | 'month-5' 
  | 'month-6' 
  | 'month-7' 
  | 'month-8' 
  | 'month-9' 
  | 'month-10' 
  | 'month-11';

export type FillLevelThreshold = {
  low: number; // 0-60% (green)
  medium: number; // 60-80% (yellow/orange)
  high: number; // 80-100% (red)
};

export const FILL_LEVEL_THRESHOLDS: FillLevelThreshold = {
  low: 60,
  medium: 80,
  high: 100,
};

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface ApiError {
  message: string;
  statusCode?: number;
  endpoint?: string;
  timestamp: string;
}

export class BinThereApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'BinThereApiError';
  }
}
