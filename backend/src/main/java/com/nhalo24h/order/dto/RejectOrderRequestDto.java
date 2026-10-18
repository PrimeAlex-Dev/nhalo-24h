package com.nhalo24h.order.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Yêu cầu từ chối nhận việc từ thợ")
public record RejectOrderRequestDto(
    @Schema(description = "Lý do từ chối", example = "Trùng lịch bận đột xuất / Khu vực quá xa.")
    @NotBlank(message = "Vui lòng cung cấp lý do từ chối")
    String rejectReason
) {
}
