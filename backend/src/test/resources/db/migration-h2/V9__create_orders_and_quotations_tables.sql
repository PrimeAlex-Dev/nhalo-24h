-- ==============================================================================
-- Migration: V9__create_orders_and_quotations_tables.sql (H2 Test Compatibility)
-- ==============================================================================

-- 1. Bảng orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    order_code VARCHAR(32) NOT NULL,
    customer_id UUID NOT NULL,
    category_id UUID NOT NULL,
    address_id UUID,
    address_snapshot VARCHAR(500) NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    expected_schedule_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING_PROVIDER' NOT NULL,
    assigned_provider_id UUID,
    final_price BIGINT,
    cancel_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_orders_order_code UNIQUE (order_code),
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_orders_category FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE RESTRICT,
    CONSTRAINT fk_orders_address FOREIGN KEY (address_id) REFERENCES customer_addresses(id) ON DELETE SET NULL,
    CONSTRAINT fk_orders_provider FOREIGN KEY (assigned_provider_id) REFERENCES provider_profiles(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_assigned_provider_id ON orders (assigned_provider_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);

-- 2. Bảng order_images
CREATE TABLE IF NOT EXISTS order_images (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    order_id UUID NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_order_images_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_order_images_order_id ON order_images (order_id);

-- 3. Bảng order_requests
CREATE TABLE IF NOT EXISTS order_requests (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    order_id UUID NOT NULL,
    provider_id UUID NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING_RESPONSE' NOT NULL,
    quoted_price BIGINT,
    provider_note TEXT,
    estimated_arrival_time TIMESTAMP WITH TIME ZONE,
    reject_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_order_requests_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_requests_provider FOREIGN KEY (provider_id) REFERENCES provider_profiles(id) ON DELETE CASCADE,
    CONSTRAINT uq_order_provider UNIQUE (order_id, provider_id)
);

CREATE INDEX IF NOT EXISTS idx_order_requests_order_id ON order_requests (order_id);
CREATE INDEX IF NOT EXISTS idx_order_requests_provider_id ON order_requests (provider_id);
CREATE INDEX IF NOT EXISTS idx_order_requests_status ON order_requests (status);

-- 4. Bảng order_request_messages
CREATE TABLE IF NOT EXISTS order_request_messages (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    request_id UUID NOT NULL,
    sender_user_id UUID NOT NULL,
    sender_role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_messages_request FOREIGN KEY (request_id) REFERENCES order_requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_sender FOREIGN KEY (sender_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_request_messages_request_id ON order_request_messages (request_id);
