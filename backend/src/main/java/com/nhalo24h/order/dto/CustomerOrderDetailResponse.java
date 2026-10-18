package com.nhalo24h.order.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Schema(description = "Chi tiết toàn bộ đơn hàng kèm các báo giá của thợ và ảnh sự cố")
public record CustomerOrderDetailResponse(
    @Schema(description = "ID đơn hàng", example = "c1a2b3c4-d5e6-7890-abcd-ef1234567890")
    UUID id,

    @Schema(description = "Mã đơn hàng", example = "ORD-20261018-ABCD")
    String orderCode,

    @Schema(description = "Tiêu đề sự cố", example = "Sửa rò rỉ bồn rửa chén")
    String title,

    @Schema(description = "Mô tả chi tiết")
    String description,

    @Schema(description = "ID danh mục dịch vụ")
    UUID categoryId,

    @Schema(description = "Tên danh mục dịch vụ")
    String categoryName,

    @Schema(description = "Địa chỉ thực hiện")
    String addressSnapshot,

    @Schema(description = "Tên người liên hệ")
    String contactName,

    @Schema(description = "Số điện thoại liên hệ")
    String contactPhone,

    @Schema(description = "Thời gian mong muốn thực hiện")
    Instant expectedScheduleTime,

    @Schema(description = "Trạng thái đơn hàng", example = "PENDING_PROVIDER")
    String status,

    @Schema(description = "Giá chốt đơn hàng (nếu đã chốt)")
    Long finalPrice,

    @Schema(description = "Lý do hủy (nếu có)")
    String cancelReason,

    @Schema(description = "ID thợ được chốt nhận việc (nếu có)")
    UUID assignedProviderId,

    @Schema(description = "Tên thợ được chốt nhận việc (nếu có)")
    String assignedProviderName,

    @Schema(description = "Ảnh đại diện thợ được chốt (nếu có)")
    String assignedProviderAvatar,

    @Schema(description = "Số điện thoại thợ được chốt (chỉ hiện khi IN_PROGRESS hoặc COMPLETED)")
    String assignedProviderPhone,

    @Schema(description = "Danh sách link ảnh sự cố")
    List<String> images,

    @Schema(description = "Danh sách các báo giá nhận được từ các thợ")
    List<QuotationItemResponse> quotations,

    @Schema(description = "Thời gian tạo đơn")
    Instant createdAt,

    @Schema(description = "Thời gian cập nhật")
    Instant updatedAt
) {
}
