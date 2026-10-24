package com.nhalo24h.order.repository;

import com.nhalo24h.order.domain.OrderQuoteItem;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderQuoteItemRepository extends JpaRepository<OrderQuoteItem, UUID> {

    List<OrderQuoteItem> findAllByQuoteVersionId(UUID quoteVersionId);
}
