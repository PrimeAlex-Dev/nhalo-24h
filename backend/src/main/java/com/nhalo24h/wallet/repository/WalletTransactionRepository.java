package com.nhalo24h.wallet.repository;

import com.nhalo24h.wallet.domain.WalletTransaction;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, UUID> {

    Page<WalletTransaction> findByWalletIdOrderByCreatedAtDesc(UUID walletId, Pageable pageable);

    List<WalletTransaction> findByWalletIdOrderByCreatedAtDesc(UUID walletId);
}
