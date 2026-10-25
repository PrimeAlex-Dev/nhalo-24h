package com.nhalo24h.report.repository;

import com.nhalo24h.report.domain.ProviderReport;
import com.nhalo24h.report.domain.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProviderReportRepository extends JpaRepository<ProviderReport, UUID>, JpaSpecificationExecutor<ProviderReport> {

    Optional<ProviderReport> findByReportCode(String reportCode);

    Page<ProviderReport> findByReporterId(UUID reporterId, Pageable pageable);

    Page<ProviderReport> findByProviderId(UUID providerId, Pageable pageable);

    Page<ProviderReport> findByStatus(ReportStatus status, Pageable pageable);

    long countByStatus(ReportStatus status);
}
