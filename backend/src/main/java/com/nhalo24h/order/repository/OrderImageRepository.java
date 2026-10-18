package com.nhalo24h.order.repository;

import com.nhalo24h.order.domain.OrderImage;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderImageRepository extends JpaRepository<OrderImage, UUID> {

    List<OrderImage> findAllByOrderId(UUID orderId);

    void deleteAllByOrderId(UUID orderId);
}
