package com.nhalo24h.order.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.UUID;

@Schema(description = "Tin nhắn trao đổi trong báo giá")
public record ChatMessageResponse(
    @Schema(description = "ID tin nhắn", example = "a1b2c3d4-e5f6-7890-abcd-ef1234567890")
    UUID id,

    @Schema(description = "ID yêu cầu báo giá")
    UUID requestId,

    @Schema(description = "ID người gửi")
    UUID senderUserId,

    @Schema(description = "Vai trò người gửi: CUSTOMER hoặc PROVIDER", example = "PROVIDER")
    String senderRole,

    @Schema(description = "Tên hiển thị người gửi", example = "Nguyễn Văn Minh")
    String senderName,

    @Schema(description = "Nội dung tin nhắn", example = "Dạ chào anh, em có mặt sau 30 phút nữa được không ạ?")
    String content,

    @Schema(description = "Thời gian gửi")
    Instant createdAt
) {
}
