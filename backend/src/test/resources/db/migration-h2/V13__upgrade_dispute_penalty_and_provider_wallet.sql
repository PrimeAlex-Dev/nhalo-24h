-- ==============================================================================
-- Migration: V13__upgrade_dispute_penalty_and_provider_wallet.sql (H2 Test Compatibility)
-- ==============================================================================

-- 1. Bổ sung quản lý kỷ luật vào bảng provider_profiles
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS warning_count INTEGER DEFAULT 0 NOT NULL;

CREATE INDEX IF NOT EXISTS idx_provider_profiles_suspended_until ON provider_profiles (suspended_until);

-- 2. Bổ sung luồng hoàn cọc và bồi thường khách hàng vào provider_reports
ALTER TABLE provider_reports ADD COLUMN IF NOT EXISTS ban_duration_days INTEGER;
ALTER TABLE provider_reports ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE provider_reports ADD COLUMN IF NOT EXISTS refunded_by UUID;
ALTER TABLE provider_reports ADD COLUMN IF NOT EXISTS refund_reason TEXT;
ALTER TABLE provider_reports ADD COLUMN IF NOT EXISTS compensation_amount BIGINT DEFAULT 0 NOT NULL;
ALTER TABLE provider_reports ADD COLUMN IF NOT EXISTS compensation_status VARCHAR(30) DEFAULT 'NONE' NOT NULL;
ALTER TABLE provider_reports ADD COLUMN IF NOT EXISTS customer_bank_code VARCHAR(20);
ALTER TABLE provider_reports ADD COLUMN IF NOT EXISTS customer_account_number VARCHAR(50);
ALTER TABLE provider_reports ADD COLUMN IF NOT EXISTS customer_account_holder VARCHAR(100);
ALTER TABLE provider_reports ADD COLUMN IF NOT EXISTS compensation_payout_ref VARCHAR(100);
ALTER TABLE provider_reports ADD COLUMN IF NOT EXISTS compensation_payout_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_reports_compensation_status ON provider_reports (compensation_status);
