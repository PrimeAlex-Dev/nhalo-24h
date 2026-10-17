-- ==============================================================================
-- Migration: V7__create_customer_addresses_table.sql (H2 Test Compatibility)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS customer_addresses (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    user_id UUID NOT NULL,
    label VARCHAR(100) NOT NULL,
    full_address VARCHAR(500) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_customer_addresses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_customer_addresses_user_id ON customer_addresses (user_id);
