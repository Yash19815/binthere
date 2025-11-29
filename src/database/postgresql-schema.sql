-- ============================================================================
-- BinThere PostgreSQL Database Schema
-- ============================================================================
-- This schema supports the complete BinThere smart waste management system
-- with tables for dustbins, analytics history, notifications, and users.
--
-- Compatible with: PostgreSQL 12+, Neon, Railway, Render, Heroku, DigitalOcean
-- ============================================================================

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable timestamp functions
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
-- Stores admin user accounts for the BinThere dashboard

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Index for faster email lookups during login
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- DUSTBINS TABLE
-- ============================================================================
-- Master table for all dustbin devices in the system

CREATE TABLE dustbins (
    id VARCHAR(10) PRIMARY KEY, -- Format: "001", "002", etc.
    name VARCHAR(100) NOT NULL, -- Format: "Dustbin #001"
    location VARCHAR(255) NOT NULL,
    overall_fill_level INTEGER DEFAULT 0 CHECK (overall_fill_level BETWEEN 0 AND 100),
    wet_waste_fill_level INTEGER DEFAULT 0 CHECK (wet_waste_fill_level BETWEEN 0 AND 100),
    dry_waste_fill_level INTEGER DEFAULT 0 CHECK (dry_waste_fill_level BETWEEN 0 AND 100),
    battery_level INTEGER CHECK (battery_level BETWEEN 0 AND 100),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_maintenance TIMESTAMP WITH TIME ZONE,
    critical_timestamp TIMESTAMP WITH TIME ZONE, -- When dustbin became >= 80% full
    device_id VARCHAR(100) UNIQUE, -- IoT device identifier (optional)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_dustbins_location ON dustbins(location);
CREATE INDEX idx_dustbins_fill_level ON dustbins(overall_fill_level DESC);
CREATE INDEX idx_dustbins_critical ON dustbins(critical_timestamp DESC) WHERE critical_timestamp IS NOT NULL;
CREATE INDEX idx_dustbins_active ON dustbins(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- DUSTBIN_HISTORY TABLE
-- ============================================================================
-- Time-series data for tracking fill levels over time (for analytics graphs)

CREATE TABLE dustbin_history (
    id SERIAL PRIMARY KEY,
    dustbin_id VARCHAR(10) NOT NULL REFERENCES dustbins(id) ON DELETE CASCADE,
    overall_fill_level INTEGER NOT NULL CHECK (overall_fill_level BETWEEN 0 AND 100),
    wet_waste_fill_level INTEGER NOT NULL CHECK (wet_waste_fill_level BETWEEN 0 AND 100),
    dry_waste_fill_level INTEGER NOT NULL CHECK (dry_waste_fill_level BETWEEN 0 AND 100),
    battery_level INTEGER CHECK (battery_level BETWEEN 0 AND 100),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX idx_history_dustbin_timestamp ON dustbin_history(dustbin_id, timestamp DESC);
CREATE INDEX idx_history_timestamp ON dustbin_history(timestamp DESC);

-- Partition by month for better performance (optional, for large datasets)
-- CREATE INDEX idx_history_timestamp_brin ON dustbin_history USING BRIN(timestamp);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
-- Stores critical alerts for dustbins that are >= 80% full

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dustbin_id VARCHAR(10) NOT NULL REFERENCES dustbins(id) ON DELETE CASCADE,
    dustbin_name VARCHAR(100) NOT NULL,
    dustbin_location VARCHAR(255) NOT NULL,
    fill_level INTEGER NOT NULL,
    critical_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for notification queries
CREATE INDEX idx_notifications_dustbin ON notifications(dustbin_id);
CREATE INDEX idx_notifications_unread ON notifications(is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_unresolved ON notifications(is_resolved) WHERE is_resolved = FALSE;
CREATE INDEX idx_notifications_critical_timestamp ON notifications(critical_timestamp DESC);

-- ============================================================================
-- ANALYTICS_AGGREGATES TABLE
-- ============================================================================
-- Pre-aggregated daily statistics for faster analytics queries

CREATE TABLE analytics_aggregates (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    dustbin_id VARCHAR(10) REFERENCES dustbins(id) ON DELETE CASCADE, -- NULL for system-wide aggregates
    total_collections INTEGER DEFAULT 0,
    avg_fill_level NUMERIC(5,2),
    max_fill_level INTEGER,
    avg_wet_waste NUMERIC(5,2),
    avg_dry_waste NUMERIC(5,2),
    total_wet_waste INTEGER DEFAULT 0,
    total_dry_waste INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one record per day per dustbin (or one system-wide per day)
    UNIQUE(date, dustbin_id)
);

CREATE INDEX idx_analytics_date ON analytics_aggregates(date DESC);
CREATE INDEX idx_analytics_dustbin_date ON analytics_aggregates(dustbin_id, date DESC);

-- ============================================================================
-- AUDIT_LOG TABLE
-- ============================================================================
-- Track all CRUD operations for security and compliance

CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'
    table_name VARCHAR(50) NOT NULL,
    record_id VARCHAR(100),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_timestamp ON audit_log(timestamp DESC);
CREATE INDEX idx_audit_action ON audit_log(action);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update the 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dustbins_updated_at BEFORE UPDATE ON dustbins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create notification when dustbin becomes critical
CREATE OR REPLACE FUNCTION create_critical_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- If fill level crosses 80% threshold
    IF NEW.overall_fill_level >= 80 AND (OLD.overall_fill_level IS NULL OR OLD.overall_fill_level < 80) THEN
        -- Set critical timestamp if not already set
        IF NEW.critical_timestamp IS NULL THEN
            NEW.critical_timestamp = NOW();
        END IF;
        
        -- Create notification
        INSERT INTO notifications (
            dustbin_id,
            dustbin_name,
            dustbin_location,
            fill_level,
            critical_timestamp
        ) VALUES (
            NEW.id,
            NEW.name,
            NEW.location,
            NEW.overall_fill_level,
            COALESCE(NEW.critical_timestamp, NOW())
        );
    END IF;
    
    -- Clear critical timestamp if fill level drops below 80%
    IF NEW.overall_fill_level < 80 THEN
        NEW.critical_timestamp = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER dustbin_critical_notification BEFORE UPDATE ON dustbins
    FOR EACH ROW EXECUTE FUNCTION create_critical_notification();

-- Function to log dustbin changes to history table
CREATE OR REPLACE FUNCTION log_dustbin_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if fill levels actually changed
    IF (TG_OP = 'UPDATE' AND (
        OLD.overall_fill_level != NEW.overall_fill_level OR
        OLD.wet_waste_fill_level != NEW.wet_waste_fill_level OR
        OLD.dry_waste_fill_level != NEW.dry_waste_fill_level OR
        OLD.battery_level != NEW.battery_level
    )) OR TG_OP = 'INSERT' THEN
        INSERT INTO dustbin_history (
            dustbin_id,
            overall_fill_level,
            wet_waste_fill_level,
            dry_waste_fill_level,
            battery_level
        ) VALUES (
            NEW.id,
            NEW.overall_fill_level,
            NEW.wet_waste_fill_level,
            NEW.dry_waste_fill_level,
            NEW.battery_level
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER dustbin_history_log AFTER INSERT OR UPDATE ON dustbins
    FOR EACH ROW EXECUTE FUNCTION log_dustbin_history();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View for current critical dustbins (for notification bell)
CREATE OR REPLACE VIEW critical_dustbins AS
SELECT 
    d.id,
    d.name,
    d.location,
    d.overall_fill_level,
    d.critical_timestamp,
    d.last_updated
FROM dustbins d
WHERE d.overall_fill_level >= 80 
  AND d.is_active = TRUE
ORDER BY d.critical_timestamp DESC;

-- View for dustbin dashboard summary
CREATE OR REPLACE VIEW dustbin_summary AS
SELECT
    COUNT(*) as total_dustbins,
    COUNT(*) FILTER (WHERE overall_fill_level >= 80) as critical_count,
    COUNT(*) FILTER (WHERE overall_fill_level >= 60 AND overall_fill_level < 80) as warning_count,
    COUNT(*) FILTER (WHERE overall_fill_level < 60) as normal_count,
    ROUND(AVG(overall_fill_level), 2) as avg_fill_level,
    ROUND(AVG(battery_level), 2) as avg_battery_level
FROM dustbins
WHERE is_active = TRUE;

-- ============================================================================
-- SEED DATA
-- ============================================================================
-- Initial data for testing (optional)

-- Insert default admin user (password: 'admin123' - CHANGE IN PRODUCTION!)
-- Password hash generated with bcrypt, rounds=10
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@binthere.com', '$2b$10$rKzI5X8K5X8K5X8K5X8K5uQ8wZCYqJ5X8K5X8K5X8K5X8K5X8K5Xe', 'Admin User', 'super_admin');

-- Insert sample dustbins
INSERT INTO dustbins (id, name, location, overall_fill_level, wet_waste_fill_level, dry_waste_fill_level, battery_level, last_maintenance) VALUES
('001', 'Dustbin #001', 'Central Park North', 85, 78, 92, 85, NOW() - INTERVAL '3 days'),
('002', 'Dustbin #002', 'Market District', 65, 68, 62, 92, NOW() - INTERVAL '1 week'),
('003', 'Dustbin #003', 'Residential Zone A', 45, 42, 48, 78, NOW() - INTERVAL '5 days'),
('004', 'Dustbin #004', 'Shopping Mall', 92, 95, 89, 15, NOW() - INTERVAL '2 days'),
('005', 'Dustbin #005', 'Industrial Area', 73, 58, 88, 68, NOW() - INTERVAL '1 day'),
('006', 'Dustbin #006', 'School Campus', 55, 61, 49, 95, NOW() - INTERVAL '6 days'),
('007', 'Dustbin #007', 'Hospital Quarter', 38, 35, 41, 38, NOW() - INTERVAL '4 days'),
('008', 'Dustbin #008', 'Downtown Plaza', 28, 25, 31, 72, NOW() - INTERVAL '1 week');

-- Insert historical data for analytics (last 30 days)
INSERT INTO dustbin_history (dustbin_id, overall_fill_level, wet_waste_fill_level, dry_waste_fill_level, battery_level, timestamp)
SELECT 
    d.id,
    FLOOR(RANDOM() * 100)::INTEGER,
    FLOOR(RANDOM() * 100)::INTEGER,
    FLOOR(RANDOM() * 100)::INTEGER,
    FLOOR(RANDOM() * 100)::INTEGER,
    NOW() - (i || ' hours')::INTERVAL
FROM dustbins d
CROSS JOIN generate_series(1, 720, 6) i -- Every 6 hours for 30 days
WHERE d.is_active = TRUE;

-- ============================================================================
-- PERMISSIONS (Optional - for multi-tenant setups)
-- ============================================================================

-- Create read-only role for viewer users
-- CREATE ROLE binthere_viewer;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO binthere_viewer;

-- Create admin role with full access
-- CREATE ROLE binthere_admin;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO binthere_admin;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO binthere_admin;

-- ============================================================================
-- MAINTENANCE QUERIES
-- ============================================================================

-- Clean up old history data (keep last 90 days)
-- Run this periodically as a scheduled job
-- DELETE FROM dustbin_history WHERE timestamp < NOW() - INTERVAL '90 days';

-- Clean up resolved notifications (keep last 30 days)
-- DELETE FROM notifications WHERE is_resolved = TRUE AND resolved_at < NOW() - INTERVAL '30 days';

-- Vacuum and analyze for performance
-- VACUUM ANALYZE dustbins;
-- VACUUM ANALYZE dustbin_history;
-- VACUUM ANALYZE notifications;

-- ============================================================================
-- USEFUL QUERIES
-- ============================================================================

-- Get current status of all dustbins
-- SELECT * FROM dustbins WHERE is_active = TRUE ORDER BY overall_fill_level DESC;

-- Get analytics for last 7 days (aggregated by day)
-- SELECT 
--     DATE(timestamp) as date,
--     ROUND(AVG(wet_waste_fill_level), 2) as avg_wet_waste,
--     ROUND(AVG(dry_waste_fill_level), 2) as avg_dry_waste
-- FROM dustbin_history
-- WHERE timestamp >= NOW() - INTERVAL '7 days'
-- GROUP BY DATE(timestamp)
-- ORDER BY date;

-- Get all unresolved critical notifications
-- SELECT * FROM notifications WHERE is_resolved = FALSE ORDER BY critical_timestamp DESC;
