package com.nhalo24h.wallet.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AdminTopupDepositRequestDto(
        @NotNull(message = "Số tiền nạp bù cọc không được để trống")
        @Min(value = 1000, message = "Số tiền nạp bù tối thiểu là 1.000đ")
        Long amount,

        String note
) {}
