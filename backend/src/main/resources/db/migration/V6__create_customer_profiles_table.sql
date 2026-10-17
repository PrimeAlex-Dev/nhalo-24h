-- ==============================================================================
-- Migration: V6__create_customer_profiles_table.sql
-- Mục đích: Khởi tạo bảng customer_profiles để lưu hồ sơ khách hàng (quan hệ 1:1 với users).
-- ==============================================================================

CREATE TABLE IF NOT EXISTS customer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    gender VARCHAR(20),
    address VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_customer_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_customer_profiles_gender CHECK (gender IS NULL OR gender IN ('MALE', 'FEMALE', 'OTHER'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_profiles_user_id ON customer_profiles (user_id);
