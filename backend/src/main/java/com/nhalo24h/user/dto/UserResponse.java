package com.nhalo24h.user.dto;

import com.nhalo24h.user.domain.UserRole;
import com.nhalo24h.user.domain.UserStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.UUID;

@Schema(description = "Thông tin chi tiết người dùng")
public record UserResponse(
    @Schema(description = "Mã định danh duy nhất (UUID)", example = "a1b2c3d4-e5f6-7890-abcd-ef1234567890")
    UUID id,

    @Schema(description = "Họ và tên", example = "Nguyễn Văn An")
    String fullName,

    @Schema(description = "Địa chỉ email", example = "nguyenvanan@example.com")
    String email,

    @Schema(description = "Số điện thoại", example = "0901234567")
    String phone,

    @Schema(description = "Vai trò", example = "CUSTOMER")
    UserRole role,

    @Schema(description = "Trạng thái tài khoản", example = "ACTIVE")
    UserStatus status,

    @Schema(description = "Trạng thái xác minh email", example = "false")
    boolean isEmailVerified,

    @Schema(description = "Thời điểm tạo tài khoản", example = "2026-10-16T08:00:00Z")
    Instant createdAt,

    @Schema(description = "Thời điểm cập nhật gần nhất", example = "2026-10-16T08:00:00Z")
    Instant updatedAt
) {
}
