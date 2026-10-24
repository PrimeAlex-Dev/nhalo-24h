package com.nhalo24h.order.repository;

import com.nhalo24h.order.domain.OrderQuoteVersion;
import com.nhalo24h.order.domain.QuoteVersionStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderQuoteVersionRepository extends JpaRepository<OrderQuoteVersion, UUID> {

    @Query("SELECT DISTINCT v FROM OrderQuoteVersion v LEFT JOIN FETCH v.items JOIN FETCH v.provider p JOIN FETCH p.user WHERE v.order.id = :orderId ORDER BY v.versionNumber ASC, v.createdAt ASC")
    List<OrderQuoteVersion> findAllByOrderIdWithItems(@Param("orderId") UUID orderId);

    List<OrderQuoteVersion> findAllByOrderIdOrderByVersionNumberAsc(UUID orderId);

    List<OrderQuoteVersion> findAllByOrderIdAndProviderIdOrderByVersionNumberDesc(UUID orderId, UUID providerId);

    Optional<OrderQuoteVersion> findFirstByOrderIdAndStatusOrderByVersionNumberDesc(UUID orderId, QuoteVersionStatus status);

    int countByOrderId(UUID orderId);
}
