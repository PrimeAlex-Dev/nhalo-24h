package com.nhalo24h.order.repository;

import com.nhalo24h.order.domain.Order;
import com.nhalo24h.order.domain.OrderStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID>, JpaSpecificationExecutor<Order> {

    List<Order> findAllByCustomerIdOrderByCreatedAtDesc(UUID customerId);

    List<Order> findAllByCustomerIdAndStatusOrderByCreatedAtDesc(UUID customerId, OrderStatus status);

    List<Order> findAllByAssignedProviderIdOrderByCreatedAtDesc(UUID providerProfileId);

    List<Order> findAllByAssignedProviderIdAndStatusOrderByCreatedAtDesc(UUID providerProfileId, OrderStatus status);

    Optional<Order> findByIdAndCustomerId(UUID id, UUID customerId);

    Optional<Order> findByOrderCode(String orderCode);

    boolean existsByOrderCode(String orderCode);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.images LEFT JOIN FETCH o.assignedProvider ap LEFT JOIN FETCH ap.user WHERE o.id = :id")
    Optional<Order> findByIdWithDetails(@Param("id") UUID id);
}
