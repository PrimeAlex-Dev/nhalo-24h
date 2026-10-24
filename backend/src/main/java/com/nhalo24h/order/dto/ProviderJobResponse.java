package com.nhalo24h.order.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Schema(description = "Thông tin công việc dành cho thợ (yêu cầu báo giá hoặc việc đã nhận)")
public record ProviderJobResponse(
    @Schema(description = "ID yêu cầu báo giá")
    UUID requestId,

    @Schema(description = "ID đơn hàng")
    UUID orderId,

    @Schema(description = "Mã đơn hàng")
    String orderCode,

    @Schema(description = "Tiêu đề công việc")
    String title,

    @Schema(description = "Mô tả sự cố từ khách hàng")
    String description,

    @Schema(description = "Tên danh mục dịch vụ")
    String categoryName,

    @Schema(description = "Tên khách hàng")
    String customerName,

    @Schema(description = "Số điện thoại khách hàng (chỉ hiển thị khi đơn đã chốt cho thợ)")
    String customerPhone,

    @Schema(description = "Địa chỉ thực hiện")
    String addressSnapshot,

    @Schema(description = "Thời gian khách mong muốn thợ tới")
    Instant expectedScheduleTime,

    @Schema(description = "Mức độ khẩn cấp")
    String urgencyLevel,

    @Schema(description = "Thông số đặc thù của dịch vụ")
    String serviceMetadata,

    @Schema(description = "Danh sách ảnh sự cố ban đầu")
    List<String> images,

    @Schema(description = "Danh sách ảnh khảo sát")
    List<String> surveyImages,

    @Schema(description = "Danh sách ảnh nghiệm thu hoàn thành")
    List<String> completionImages,

    @Schema(description = "Trạng thái của yêu cầu thợ (PENDING_RESPONSE, QUOTED, ACCEPTED, REJECTED, CANCELED)")
    String requestStatus,

    @Schema(description = "Trạng thái công việc của đơn")
    String orderStatus,

    @Schema(description = "Chế độ báo giá / quy trình (SURVEY_REQUIRED hoặc COMMITTED_FIXED)")
    String quoteMode,

    @Schema(description = "Phí khảo sát (VNĐ)")
    Long surveyFee,

    @Schema(description = "Phí di chuyển (VNĐ)")
    Long travelFee,

    @Schema(description = "Miễn phí khảo sát nếu sửa")
    Boolean waiveSurveyIfRepaired,

    @Schema(description = "Miễn phí di chuyển nếu sửa")
    Boolean waiveTravelIfRepaired,

    @Schema(description = "Phí khảo sát áp dụng vào hóa đơn cuối (VNĐ)")
    Long appliedSurveyFee,

    @Schema(description = "Phí di chuyển áp dụng vào hóa đơn cuối (VNĐ)")
    Long appliedTravelFee,

    @Schema(description = "Tiền công dự kiến / chốt (VNĐ)")
    Long laborFee,

    @Schema(description = "Tiền vật tư dự kiến / chốt (VNĐ)")
    Long materialsFee,

    @Schema(description = "Tổng giá báo hoặc tổng hóa đơn chốt (VNĐ)")
    Long quotedPrice,

    @Schema(description = "Tỷ lệ hoa hồng áp dụng trên tiền công (%)")
    BigDecimal commissionRateSnapshot,

    @Schema(description = "Số tiền hoa hồng dự kiến / thực tế phải nộp nền tảng (VNĐ)")
    Long commissionAmount,

    @Schema(description = "Ghi chú đã gửi của thợ")
    String providerNote,

    @Schema(description = "Phạm vi kiểm tra & điều kiện miễn phí")
    String scopeAndConditions,

    @Schema(description = "Ghi chú hoàn thành công việc")
    String completionNote,

    @Schema(description = "Phương thức thanh toán (CASH / ONLINE)")
    String paymentMethod,

    @Schema(description = "Trạng thái thanh toán độc lập")
    String paymentStatus,

    @Schema(description = "Số tiền mặt khách đã khai báo trả")
    Long customerDeclaredAmount,

    @Schema(description = "Ghi chú thanh toán của khách")
    String customerPaymentNote,

    @Schema(description = "Lý do tranh chấp thanh toán (nếu có)")
    String disputeReason,

    @Schema(description = "Thời gian ước tính có mặt đã gửi")
    Instant estimatedArrivalTime,

    @Schema(description = "Lý do từ chối (nếu thợ từ chối)")
    String rejectReason,

    @Schema(description = "Lịch sử các phiên bản báo giá của đơn")
    List<QuoteVersionResponse> quoteVersions,

    @Schema(description = "Thời gian nhận yêu cầu")
    Instant createdAt
) {
}
