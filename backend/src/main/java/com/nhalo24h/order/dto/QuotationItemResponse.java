package com.nhalo24h.order.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.UUID;

@Schema(description = "Thông tin chi tiết một báo giá từ thợ")
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

    @Schema(description = "Giá báo (VNĐ)", example = "250000")
    Long quotedPrice,

    @Schema(description = "Ghi chú của thợ về giải pháp/cam kết", example = "Đã bao gồm công và ống dẫn mới, bảo hành 6 tháng.")
    String providerNote,

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
