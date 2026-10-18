package com.nhalo24h.order.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Yêu cầu gửi tin nhắn trao đổi trong báo giá")
public record SendChatMessageRequest(
    @Schema(description = "Nội dung tin nhắn", example = "Dạ chào anh, em có mặt sau 30 phút nữa được không ạ?")
    @NotBlank(message = "Nội dung tin nhắn không được để trống")
    String content
) {
}
