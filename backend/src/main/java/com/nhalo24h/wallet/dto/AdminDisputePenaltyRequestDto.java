package com.nhalo24h.wallet.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record AdminDisputePenaltyRequestDto(
        @NotNull(message = "Số tiền phạt/đền bù không được để trống")
        @Min(value = 1000, message = "Số tiền phạt tối thiểu là 1.000đ")
        Long penaltyAmount,

        @NotNull(message = "Lý do phạt không được để trống")
        String reason,

        UUID disputeOrderId
) {}
