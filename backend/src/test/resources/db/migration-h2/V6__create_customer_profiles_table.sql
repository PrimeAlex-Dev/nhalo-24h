-- ==============================================================================
-- Migration: V6__create_customer_profiles_table.sql (H2 Test Compatibility)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS customer_profiles (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    gender VARCHAR(20),
    address VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_customer_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_customer_profiles_gender CHECK (gender IS NULL OR gender IN ('MALE', 'FEMALE', 'OTHER'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_profiles_user_id ON customer_profiles (user_id);
