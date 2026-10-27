-- V14: Add support for admin revocation of provider suspension/bans (H2 Compatibility)
ALTER TABLE provider_reports ADD COLUMN IF NOT EXISTS suspension_lifted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE provider_reports ADD COLUMN IF NOT EXISTS suspension_lifted_by UUID;
ALTER TABLE provider_reports ADD COLUMN IF NOT EXISTS suspension_lifted_reason TEXT;
