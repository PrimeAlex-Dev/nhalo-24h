package com.nhalo24h.order.service;

import com.nhalo24h.common.error.AppException;
import com.nhalo24h.common.error.ErrorCode;
import com.nhalo24h.order.domain.Order;
import com.nhalo24h.order.domain.OrderAuditLog;
import com.nhalo24h.order.domain.OrderStatus;
import com.nhalo24h.order.domain.PaymentStatus;
import com.nhalo24h.order.domain.QuoteMode;
import com.nhalo24h.order.dto.AdjustInvoiceRequest;
import com.nhalo24h.order.dto.AdminOrderSummaryResponse;
import com.nhalo24h.order.dto.CustomerOrderDetailResponse;
import com.nhalo24h.order.dto.DismissAbnormalFlagRequest;
import com.nhalo24h.order.dto.ResolveDisputeRequest;
import com.nhalo24h.order.repository.OrderAuditLogRepository;
import com.nhalo24h.order.repository.OrderRepository;
import com.nhalo24h.order.repository.OrderRequestRepository;
import com.nhalo24h.provider.domain.ProviderProfile;
import jakarta.persistence.criteria.Predicate;
import java.time.Instant;
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
    private final OrderAuditLogRepository orderAuditLogRepository;
    private final CustomerOrderService customerOrderService;

    public AdminOrderService(
        OrderRepository orderRepository,
        OrderRequestRepository orderRequestRepository,
        OrderAuditLogRepository orderAuditLogRepository,
        CustomerOrderService customerOrderService
    ) {
        this.orderRepository = orderRepository;
        this.orderRequestRepository = orderRequestRepository;
        this.orderAuditLogRepository = orderAuditLogRepository;
        this.customerOrderService = customerOrderService;
    }

    @Transactional(readOnly = true)
    public Page<AdminOrderSummaryResponse> getOrders(
        OrderStatus status,
        PaymentStatus paymentStatus,
        Boolean flaggedOnly,
        UUID categoryId,
        String search,
        Pageable pageable
    ) {
        Specification<Order> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (paymentStatus != null) {
                predicates.add(cb.equal(root.get("paymentStatus"), paymentStatus));
            }

            if (Boolean.TRUE.equals(flaggedOnly)) {
                predicates.add(cb.isTrue(root.get("flaggedAbnormal")));
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

        return customerOrderService.buildOrderDetailResponse(order, true);
    }

    /**
     * Quản trị viên đối soát và giải quyết đơn tranh chấp thanh toán tiền mặt (PAYMENT_DISPUTED).
     * Chỉ áp dụng khi khách đã đưa tiền mặt nhưng thợ báo không khớp.
     */
    @Transactional
    public CustomerOrderDetailResponse resolvePaymentDispute(UUID adminUserId, UUID orderId, ResolveDisputeRequest request) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn hàng ID=" + orderId));

        if (order.getPaymentStatus() != PaymentStatus.PAYMENT_DISPUTED && order.getStatus() != OrderStatus.DISPUTED) {
            throw new AppException(
                ErrorCode.CONFLICT,
                "Chức năng phán quyết đối soát chỉ áp dụng cho đơn hàng đang có tranh chấp thanh toán tiền mặt (PAYMENT_DISPUTED)"
            );
        }

        long appliedSurvey = Boolean.TRUE.equals(order.getWaiveSurveyIfRepaired()) ? 0L : (order.getAgreedSurveyFee() != null ? order.getAgreedSurveyFee() : 0L);
        long appliedTravel = Boolean.TRUE.equals(order.getWaiveTravelIfRepaired()) ? 0L : (order.getAgreedTravelFee() != null ? order.getAgreedTravelFee() : 0L);
        long expectedTotal = appliedSurvey + appliedTravel + request.verifiedLaborFee() + request.verifiedMaterialsFee();

        if (!request.verifiedTotalPaid().equals(expectedTotal)) {
            throw new AppException(
                ErrorCode.INVALID_INPUT,
                "Tổng tiền thanh toán (" + request.verifiedTotalPaid() + "đ) phải bằng Tiền công (" + request.verifiedLaborFee()
                    + "đ) + Tiền vật tư (" + request.verifiedMaterialsFee()
                    + "đ) + Phí khảo sát/di chuyển (" + (appliedSurvey + appliedTravel)
                    + "đ) = " + expectedTotal + "đ"
            );
        }

        String oldOrderStatus = order.getStatus().name();
        String oldPaymentStatus = order.getPaymentStatus().name();

        order.setFinalLaborFee(request.verifiedLaborFee());
        order.setFinalMaterialsFee(request.verifiedMaterialsFee());
        boolean isDeclined = order.getStatus() == OrderStatus.DECLINED_AFTER_SURVEY;
        order.recalculateFinancials(isDeclined);
        order.setFinalPrice(expectedTotal);

        order.setCustomerDeclaredAmount(expectedTotal);
        order.setProviderConfirmedAmount(expectedTotal);
        order.setProviderPaymentConfirmedAt(Instant.now());
        order.setPaymentStatus(PaymentStatus.CASH_CONFIRMED);
        order.setStatus(OrderStatus.COMPLETED);
        order.setFlaggedAbnormal(false);
        order.setDisputeReason(order.getDisputeReason() != null
            ? order.getDisputeReason() + " | [Admin đã chốt đối soát: " + request.resolutionNote().trim() + "]"
            : "[Admin đã chốt đối soát: " + request.resolutionNote().trim() + "]");

        Order savedOrder = orderRepository.save(order);

        OrderAuditLog log = new OrderAuditLog(
            savedOrder,
            adminUserId,
            "ADMIN",
            "RESOLVE_PAYMENT_DISPUTE",
            oldOrderStatus,
            savedOrder.getStatus().name(),
            oldPaymentStatus,
            savedOrder.getPaymentStatus().name(),
            "Admin đối soát hoàn tất tranh chấp tiền mặt: Tiền công " + savedOrder.getFinalLaborFee()
                + "đ, Vật tư " + savedOrder.getFinalMaterialsFee()
                + "đ, Tổng thanh toán " + savedOrder.getFinalPrice()
                + "đ, Hoa hồng chốt " + savedOrder.getCommissionAmount()
                + "đ. Kết luận: " + request.resolutionNote().trim()
        );
        orderAuditLogRepository.save(log);

        return customerOrderService.buildOrderDetailResponse(savedOrder, true);
    }

    /**
     * Quản trị viên điều chỉnh hóa đơn hòa giải TRƯỚC KHI THANH TOÁN (khách chưa trả tiền).
     * Ràng buộc: Giữ nguyên trạng thái để Khách hàng tự mở app lên bấm Thanh toán!
     */
    @Transactional
    public CustomerOrderDetailResponse adjustInvoice(UUID adminUserId, UUID orderId, AdjustInvoiceRequest request) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn hàng ID=" + orderId));

        if (order.getPaymentStatus() == PaymentStatus.PAID_ONLINE || order.getPaymentStatus() == PaymentStatus.CASH_CONFIRMED) {
            throw new AppException(
                ErrorCode.CONFLICT,
                "Đơn hàng đã thanh toán thành công, không thể điều chỉnh hóa đơn trực tiếp (vui lòng sử dụng quy trình hoàn tiền/bồi thường nếu cần)"
            );
        }

        if (order.getStatus() == OrderStatus.COMPLETED || order.getStatus() == OrderStatus.CANCELED) {
            throw new AppException(
                ErrorCode.CONFLICT,
                "Không thể điều chỉnh hóa đơn cho đơn hàng đã hoàn tất hoặc đã bị hủy"
            );
        }

        long oldLabor = order.getFinalLaborFee() != null ? order.getFinalLaborFee() : 0L;
        long oldMaterials = order.getFinalMaterialsFee() != null ? order.getFinalMaterialsFee() : 0L;
        long oldPrice = order.getFinalPrice() != null ? order.getFinalPrice() : 0L;

        order.setFinalLaborFee(request.adjustedLaborFee());
        order.setFinalMaterialsFee(request.adjustedMaterialsFee());
        boolean isDeclined = order.getStatus() == OrderStatus.DECLINED_AFTER_SURVEY;
        order.recalculateFinancials(isDeclined);

        // Lưu vết lý do hòa giải
        order.setDisputeReason(order.getDisputeReason() != null
            ? order.getDisputeReason() + " | [Admin điều chỉnh hóa đơn hòa giải: " + request.adminNote().trim() + "]"
            : "[Admin điều chỉnh hóa đơn hòa giải: " + request.adminNote().trim() + "]");

        Order savedOrder = orderRepository.save(order);

        OrderAuditLog log = new OrderAuditLog(
            savedOrder,
            adminUserId,
            "ADMIN",
            "ADJUST_INVOICE",
            savedOrder.getStatus().name(),
            savedOrder.getStatus().name(),
            savedOrder.getPaymentStatus().name(),
            savedOrder.getPaymentStatus().name(),
            "Admin điều chỉnh biểu giá hòa giải: Tiền công " + oldLabor + "đ -> " + savedOrder.getFinalLaborFee()
                + "đ, Vật tư " + oldMaterials + "đ -> " + savedOrder.getFinalMaterialsFee()
                + "đ, Tổng khách trả " + oldPrice + "đ -> " + savedOrder.getFinalPrice()
                + "đ. Hoa hồng cập nhật: " + savedOrder.getCommissionAmount()
                + "đ. Lý do: " + request.adminNote().trim()
        );
        orderAuditLogRepository.save(log);

        return customerOrderService.buildOrderDetailResponse(savedOrder, true);
    }

    /**
     * Quản trị viên xác minh và gỡ bỏ cờ cảnh báo bất thường (Fraud/Audit Flag).
     * Đơn hàng tiếp tục chạy bình thường mà không bị sửa giá hay ép đổi trạng thái.
     */
    @Transactional
    public CustomerOrderDetailResponse dismissAbnormalFlag(UUID adminUserId, UUID orderId, DismissAbnormalFlagRequest request) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn hàng ID=" + orderId));

        order.setFlaggedAbnormal(false);
        order.setAbnormalReason(order.getAbnormalReason() != null
            ? order.getAbnormalReason() + " | [Admin đã xác minh hợp lệ: " + request.note().trim() + "]"
            : "[Admin đã xác minh hợp lệ: " + request.note().trim() + "]");

        Order savedOrder = orderRepository.save(order);

        OrderAuditLog log = new OrderAuditLog(
            savedOrder,
            adminUserId,
            "ADMIN",
            "DISMISS_ABNORMAL_FLAG",
            savedOrder.getStatus().name(),
            savedOrder.getStatus().name(),
            savedOrder.getPaymentStatus().name(),
            savedOrder.getPaymentStatus().name(),
            "Admin gỡ bỏ cảnh báo bất thường: " + request.note().trim()
        );
        orderAuditLogRepository.save(log);

        return customerOrderService.buildOrderDetailResponse(savedOrder, true);
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
            order.getPaymentStatus() != null ? order.getPaymentStatus().name() : PaymentStatus.UNPAID.name(),
            order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null,
            order.getWorkflowMode() != null ? order.getWorkflowMode().name() : QuoteMode.SURVEY_REQUIRED.name(),
            order.getAppliedSurveyFee(),
            order.getAppliedTravelFee(),
            order.getFinalLaborFee(),
            order.getFinalMaterialsFee(),
            order.getFinalPrice(),
            order.getCommissionRateSnapshot(),
            order.getCommissionAmount(),
            order.getCustomerDeclaredAmount(),
            order.getFlaggedAbnormal(),
            order.getAbnormalReason(),
            order.getDisputeReason(),
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
}
