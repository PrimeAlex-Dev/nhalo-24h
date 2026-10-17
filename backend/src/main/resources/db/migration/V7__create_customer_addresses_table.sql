-- ==============================================================================
-- Migration: V7__create_customer_addresses_table.sql
-- Mục đích: Khởi tạo bảng customer_addresses lưu trữ sổ địa chỉ của khách hàng (1:N với users).
-- ==============================================================================

CREATE TABLE IF NOT EXISTS customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    label VARCHAR(100) NOT NULL,
    full_address VARCHAR(500) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_customer_addresses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_customer_addresses_user_id ON customer_addresses (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_addresses_single_default ON customer_addresses (user_id) WHERE is_default = TRUE;
