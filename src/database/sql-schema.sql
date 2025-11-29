-- ============================================================================
-- BinThere - SQL Database Schema (PostgreSQL/MySQL Alternative to DynamoDB)
-- ============================================================================
-- Use this if you prefer AWS RDS instead of DynamoDB
-- Compatible with PostgreSQL 12+ and MySQL 8.0+

-- ============================================================================
-- TABLE 1: DUSTBINS
-- ============================================================================
CREATE TABLE dustbins (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    overall_fill_level DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (overall_fill_level BETWEEN 0 AND 100),
    wet_waste_fill_level DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (wet_waste_fill_level BETWEEN 0 AND 100),
    dry_waste_fill_level DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (dry_waste_fill_level BETWEEN 0 AND 100),
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    critical_timestamp BIGINT,  -- Unix timestamp when dustbin became ≥80% full
    device_id VARCHAR(50),
    battery_level DECIMAL(5,2) CHECK (battery_level BETWEEN 0 AND 100),
    sensor_status VARCHAR(20) CHECK (sensor_status IN ('active', 'inactive', 'error')),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    install_date DATE,
    last_maintenance DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_dustbins_location ON dustbins(location);
CREATE INDEX idx_dustbins_critical ON dustbins(overall_fill_level) WHERE overall_fill_level >= 80;
CREATE INDEX idx_dustbins_last_updated ON dustbins(last_updated DESC);
CREATE INDEX idx_dustbins_device_id ON dustbins(device_id);

-- Trigger to auto-update updated_at (PostgreSQL version)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dustbins_updated_at
BEFORE UPDATE ON dustbins
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE 2: ANALYTICS_HISTORY
-- ============================================================================
CREATE TABLE analytics_history (
    id SERIAL PRIMARY KEY,
    dustbin_id VARCHAR(10) NOT NULL,  -- "ALL" for aggregated data
    period VARCHAR(7) NOT NULL,  -- Format: "YYYY-MM" (e.g., "2025-10")
    date DATE NOT NULL,
    date_display VARCHAR(20) NOT NULL,  -- Human-readable (e.g., "Oct 21")
    wet_waste_fill_count INT NOT NULL DEFAULT 0,
    dry_waste_fill_count INT NOT NULL DEFAULT 0,
    total_fill_count INT NOT NULL DEFAULT 0,
    avg_wet_fill_level DECIMAL(5,2),
    avg_dry_fill_level DECIMAL(5,2),
    max_wet_fill_level DECIMAL(5,2),
    max_dry_fill_level DECIMAL(5,2),
    emptying_events INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (dustbin_id, date)
);

-- Indexes for performance
CREATE INDEX idx_analytics_dustbin_period ON analytics_history(dustbin_id, period, date);
CREATE INDEX idx_analytics_period ON analytics_history(period, date);
CREATE INDEX idx_analytics_date ON analytics_history(date DESC);

-- Foreign key constraint (optional - since "ALL" is also used)
-- ALTER TABLE analytics_history ADD CONSTRAINT fk_dustbin 
--     FOREIGN KEY (dustbin_id) REFERENCES dustbins(id) ON DELETE CASCADE;

-- ============================================================================
-- TABLE 3: IOT_SENSOR_LOGS
-- ============================================================================
CREATE TABLE iot_sensor_logs (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    dustbin_id VARCHAR(10) NOT NULL,
    timestamp BIGINT NOT NULL,  -- Unix timestamp (milliseconds)
    wet_waste_fill_level DECIMAL(5,2) NOT NULL,
    dry_waste_fill_level DECIMAL(5,2) NOT NULL,
    battery_level DECIMAL(5,2),
    sensor_status VARCHAR(20),
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    signal_strength INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dustbin_id) REFERENCES dustbins(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_iot_device_timestamp ON iot_sensor_logs(device_id, timestamp DESC);
CREATE INDEX idx_iot_dustbin ON iot_sensor_logs(dustbin_id);
CREATE INDEX idx_iot_timestamp ON iot_sensor_logs(timestamp DESC);

-- Partition by date for better performance (PostgreSQL 10+)
-- CREATE TABLE iot_sensor_logs_2025_10 PARTITION OF iot_sensor_logs
--     FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

-- Auto-delete logs older than 90 days (scheduled job required)
-- Run this as a daily cron job:
-- DELETE FROM iot_sensor_logs WHERE created_at < NOW() - INTERVAL '90 days';

-- ============================================================================
-- TABLE 4: SYSTEM_CONFIG
-- ============================================================================
CREATE TABLE system_config (
    config_key VARCHAR(100) PRIMARY KEY,
    config_value JSONB NOT NULL,  -- Use JSON for MySQL
    description TEXT,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE 5: NOTIFICATIONS (Alternative to querying dustbins)
-- ============================================================================
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    dustbin_id VARCHAR(10) NOT NULL,
    fill_level DECIMAL(5,2) NOT NULL,
    critical_timestamp BIGINT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dustbin_id) REFERENCES dustbins(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_notifications_dustbin ON notifications(dustbin_id);
CREATE INDEX idx_notifications_unread ON notifications(is_read, critical_timestamp DESC);
CREATE INDEX idx_notifications_timestamp ON notifications(critical_timestamp DESC);

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Insert sample dustbins
INSERT INTO dustbins (id, name, location, overall_fill_level, wet_waste_fill_level, dry_waste_fill_level, last_updated, critical_timestamp, device_id, battery_level, sensor_status, latitude, longitude, install_date) VALUES
('001', 'Dustbin #001', 'Central Park North', 85.00, 78.00, 92.00, '2025-10-27 10:35:00', 1729854900000, 'iot-device-001', 85.00, 'active', 40.7829, -73.9654, '2025-01-15'),
('002', 'Dustbin #002', 'Market District', 65.00, 68.00, 62.00, '2025-10-27 10:28:00', NULL, 'iot-device-002', 90.00, 'active', 40.7580, -73.9855, '2025-01-15'),
('003', 'Dustbin #003', 'Downtown Plaza', 42.00, 38.00, 46.00, '2025-10-27 10:30:00', NULL, 'iot-device-003', 78.00, 'active', 40.7614, -73.9776, '2025-01-20'),
('004', 'Dustbin #004', 'Shopping Mall', 92.00, 88.00, 96.00, '2025-10-27 10:38:00', 1729855080000, 'iot-device-004', 65.00, 'active', 40.7489, -73.9680, '2025-02-01'),
('005', 'Dustbin #005', 'City Hall', 58.00, 62.00, 54.00, '2025-10-27 10:25:00', NULL, 'iot-device-005', 88.00, 'active', 40.7127, -74.0059, '2025-02-10'),
('006', 'Dustbin #006', 'Library Square', 73.00, 75.00, 71.00, '2025-10-27 10:32:00', NULL, 'iot-device-006', 72.00, 'active', 40.7532, -73.9822, '2025-02-15'),
('007', 'Dustbin #007', 'Train Station', 28.00, 25.00, 31.00, '2025-10-27 10:20:00', NULL, 'iot-device-007', 95.00, 'active', 40.7527, -73.9772, '2025-03-01'),
('008', 'Dustbin #008', 'Park Avenue', 81.00, 79.00, 83.00, '2025-10-27 10:40:00', 1729855200000, 'iot-device-008', 80.00, 'active', 40.7484, -73.9857, '2025-03-15');

-- Insert sample analytics data (last week)
INSERT INTO analytics_history (dustbin_id, period, date, date_display, wet_waste_fill_count, dry_waste_fill_count, total_fill_count) VALUES
('ALL', '2025-10', '2025-10-21', 'Oct 21', 45, 38, 83),
('ALL', '2025-10', '2025-10-22', 'Oct 22', 52, 44, 96),
('ALL', '2025-10', '2025-10-23', 'Oct 23', 48, 41, 89),
('ALL', '2025-10', '2025-10-24', 'Oct 24', 50, 43, 93),
('ALL', '2025-10', '2025-10-25', 'Oct 25', 47, 40, 87),
('ALL', '2025-10', '2025-10-26', 'Oct 26', 54, 46, 100),
('ALL', '2025-10', '2025-10-27', 'Oct 27', 49, 42, 91);

-- Insert sample analytics for individual dustbin
INSERT INTO analytics_history (dustbin_id, period, date, date_display, wet_waste_fill_count, dry_waste_fill_count, total_fill_count) VALUES
('001', '2025-10', '2025-10-21', 'Oct 21', 5, 4, 9),
('001', '2025-10', '2025-10-22', 'Oct 22', 6, 5, 11),
('001', '2025-10', '2025-10-23', 'Oct 23', 5, 4, 9);

-- Insert system config
INSERT INTO system_config (config_key, config_value, description) VALUES
('notifications', '{"criticalThreshold": 80, "warningThreshold": 60, "emailAlerts": true, "smsAlerts": false, "alertRecipients": ["admin@binthere.com"]}', 'Notification settings'),
('analytics', '{"dataRetentionDays": 365, "aggregationInterval": "daily", "enablePredictiveAnalytics": true}', 'Analytics configuration'),
('dustbinCounter', '{"lastId": "008", "nextId": "009"}', 'Auto-increment counter for dustbin IDs');

-- Insert sample notifications
INSERT INTO notifications (dustbin_id, fill_level, critical_timestamp) VALUES
('001', 85.00, 1729854900000),
('004', 92.00, 1729855080000),
('008', 81.00, 1729855200000);

-- ============================================================================
-- USEFUL QUERIES
-- ============================================================================

-- Query 1: Get all critical dustbins (for notifications API)
-- SELECT * FROM dustbins WHERE overall_fill_level >= 80 ORDER BY critical_timestamp DESC;

-- Query 2: Get analytics for last week (aggregated)
-- SELECT * FROM analytics_history 
-- WHERE dustbin_id = 'ALL' 
--   AND date BETWEEN CURRENT_DATE - INTERVAL '7 days' AND CURRENT_DATE
-- ORDER BY date ASC;

-- Query 3: Get analytics for specific dustbin in October
-- SELECT * FROM analytics_history 
-- WHERE dustbin_id = '001' 
--   AND period = '2025-10'
-- ORDER BY date ASC;

-- Query 4: Get all unread notifications
-- SELECT n.*, d.name, d.location 
-- FROM notifications n
-- JOIN dustbins d ON n.dustbin_id = d.id
-- WHERE n.is_read = FALSE
-- ORDER BY n.critical_timestamp DESC;

-- Query 5: Daily aggregation job (run via Lambda/cron)
/*
INSERT INTO analytics_history (dustbin_id, period, date, date_display, wet_waste_fill_count, dry_waste_fill_count, total_fill_count)
SELECT 
    'ALL' as dustbin_id,
    TO_CHAR(CURRENT_DATE - 1, 'YYYY-MM') as period,
    CURRENT_DATE - 1 as date,
    TO_CHAR(CURRENT_DATE - 1, 'Mon DD') as date_display,
    SUM(CASE WHEN wet_waste_fill_level >= 80 THEN 1 ELSE 0 END) as wet_waste_fill_count,
    SUM(CASE WHEN dry_waste_fill_level >= 80 THEN 1 ELSE 0 END) as dry_waste_fill_count,
    SUM(CASE WHEN overall_fill_level >= 80 THEN 1 ELSE 0 END) as total_fill_count
FROM iot_sensor_logs
WHERE DATE(FROM_UNIXTIME(timestamp/1000)) = CURRENT_DATE - 1;
*/

-- ============================================================================
-- CLEANUP OLD LOGS (Schedule as daily cron job)
-- ============================================================================
-- DELETE FROM iot_sensor_logs WHERE created_at < NOW() - INTERVAL '90 days';

-- ============================================================================
-- BACKUP COMMANDS
-- ============================================================================
-- PostgreSQL: pg_dump -U username -d binthere > backup.sql
-- MySQL: mysqldump -u username -p binthere > backup.sql
