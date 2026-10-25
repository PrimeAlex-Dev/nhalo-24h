-- ==============================================================================
-- Migration: V11__add_wallet_and_financial_management.sql (H2 Test Compatibility)
-- ==============================================================================

-- 1. Bảng provider_wallets
CREATE TABLE IF NOT EXISTS provider_wallets (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    provider_id UUID NOT NULL UNIQUE,
    available_balance BIGINT DEFAULT 0 NOT NULL,
    deposit_balance BIGINT DEFAULT 0 NOT NULL,
    deposit_target BIGINT DEFAULT 2000000 NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    cooling_ends_at TIMESTAMP WITH TIME ZONE,
    last_completed_order_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT fk_wallets_provider FOREIGN KEY (provider_id) REFERENCES provider_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_wallets_provider_id ON provider_wallets (provider_id);
CREATE INDEX IF NOT EXISTS idx_wallets_status ON provider_wallets (status);

-- 2. Bảng wallet_transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    wallet_id UUID NOT NULL,
    balance_type VARCHAR(30) NOT NULL,
    amount BIGINT NOT NULL,
    balance_before BIGINT NOT NULL,
    balance_after BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    reference_id VARCHAR(64),
    created_by VARCHAR(50),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT fk_wallet_tx_wallet FOREIGN KEY (wallet_id) REFERENCES provider_wallets(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_wallet_id ON wallet_transactions (wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_type ON wallet_transactions (type);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_created_at ON wallet_transactions (created_at DESC);

-- 3. Bảng payout_requests
CREATE TABLE IF NOT EXISTS payout_requests (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    provider_id UUID NOT NULL,
    wallet_id UUID NOT NULL,
    amount BIGINT NOT NULL,
    source_wallet_type VARCHAR(30) DEFAULT 'AVAILABLE' NOT NULL,
    bank_code VARCHAR(30) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_holder_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL,
    cooling_ends_at TIMESTAMP WITH TIME ZONE,
    admin_note TEXT,
    processed_by UUID,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT fk_payout_provider FOREIGN KEY (provider_id) REFERENCES provider_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_payout_wallet FOREIGN KEY (wallet_id) REFERENCES provider_wallets(id) ON DELETE CASCADE,
    CONSTRAINT fk_payout_processed_by FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_payout_provider_id ON payout_requests (provider_id);
CREATE INDEX IF NOT EXISTS idx_payout_status ON payout_requests (status);

-- 4. Bảng platform_financial_records
CREATE TABLE IF NOT EXISTS platform_financial_records (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    order_id UUID NOT NULL UNIQUE,
    total_paid BIGINT NOT NULL,
    labor_fee BIGINT DEFAULT 0 NOT NULL,
    materials_fee BIGINT DEFAULT 0 NOT NULL,
    platform_commission BIGINT DEFAULT 0 NOT NULL,
    provider_earning BIGINT DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT fk_platform_fin_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_platform_fin_order_id ON platform_financial_records (order_id);
CREATE INDEX IF NOT EXISTS idx_platform_fin_created_at ON platform_financial_records (created_at DESC);

-- 5. Khởi tạo ví cho thợ hiện có
INSERT INTO provider_wallets (id, provider_id, available_balance, deposit_balance, deposit_target, status, created_at, updated_at)
SELECT RANDOM_UUID(), id, 0, 2000000, 2000000, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM provider_profiles
WHERE id NOT IN (SELECT provider_id FROM provider_wallets);
