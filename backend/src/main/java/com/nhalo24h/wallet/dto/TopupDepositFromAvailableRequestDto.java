package com.nhalo24h.wallet.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record TopupDepositFromAvailableRequestDto(
    @NotNull(message = "Số tiền nạp bù cọc không được để trống")
    @Positive(message = "Số tiền nạp bù cọc phải lớn hơn 0")
    Long amount
) {
}
