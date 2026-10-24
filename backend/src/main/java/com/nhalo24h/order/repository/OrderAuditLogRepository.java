package com.nhalo24h.order.repository;

import com.nhalo24h.order.domain.OrderAuditLog;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderAuditLogRepository extends JpaRepository<OrderAuditLog, UUID> {

    List<OrderAuditLog> findAllByOrderIdOrderByCreatedAtAsc(UUID orderId);
}
