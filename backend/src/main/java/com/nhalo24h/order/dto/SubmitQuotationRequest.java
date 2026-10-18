package com.nhalo24h.order.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.Instant;

@Schema(description = "Yêu cầu gửi báo giá từ thợ cho một đơn hàng")
public record SubmitQuotationRequest(
    @Schema(description = "Giá báo cho công việc (VNĐ)", example = "250000")
    @NotNull(message = "Giá báo không được để trống")
    @Positive(message = "Giá báo phải lớn hơn 0")
    Long quotedPrice,

    @Schema(description = "Ghi chú, phương án thi công hoặc cam kết bảo hành của thợ", example = "Đã bao gồm công và vật tư thay thế mới.")
    String providerNote,

    @Schema(description = "Thời gian ước tính thợ có thể đến nơi (ISO 8601)", example = "2026-10-18T14:30:00Z")
    Instant estimatedArrivalTime
) {
}
