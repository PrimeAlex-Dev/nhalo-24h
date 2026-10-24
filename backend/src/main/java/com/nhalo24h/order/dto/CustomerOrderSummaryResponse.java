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

    @Schema(description = "Trạng thái công việc của đơn hàng", example = "PENDING_PROVIDER")
    String status,

    @Schema(description = "Trạng thái thanh toán độc lập", example = "UNPAID")
    String paymentStatus,

    @Schema(description = "Phương thức thanh toán (CASH / ONLINE)")
    String paymentMethod,

    @Schema(description = "Chế độ quy trình (SURVEY_REQUIRED / COMMITTED_FIXED)")
    String workflowMode,

    @Schema(description = "Mức độ khẩn cấp (NORMAL / URGENT / EMERGENCY)")
    String urgencyLevel,

    @Schema(description = "Địa chỉ thực hiện", example = "123 Đường 30/4, P. Hưng Lợi, Q. Ninh Kiều, Cần Thơ")
    String addressSnapshot,

    @Schema(description = "Thời gian mong muốn thực hiện", example = "2026-10-18T14:00:00Z")
    Instant expectedScheduleTime,

    @Schema(description = "Tổng hóa đơn chốt (nếu đã xác định)", example = "430000")
    Long finalPrice,

    @Schema(description = "Tiền công chốt (VNĐ)", example = "250000")
    Long finalLaborFee,

    @Schema(description = "Tiền vật tư chốt (VNĐ)", example = "180000")
    Long finalMaterialsFee,

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
