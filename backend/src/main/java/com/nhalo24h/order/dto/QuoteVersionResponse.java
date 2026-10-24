package com.nhalo24h.order.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Schema(description = "Thông tin chi tiết một phiên bản báo giá / điều chỉnh chi phí")
public record QuoteVersionResponse(
    UUID id,
    UUID orderId,
    UUID requestId,
    UUID providerId,
    String providerName,
    Integer versionNumber,
    String versionType,
    String quoteMode,
    Long surveyFee,
    Long travelFee,
    Boolean waiveSurveyIfRepaired,
    Boolean waiveTravelIfRepaired,
    Long laborFee,
    Long materialsFee,
    Long totalAmount,
    String diagnosisOrReason,
    String status,
    List<QuoteItemDto> items,
    Instant createdAt,
    Instant respondedAt
) {
}
