package com.nhalo24h.order.repository;

import com.nhalo24h.order.domain.OrderRequest;
import com.nhalo24h.order.domain.OrderRequestStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRequestRepository extends JpaRepository<OrderRequest, UUID> {

    List<OrderRequest> findAllByOrderIdOrderByCreatedAtDesc(UUID orderId);

    List<OrderRequest> findAllByOrderId(UUID orderId);

    List<OrderRequest> findAllByOrderIdAndIdNot(UUID orderId, UUID id);

    List<OrderRequest> findAllByProviderIdOrderByCreatedAtDesc(UUID providerProfileId);

    List<OrderRequest> findAllByProviderIdAndStatusOrderByCreatedAtDesc(UUID providerProfileId, OrderRequestStatus status);

    Optional<OrderRequest> findByOrderIdAndProviderId(UUID orderId, UUID providerProfileId);

    boolean existsByOrderIdAndProviderId(UUID orderId, UUID providerProfileId);

    int countByOrderId(UUID orderId);

    @Query("SELECT COUNT(r) FROM OrderRequest r WHERE r.provider.id = :providerId AND r.status = 'PENDING_RESPONSE' AND r.order.status = 'PENDING_PROVIDER'")
    int countPendingIncomingRequests(@Param("providerId") UUID providerId);

    @Query("SELECT r FROM OrderRequest r JOIN FETCH r.order o LEFT JOIN FETCH o.category LEFT JOIN FETCH o.images WHERE r.provider.id = :providerId ORDER BY r.createdAt DESC")
    List<OrderRequest> findAllByProviderIdWithOrder(@Param("providerId") UUID providerId);

    @Query("SELECT r FROM OrderRequest r JOIN FETCH r.order o LEFT JOIN FETCH o.category LEFT JOIN FETCH o.images WHERE r.provider.id = :providerId AND r.status = :status ORDER BY r.createdAt DESC")
    List<OrderRequest> findAllByProviderIdAndStatusWithOrder(@Param("providerId") UUID providerId, @Param("status") OrderRequestStatus status);

    @Query(value = "SELECT r FROM OrderRequest r JOIN FETCH r.order o LEFT JOIN FETCH o.category WHERE r.provider.id = :providerId ORDER BY CASE WHEN r.status = 'PENDING_RESPONSE' AND o.status = 'PENDING_PROVIDER' THEN 0 WHEN r.status = 'QUOTED' AND o.status = 'PENDING_PROVIDER' THEN 1 ELSE 2 END, r.createdAt DESC",
           countQuery = "SELECT COUNT(r) FROM OrderRequest r WHERE r.provider.id = :providerId")
    Page<OrderRequest> findAllByProviderIdWithOrder(@Param("providerId") UUID providerId, Pageable pageable);

    @Query(value = "SELECT r FROM OrderRequest r JOIN FETCH r.order o LEFT JOIN FETCH o.category WHERE r.provider.id = :providerId AND r.status = :status ORDER BY r.createdAt DESC",
           countQuery = "SELECT COUNT(r) FROM OrderRequest r WHERE r.provider.id = :providerId AND r.status = :status")
    Page<OrderRequest> findAllByProviderIdAndStatusWithOrder(@Param("providerId") UUID providerId, @Param("status") OrderRequestStatus status, Pageable pageable);

    @Query("SELECT r FROM OrderRequest r JOIN FETCH r.provider p JOIN FETCH p.user u WHERE r.order.id = :orderId")
    List<OrderRequest> findAllByOrderIdWithProvider(@Param("orderId") UUID orderId);
}
