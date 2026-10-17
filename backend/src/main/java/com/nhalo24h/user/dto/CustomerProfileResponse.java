package com.nhalo24h.user.dto;

import com.nhalo24h.user.domain.Gender;
import com.nhalo24h.user.domain.UserRole;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.UUID;

@Schema(description = "Thông tin chi tiết hồ sơ khách hàng")
public record CustomerProfileResponse(
    @Schema(description = "Mã người dùng (User ID)", example = "a1b2c3d4-e5f6-7890-abcd-ef1234567890")
    UUID id,

    @Schema(description = "Họ và tên khách hàng", example = "Nguyễn Văn An")
    String fullName,

    @Schema(description = "Địa chỉ email (không thể tự chỉnh sửa)", example = "nguyenvanan@example.com")
    String email,

    @Schema(description = "Số điện thoại liên hệ (không thể tự chỉnh sửa)", example = "0901234567")
    String phone,

    @Schema(description = "Giới tính (MALE, FEMALE, OTHER)", example = "MALE")
    Gender gender,

    @Schema(description = "Địa chỉ chi tiết", example = "Số 123 Đường Cầu Giấy, Hà Nội")
    String address,

    @Schema(description = "Vai trò người dùng", example = "CUSTOMER")
    UserRole role,

    @Schema(description = "Thời điểm tạo tài khoản", example = "2026-10-16T08:00:00Z")
    Instant createdAt,

    @Schema(description = "Thời điểm cập nhật hồ sơ gần nhất", example = "2026-10-17T08:00:00Z")
    Instant updatedAt
) {
}
