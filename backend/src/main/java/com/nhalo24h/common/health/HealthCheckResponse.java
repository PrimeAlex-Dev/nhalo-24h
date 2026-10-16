package com.nhalo24h.common.health;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;

@Schema(description = "Phản hồi kiểm tra trạng thái hoạt động của hệ thống")
public record HealthCheckResponse(
    @Schema(description = "Trạng thái vận hành của dịch vụ", example = "UP")
    String status,

    @Schema(description = "Tên định danh dịch vụ", example = "nhalo24h-backend")
    String service,

    @Schema(description = "Thời điểm kiểm tra theo chuẩn ISO-8601", example = "2026-10-15T12:00:00Z")
    Instant timestamp
) {
    public static HealthCheckResponse up(String service) {
        return new HealthCheckResponse("UP", service, Instant.now());
    }
}
