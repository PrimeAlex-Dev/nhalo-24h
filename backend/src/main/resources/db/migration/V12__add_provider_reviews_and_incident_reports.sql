-- ==============================================================================
-- Migration: V12__add_provider_reviews_and_incident_reports.sql
-- Mục đích: Bổ sung chỉ số đánh giá thợ, bảng reviews (đánh giá & xếp hạng),
--           và bảng provider_reports (báo cáo vi phạm & khiếu nại thợ).
-- ==============================================================================

-- 1. Bổ sung các cột chỉ số đánh giá & khiếu nại vào provider_profiles
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS rating_average DOUBLE PRECISION NOT NULL DEFAULT 5.0;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS review_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS report_count INTEGER NOT NULL DEFAULT 0;

-- 2. Bảng reviews (Đánh giá thợ theo đơn hàng hoàn tất)
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE,
    provider_profile_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    rating SMALLINT NOT NULL,
    punctuality_rating SMALLINT,
    skill_rating SMALLINT,
    attitude_rating SMALLINT,
    price_rating SMALLINT,
    comment TEXT,
    tags VARCHAR(500),
    images TEXT,
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    provider_reply TEXT,
    provider_replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reviews_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_provider FOREIGN KEY (provider_profile_id) REFERENCES provider_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_reviews_rating CHECK (rating >= 1 AND rating <= 5)
);

CREATE INDEX IF NOT EXISTS idx_reviews_provider_profile_id ON reviews (provider_profile_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON reviews (customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews (rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews (created_at DESC);

-- 3. Bảng provider_reports (Báo cáo vi phạm & Khiếu nại đối soát)
CREATE TABLE IF NOT EXISTS provider_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_code VARCHAR(32) NOT NULL UNIQUE,
    order_id UUID,
    provider_id UUID NOT NULL,
    reporter_id UUID NOT NULL,
    reason_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    evidence_images TEXT,
    expected_resolution VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    penalty_type VARCHAR(30) NOT NULL DEFAULT 'NONE',
    penalty_amount BIGINT NOT NULL DEFAULT 0,
    admin_notes TEXT,
    resolved_by UUID,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reports_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    CONSTRAINT fk_reports_provider FOREIGN KEY (provider_id) REFERENCES provider_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reports_resolved_by FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_reports_provider_id ON provider_reports (provider_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON provider_reports (reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON provider_reports (status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON provider_reports (created_at DESC);
