package com.nhalo24h.report.dto;

import jakarta.validation.constraints.NotBlank;

public record RefundPenaltyRequest(
    @NotBlank(message = "Lý do hoàn trả tiền phạt cọc không được để trống")
    String reason
) {
}
