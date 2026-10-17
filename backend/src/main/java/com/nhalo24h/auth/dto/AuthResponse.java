package com.nhalo24h.auth.dto;

import com.nhalo24h.user.dto.UserResponse;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Thông tin phản hồi đăng nhập thành công")
public record AuthResponse(
    @Schema(description = "JWT Access Token dùng để xác thực các request tiếp theo", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    String accessToken,

    @Schema(description = "Loại token", example = "Bearer")
    String tokenType,

    @Schema(description = "Thời gian hiệu lực tính bằng giây", example = "86400")
    long expiresIn,

    @Schema(description = "Thông tin hồ sơ người dùng")
    UserResponse user
) {
    public static AuthResponse of(String accessToken, long expiresIn, UserResponse user) {
        return new AuthResponse(accessToken, "Bearer", expiresIn, user);
    }
}
