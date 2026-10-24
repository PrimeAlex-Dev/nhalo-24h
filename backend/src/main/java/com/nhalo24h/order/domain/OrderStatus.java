package com.nhalo24h.order.domain;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Trạng thái công việc của đơn hàng")
public enum OrderStatus {
    @Schema(description = "Đơn mới tạo, đang chờ thợ gửi báo giá hoặc chờ khách chọn thợ")
    PENDING_PROVIDER,

    @Schema(description = "Khách đã chọn thợ và đồng ý điều kiện khảo sát, chờ thợ đến kiểm tra thực tế")
    AWAITING_SURVEY,

    @Schema(description = "Thợ đã khảo sát và gửi báo giá cuối kèm vật tư, chờ khách xác nhận trước khi sửa")
    AWAITING_CUSTOMER_APPROVAL,

    @Schema(description = "Khách đã chấp thuận giá và thợ đang thực hiện công việc")
    IN_PROGRESS,

    @Schema(description = "Thợ báo hoàn thành và gửi hóa đơn cuối, chờ khách nghiệm thu và thanh toán")
    AWAITING_COMPLETION_CONFIRMATION,

    @Schema(description = "Khách từ chối sửa sau khảo sát (chỉ tính phí khảo sát và phí di chuyển theo thỏa thuận)")
    DECLINED_AFTER_SURVEY,

    @Schema(description = "Đơn hàng đã nghiệm thu và hoàn tất xác nhận thanh toán")
    COMPLETED,

    @Schema(description = "Đơn hàng đã bị hủy")
    CANCELED,

    @Schema(description = "Đơn hàng đang có tranh chấp cần Quản trị viên xử lý")
    DISPUTED
}
