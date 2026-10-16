package com.nhalo24h.user.dto;

import com.nhalo24h.user.domain.UserStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Yêu cầu thay đổi trạng thái tài khoản người dùng")
public record UpdateUserStatusRequest(
    @Schema(description = "Trạng thái mới của tài khoản (ACTIVE hoặc DISABLED)", example = "DISABLED")
    @NotNull(message = "Trạng thái không được để trống")
    UserStatus status
) {
}
