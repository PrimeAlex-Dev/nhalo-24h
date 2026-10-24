package com.nhalo24h.order.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Yêu cầu Quản trị viên gỡ bỏ cờ cảnh báo bất thường sau khi đã xác minh")
public record DismissAbnormalFlagRequest(
    @Schema(description = "Ghi chú kết luận xác minh của Admin", example = "Đã kiểm tra hình ảnh hiện trường, tình trạng sự cố nhẹ hơn dự kiến nên tiền công giảm là hợp lý.")
    @NotBlank(message = "Vui lòng nhập kết luận xác minh để gỡ bỏ cảnh báo")
    String note
) {
}
