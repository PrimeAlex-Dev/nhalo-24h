package com.nhalo24h.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Yêu cầu đăng nhập hệ thống")
public record LoginRequest(
    @Schema(description = "Địa chỉ email đăng nhập", example = "nguyenvanan@example.com")
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    String email,

    @Schema(description = "Mật khẩu đăng nhập", example = "SecretPassword123@")
    @NotBlank(message = "Mật khẩu không được để trống")
    String password
) {
}
