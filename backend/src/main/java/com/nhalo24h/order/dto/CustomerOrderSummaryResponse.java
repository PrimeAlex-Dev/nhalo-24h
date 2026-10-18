package com.nhalo24h.order.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.UUID;

@Schema(description = "Thông tin tóm tắt đơn hàng hiển thị trong danh sách của khách")
public record CustomerOrderSummaryResponse(
    @Schema(description = "ID đơn hàng", example = "c1a2b3c4-d5e6-7890-abcd-ef1234567890")
    UUID id,

    @Schema(description = "Mã đơn hàng", example = "ORD-20261018-ABCD")
    String orderCode,

    @Schema(description = "Tiêu đề sự cố", example = "Sửa rò rỉ bồn rửa chén")
    String title,

    @Schema(description = "Tên danh mục dịch vụ", example = "Sửa chữa ống nước")
    String categoryName,

    @Schema(description = "Trạng thái đơn hàng", example = "PENDING_PROVIDER")
    String status,

    @Schema(description = "Địa chỉ thực hiện", example = "123 Đường 30/4, P. Hưng Lợi, Q. Ninh Kiều, Cần Thơ")
    String addressSnapshot,

    @Schema(description = "Thời gian mong muốn thực hiện", example = "2026-10-18T14:00:00Z")
    Instant expectedScheduleTime,

    @Schema(description = "Giá chốt (nếu đã chốt thợ)", example = "200000")
    Long finalPrice,

    @Schema(description = "ID thợ được chọn (nếu có)")
    UUID assignedProviderId,

    @Schema(description = "Tên thợ được chọn (nếu có)", example = "Nguyễn Văn Minh")
    String assignedProviderName,

    @Schema(description = "Ảnh đại diện thợ được chọn")
    String assignedProviderAvatar,

    @Schema(description = "Số lượng báo giá nhận được", example = "3")
    int quotationCount,

    @Schema(description = "Thời gian tạo đơn")
    Instant createdAt
) {
}
