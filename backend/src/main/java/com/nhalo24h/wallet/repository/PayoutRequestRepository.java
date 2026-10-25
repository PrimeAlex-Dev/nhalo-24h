package com.nhalo24h.wallet.repository;

import com.nhalo24h.wallet.domain.PayoutRequest;
import com.nhalo24h.wallet.domain.PayoutStatus;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PayoutRequestRepository extends JpaRepository<PayoutRequest, UUID> {

    Page<PayoutRequest> findByProviderProfileIdOrderByCreatedAtDesc(UUID providerProfileId, Pageable pageable);

    Page<PayoutRequest> findByProviderProfileUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    Page<PayoutRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<PayoutRequest> findByStatus(PayoutStatus status);
}
