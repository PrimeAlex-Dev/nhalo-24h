package com.nhalo24h.order.dto;

import com.nhalo24h.order.domain.QuoteMode;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import java.time.Instant;
import java.util.List;

@Schema(description = "Yêu cầu gửi báo giá từ thợ cho một đơn hàng (Hỗ trợ bóc tách 3 nhóm chi phí)")
public record SubmitQuotationRequest(
    @Schema(description = "Tổng giá dự kiến hoặc giá cố định (VNĐ)", example = "250000")
    @Min(value = 0, message = "Giá báo không được âm")
    Long quotedPrice,

    @Schema(description = "Ghi chú, phương án thi công hoặc cam kết bảo hành của thợ", example = "Đã bao gồm công và vật tư thay thế mới.")
    String providerNote,

    @Schema(description = "Thời gian ước tính thợ có thể đến nơi (ISO 8601)", example = "2026-10-18T14:30:00Z")
    Instant estimatedArrivalTime,

    @Schema(description = "Chế độ báo giá: SURVEY_REQUIRED (Khảo sát trước khi chốt) hoặc COMMITTED_FIXED (Cam kết giá cố định theo mô tả)", example = "SURVEY_REQUIRED")
    QuoteMode quoteMode,

    @Schema(description = "Nhóm 1 - Phí khảo sát kiểm tra thực tế (VNĐ)", example = "50000")
    @Min(value = 0, message = "Phí khảo sát không được âm")
    Long surveyFee,

    @Schema(description = "Nhóm 2 - Phí di chuyển tới nhà khách (VNĐ)", example = "30000")
    @Min(value = 0, message = "Phí di chuyển không được âm")
    Long travelFee,

    @Schema(description = "Miễn phí khảo sát nếu khách đồng ý sửa chữa", example = "true")
    Boolean waiveSurveyIfRepaired,

    @Schema(description = "Miễn phí di chuyển nếu khách đồng ý sửa chữa", example = "true")
    Boolean waiveTravelIfRepaired,

    @Schema(description = "Nhóm 3a - Tiền công dự kiến hoặc cam kết (VNĐ)", example = "200000")
    @Min(value = 0, message = "Tiền công không được âm")
    Long estimatedLaborFee,

    @Schema(description = "Nhóm 3b - Tiền vật tư dự kiến (VNĐ)", example = "100000")
    @Min(value = 0, message = "Tiền vật tư không được âm")
    Long estimatedMaterialsFee,

    @Schema(description = "Phạm vi kiểm tra, điều kiện miễn phí khảo sát/di chuyển và lưu ý phát sinh", example = "Miễn 100% phí khảo sát & di chuyển nếu anh/chị đồng ý sửa chữa.")
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
            0L,
            true,
            true,
            quotedPrice,
            0L,
            null,
            null
        );
    }
}
