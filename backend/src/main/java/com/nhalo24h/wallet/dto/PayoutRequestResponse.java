package com.nhalo24h.wallet.dto;

import com.nhalo24h.wallet.domain.PayoutRequest;
import com.nhalo24h.wallet.domain.PayoutStatus;
import com.nhalo24h.wallet.domain.WalletBalanceType;
import java.time.Instant;
import java.util.UUID;

public record PayoutRequestResponse(
        UUID id,
        UUID providerId,
        String providerName,
        Long amount,
        WalletBalanceType sourceWalletType,
        String bankCode,
        String accountNumber,
        String accountHolderName,
        PayoutStatus status,
        Instant coolingEndsAt,
        String adminNote,
        String processedByName,
        Instant processedAt,
        Instant createdAt
) {
    public static PayoutRequestResponse from(PayoutRequest r) {
        String providerName = null;
        if (r.getProviderProfile() != null && r.getProviderProfile().getUser() != null) {
            providerName = r.getProviderProfile().getUser().getFullName();
        }
        String processedByName = null;
        if (r.getProcessedBy() != null) {
            processedByName = r.getProcessedBy().getFullName();
        }
        return new PayoutRequestResponse(
                r.getId(),
                r.getProviderProfile() != null ? r.getProviderProfile().getId() : null,
                providerName,
                r.getAmount(),
                r.getSourceWalletType(),
                r.getBankCode(),
                r.getAccountNumber(),
                r.getAccountHolderName(),
                r.getStatus(),
                r.getCoolingEndsAt(),
                r.getAdminNote(),
                processedByName,
                r.getProcessedAt(),
                r.getCreatedAt()
        );
    }
}
