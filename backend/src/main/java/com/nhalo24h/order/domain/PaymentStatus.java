package com.nhalo24h.order.domain;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Trạng thái thanh toán của đơn hàng (tách biệt độc lập với trạng thái công việc)")
public enum PaymentStatus {
    @Schema(description = "Chưa thanh toán")
    UNPAID,

    @Schema(description = "Đang chờ xác nhận giao dịch thanh toán Online")
    PAYMENT_PENDING,

    @Schema(description = "Đã thanh toán Online thành công")
    PAID_ONLINE,

    @Schema(description = "Khách đã khai báo số tiền mặt đã trả, chờ thợ xác nhận")
    CASH_PENDING_CONFIRMATION,

    @Schema(description = "Hai bên đã xác nhận thanh toán tiền mặt khớp nhau")
    CASH_CONFIRMED,

    @Schema(description = "Có bất đồng về số tiền thanh toán / lệch hóa đơn cần xử lý")
    PAYMENT_DISPUTED,

    @Schema(description = "Đã hoàn tiền")
    REFUNDED
}
