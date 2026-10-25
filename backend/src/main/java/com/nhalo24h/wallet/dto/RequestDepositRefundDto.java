package com.nhalo24h.wallet.dto;

import jakarta.validation.constraints.NotBlank;

public record RequestDepositRefundDto(
        @NotBlank(message = "Mã ngân hàng không được để trống")
        String bankCode,

        @NotBlank(message = "Số tài khoản ngân hàng không được để trống")
        String accountNumber,

        @NotBlank(message = "Tên chủ tài khoản không được để trống")
        String accountHolderName,

        String reason
) {}
