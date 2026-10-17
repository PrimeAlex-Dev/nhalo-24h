-- ==============================================================================
-- Migration: V8__create_provider_profiles_tables.sql
-- Mục đích: Khởi tạo bảng provider_profiles và bảng liên kết provider_categories (PostgreSQL).
-- ==============================================================================

CREATE TABLE IF NOT EXISTS provider_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    avatar_url VARCHAR(500),
    headline VARCHAR(150),
    bio TEXT,
    experience_years INTEGER DEFAULT 0,
    price_per_hour BIGINT DEFAULT 0,
    service_area VARCHAR(255),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_provider_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_provider_profiles_exp_years CHECK (experience_years >= 0),
    CONSTRAINT chk_provider_profiles_price CHECK (price_per_hour >= 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_provider_profiles_user_id ON provider_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_provider_profiles_is_available ON provider_profiles (is_available);

CREATE TABLE IF NOT EXISTS provider_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_profile_id UUID NOT NULL,
    category_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_provider_categories_profile FOREIGN KEY (provider_profile_id) REFERENCES provider_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_provider_categories_category FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE CASCADE,
    CONSTRAINT uq_provider_category UNIQUE (provider_profile_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_provider_categories_profile_id ON provider_categories (provider_profile_id);
CREATE INDEX IF NOT EXISTS idx_provider_categories_category_id ON provider_categories (category_id);
