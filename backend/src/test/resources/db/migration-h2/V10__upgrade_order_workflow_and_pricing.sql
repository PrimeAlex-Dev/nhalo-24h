-- ==============================================================================
-- Migration: V10__upgrade_order_workflow_and_pricing.sql (H2 Test Compatibility)
-- ==============================================================================

-- 1. Mở rộng bảng service_categories
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS default_workflow_type VARCHAR(50) DEFAULT 'SURVEY_FIRST' NOT NULL;
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5,2) DEFAULT 10.00 NOT NULL;

-- 2. Mở rộng bảng order_images
ALTER TABLE order_images ADD COLUMN IF NOT EXISTS image_stage VARCHAR(50) DEFAULT 'ISSUE_BEFORE' NOT NULL;
ALTER TABLE order_images ADD COLUMN IF NOT EXISTS uploaded_by_role VARCHAR(30) DEFAULT 'CUSTOMER' NOT NULL;

-- 3. Mở rộng bảng order_requests
ALTER TABLE order_requests ALTER COLUMN status VARCHAR(50) DEFAULT 'PENDING_RESPONSE' NOT NULL;
ALTER TABLE order_requests ADD COLUMN IF NOT EXISTS quote_mode VARCHAR(50) DEFAULT 'SURVEY_REQUIRED' NOT NULL;
ALTER TABLE order_requests ADD COLUMN IF NOT EXISTS survey_fee BIGINT DEFAULT 0 NOT NULL;
ALTER TABLE order_requests ADD COLUMN IF NOT EXISTS travel_fee BIGINT DEFAULT 0 NOT NULL;
ALTER TABLE order_requests ADD COLUMN IF NOT EXISTS waive_survey_if_repaired BOOLEAN DEFAULT TRUE NOT NULL;
ALTER TABLE order_requests ADD COLUMN IF NOT EXISTS waive_travel_if_repaired BOOLEAN DEFAULT TRUE NOT NULL;
ALTER TABLE order_requests ADD COLUMN IF NOT EXISTS estimated_labor_fee BIGINT DEFAULT 0 NOT NULL;
ALTER TABLE order_requests ADD COLUMN IF NOT EXISTS estimated_materials_fee BIGINT DEFAULT 0 NOT NULL;
ALTER TABLE order_requests ADD COLUMN IF NOT EXISTS scope_and_conditions TEXT;

-- 4. Mở rộng bảng orders
ALTER TABLE orders ALTER COLUMN status VARCHAR(50) DEFAULT 'PENDING_PROVIDER' NOT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS urgency_level VARCHAR(30) DEFAULT 'NORMAL' NOT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS service_metadata TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS workflow_mode VARCHAR(50) DEFAULT 'SURVEY_REQUIRED' NOT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS agreed_survey_fee BIGINT DEFAULT 0 NOT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS agreed_travel_fee BIGINT DEFAULT 0 NOT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS waive_survey_if_repaired BOOLEAN DEFAULT TRUE NOT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS waive_travel_if_repaired BOOLEAN DEFAULT TRUE NOT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS applied_survey_fee BIGINT DEFAULT 0 NOT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS applied_travel_fee BIGINT DEFAULT 0 NOT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS final_labor_fee BIGINT DEFAULT 0 NOT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS final_materials_fee BIGINT DEFAULT 0 NOT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS commission_rate_snapshot NUMERIC(5,2) DEFAULT 10.00 NOT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS commission_amount BIGINT DEFAULT 0 NOT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS completion_note TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'UNPAID' NOT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS online_transaction_ref VARCHAR(64);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_declared_amount BIGINT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_payment_note TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS provider_confirmed_amount BIGINT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS provider_payment_confirmed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS dispute_reason TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_flagged_abnormal BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS abnormal_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders (payment_status);

-- 5. Bảng order_quote_versions
CREATE TABLE IF NOT EXISTS order_quote_versions (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    order_id UUID NOT NULL,
    request_id UUID,
    provider_id UUID NOT NULL,
    version_number INTEGER DEFAULT 1 NOT NULL,
    version_type VARCHAR(50) NOT NULL,
    quote_mode VARCHAR(50) DEFAULT 'SURVEY_REQUIRED' NOT NULL,
    survey_fee BIGINT DEFAULT 0 NOT NULL,
    travel_fee BIGINT DEFAULT 0 NOT NULL,
    waive_survey_if_repaired BOOLEAN DEFAULT TRUE NOT NULL,
    waive_travel_if_repaired BOOLEAN DEFAULT TRUE NOT NULL,
    labor_fee BIGINT DEFAULT 0 NOT NULL,
    materials_fee BIGINT DEFAULT 0 NOT NULL,
    total_amount BIGINT DEFAULT 0 NOT NULL,
    diagnosis_or_reason TEXT,
    status VARCHAR(50) DEFAULT 'PENDING_APPROVAL' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    responded_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT fk_quote_versions_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_quote_versions_request FOREIGN KEY (request_id) REFERENCES order_requests(id) ON DELETE SET NULL,
    CONSTRAINT fk_quote_versions_provider FOREIGN KEY (provider_id) REFERENCES provider_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_quote_versions_order_id ON order_quote_versions (order_id);

-- 6. Bảng order_quote_items
CREATE TABLE IF NOT EXISTS order_quote_items (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    quote_version_id UUID NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    unit VARCHAR(50),
    quantity INTEGER DEFAULT 1 NOT NULL,
    unit_price BIGINT DEFAULT 0 NOT NULL,
    total_price BIGINT DEFAULT 0 NOT NULL,
    note VARCHAR(500),

    CONSTRAINT fk_quote_items_version FOREIGN KEY (quote_version_id) REFERENCES order_quote_versions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_quote_items_version_id ON order_quote_items (quote_version_id);

-- 7. Bảng order_audit_logs
CREATE TABLE IF NOT EXISTS order_audit_logs (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    order_id UUID NOT NULL,
    actor_user_id UUID,
    actor_role VARCHAR(30),
    action_type VARCHAR(50) NOT NULL,
    old_order_status VARCHAR(50),
    new_order_status VARCHAR(50),
    old_payment_status VARCHAR(50),
    new_payment_status VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT fk_audit_logs_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_order_id ON order_audit_logs (order_id);
