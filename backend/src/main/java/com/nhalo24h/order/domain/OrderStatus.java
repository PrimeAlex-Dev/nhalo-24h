package com.nhalo24h.order.domain;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Trạng thái của đơn hàng")
public enum OrderStatus {
    @Schema(description = "Đơn mới tạo, đang tìm hoặc chờ chốt thợ")
    PENDING_PROVIDER,

    @Schema(description = "Đã chốt thợ, thợ đang chuẩn bị hoặc đang sửa chữa")
    IN_PROGRESS,

    @Schema(description = "Công việc đã hoàn thành thành công")
    COMPLETED,

    @Schema(description = "Đơn hàng đã bị hủy")
    CANCELED
}
