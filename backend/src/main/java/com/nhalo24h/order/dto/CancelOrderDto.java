package com.nhalo24h.order.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Yêu cầu hủy đơn hàng")
public record CancelOrderDto(
    @Schema(description = "Lý do hủy đơn hàng", example = "Đã tự khắc phục được sự cố.")
    String reason
) {
}
