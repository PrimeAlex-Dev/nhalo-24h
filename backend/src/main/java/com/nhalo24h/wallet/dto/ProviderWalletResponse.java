package com.nhalo24h.wallet.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.nhalo24h.wallet.domain.ProviderWallet;
import com.nhalo24h.wallet.domain.WalletStatus;
import java.time.Instant;
import java.util.UUID;

public record ProviderWalletResponse(
        UUID id,
        UUID providerId,
        Long availableBalance,
        Long depositBalance,
        Long depositTarget,
        WalletStatus status,
        Instant coolingEndsAt,
        Instant lastCompletedOrderAt,
        @JsonProperty("eligibleToAcceptOrders")
        boolean isEligibleToAcceptOrders
) {
    public static ProviderWalletResponse from(ProviderWallet wallet) {
        return new ProviderWalletResponse(
                wallet.getId(),
                wallet.getProviderProfile() != null ? wallet.getProviderProfile().getId() : null,
                wallet.getAvailableBalance(),
                wallet.getDepositBalance(),
                wallet.getDepositTarget(),
                wallet.getStatus(),
                wallet.getCoolingEndsAt(),
                wallet.getLastCompletedOrderAt(),
                wallet.isEligibleToAcceptOrders()
        );
    }
}
