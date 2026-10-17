-- ==============================================================================
-- Migration: V5__create_invalidated_tokens_table.sql
-- Mục đích: Bảng lưu danh sách các JWT token đã bị vô hiệu hóa khi người dùng Logout (Token Blacklist).
-- Quy tắc:
--   - id: Chuỗi định danh token (jti claim trong JWT) làm khóa chính.
--   - user_id: ID người dùng sở hữu token.
--   - expiry_time: Thời điểm token hết hạn tự nhiên.
--   - created_at: Thời điểm người dùng thực hiện logout.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS invalidated_tokens (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID,
    expiry_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_invalidated_tokens_expiry_time ON invalidated_tokens (expiry_time);
