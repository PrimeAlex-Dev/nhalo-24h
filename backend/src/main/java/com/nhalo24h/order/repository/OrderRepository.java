package com.nhalo24h.order.repository;

import com.nhalo24h.order.domain.Order;
import com.nhalo24h.order.domain.OrderStatus;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID>, JpaSpecificationExecutor<Order> {

    List<Order> findAllByCustomerIdOrderByCreatedAtDesc(UUID customerId);

    List<Order> findAllByCustomerIdAndStatusOrderByCreatedAtDesc(UUID customerId, OrderStatus status);

    Page<Order> findAllByCustomerIdOrderByCreatedAtDesc(UUID customerId, Pageable pageable);

    Page<Order> findAllByCustomerIdAndStatusOrderByCreatedAtDesc(UUID customerId, OrderStatus status, Pageable pageable);

    Page<Order> findAllByCustomerIdAndStatusInOrderByCreatedAtDesc(UUID customerId, Collection<OrderStatus> statuses, Pageable pageable);

    List<Order> findAllByAssignedProviderIdOrderByCreatedAtDesc(UUID providerProfileId);

    List<Order> findAllByAssignedProviderIdAndStatusOrderByCreatedAtDesc(UUID providerProfileId, OrderStatus status);

    List<Order> findAllByAssignedProviderIdAndStatusInOrderByCreatedAtDesc(UUID providerProfileId, Collection<OrderStatus> statuses);

    Page<Order> findAllByAssignedProviderIdOrderByCreatedAtDesc(UUID providerProfileId, Pageable pageable);

    Page<Order> findAllByAssignedProviderIdAndStatusOrderByCreatedAtDesc(UUID providerProfileId, OrderStatus status, Pageable pageable);

    Page<Order> findAllByAssignedProviderIdAndStatusInOrderByCreatedAtDesc(UUID providerProfileId, Collection<OrderStatus> statuses, Pageable pageable);

    Optional<Order> findByIdAndCustomerId(UUID id, UUID customerId);

    Optional<Order> findByOrderCode(String orderCode);

    boolean existsByOrderCode(String orderCode);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.images LEFT JOIN FETCH o.assignedProvider ap LEFT JOIN FETCH ap.user WHERE o.id = :id")
    Optional<Order> findByIdWithDetails(@Param("id") UUID id);
}
