-- ==============================================================================
-- Migration: V3__create_service_categories_table.sql
-- Mục đích: Khởi tạo bảng service_categories và các chỉ mục, ràng buộc cho Service Category (PostgreSQL).
-- Quy tắc:
--   - id: UUID tự sinh làm khóa chính (gen_random_uuid()).
--   - name: VARCHAR(100) NOT NULL.
--   - slug: VARCHAR(120) NOT NULL, duy nhất không phân biệt hoa/thường (LOWER(slug)).
--   - description: VARCHAR(500), có thể bỏ trống.
--   - icon_url: VARCHAR(500), có thể bỏ trống.
--   - status: Chỉ nhận 'ACTIVE', 'INACTIVE' (mặc định 'ACTIVE').
--   - display_order: INTEGER NOT NULL DEFAULT 0, không được âm (display_order >= 0).
--   - created_at, updated_at: TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL,
    description VARCHAR(500),
    icon_url VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_service_categories_status CHECK (status IN ('ACTIVE', 'INACTIVE')),
    CONSTRAINT chk_service_categories_display_order CHECK (display_order >= 0)
);

-- Chỉ mục unique không phân biệt hoa/thường cho slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_service_categories_slug_lower ON service_categories (LOWER(slug));

-- Chỉ mục hỗ trợ lọc theo trạng thái và sắp xếp theo thứ tự hiển thị
CREATE INDEX IF NOT EXISTS idx_service_categories_status ON service_categories (status);
CREATE INDEX IF NOT EXISTS idx_service_categories_display_order ON service_categories (display_order);
