package com.nhalo24h.wallet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AdminReviewPayoutRequestDto(
        @NotBlank(message = "Hành động duyệt không được để trống")
        @Pattern(regexp = "APPROVE|REJECT", message = "Hành động phải là APPROVE hoặc REJECT")
        String action,

        String adminNote
) {}
