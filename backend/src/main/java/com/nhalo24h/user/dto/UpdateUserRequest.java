package com.nhalo24h.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

@Schema(description = "Yêu cầu cập nhật thông tin hồ sơ người dùng")
public record UpdateUserRequest(
    @Schema(description = "Họ và tên mới của người dùng", example = "Nguyễn Văn Bình")
    @Size(max = 100, message = "Họ tên không được vượt quá 100 ký tự")
    String fullName,

    @Schema(description = "Số điện thoại mới (tùy chọn, nếu có phải gồm đúng 10 chữ số)", example = "0987654321")
    @jakarta.validation.constraints.Pattern(regexp = "^$|^0[0-9]{9}$", message = "Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0")
    String phone
) {
}
