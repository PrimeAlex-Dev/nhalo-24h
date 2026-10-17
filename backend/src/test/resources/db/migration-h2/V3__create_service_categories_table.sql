-- Migration: V3__create_service_categories_table.sql (H2 Test Compatibility)
CREATE TABLE IF NOT EXISTS service_categories (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL,
    description VARCHAR(500),
    icon_url VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_service_categories_status CHECK (status IN ('ACTIVE', 'INACTIVE')),
    CONSTRAINT chk_service_categories_display_order CHECK (display_order >= 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_service_categories_slug_unique ON service_categories (slug);
CREATE INDEX IF NOT EXISTS idx_service_categories_status ON service_categories (status);
CREATE INDEX IF NOT EXISTS idx_service_categories_display_order ON service_categories (display_order);
