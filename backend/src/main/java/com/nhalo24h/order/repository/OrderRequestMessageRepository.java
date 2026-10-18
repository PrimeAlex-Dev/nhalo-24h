package com.nhalo24h.order.repository;

import com.nhalo24h.order.domain.OrderRequestMessage;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRequestMessageRepository extends JpaRepository<OrderRequestMessage, UUID> {

    @Query("SELECT m FROM OrderRequestMessage m JOIN FETCH m.senderUser WHERE m.orderRequest.id = :requestId ORDER BY m.createdAt ASC")
    List<OrderRequestMessage> findAllByRequestIdWithSender(@Param("requestId") UUID requestId);

    List<OrderRequestMessage> findAllByOrderRequestIdOrderByCreatedAtAsc(UUID requestId);
}
