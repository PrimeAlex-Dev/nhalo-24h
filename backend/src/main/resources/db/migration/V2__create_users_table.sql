-- ==============================================================================
-- Migration: V2__create_users_table.sql
-- Mục đích: Khởi tạo bảng users và các chỉ mục, ràng buộc cho User Management (PostgreSQL).
-- Quy tắc:
--   - id: UUID tự sinh làm khóa chính (gen_random_uuid()).
--   - full_name: VARCHAR(100) NOT NULL.
--   - email: VARCHAR(255) NOT NULL, duy nhất không phân biệt hoa/thường (LOWER(email)).
--   - phone: VARCHAR(20), tùy chọn, duy nhất có điều kiện (WHERE phone IS NOT NULL).
--   - role: Chỉ nhận 'CUSTOMER', 'PROVIDER', 'ADMIN' (mặc định 'CUSTOMER').
--   - status: Chỉ nhận 'ACTIVE', 'DISABLED' (mặc định 'ACTIVE').
--   - is_email_verified: BOOLEAN theo dõi trạng thái xác minh email (mặc định FALSE).
--   - created_at, updated_at: TIMESTAMPTZ.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_users_role CHECK (role IN ('CUSTOMER', 'PROVIDER', 'ADMIN')),
    CONSTRAINT chk_users_status CHECK (status IN ('ACTIVE', 'DISABLED'))
);

-- Chỉ mục unique không phân biệt hoa/thường cho email
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));

-- Chỉ mục unique có điều kiện cho số điện thoại (chỉ áp dụng khi phone IS NOT NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone_unique ON users (phone) WHERE phone IS NOT NULL;

-- Chỉ mục hỗ trợ lọc nhanh theo vai trò và trạng thái
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);
