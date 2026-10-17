package com.nhalo24h.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.UUID;

@Schema(description = "Thông tin chi tiết một địa chỉ trong sổ địa chỉ của khách hàng")
public record CustomerAddressResponse(
    @Schema(description = "Mã địa chỉ (UUID)", example = "a1b2c3d4-e5f6-7890-abcd-ef1234567890")
    UUID id,

    @Schema(description = "Tên gợi nhớ (Ví dụ: Nhà riêng, Công ty...)", example = "Nhà riêng")
    String label,

    @Schema(description = "Địa chỉ chi tiết", example = "Số 123 Đường Cầu Giấy, Phường Dịch Vọng, Quận Cầu Giấy, Hà Nội")
    String fullAddress,

    @Schema(description = "Đánh dấu là địa chỉ mặc định", example = "true")
    boolean isDefault,

    @Schema(description = "Thời điểm tạo địa chỉ", example = "2026-10-17T08:00:00Z")
    Instant createdAt,

    @Schema(description = "Thời điểm cập nhật địa chỉ", example = "2026-10-17T08:00:00Z")
    Instant updatedAt
) {
}
