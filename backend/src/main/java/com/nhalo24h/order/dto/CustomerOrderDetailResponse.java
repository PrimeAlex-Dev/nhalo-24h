package com.nhalo24h.order.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Schema(description = "Chi tiết toàn bộ đơn hàng kèm 3 nhóm chi phí, lịch sử phiên bản báo giá, thanh toán và nhật ký")
public record CustomerOrderDetailResponse(
    @Schema(description = "ID đơn hàng")
    UUID id,

    @Schema(description = "Mã đơn hàng")
    String orderCode,

    @Schema(description = "Tiêu đề sự cố")
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

    @Schema(description = "Mức độ khẩn cấp (NORMAL, URGENT, EMERGENCY)")
    String urgencyLevel,

    @Schema(description = "Thông số đặc thù của dịch vụ (JSON/Text)")
    String serviceMetadata,

    @Schema(description = "Trạng thái công việc của đơn hàng")
    String status,

    @Schema(description = "Chế độ quy trình (SURVEY_REQUIRED hoặc COMMITTED_FIXED)")
    String workflowMode,

    @Schema(description = "Phí khảo sát đã thỏa thuận (VNĐ)")
    Long agreedSurveyFee,

    @Schema(description = "Phí di chuyển đã thỏa thuận (VNĐ)")
    Long agreedTravelFee,

    @Schema(description = "Chính sách miễn phí khảo sát nếu sửa (snapshot)")
    Boolean waiveSurveyIfRepaired,

    @Schema(description = "Chính sách miễn phí di chuyển nếu sửa (snapshot)")
    Boolean waiveTravelIfRepaired,

    @Schema(description = "Phí khảo sát áp dụng thực tế vào hóa đơn (VNĐ)")
    Long appliedSurveyFee,

    @Schema(description = "Phí di chuyển áp dụng thực tế vào hóa đơn (VNĐ)")
    Long appliedTravelFee,

    @Schema(description = "Tiền công sửa chữa/vệ sinh thực tế chốt (VNĐ)")
    Long finalLaborFee,

    @Schema(description = "Tiền vật tư/linh kiện thực tế chốt (VNĐ)")
    Long finalMaterialsFee,

    @Schema(description = "Tổng hóa đơn khách phải trả (VNĐ)")
    Long finalPrice,

    @Schema(description = "Tỷ lệ hoa hồng nền tảng snapshot (%)")
    BigDecimal commissionRateSnapshot,

    @Schema(description = "Số tiền hoa hồng nền tảng tính trên tiền công (VNĐ)")
    Long commissionAmount,

    @Schema(description = "Ghi chú tổng kết công việc của thợ khi hoàn thành")
    String completionNote,

    @Schema(description = "Phương thức thanh toán (CASH / ONLINE)")
    String paymentMethod,

    @Schema(description = "Trạng thái thanh toán độc lập")
    String paymentStatus,

    @Schema(description = "Mã tham chiếu giao dịch thanh toán Online")
    String onlineTransactionRef,

    @Schema(description = "Số tiền mặt khách hàng đã khai báo")
    Long customerDeclaredAmount,

    @Schema(description = "Ghi chú thanh toán của khách")
    String customerPaymentNote,

    @Schema(description = "Số tiền mặt thợ xác nhận đã thu")
    Long providerConfirmedAmount,

    @Schema(description = "Thời điểm thợ xác nhận thu tiền mặt")
    Instant providerPaymentConfirmedAt,

    @Schema(description = "Lý do tranh chấp thanh toán (nếu có)")
    String disputeReason,

    @Schema(description = "Cờ đánh dấu đơn có dấu hiệu bất thường cần Admin lưu ý")
    Boolean isFlaggedAbnormal,

    @Schema(description = "Lý do cảnh báo bất thường")
    String abnormalReason,

    @Schema(description = "Lý do hủy đơn (nếu có)")
    String cancelReason,

    @Schema(description = "ID thợ được chốt nhận việc (nếu có)")
    UUID assignedProviderId,

    @Schema(description = "Tên thợ được chốt nhận việc (nếu có)")
    String assignedProviderName,

    @Schema(description = "Ảnh đại diện thợ được chốt (nếu có)")
    String assignedProviderAvatar,

    @Schema(description = "Số điện thoại thợ được chốt")
    String assignedProviderPhone,

    @Schema(description = "Danh sách link ảnh sự cố ban đầu của khách")
    List<String> images,

    @Schema(description = "Danh sách ảnh hiện trường lúc thợ khảo sát")
    List<String> surveyImages,

    @Schema(description = "Danh sách ảnh nghiệm thu sau khi thợ hoàn thành")
    List<String> completionImages,

    @Schema(description = "Danh sách các báo giá ban đầu từ các thợ")
    List<QuotationItemResponse> quotations,

    @Schema(description = "Lịch sử các phiên bản báo giá & điều chỉnh chi phí")
    List<QuoteVersionResponse> quoteVersions,

    @Schema(description = "Nhật ký hành động và chuyển trạng thái của đơn hàng")
    List<OrderAuditLogResponse> auditLogs,

    @Schema(description = "Thời gian tạo đơn")
    Instant createdAt,

    @Schema(description = "Thời gian cập nhật")
    Instant updatedAt
) {
}
