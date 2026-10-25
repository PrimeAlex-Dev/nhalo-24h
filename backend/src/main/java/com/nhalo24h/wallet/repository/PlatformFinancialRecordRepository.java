package com.nhalo24h.wallet.repository;

import com.nhalo24h.wallet.domain.PlatformFinancialRecord;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PlatformFinancialRecordRepository extends JpaRepository<PlatformFinancialRecord, UUID> {

    Optional<PlatformFinancialRecord> findByOrderId(UUID orderId);

    Page<PlatformFinancialRecord> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT COALESCE(SUM(r.totalPaid), 0) FROM PlatformFinancialRecord r")
    Long sumTotalPaid();

    @Query("SELECT COALESCE(SUM(r.platformCommission), 0) FROM PlatformFinancialRecord r")
    Long sumPlatformCommission();

    @Query("SELECT COALESCE(SUM(r.providerEarning), 0) FROM PlatformFinancialRecord r")
    Long sumProviderEarning();
}
