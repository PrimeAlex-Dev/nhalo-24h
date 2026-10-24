package com.nhalo24h.order.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Xác nhận kết quả giao dịch từ cổng thanh toán trực tuyến")
public record ConfirmOnlinePaymentRequest(
    @Schema(description = "Mã tham chiếu giao dịch", example = "TXN-20261024-ABC123")
    @NotBlank(message = "Mã giao dịch không được để trống")
    String transactionRef,

    @Schema(description = "Kết quả thanh toán từ cổng (true: thành công, false: thất bại/hủy)", example = "true")
    @NotNull(message = "Trạng thái kết quả giao dịch không được để trống")
    Boolean success
) {
}
