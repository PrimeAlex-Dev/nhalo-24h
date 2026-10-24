package com.nhalo24h.order.domain;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Phương thức thanh toán đơn hàng")
public enum PaymentMethod {
    @Schema(description = "Thanh toán tiền mặt trực tiếp cho thợ (cần 2 bước xác nhận)")
    CASH,

    @Schema(description = "Thanh toán trực tuyến qua cổng thanh toán")
    ONLINE
}
