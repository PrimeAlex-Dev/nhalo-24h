package com.nhalo24h.order.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Schema(description = "Thông tin công việc dành cho thợ (yêu cầu báo giá hoặc việc đã nhận)")
public record ProviderJobResponse(
    @Schema(description = "ID yêu cầu báo giá", example = "a1b2c3d4-e5f6-7890-abcd-ef1234567890")
    UUID requestId,

    @Schema(description = "ID đơn hàng", example = "c1a2b3c4-d5e6-7890-abcd-ef1234567890")
    UUID orderId,

    @Schema(description = "Mã đơn hàng", example = "ORD-20261018-ABCD")
    String orderCode,

    @Schema(description = "Tiêu đề công việc", example = "Sửa ống nước bồn rửa chén")
    String title,

    @Schema(description = "Mô tả sự cố từ khách hàng")
    String description,

    @Schema(description = "Tên danh mục dịch vụ", example = "Sửa chữa ống nước")
    String categoryName,

    @Schema(description = "Tên khách hàng", example = "Nguyễn Văn A")
    String customerName,

    @Schema(description = "Số điện thoại khách hàng (chỉ hiển thị khi đơn đã chốt cho thợ)")
    String customerPhone,

    @Schema(description = "Địa chỉ thực hiện", example = "123 Đường 30/4, P. Hưng Lợi, Q. Ninh Kiều, Cần Thơ")
    String addressSnapshot,

    @Schema(description = "Thời gian khách mong muốn thợ tới")
    Instant expectedScheduleTime,

    @Schema(description = "Danh sách ảnh sự cố")
    List<String> images,

    @Schema(description = "Trạng thái của yêu cầu thợ (PENDING_RESPONSE, QUOTED, ACCEPTED, REJECTED, CANCELED)")
    String requestStatus,

    @Schema(description = "Trạng thái tổng thể của đơn (PENDING_PROVIDER, IN_PROGRESS, COMPLETED, CANCELED)")
    String orderStatus,

    @Schema(description = "Giá đã báo của thợ (VNĐ)", example = "250000")
    Long quotedPrice,

    @Schema(description = "Ghi chú đã gửi của thợ")
    String providerNote,

    @Schema(description = "Thời gian ước tính có mặt đã gửi")
    Instant estimatedArrivalTime,

    @Schema(description = "Lý do từ chối (nếu thợ từ chối)")
    String rejectReason,

    @Schema(description = "Thời gian nhận yêu cầu")
    Instant createdAt
) {
}
