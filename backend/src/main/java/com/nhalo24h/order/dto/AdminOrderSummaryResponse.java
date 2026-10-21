package com.nhalo24h.order.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.UUID;

@Schema(description = "Thông tin đơn hàng hiển thị cho Quản trị viên")
public record AdminOrderSummaryResponse(
    @Schema(description = "ID đơn hàng", example = "c1a2b3c4-d5e6-7890-abcd-ef1234567890")
    UUID id,

    @Schema(description = "Mã đơn hàng", example = "ORD-20261018-ABCD")
    String orderCode,

    @Schema(description = "Tiêu đề yêu cầu", example = "Sửa rò rỉ bồn rửa chén")
    String title,

    @Schema(description = "Mô tả chi tiết")
    String description,

    @Schema(description = "ID danh mục dịch vụ")
    UUID categoryId,

    @Schema(description = "Tên danh mục dịch vụ", example = "Sửa chữa ống nước")
    String categoryName,

    @Schema(description = "Địa chỉ thực hiện")
    String addressSnapshot,

    @Schema(description = "Tên khách hàng liên hệ", example = "Nguyễn Văn An")
    String contactName,

    @Schema(description = "Số điện thoại liên hệ", example = "0907654321")
    String contactPhone,

    @Schema(description = "Thời gian mong muốn thực hiện")
    Instant expectedScheduleTime,

    @Schema(description = "Trạng thái đơn hàng", example = "PENDING_PROVIDER")
    String status,

    @Schema(description = "Giá chốt đơn hàng (nếu đã chốt)")
    Long finalPrice,

    @Schema(description = "Lý do hủy (nếu có)")
    String cancelReason,

    @Schema(description = "ID thợ được chọn (nếu có)")
    UUID assignedProviderId,

    @Schema(description = "Tên thợ được chọn (nếu có)")
    String assignedProviderName,

    @Schema(description = "Số điện thoại thợ được chọn (nếu có)")
    String assignedProviderPhone,

    @Schema(description = "Ảnh đại diện thợ được chọn")
    String assignedProviderAvatar,

    @Schema(description = "Số lượng báo giá nhận được", example = "2")
    int quotationCount,

    @Schema(description = "Thời gian tạo đơn")
    Instant createdAt,

    @Schema(description = "Thời gian cập nhật gần nhất")
    Instant updatedAt
) {
}
