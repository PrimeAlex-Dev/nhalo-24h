-- Migration: V1__create_initial_schema.sql (H2 Test Compatibility)
CREATE TABLE IF NOT EXISTS app_system_info (
    system_key VARCHAR(64) PRIMARY KEY,
    system_value VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO app_system_info (system_key, system_value, description)
VALUES ('app_version', '1.0.0', 'Khởi tạo nền tảng kiến trúc Nhà Lo 24h');
