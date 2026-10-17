-- Migration: V5__create_invalidated_tokens_table.sql (H2 Test Compatibility)
CREATE TABLE IF NOT EXISTS invalidated_tokens (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID,
    expiry_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_invalidated_tokens_expiry_time ON invalidated_tokens (expiry_time);
