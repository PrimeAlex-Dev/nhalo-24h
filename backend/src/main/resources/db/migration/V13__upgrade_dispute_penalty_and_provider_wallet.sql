-- V13: Upgrade dispute penalty mechanisms, provider disciplinary status and wallet topup
-- 1. Bổ sung quản lý kỷ luật vào bảng provider_profiles
ALTER TABLE provider_profiles 
    ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMPTZ DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS warning_count INT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_provider_profiles_suspended_until ON provider_profiles (suspended_until);

-- 2. Bổ sung luồng hoàn cọc và bồi thường khách hàng vào provider_reports
ALTER TABLE provider_reports
    ADD COLUMN IF NOT EXISTS ban_duration_days INT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS refunded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS refund_reason TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS compensation_amount BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS compensation_status VARCHAR(30) NOT NULL DEFAULT 'NONE',
    ADD COLUMN IF NOT EXISTS customer_bank_code VARCHAR(20) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS customer_account_number VARCHAR(50) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS customer_account_holder VARCHAR(100) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS compensation_payout_ref VARCHAR(100) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS compensation_payout_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_reports_compensation_status ON provider_reports (compensation_status);
