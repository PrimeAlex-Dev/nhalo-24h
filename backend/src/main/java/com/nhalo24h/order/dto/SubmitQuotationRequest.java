package com.nhalo24h.order.dto;

import com.nhalo24h.order.domain.QuoteMode;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import java.time.Instant;
import java.util.List;

@Schema(description = "Yêu cầu gửi báo giá từ thợ cho một đơn hàng (Cơ cấu chi phí tinh gọn)")
public record SubmitQuotationRequest(
    @Schema(description = "Tổng giá dự kiến hoặc giá cố định (VNĐ)", example = "250000")
    @Min(value = 0, message = "Giá báo không được âm")
    Long quotedPrice,

    @Schema(description = "Ghi chú, phương án thi công hoặc cam kết bảo hành của thợ", example = "Đã bao gồm công và vật tư thay thế mới.")
    String providerNote,

    @Schema(description = "Thời gian ước tính thợ có thể đến nơi (ISO 8601)", example = "2026-10-18T14:30:00Z")
    Instant estimatedArrivalTime,

    @Schema(description = "Chế độ báo giá quy trình", example = "SURVEY_REQUIRED")
    QuoteMode quoteMode,

    @Schema(description = "Phí di chuyển / kiểm tra tới nhà khách (VNĐ)", example = "30000")
    @Min(value = 0, message = "Phí di chuyển không được âm")
    Long travelFee,

    @Schema(description = "Miễn phí di chuyển nếu khách đồng ý sửa chữa", example = "true")
    Boolean waiveTravelIfRepaired,

    @Schema(description = "Tiền công dự kiến (VNĐ)", example = "200000")
    @Min(value = 0, message = "Tiền công không được âm")
    Long estimatedLaborFee,

    @Schema(description = "Tiền vật tư dự kiến (VNĐ)", example = "100000")
    @Min(value = 0, message = "Tiền vật tư không được âm")
    Long estimatedMaterialsFee,

    @Schema(description = "Phạm vi kiểm tra, lưu ý phát sinh & cam kết bảo hành", example = "Miễn 100% phí di chuyển nếu khách đồng ý sửa chữa.")
    String scopeAndConditions,

    @Schema(description = "Danh sách vật tư dự kiến ban đầu (nếu có)")
    @Valid
    List<QuoteItemDto> items
) {
    public SubmitQuotationRequest(
        Long quotedPrice,
        String providerNote,
        Instant estimatedArrivalTime
    ) {
        this(
            quotedPrice,
            providerNote,
            estimatedArrivalTime,
            QuoteMode.COMMITTED_FIXED,
            0L,
            true,
            quotedPrice,
            0L,
            null,
            null
        );
    }
}
