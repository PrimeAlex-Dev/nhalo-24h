-- ==============================================================================
-- Migration: V1__create_initial_schema.sql
-- Mục đích: Khởi tạo schema nền tảng và bảng thông tin hệ thống cho Nhà Lo 24h.
-- Ghi chú: Chưa tạo các bảng nghiệp vụ (Customer, Worker, Booking, Catalog,...)
--          khi chưa thống nhất chi tiết đặc tả thiết kế database ở giai đoạn sau.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS app_system_info (
    system_key VARCHAR(64) PRIMARY KEY,
    system_value VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO app_system_info (system_key, system_value, description)
VALUES ('app_version', '1.0.0', 'Khởi tạo nền tảng kiến trúc Nhà Lo 24h');
