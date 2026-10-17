-- Migration: V4__add_password_hash_to_users.sql (H2 Test Compatibility)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
