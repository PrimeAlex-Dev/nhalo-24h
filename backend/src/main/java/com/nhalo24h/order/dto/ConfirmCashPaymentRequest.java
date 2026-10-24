package com.nhalo24h.order.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Thợ xác nhận số tiền mặt khách hàng đã khai báo")
public record ConfirmCashPaymentRequest(
    @Schema(description = "true nếu đồng ý đã nhận đúng số tiền khách khai, false nếu số tiền không khớp", example = "true")
    @NotNull(message = "Vui lòng chọn xác nhận đồng ý hoặc báo không khớp")
    Boolean confirmed,

    @Schema(description = "Số tiền thực nhận theo phía thợ (nếu báo không khớp)")
    Long actualReceivedAmount,

    @Schema(description = "Lý do báo không khớp")
    String disputeReason
) {
}
