package com.nhalo24h.order.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.UUID;

@Schema(description = "Thông tin khởi tạo giao dịch thanh toán trực tuyến (Mock Gateway)")
public record OnlinePaymentInitResponse(
    UUID orderId,
    String orderCode,
    String transactionRef,
    Long amountToPay,
    Long laborFee,
    Long materialsFee,
    Long appliedSurveyFee,
    Long appliedTravelFee,
    String paymentStatus,
    String gatewayProvider,
    Instant createdAt
) {
}
