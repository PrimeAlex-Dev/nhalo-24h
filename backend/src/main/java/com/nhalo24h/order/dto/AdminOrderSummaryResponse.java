package com.nhalo24h.order.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Schema(description = "Thông tin đơn hàng hiển thị cho Quản trị viên")
public record AdminOrderSummaryResponse(
    @Schema(description = "ID đơn hàng")
    UUID id,

    @Schema(description = "Mã đơn hàng")
    String orderCode,

    @Schema(description = "Tiêu đề yêu cầu")
    String title,

    @Schema(description = "Mô tả chi tiết")
    String description,

    @Schema(description = "ID danh mục dịch vụ")
    UUID categoryId,

    @Schema(description = "Tên danh mục dịch vụ")
    String categoryName,

    @Schema(description = "Địa chỉ thực hiện")
    String addressSnapshot,

    @Schema(description = "Tên khách hàng liên hệ")
    String contactName,

    @Schema(description = "Số điện thoại liên hệ")
    String contactPhone,

    @Schema(description = "Thời gian mong muốn thực hiện")
    Instant expectedScheduleTime,

    @Schema(description = "Trạng thái công việc của đơn hàng")
    String status,

    @Schema(description = "Trạng thái thanh toán")
    String paymentStatus,

    @Schema(description = "Phương thức thanh toán")
    String paymentMethod,

    @Schema(description = "Chế độ quy trình (SURVEY_REQUIRED / COMMITTED_FIXED)")
    String workflowMode,

    @Schema(description = "Phí khảo sát áp dụng (VNĐ)")
    Long appliedSurveyFee,

    @Schema(description = "Phí di chuyển áp dụng (VNĐ)")
    Long appliedTravelFee,

    @Schema(description = "Tiền công thực tế (VNĐ)")
    Long finalLaborFee,

    @Schema(description = "Tiền vật tư thực tế (VNĐ)")
    Long finalMaterialsFee,

    @Schema(description = "Tổng hóa đơn chốt (VNĐ)")
    Long finalPrice,

    @Schema(description = "Tỷ lệ hoa hồng (%)")
    BigDecimal commissionRateSnapshot,

    @Schema(description = "Số tiền hoa hồng nền tảng (VNĐ)")
    Long commissionAmount,

    @Schema(description = "Số tiền mặt khách khai báo")
    Long customerDeclaredAmount,

    @Schema(description = "Cờ cảnh báo đơn bất thường")
    Boolean isFlaggedAbnormal,

    @Schema(description = "Lý do cảnh báo bất thường")
    String abnormalReason,

    @Schema(description = "Lý do tranh chấp thanh toán")
    String disputeReason,

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

    @Schema(description = "Số lượng báo giá nhận được")
    int quotationCount,

    @Schema(description = "Thời gian tạo đơn")
    Instant createdAt,

    @Schema(description = "Thời gian cập nhật gần nhất")
    Instant updatedAt
) {
}
