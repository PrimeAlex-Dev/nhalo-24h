package com.nhalo24h.wallet.dto;

import com.nhalo24h.wallet.domain.WalletBalanceType;
import com.nhalo24h.wallet.domain.WalletTransaction;
import com.nhalo24h.wallet.domain.WalletTransactionType;
import java.time.Instant;
import java.util.UUID;

public record WalletTransactionResponse(
        UUID id,
        WalletBalanceType balanceType,
        Long amount,
        Long balanceBefore,
        Long balanceAfter,
        WalletTransactionType type,
        String referenceId,
        String createdBy,
        String note,
        Instant createdAt
) {
    public static WalletTransactionResponse from(WalletTransaction tx) {
        return new WalletTransactionResponse(
                tx.getId(),
                tx.getBalanceType(),
                tx.getAmount(),
                tx.getBalanceBefore(),
                tx.getBalanceAfter(),
                tx.getType(),
                tx.getReferenceId(),
                tx.getCreatedBy(),
                tx.getNote(),
                tx.getCreatedAt()
        );
    }
}
