package com.nhalo24h.order.service;

import com.nhalo24h.common.error.AppException;
import com.nhalo24h.common.error.ErrorCode;
import com.nhalo24h.order.domain.Order;
import com.nhalo24h.order.domain.OrderImage;
import com.nhalo24h.order.domain.OrderRequest;
import com.nhalo24h.order.domain.OrderStatus;
import com.nhalo24h.order.dto.AdminOrderSummaryResponse;
import com.nhalo24h.order.dto.CustomerOrderDetailResponse;
import com.nhalo24h.order.dto.QuotationItemResponse;
import com.nhalo24h.order.repository.OrderImageRepository;
import com.nhalo24h.order.repository.OrderRepository;
import com.nhalo24h.order.repository.OrderRequestRepository;
import com.nhalo24h.provider.domain.ProviderProfile;
import com.nhalo24h.user.domain.User;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminOrderService {

    private final OrderRepository orderRepository;
    private final OrderRequestRepository orderRequestRepository;
    private final OrderImageRepository orderImageRepository;

    public AdminOrderService(
        OrderRepository orderRepository,
        OrderRequestRepository orderRequestRepository,
        OrderImageRepository orderImageRepository
    ) {
        this.orderRepository = orderRepository;
        this.orderRequestRepository = orderRequestRepository;
        this.orderImageRepository = orderImageRepository;
    }

    @Transactional(readOnly = true)
    public Page<AdminOrderSummaryResponse> getOrders(OrderStatus status, UUID categoryId, String search, Pageable pageable) {
        Specification<Order> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate searchPred = cb.or(
                    cb.like(cb.lower(root.get("orderCode")), pattern),
                    cb.like(cb.lower(root.get("title")), pattern),
                    cb.like(cb.lower(root.get("contactName")), pattern),
                    cb.like(cb.lower(root.get("contactPhone")), pattern),
                    cb.like(cb.lower(root.get("addressSnapshot")), pattern)
                );
                predicates.add(searchPred);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return orderRepository.findAll(spec, pageable).map(this::mapToAdminSummary);
    }

    @Transactional(readOnly = true)
    public CustomerOrderDetailResponse getOrderDetail(UUID orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn hàng ID=" + orderId));

        List<String> images = orderImageRepository.findAllByOrderId(order.getId())
            .stream()
            .map(OrderImage::getImageUrl)
            .toList();

        List<QuotationItemResponse> quotations = orderRequestRepository.findAllByOrderId(order.getId())
            .stream()
            .map(this::mapToQuotationResponse)
            .toList();

        UUID assignedProviderId = null;
        String assignedProviderName = null;
        String assignedProviderAvatar = null;
        String assignedProviderPhone = null;

        if (order.getAssignedProvider() != null) {
            ProviderProfile provider = order.getAssignedProvider();
            assignedProviderId = provider.getId();
            assignedProviderName = provider.getUser().getFullName();
            assignedProviderAvatar = provider.getAvatarUrl();
            assignedProviderPhone = provider.getUser().getPhone();
        }

        return new CustomerOrderDetailResponse(
            order.getId(),
            order.getOrderCode(),
            order.getTitle(),
            order.getDescription(),
            order.getCategory() != null ? order.getCategory().getId() : null,
            order.getCategory() != null ? order.getCategory().getName() : null,
            order.getAddressSnapshot(),
            order.getContactName(),
            order.getContactPhone(),
            order.getExpectedScheduleTime(),
            order.getStatus().name(),
            order.getFinalPrice(),
            order.getCancelReason(),
            assignedProviderId,
            assignedProviderName,
            assignedProviderAvatar,
            assignedProviderPhone,
            images,
            quotations,
            order.getCreatedAt(),
            order.getUpdatedAt()
        );
    }

    private AdminOrderSummaryResponse mapToAdminSummary(Order order) {
        int quotationCount = orderRequestRepository.countByOrderId(order.getId());
        UUID assignedProviderId = null;
        String assignedProviderName = null;
        String assignedProviderPhone = null;
        String assignedProviderAvatar = null;

        if (order.getAssignedProvider() != null) {
            ProviderProfile provider = order.getAssignedProvider();
            assignedProviderId = provider.getId();
            assignedProviderName = provider.getUser().getFullName();
            assignedProviderPhone = provider.getUser().getPhone();
            assignedProviderAvatar = provider.getAvatarUrl();
        }

        return new AdminOrderSummaryResponse(
            order.getId(),
            order.getOrderCode(),
            order.getTitle(),
            order.getDescription(),
            order.getCategory() != null ? order.getCategory().getId() : null,
            order.getCategory() != null ? order.getCategory().getName() : null,
            order.getAddressSnapshot(),
            order.getContactName(),
            order.getContactPhone(),
            order.getExpectedScheduleTime(),
            order.getStatus().name(),
            order.getFinalPrice(),
            order.getCancelReason(),
            assignedProviderId,
            assignedProviderName,
            assignedProviderPhone,
            assignedProviderAvatar,
            quotationCount,
            order.getCreatedAt(),
            order.getUpdatedAt()
        );
    }

    private QuotationItemResponse mapToQuotationResponse(OrderRequest req) {
        ProviderProfile provider = req.getProvider();
        User providerUser = provider.getUser();

        return new QuotationItemResponse(
            req.getId(),
            provider.getId(),
            providerUser.getId(),
            providerUser.getFullName(),
            provider.getAvatarUrl(),
            provider.getHeadline(),
            provider.getPricePerHour(),
            req.getStatus().name(),
            req.getQuotedPrice(),
            req.getProviderNote(),
            req.getEstimatedArrivalTime(),
            req.getRejectReason(),
            req.getCreatedAt(),
            req.getUpdatedAt()
        );
    }
}
