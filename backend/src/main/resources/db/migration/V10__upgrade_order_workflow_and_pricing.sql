-- ==============================================================================
-- Migration: V10__upgrade_order_workflow_and_pricing.sql
-- Mục đích: Nâng cấp toàn diện luồng Order (3 nhóm chi phí, Khảo sát vs Giá cố định,
--           Lịch sử phiên bản báo giá & Vật tư, Tách trạng thái Thanh toán, Hoa hồng).
-- ==============================================================================

-- 1. Mở rộng bảng service_categories
ALTER TABLE service_categories
    ADD COLUMN IF NOT EXISTS default_workflow_type VARCHAR(50) NOT NULL DEFAULT 'SURVEY_FIRST',
    ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5,2) NOT NULL DEFAULT 10.00;

-- 2. Mở rộng bảng order_images (Phân biệt ảnh sự cố trước khi làm, ảnh khảo sát và ảnh nghiệm thu hoàn thành)
ALTER TABLE order_images
    ADD COLUMN IF NOT EXISTS image_stage VARCHAR(50) NOT NULL DEFAULT 'ISSUE_BEFORE',
    ADD COLUMN IF NOT EXISTS uploaded_by_role VARCHAR(30) NOT NULL DEFAULT 'CUSTOMER';

-- 3. Mở rộng bảng order_requests (Bóc tách 3 nhóm chi phí ngay từ báo giá ban đầu)
ALTER TABLE order_requests
    ALTER COLUMN status TYPE VARCHAR(50);

ALTER TABLE order_requests
    ADD COLUMN IF NOT EXISTS quote_mode VARCHAR(50) NOT NULL DEFAULT 'SURVEY_REQUIRED',
    ADD COLUMN IF NOT EXISTS survey_fee BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS travel_fee BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS waive_survey_if_repaired BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS waive_travel_if_repaired BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS estimated_labor_fee BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS estimated_materials_fee BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS scope_and_conditions TEXT;

-- 4. Mở rộng bảng orders (Quản lý 3 nhóm chi phí thực tế, Hoa hồng, Nghiệm thu & Thanh toán độc lập)
ALTER TABLE orders
    ALTER COLUMN status TYPE VARCHAR(50);

ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS urgency_level VARCHAR(30) NOT NULL DEFAULT 'NORMAL',
    ADD COLUMN IF NOT EXISTS service_metadata TEXT,
    ADD COLUMN IF NOT EXISTS workflow_mode VARCHAR(50) NOT NULL DEFAULT 'SURVEY_REQUIRED',
    ADD COLUMN IF NOT EXISTS agreed_survey_fee BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS agreed_travel_fee BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS waive_survey_if_repaired BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS waive_travel_if_repaired BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS applied_survey_fee BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS applied_travel_fee BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS final_labor_fee BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS final_materials_fee BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS commission_rate_snapshot NUMERIC(5,2) NOT NULL DEFAULT 10.00,
    ADD COLUMN IF NOT EXISTS commission_amount BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS completion_note TEXT,
    ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30),
    ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) NOT NULL DEFAULT 'UNPAID',
    ADD COLUMN IF NOT EXISTS online_transaction_ref VARCHAR(64),
    ADD COLUMN IF NOT EXISTS customer_declared_amount BIGINT,
    ADD COLUMN IF NOT EXISTS customer_payment_note TEXT,
    ADD COLUMN IF NOT EXISTS provider_confirmed_amount BIGINT,
    ADD COLUMN IF NOT EXISTS provider_payment_confirmed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS dispute_reason TEXT,
    ADD COLUMN IF NOT EXISTS is_flagged_abnormal BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS abnormal_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders (payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_is_flagged_abnormal ON orders (is_flagged_abnormal);

-- 5. Bảng order_quote_versions (Lưu lịch sử các phiên bản báo giá & điều chỉnh phát sinh)
CREATE TABLE IF NOT EXISTS order_quote_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    request_id UUID,
    provider_id UUID NOT NULL,
    version_number INTEGER NOT NULL DEFAULT 1,
    version_type VARCHAR(50) NOT NULL,
    quote_mode VARCHAR(50) NOT NULL DEFAULT 'SURVEY_REQUIRED',
    survey_fee BIGINT NOT NULL DEFAULT 0,
    travel_fee BIGINT NOT NULL DEFAULT 0,
    waive_survey_if_repaired BOOLEAN NOT NULL DEFAULT TRUE,
    waive_travel_if_repaired BOOLEAN NOT NULL DEFAULT TRUE,
    labor_fee BIGINT NOT NULL DEFAULT 0,
    materials_fee BIGINT NOT NULL DEFAULT 0,
    total_amount BIGINT NOT NULL DEFAULT 0,
    diagnosis_or_reason TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_APPROVAL',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMPTZ,

    CONSTRAINT fk_quote_versions_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_quote_versions_request FOREIGN KEY (request_id) REFERENCES order_requests(id) ON DELETE SET NULL,
    CONSTRAINT fk_quote_versions_provider FOREIGN KEY (provider_id) REFERENCES provider_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_quote_versions_order_id ON order_quote_versions (order_id);
CREATE INDEX IF NOT EXISTS idx_quote_versions_provider_id ON order_quote_versions (provider_id);
CREATE INDEX IF NOT EXISTS idx_quote_versions_status ON order_quote_versions (status);

-- 6. Bảng order_quote_items (Danh sách linh kiện / vật tư trong từng phiên bản báo giá)
CREATE TABLE IF NOT EXISTS order_quote_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_version_id UUID NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    unit VARCHAR(50),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price BIGINT NOT NULL DEFAULT 0,
    total_price BIGINT NOT NULL DEFAULT 0,
    note VARCHAR(500),

    CONSTRAINT fk_quote_items_version FOREIGN KEY (quote_version_id) REFERENCES order_quote_versions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_quote_items_version_id ON order_quote_items (quote_version_id);

-- 7. Bảng order_audit_logs (Nhật ký hành động & chuyển trạng thái phục vụ đối soát/tranh chấp)
CREATE TABLE IF NOT EXISTS order_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    actor_user_id UUID,
    actor_role VARCHAR(30),
    action_type VARCHAR(50) NOT NULL,
    old_order_status VARCHAR(50),
    new_order_status VARCHAR(50),
    old_payment_status VARCHAR(50),
    new_payment_status VARCHAR(50),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_logs_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_order_id ON order_audit_logs (order_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON order_audit_logs (created_at ASC);
