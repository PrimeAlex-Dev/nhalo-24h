package com.nhalo24h.order.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.UUID;

@Schema(description = "Thông tin chi tiết một báo giá từ thợ (Bóc tách 3 nhóm chi phí)")
public record QuotationItemResponse(
    @Schema(description = "ID bản ghi yêu cầu báo giá", example = "a1b2c3d4-e5f6-7890-abcd-ef1234567890")
    UUID requestId,

    @Schema(description = "ID hồ sơ thợ (ProviderProfile ID)", example = "b1c2d3e4-f5a6-7890-abcd-ef1234567890")
    UUID providerId,

    @Schema(description = "ID tài khoản User của thợ", example = "c1d2e3f4-a5b6-7890-abcd-ef1234567890")
    UUID providerUserId,

    @Schema(description = "Họ tên thợ", example = "Nguyễn Văn Minh")
    String providerName,

    @Schema(description = "Ảnh đại diện thợ")
    String providerAvatar,

    @Schema(description = "Tiêu đề nghề nghiệp của thợ", example = "Thợ Điện Nước Chuyên Nghiệp")
    String providerHeadline,

    @Schema(description = "Đơn giá theo giờ tham khảo của thợ (VNĐ)", example = "150000")
    Long pricePerHour,

    @Schema(description = "Trạng thái báo giá", example = "QUOTED")
    String status,

    @Schema(description = "Chế độ báo giá (SURVEY_REQUIRED hoặc COMMITTED_FIXED)", example = "SURVEY_REQUIRED")
    String quoteMode,

    @Schema(description = "Phí khảo sát (VNĐ)", example = "50000")
    Long surveyFee,

    @Schema(description = "Phí di chuyển (VNĐ)", example = "30000")
    Long travelFee,

    @Schema(description = "Miễn phí khảo sát nếu khách đồng ý sửa", example = "true")
    Boolean waiveSurveyIfRepaired,

    @Schema(description = "Miễn phí di chuyển nếu khách đồng ý sửa", example = "true")
    Boolean waiveTravelIfRepaired,

    @Schema(description = "Tiền công dự kiến / cam kết (VNĐ)", example = "200000")
    Long estimatedLaborFee,

    @Schema(description = "Tiền vật tư dự kiến (VNĐ)", example = "100000")
    Long estimatedMaterialsFee,

    @Schema(description = "Tổng giá báo dự kiến khi sửa chữa (VNĐ)", example = "300000")
    Long quotedPrice,

    @Schema(description = "Ghi chú của thợ về giải pháp/cam kết", example = "Đã bao gồm công và ống dẫn mới, bảo hành 6 tháng.")
    String providerNote,

    @Schema(description = "Phạm vi công việc và điều kiện miễn phí khảo sát/di chuyển")
    String scopeAndConditions,

    @Schema(description = "Thời gian ước tính thợ có mặt")
    Instant estimatedArrivalTime,

    @Schema(description = "Lý do thợ từ chối (nếu có)")
    String rejectReason,

    @Schema(description = "Thời gian gửi yêu cầu")
    Instant createdAt,

    @Schema(description = "Thời gian thợ phản hồi")
    Instant updatedAt
) {
}
