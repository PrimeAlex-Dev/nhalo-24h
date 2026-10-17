-- ==============================================================================
-- Migration: V4__add_password_hash_to_users.sql
-- Mục đích: Bổ sung cột password_hash để lưu trữ mật khẩu đã mã hóa (BCrypt).
-- Quy tắc:
--   - Cột cho phép NULL để tương thích với các tài khoản tạo trước đó hoặc
--     các tài khoản đăng nhập OAuth/Google trong tương lai chưa thiết lập mật khẩu.
-- ==============================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
