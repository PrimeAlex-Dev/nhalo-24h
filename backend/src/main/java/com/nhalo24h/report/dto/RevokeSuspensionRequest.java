package com.nhalo24h.report.dto;

import jakarta.validation.constraints.NotBlank;

public record RevokeSuspensionRequest(
    @NotBlank(message = "Lý do gỡ phạt / mở khóa tài khoản thợ không được để trống")
    String reason
) {
}
