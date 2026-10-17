package com.nhalo24h.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Thông báo kết quả thao tác xác thực")
public record MessageResponse(
    @Schema(description = "Nội dung thông báo", example = "Đăng xuất thành công")
    String message
) {
    public static MessageResponse of(String message) {
        return new MessageResponse(message);
    }
}
