package com.nhalo24h.order.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.UUID;

@Schema(description = "Bản ghi nhật ký hành động và chuyển trạng thái của đơn hàng")
public record OrderAuditLogResponse(
    UUID id,
    UUID actorUserId,
    String actorRole,
    String actionType,
    String oldOrderStatus,
    String newOrderStatus,
    String oldPaymentStatus,
    String newPaymentStatus,
    String description,
    Instant createdAt
) {
}
