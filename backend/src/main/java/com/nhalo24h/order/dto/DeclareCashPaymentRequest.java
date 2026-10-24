package com.nhalo24h.order.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Khách hàng khai báo số tiền mặt thực tế đã giao cho thợ")
public record DeclareCashPaymentRequest(
    @Schema(description = "Số tiền mặt khách đã đưa cho thợ (VNĐ)", example = "430000")
    @NotNull(message = "Vui lòng nhập số tiền mặt đã thanh toán")
    @Min(value = 0, message = "Số tiền thanh toán không được âm")
    Long declaredAmount,

    @Schema(description = "Ghi chú hoặc giải trình nếu số tiền khác hóa đơn", example = "Đã thanh toán đủ tiền mặt trực tiếp cho thợ")
    String note
) {
}
