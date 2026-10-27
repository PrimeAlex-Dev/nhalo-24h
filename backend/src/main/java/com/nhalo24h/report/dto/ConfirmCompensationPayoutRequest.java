package com.nhalo24h.report.dto;

import jakarta.validation.constraints.NotBlank;

public record ConfirmCompensationPayoutRequest(
    @NotBlank(message = "Mã tham chiếu / Ủy nhiệm chi ngân hàng không được để trống")
    String payoutRef,
    String note
) {
}
