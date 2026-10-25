package com.nhalo24h.wallet.repository;

import com.nhalo24h.wallet.domain.ProviderWallet;
import com.nhalo24h.wallet.domain.WalletStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProviderWalletRepository extends JpaRepository<ProviderWallet, UUID> {

    Optional<ProviderWallet> findByProviderProfileId(UUID providerProfileId);

    Optional<ProviderWallet> findByProviderProfileUserId(UUID userId);

    List<ProviderWallet> findAllByStatus(WalletStatus status);
}
