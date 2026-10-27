-- V14: Add support for admin revocation of provider suspension/bans
ALTER TABLE provider_reports
    ADD COLUMN IF NOT EXISTS suspension_lifted_at TIMESTAMPTZ DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS suspension_lifted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS suspension_lifted_reason TEXT DEFAULT NULL;
