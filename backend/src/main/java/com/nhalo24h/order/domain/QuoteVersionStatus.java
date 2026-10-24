package com.nhalo24h.order.domain;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Trạng thái phê duyệt của một phiên bản báo giá")
public enum QuoteVersionStatus {
    @Schema(description = "Đang chờ khách hàng xem xét và xác nhận")
    PENDING_APPROVAL,

    @Schema(description = "Khách hàng đã đồng ý áp dụng phiên bản báo giá này")
    APPROVED,

    @Schema(description = "Khách hàng từ chối phiên bản báo giá này")
    REJECTED,

    @Schema(description = "Đã được thay thế bởi một phiên bản báo giá mới hơn")
    SUPERSEDED
}
