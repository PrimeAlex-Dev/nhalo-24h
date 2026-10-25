-- ==============================================================================
-- Migration: V11__add_wallet_and_financial_management.sql
-- Mục đích: Hệ thống Quản lý Ví Thợ (2 ngăn: Khả dụng & Ký quỹ bảo hành),
--           Lịch sử giao dịch biến động số dư, Yêu cầu rút tiền, Doanh thu sàn.
-- ==============================================================================

-- 1. Bảng provider_wallets (Quản lý 2 ngăn số dư và định mức ký quỹ 2 triệu)
CREATE TABLE IF NOT EXISTS provider_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL UNIQUE,
    available_balance BIGINT NOT NULL DEFAULT 0,
    deposit_balance BIGINT NOT NULL DEFAULT 0,
    deposit_target BIGINT NOT NULL DEFAULT 2000000,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    cooling_ends_at TIMESTAMPTZ,
    last_completed_order_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_wallets_provider FOREIGN KEY (provider_id) REFERENCES provider_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_wallets_provider_id ON provider_wallets (provider_id);
CREATE INDEX IF NOT EXISTS idx_wallets_status ON provider_wallets (status);

-- 2. Bảng wallet_transactions (Sổ cái giao dịch biến động số dư)
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL,
    balance_type VARCHAR(30) NOT NULL,
    amount BIGINT NOT NULL,
    balance_before BIGINT NOT NULL,
    balance_after BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    reference_id VARCHAR(64),
    created_by VARCHAR(50),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_wallet_tx_wallet FOREIGN KEY (wallet_id) REFERENCES provider_wallets(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_wallet_id ON wallet_transactions (wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_type ON wallet_transactions (type);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_created_at ON wallet_transactions (created_at DESC);

-- 3. Bảng payout_requests (Yêu cầu rút thu nhập khả dụng hoặc rút ký quỹ)
CREATE TABLE IF NOT EXISTS payout_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL,
    wallet_id UUID NOT NULL,
    amount BIGINT NOT NULL,
    source_wallet_type VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    bank_code VARCHAR(30) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_holder_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    cooling_ends_at TIMESTAMPTZ,
    admin_note TEXT,
    processed_by UUID,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payout_provider FOREIGN KEY (provider_id) REFERENCES provider_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_payout_wallet FOREIGN KEY (wallet_id) REFERENCES provider_wallets(id) ON DELETE CASCADE,
    CONSTRAINT fk_payout_processed_by FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_payout_provider_id ON payout_requests (provider_id);
CREATE INDEX IF NOT EXISTS idx_payout_status ON payout_requests (status);

-- 4. Bảng platform_financial_records (Doanh thu sàn và phân bổ từng đơn hàng)
CREATE TABLE IF NOT EXISTS platform_financial_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE,
    total_paid BIGINT NOT NULL,
    labor_fee BIGINT NOT NULL DEFAULT 0,
    materials_fee BIGINT NOT NULL DEFAULT 0,
    platform_commission BIGINT NOT NULL DEFAULT 0,
    provider_earning BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_platform_fin_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_platform_fin_order_id ON platform_financial_records (order_id);
CREATE INDEX IF NOT EXISTS idx_platform_fin_created_at ON platform_financial_records (created_at DESC);

-- 5. Tự động khởi tạo ví ký quỹ 2.000.000đ cho các thợ đã tồn tại trong hệ thống
INSERT INTO provider_wallets (id, provider_id, available_balance, deposit_balance, deposit_target, status, created_at, updated_at)
SELECT gen_random_uuid(), id, 0, 2000000, 2000000, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM provider_profiles
ON CONFLICT (provider_id) DO NOTHING;
