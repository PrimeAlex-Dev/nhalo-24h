package com.nhalo24h.order.domain;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Trạng thái của yêu cầu gửi đến thợ")
public enum OrderRequestStatus {
    @Schema(description = "Đã gửi đến thợ, chờ thợ phản hồi / báo giá")
    PENDING_RESPONSE,

    @Schema(description = "Thợ đã phản hồi và đưa ra báo giá")
    QUOTED,

    @Schema(description = "Thợ từ chối nhận việc")
    REJECTED,

    @Schema(description = "Khách hàng chấp nhận báo giá này để làm việc")
    ACCEPTED,

    @Schema(description = "Yêu cầu bị hủy (do khách hủy đơn hoặc đã chọn thợ khác)")
    CANCELED
}
