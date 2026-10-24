package com.nhalo24h.order.service;

import com.nhalo24h.category.domain.ServiceCategory;
import com.nhalo24h.category.repository.ServiceCategoryRepository;
import com.nhalo24h.common.error.AppException;
import com.nhalo24h.common.error.ErrorCode;
import com.nhalo24h.order.domain.Order;
import com.nhalo24h.order.domain.OrderAuditLog;
import com.nhalo24h.order.domain.OrderImage;
import com.nhalo24h.order.domain.OrderQuoteItem;
import com.nhalo24h.order.domain.OrderQuoteVersion;
import com.nhalo24h.order.domain.OrderRequest;
import com.nhalo24h.order.domain.OrderRequestStatus;
import com.nhalo24h.order.domain.OrderStatus;
import com.nhalo24h.order.domain.PaymentMethod;
import com.nhalo24h.order.domain.PaymentStatus;
import com.nhalo24h.order.domain.QuoteMode;
import com.nhalo24h.order.domain.QuoteVersionStatus;
import com.nhalo24h.order.domain.QuoteVersionType;
import com.nhalo24h.order.dto.ConfirmOnlinePaymentRequest;
import com.nhalo24h.order.dto.CreateOrderRequest;
import com.nhalo24h.order.dto.CustomerOrderDetailResponse;
import com.nhalo24h.order.dto.CustomerOrderSummaryResponse;
import com.nhalo24h.order.dto.DeclareCashPaymentRequest;
import com.nhalo24h.order.dto.DispatchOrderRequestsDto;
import com.nhalo24h.order.dto.OnlinePaymentInitResponse;
import com.nhalo24h.order.dto.OrderAuditLogResponse;
import com.nhalo24h.order.dto.QuotationItemResponse;
import com.nhalo24h.order.dto.QuoteItemDto;
import com.nhalo24h.order.dto.QuoteVersionResponse;
import com.nhalo24h.order.repository.OrderAuditLogRepository;
import com.nhalo24h.order.repository.OrderImageRepository;
import com.nhalo24h.order.repository.OrderQuoteVersionRepository;
import com.nhalo24h.order.repository.OrderRepository;
import com.nhalo24h.order.repository.OrderRequestRepository;
import com.nhalo24h.provider.domain.ProviderProfile;
import com.nhalo24h.provider.repository.ProviderProfileRepository;
import com.nhalo24h.user.domain.CustomerAddress;
import com.nhalo24h.user.domain.User;
import com.nhalo24h.user.repository.CustomerAddressRepository;
import com.nhalo24h.user.repository.UserRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerOrderService {

    private final OrderRepository orderRepository;
    private final OrderImageRepository orderImageRepository;
    private final OrderRequestRepository orderRequestRepository;
    private final OrderQuoteVersionRepository orderQuoteVersionRepository;
    private final OrderAuditLogRepository orderAuditLogRepository;
    private final UserRepository userRepository;
    private final CustomerAddressRepository customerAddressRepository;
    private final ServiceCategoryRepository serviceCategoryRepository;
    private final ProviderProfileRepository providerProfileRepository;

    public CustomerOrderService(
        OrderRepository orderRepository,
        OrderImageRepository orderImageRepository,
        OrderRequestRepository orderRequestRepository,
        OrderQuoteVersionRepository orderQuoteVersionRepository,
        OrderAuditLogRepository orderAuditLogRepository,
        UserRepository userRepository,
        CustomerAddressRepository customerAddressRepository,
        ServiceCategoryRepository serviceCategoryRepository,
        ProviderProfileRepository providerProfileRepository
    ) {
        this.orderRepository = orderRepository;
        this.orderImageRepository = orderImageRepository;
        this.orderRequestRepository = orderRequestRepository;
        this.orderQuoteVersionRepository = orderQuoteVersionRepository;
        this.orderAuditLogRepository = orderAuditLogRepository;
        this.userRepository = userRepository;
        this.customerAddressRepository = customerAddressRepository;
        this.serviceCategoryRepository = serviceCategoryRepository;
        this.providerProfileRepository = providerProfileRepository;
    }

    @Transactional
    public CustomerOrderDetailResponse createOrder(UUID customerUserId, CreateOrderRequest request) {
        if (request.expectedScheduleTime() == null || request.expectedScheduleTime().isBefore(Instant.now())) {
            throw new AppException(ErrorCode.INVALID_INPUT, "Thời gian mong muốn không thể ở trong quá khứ");
        }

        User customer = userRepository.findById(customerUserId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy thông tin khách hàng"));

        ServiceCategory category = serviceCategoryRepository.findById(request.categoryId())
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Danh mục dịch vụ không tồn tại"));

        CustomerAddress address = customerAddressRepository.findByIdAndUserId(request.addressId(), customerUserId)
            .orElseThrow(() -> new AppException(ErrorCode.FORBIDDEN, "Địa chỉ đã chọn không thuộc về tài khoản của bạn"));

        String contactName = customer.getFullName();
        if (request.contactName() != null && !request.contactName().isBlank()) {
            String trimmedName = request.contactName().trim();
            if (trimmedName.length() < 2 || trimmedName.length() > 100) {
                throw new AppException(ErrorCode.INVALID_INPUT, "Tên người liên hệ tại nhà phải từ 2 đến 100 ký tự");
            }
            contactName = trimmedName;
        }

        String contactPhone = (customer.getPhone() != null && !customer.getPhone().isBlank())
            ? customer.getPhone()
            : "Chưa cập nhật";
        if (request.contactPhone() != null && !request.contactPhone().isBlank()) {
            String trimmedPhone = request.contactPhone().trim();
            if (!trimmedPhone.matches("^0[0-9]{9}$")) {
                throw new AppException(ErrorCode.INVALID_INPUT, "Số điện thoại liên hệ phải gồm đúng 10 chữ số và bắt đầu bằng số 0");
            }
            contactPhone = trimmedPhone;
        }

        String addressSnapshot = address.getFullAddress();
        String orderCode = generateOrderCode();

        Order order = new Order(
            customer,
            category,
            address,
            addressSnapshot,
            contactName,
            contactPhone,
            request.title().trim(),
            request.description().trim(),
            request.expectedScheduleTime()
        );
        order.setOrderCode(orderCode);
        order.setUrgencyLevel(request.urgencyLevel() != null && !request.urgencyLevel().isBlank() ? request.urgencyLevel().trim() : "NORMAL");
        order.setServiceMetadata(request.serviceMetadata());

        Order savedOrder = orderRepository.save(order);

        // Lưu ảnh sự cố ban đầu nếu có
        if (request.imageUrls() != null && !request.imageUrls().isEmpty()) {
            for (String imgUrl : request.imageUrls()) {
                if (imgUrl != null && !imgUrl.isBlank()) {
                    OrderImage image = new OrderImage(savedOrder, imgUrl.trim(), "ISSUE_BEFORE", "CUSTOMER");
                    orderImageRepository.save(image);
                }
            }
        }

        // Gửi yêu cầu ban đầu tới danh sách thợ được chọn (nếu có)
        if (request.initialProviderIds() != null && !request.initialProviderIds().isEmpty()) {
            for (UUID providerId : request.initialProviderIds()) {
                providerProfileRepository.findById(providerId).ifPresent(provider -> {
                    if (!orderRequestRepository.existsByOrderIdAndProviderId(savedOrder.getId(), provider.getId())) {
                        OrderRequest orderRequest = new OrderRequest(savedOrder, provider);
                        orderRequestRepository.save(orderRequest);
                    }
                });
            }
        }

        recordAuditLog(
            savedOrder,
            customerUserId,
            "CUSTOMER",
            "CREATE_ORDER",
            null,
            savedOrder.getStatus().name(),
            null,
            savedOrder.getPaymentStatus().name(),
            "Khách hàng tạo yêu cầu sửa chữa/dịch vụ mới (" + savedOrder.getOrderCode() + ")"
        );

        return buildOrderDetailResponse(savedOrder, false);
    }

    @Transactional(readOnly = true)
    public List<CustomerOrderSummaryResponse> getMyOrders(UUID customerUserId, OrderStatus status) {
        List<Order> orders = (status != null)
            ? orderRepository.findAllByCustomerIdAndStatusOrderByCreatedAtDesc(customerUserId, status)
            : orderRepository.findAllByCustomerIdOrderByCreatedAtDesc(customerUserId);

        return orders.stream().map(this::mapToOrderSummaryResponse).toList();
    }

    @Transactional(readOnly = true)
    public Page<CustomerOrderSummaryResponse> getMyOrders(UUID customerUserId, OrderStatus status, Pageable pageable) {
        Page<Order> orders;
        if (status == null) {
            orders = orderRepository.findAllByCustomerIdOrderByCreatedAtDesc(customerUserId, pageable);
        } else if (status == OrderStatus.IN_PROGRESS) {
            orders = orderRepository.findAllByCustomerIdAndStatusInOrderByCreatedAtDesc(
                customerUserId,
                List.of(
                    OrderStatus.AWAITING_SURVEY,
                    OrderStatus.AWAITING_CUSTOMER_APPROVAL,
                    OrderStatus.IN_PROGRESS,
                    OrderStatus.AWAITING_COMPLETION_CONFIRMATION,
                    OrderStatus.DISPUTED
                ),
                pageable
            );
        } else if (status == OrderStatus.CANCELED) {
            orders = orderRepository.findAllByCustomerIdAndStatusInOrderByCreatedAtDesc(
                customerUserId,
                List.of(OrderStatus.CANCELED, OrderStatus.DECLINED_AFTER_SURVEY),
                pageable
            );
        } else {
            orders = orderRepository.findAllByCustomerIdAndStatusOrderByCreatedAtDesc(customerUserId, status, pageable);
        }

        return orders.map(this::mapToOrderSummaryResponse);
    }

    private CustomerOrderSummaryResponse mapToOrderSummaryResponse(Order order) {
        int quotationCount = orderRequestRepository.countByOrderId(order.getId());
        String providerName = null;
        String providerAvatar = null;
        UUID providerId = null;
        if (order.getAssignedProvider() != null) {
            providerId = order.getAssignedProvider().getId();
            providerName = order.getAssignedProvider().getUser().getFullName();
            providerAvatar = order.getAssignedProvider().getAvatarUrl();
        }

        return new CustomerOrderSummaryResponse(
            order.getId(),
            order.getOrderCode(),
            order.getTitle(),
            order.getCategory() != null ? order.getCategory().getName() : null,
            order.getStatus().name(),
            order.getPaymentStatus() != null ? order.getPaymentStatus().name() : PaymentStatus.UNPAID.name(),
            order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null,
            order.getWorkflowMode() != null ? order.getWorkflowMode().name() : QuoteMode.SURVEY_REQUIRED.name(),
            order.getUrgencyLevel(),
            order.getAddressSnapshot(),
            order.getExpectedScheduleTime(),
            order.getFinalPrice(),
            order.getFinalLaborFee(),
            order.getFinalMaterialsFee(),
            providerId,
            providerName,
            providerAvatar,
            quotationCount,
            order.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public CustomerOrderDetailResponse getOrderDetail(UUID customerUserId, UUID orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn hàng"));

        if (!order.getCustomer().getId().equals(customerUserId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền xem thông tin đơn hàng này");
        }

        return buildOrderDetailResponse(order, false);
    }

    @Transactional
    public void dispatchRequests(UUID customerUserId, UUID orderId, DispatchOrderRequestsDto request) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn hàng"));

        if (!order.getCustomer().getId().equals(customerUserId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền thao tác trên đơn hàng này");
        }

        if (order.getStatus() != OrderStatus.PENDING_PROVIDER) {
            throw new AppException(ErrorCode.CONFLICT, "Chỉ có thể mời thợ báo giá khi đơn hàng chưa chốt thợ");
        }

        int addedCount = 0;
        for (UUID providerId : request.providerIds()) {
            if (!orderRequestRepository.existsByOrderIdAndProviderId(order.getId(), providerId)) {
                ProviderProfile provider = providerProfileRepository.findById(providerId).orElse(null);
                if (provider != null) {
                    OrderRequest orderRequest = new OrderRequest(order, provider);
                    orderRequestRepository.save(orderRequest);
                    addedCount++;
                }
            }
        }

        if (addedCount > 0) {
            recordAuditLog(
                order,
                customerUserId,
                "CUSTOMER",
                "DISPATCH_PROVIDERS",
                order.getStatus().name(),
                order.getStatus().name(),
                order.getPaymentStatus().name(),
                order.getPaymentStatus().name(),
                "Khách hàng gửi thêm lời mời báo giá tới " + addedCount + " thợ"
            );
        }
    }

    /**
     * Bước 3 trong luồng nghiệp vụ: Khách chọn thợ (chấp nhận báo giá ban đầu).
     * - Nếu báo giá ở chế độ SURVEY_REQUIRED: Đơn chuyển sang AWAITING_SURVEY (Khách đồng ý phí khảo sát/di chuyển & lịch hẹn, chờ thợ đến kiểm tra).
     * - Nếu báo giá ở chế độ COMMITTED_FIXED (Gói vệ sinh chuẩn / giá cố định): Đơn chuyển thẳng sang IN_PROGRESS.
     */
    @Transactional
    public void acceptQuotation(UUID customerUserId, UUID requestId) {
        OrderRequest chosenRequest = orderRequestRepository.findById(requestId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy yêu cầu báo giá"));

        Order order = chosenRequest.getOrder();

        if (!order.getCustomer().getId().equals(customerUserId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền thao tác trên đơn hàng này");
        }

        if (order.getStatus() != OrderStatus.PENDING_PROVIDER) {
            throw new AppException(ErrorCode.CONFLICT, "Đơn hàng đã được chốt thợ hoặc đã hoàn tất/hủy");
        }

        if (chosenRequest.getStatus() != OrderRequestStatus.QUOTED) {
            throw new AppException(ErrorCode.INVALID_INPUT, "Chỉ có thể chấp nhận yêu cầu đã được thợ gửi báo giá");
        }

        String oldStatus = order.getStatus().name();

        // Chấp nhận báo giá của thợ được chọn
        chosenRequest.setStatus(OrderRequestStatus.ACCEPTED);
        orderRequestRepository.save(chosenRequest);

        // Snapshot chính sách 3 nhóm chi phí từ báo giá vào đơn hàng
        QuoteMode quoteMode = chosenRequest.getQuoteMode() != null ? chosenRequest.getQuoteMode() : QuoteMode.SURVEY_REQUIRED;
        order.setAssignedProvider(chosenRequest.getProvider());
        order.setWorkflowMode(quoteMode);
        order.setAgreedSurveyFee(chosenRequest.getSurveyFee());
        order.setAgreedTravelFee(chosenRequest.getTravelFee());
        order.setWaiveSurveyIfRepaired(chosenRequest.getWaiveSurveyIfRepaired());
        order.setWaiveTravelIfRepaired(chosenRequest.getWaiveTravelIfRepaired());
        order.setFinalLaborFee(chosenRequest.getEstimatedLaborFee());
        order.setFinalMaterialsFee(chosenRequest.getEstimatedMaterialsFee());
        order.recalculateFinancials(false);

        if (quoteMode == QuoteMode.SURVEY_REQUIRED) {
            order.setStatus(OrderStatus.AWAITING_SURVEY);
        } else {
            order.setStatus(OrderStatus.IN_PROGRESS);
        }
        orderRepository.save(order);

        // Cập nhật trạng thái phiên bản báo giá ban đầu của thợ được chọn
        List<OrderQuoteVersion> providerVersions = orderQuoteVersionRepository
            .findAllByOrderIdAndProviderIdOrderByVersionNumberDesc(order.getId(), chosenRequest.getProvider().getId());
        for (OrderQuoteVersion v : providerVersions) {
            if (v.getStatus() == QuoteVersionStatus.PENDING_APPROVAL) {
                v.setStatus(QuoteVersionStatus.APPROVED);
                v.setRespondedAt(Instant.now());
                orderQuoteVersionRepository.save(v);
            }
        }

        // Đóng tự động toàn bộ các yêu cầu của các thợ còn lại
        List<OrderRequest> otherRequests = orderRequestRepository.findAllByOrderIdAndIdNot(order.getId(), requestId);
        for (OrderRequest other : otherRequests) {
            if (other.getStatus() == OrderRequestStatus.PENDING_RESPONSE || other.getStatus() == OrderRequestStatus.QUOTED) {
                other.setStatus(OrderRequestStatus.CANCELED);
                orderRequestRepository.save(other);
            }
        }

        String actionDesc = (quoteMode == QuoteMode.SURVEY_REQUIRED)
            ? "Khách chọn thợ " + chosenRequest.getProvider().getUser().getFullName() + " và đồng ý lịch khảo sát (Phí KS: " + order.getAgreedSurveyFee() + "đ, Phí di chuyển: " + order.getAgreedTravelFee() + "đ)"
            : "Khách chọn thợ " + chosenRequest.getProvider().getUser().getFullName() + " theo gói giá cố định cam kết (" + order.getFinalPrice() + "đ)";

        recordAuditLog(
            order,
            customerUserId,
            "CUSTOMER",
            "SELECT_PROVIDER",
            oldStatus,
            order.getStatus().name(),
            order.getPaymentStatus().name(),
            order.getPaymentStatus().name(),
            actionDesc
        );
    }

    /**
     * Bước 5 & Bước 6: Khách đồng ý Báo giá cuối sau khảo sát (AWAITING_CUSTOMER_APPROVAL -> IN_PROGRESS)
     * hoặc đồng ý Yêu cầu điều chỉnh phát sinh khi đang sửa (IN_PROGRESS).
     */
    @Transactional
    public CustomerOrderDetailResponse approveLatestQuoteVersion(UUID customerUserId, UUID orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn hàng"));

        if (!order.getCustomer().getId().equals(customerUserId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền thao tác trên đơn hàng này");
        }

        if (order.getStatus() != OrderStatus.AWAITING_CUSTOMER_APPROVAL && order.getStatus() != OrderStatus.IN_PROGRESS) {
            throw new AppException(ErrorCode.CONFLICT, "Đơn hàng không ở trạng thái chờ duyệt báo giá hoặc điều chỉnh phát sinh");
        }

        OrderQuoteVersion pendingVersion = orderQuoteVersionRepository
            .findFirstByOrderIdAndStatusOrderByVersionNumberDesc(order.getId(), QuoteVersionStatus.PENDING_APPROVAL)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không có báo giá hoặc yêu cầu điều chỉnh nào đang chờ duyệt"));

        String oldStatus = order.getStatus().name();

        // Đánh dấu các bản APPROVED cũ thành SUPERSEDED
        List<OrderQuoteVersion> allVersions = orderQuoteVersionRepository.findAllByOrderIdOrderByVersionNumberAsc(order.getId());
        for (OrderQuoteVersion v : allVersions) {
            if (!v.getId().equals(pendingVersion.getId()) && v.getStatus() == QuoteVersionStatus.APPROVED) {
                v.setStatus(QuoteVersionStatus.SUPERSEDED);
                orderQuoteVersionRepository.save(v);
            }
        }

        pendingVersion.setStatus(QuoteVersionStatus.APPROVED);
        pendingVersion.setRespondedAt(Instant.now());
        orderQuoteVersionRepository.save(pendingVersion);

        // Cập nhật tiền công và tiền vật tư thực tế vào Order
        order.setFinalLaborFee(pendingVersion.getLaborFee());
        order.setFinalMaterialsFee(pendingVersion.getMaterialsFee());
        order.recalculateFinancials(false);
        order.setStatus(OrderStatus.IN_PROGRESS);
        Order savedOrder = orderRepository.save(order);

        recordAuditLog(
            savedOrder,
            customerUserId,
            "CUSTOMER",
            pendingVersion.getVersionType() == QuoteVersionType.POST_SURVEY_FINAL ? "APPROVE_SURVEY_QUOTE" : "APPROVE_CHANGE_REQUEST",
            oldStatus,
            savedOrder.getStatus().name(),
            savedOrder.getPaymentStatus().name(),
            savedOrder.getPaymentStatus().name(),
            "Khách đồng ý báo giá phiên bản #" + pendingVersion.getVersionNumber()
                + " (Tiền công: " + savedOrder.getFinalLaborFee() + "đ, Vật tư: " + savedOrder.getFinalMaterialsFee()
                + "đ, Tổng hóa đơn: " + savedOrder.getFinalPrice() + "đ)"
        );

        return buildOrderDetailResponse(savedOrder, false);
    }

    /**
     * Khách từ chối phần phát sinh (IN_PROGRESS_CHANGE) khi đang sửa chữa -> Giữ nguyên báo giá đã duyệt trước đó.
     */
    @Transactional
    public CustomerOrderDetailResponse rejectChangeRequest(UUID customerUserId, UUID orderId, String reason) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn hàng"));

        if (!order.getCustomer().getId().equals(customerUserId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền thao tác trên đơn hàng này");
        }

        OrderQuoteVersion pendingVersion = orderQuoteVersionRepository
            .findFirstByOrderIdAndStatusOrderByVersionNumberDesc(order.getId(), QuoteVersionStatus.PENDING_APPROVAL)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không có yêu cầu điều chỉnh nào đang chờ xử lý"));

        if (pendingVersion.getVersionType() != QuoteVersionType.IN_PROGRESS_CHANGE) {
            throw new AppException(ErrorCode.INVALID_INPUT, "Nếu từ chối báo giá sau khảo sát, vui lòng chọn chức năng Từ chối sửa sau khảo sát");
        }

        pendingVersion.setStatus(QuoteVersionStatus.REJECTED);
        pendingVersion.setRespondedAt(Instant.now());
        orderQuoteVersionRepository.save(pendingVersion);

        recordAuditLog(
            order,
            customerUserId,
            "CUSTOMER",
            "REJECT_CHANGE_REQUEST",
            order.getStatus().name(),
            order.getStatus().name(),
            order.getPaymentStatus().name(),
            order.getPaymentStatus().name(),
            "Khách từ chối yêu cầu phát sinh phiên bản #" + pendingVersion.getVersionNumber()
                + (reason != null && !reason.isBlank() ? " - Lý do: " + reason.trim() : "")
        );

        return buildOrderDetailResponse(order, false);
    }

    /**
     * Bước 5 nhánh B: Khách từ chối sửa sau khi thợ đã khảo sát.
     * Đơn chuyển sang DECLINED_AFTER_SURVEY; chỉ tính Phí khảo sát + Phí di chuyển, không tính tiền công & vật tư, hoa hồng = 0đ.
     */
    @Transactional
    public CustomerOrderDetailResponse declineAfterSurvey(UUID customerUserId, UUID orderId, String reason) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn hàng"));

        if (!order.getCustomer().getId().equals(customerUserId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền thao tác trên đơn hàng này");
        }

        if (order.getStatus() != OrderStatus.AWAITING_CUSTOMER_APPROVAL && order.getStatus() != OrderStatus.AWAITING_SURVEY) {
            throw new AppException(ErrorCode.CONFLICT, "Chỉ có thể từ chối sửa sau khảo sát khi đơn đang ở giai đoạn khảo sát hoặc chờ duyệt giá khảo sát");
        }

        String oldStatus = order.getStatus().name();
        String oldPaymentStatus = order.getPaymentStatus().name();

        // Từ chối phiên bản báo giá cuối đang chờ (nếu có)
        orderQuoteVersionRepository
            .findFirstByOrderIdAndStatusOrderByVersionNumberDesc(order.getId(), QuoteVersionStatus.PENDING_APPROVAL)
            .ifPresent(v -> {
                v.setStatus(QuoteVersionStatus.REJECTED);
                v.setRespondedAt(Instant.now());
                orderQuoteVersionRepository.save(v);
            });

        order.setStatus(OrderStatus.DECLINED_AFTER_SURVEY);
        order.setCancelReason(reason != null && !reason.isBlank() ? reason.trim() : "Khách hàng từ chối sửa chữa sau khi khảo sát");
        order.recalculateFinancials(true);

        // Nếu tổng phí khảo sát + di chuyển = 0đ thì tự động xác nhận hoàn tất thanh toán 0đ
        if (order.getFinalPrice() != null && order.getFinalPrice() == 0L) {
            order.setPaymentStatus(PaymentStatus.CASH_CONFIRMED);
            order.setCustomerDeclaredAmount(0L);
            order.setProviderConfirmedAmount(0L);
            order.setProviderPaymentConfirmedAt(Instant.now());
        } else {
            order.setPaymentStatus(PaymentStatus.UNPAID);
        }

        Order savedOrder = orderRepository.save(order);

        recordAuditLog(
            savedOrder,
            customerUserId,
            "CUSTOMER",
            "DECLINE_AFTER_SURVEY",
            oldStatus,
            savedOrder.getStatus().name(),
            oldPaymentStatus,
            savedOrder.getPaymentStatus().name(),
            "Khách từ chối sửa sau khảo sát. Hóa đơn chỉ tính Phí khảo sát (" + savedOrder.getAppliedSurveyFee()
                + "đ) + Phí di chuyển (" + savedOrder.getAppliedTravelFee() + "đ) = " + savedOrder.getFinalPrice() + "đ. Hoa hồng = 0đ."
        );

        return buildOrderDetailResponse(savedOrder, false);
    }

    /**
     * Nhánh B Thanh toán — Bước 2: Khách khai báo số tiền mặt thực tế đã trả cho thợ.
     * Áp dụng 4 lớp bảo vệ chống nhập lệch hóa đơn.
     */
    @Transactional
    public CustomerOrderDetailResponse declareCashPayment(UUID customerUserId, UUID orderId, DeclareCashPaymentRequest request) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn hàng"));

        if (!order.getCustomer().getId().equals(customerUserId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền thao tác trên đơn hàng này");
        }

        if (order.getStatus() != OrderStatus.AWAITING_COMPLETION_CONFIRMATION && order.getStatus() != OrderStatus.DECLINED_AFTER_SURVEY) {
            throw new AppException(ErrorCode.CONFLICT, "Chỉ có thể khai báo thanh toán khi thợ đã báo hoàn thành hoặc đơn đã chốt phí khảo sát");
        }

        if (order.getPaymentStatus() == PaymentStatus.PAID_ONLINE || order.getPaymentStatus() == PaymentStatus.CASH_CONFIRMED) {
            throw new AppException(ErrorCode.CONFLICT, "Đơn hàng này đã được xác nhận thanh toán hoàn tất");
        }

        long invoiceTotal = order.getFinalPrice() != null ? order.getFinalPrice() : 0L;
        long declared = request.declaredAmount();

        // Lớp bảo vệ 1 & 2: Đối chiếu với hóa đơn, nếu lệch bắt buộc nhập lý do giải trình và gắn cờ theo dõi
        if (declared != invoiceTotal) {
            if (request.note() == null || request.note().trim().length() < 5) {
                throw new AppException(
                    ErrorCode.INVALID_INPUT,
                    "Số tiền khai báo (" + declared + "đ) khác với tổng hóa đơn (" + invoiceTotal + "đ). Vui lòng nhập lý do giải trình rõ ràng (tối thiểu 5 ký tự)."
                );
            }
            order.flagAbnormal("Khách khai báo tiền mặt (" + declared + "đ) chênh lệch so với hóa đơn chốt (" + invoiceTotal + "đ). Lý do: " + request.note().trim());
        }

        String oldPaymentStatus = order.getPaymentStatus().name();
        order.setPaymentMethod(PaymentMethod.CASH);
        order.setCustomerDeclaredAmount(declared);
        order.setCustomerPaymentNote(request.note() != null ? request.note().trim() : null);
        order.setPaymentStatus(PaymentStatus.CASH_PENDING_CONFIRMATION);

        Order savedOrder = orderRepository.save(order);

        recordAuditLog(
            savedOrder,
            customerUserId,
            "CUSTOMER",
            "DECLARE_CASH_PAYMENT",
            savedOrder.getStatus().name(),
            savedOrder.getStatus().name(),
            oldPaymentStatus,
            savedOrder.getPaymentStatus().name(),
            "Khách khai báo đã trả tiền mặt: " + declared + "đ (Hóa đơn: " + invoiceTotal + "đ). Chờ thợ xác nhận."
        );

        return buildOrderDetailResponse(savedOrder, false);
    }

    /**
     * Nhánh A Thanh toán — Khởi tạo giao dịch thanh toán Online giả lập (Mock Gateway).
     */
    @Transactional
    public OnlinePaymentInitResponse initOnlinePayment(UUID customerUserId, UUID orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn hàng"));

        if (!order.getCustomer().getId().equals(customerUserId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền thao tác trên đơn hàng này");
        }

        if (order.getStatus() != OrderStatus.AWAITING_COMPLETION_CONFIRMATION && order.getStatus() != OrderStatus.DECLINED_AFTER_SURVEY) {
            throw new AppException(ErrorCode.CONFLICT, "Đơn hàng chưa ở trạng thái chờ thanh toán hóa đơn");
        }

        if (order.getPaymentStatus() == PaymentStatus.PAID_ONLINE || order.getPaymentStatus() == PaymentStatus.CASH_CONFIRMED) {
            throw new AppException(ErrorCode.CONFLICT, "Đơn hàng này đã được thanh toán hoàn tất");
        }

        String oldPaymentStatus = order.getPaymentStatus().name();
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomPart = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
        String txnRef = "TXN-" + datePart + "-" + randomPart;

        order.setPaymentMethod(PaymentMethod.ONLINE);
        order.setOnlineTransactionRef(txnRef);
        order.setPaymentStatus(PaymentStatus.PAYMENT_PENDING);
        Order savedOrder = orderRepository.save(order);

        recordAuditLog(
            savedOrder,
            customerUserId,
            "CUSTOMER",
            "INIT_ONLINE_PAYMENT",
            savedOrder.getStatus().name(),
            savedOrder.getStatus().name(),
            oldPaymentStatus,
            savedOrder.getPaymentStatus().name(),
            "Khởi tạo giao dịch thanh toán Online mã " + txnRef + " với số tiền " + savedOrder.getFinalPrice() + "đ"
        );

        return new OnlinePaymentInitResponse(
            savedOrder.getId(),
            savedOrder.getOrderCode(),
            txnRef,
            savedOrder.getFinalPrice(),
            savedOrder.getFinalLaborFee(),
            savedOrder.getFinalMaterialsFee(),
            savedOrder.getAppliedSurveyFee(),
            savedOrder.getAppliedTravelFee(),
            savedOrder.getPaymentStatus().name(),
            "NHALO24H_MOCK_GATEWAY",
            Instant.now()
        );
    }

    /**
     * Nhánh A Thanh toán — Xác nhận kết quả callback từ cổng thanh toán Online.
     */
    @Transactional
    public CustomerOrderDetailResponse confirmOnlinePayment(UUID customerUserId, UUID orderId, ConfirmOnlinePaymentRequest request) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn hàng"));

        if (!order.getCustomer().getId().equals(customerUserId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền thao tác trên đơn hàng này");
        }

        if (order.getPaymentStatus() != PaymentStatus.PAYMENT_PENDING) {
            throw new AppException(ErrorCode.CONFLICT, "Đơn hàng không có giao dịch thanh toán Online nào đang chờ xác nhận");
        }

        if (order.getOnlineTransactionRef() == null || !order.getOnlineTransactionRef().equals(request.transactionRef().trim())) {
            throw new AppException(ErrorCode.INVALID_INPUT, "Mã tham chiếu giao dịch thanh toán không hợp lệ");
        }

        String oldOrderStatus = order.getStatus().name();
        String oldPaymentStatus = order.getPaymentStatus().name();

        if (Boolean.TRUE.equals(request.success())) {
            order.setPaymentStatus(PaymentStatus.PAID_ONLINE);
            order.setCustomerDeclaredAmount(order.getFinalPrice());
            order.setProviderConfirmedAmount(order.getFinalPrice());
            order.setProviderPaymentConfirmedAt(Instant.now());

            if (order.getStatus() == OrderStatus.AWAITING_COMPLETION_CONFIRMATION) {
                order.setStatus(OrderStatus.COMPLETED);
            }
            Order savedOrder = orderRepository.save(order);

            recordAuditLog(
                savedOrder,
                customerUserId,
                "SYSTEM_GATEWAY",
                "ONLINE_PAYMENT_CONFIRMED",
                oldOrderStatus,
                savedOrder.getStatus().name(),
                oldPaymentStatus,
                savedOrder.getPaymentStatus().name(),
                "Cổng thanh toán xác nhận giao dịch " + request.transactionRef() + " thành công (" + savedOrder.getFinalPrice()
                    + "đ). Hoa hồng nền tảng: " + savedOrder.getCommissionAmount() + "đ."
            );

            return buildOrderDetailResponse(savedOrder, false);
        } else {
            order.setPaymentStatus(PaymentStatus.UNPAID);
            Order savedOrder = orderRepository.save(order);

            recordAuditLog(
                savedOrder,
                customerUserId,
                "SYSTEM_GATEWAY",
                "ONLINE_PAYMENT_FAILED",
                oldOrderStatus,
                savedOrder.getStatus().name(),
                oldPaymentStatus,
                savedOrder.getPaymentStatus().name(),
                "Giao dịch thanh toán Online " + request.transactionRef() + " bị hủy hoặc thất bại"
            );

            return buildOrderDetailResponse(savedOrder, false);
        }
    }

    @Transactional
    public void cancelOrder(UUID customerUserId, UUID orderId, String reason) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn hàng"));

        if (!order.getCustomer().getId().equals(customerUserId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền thao tác trên đơn hàng này");
        }

        if (order.getStatus() == OrderStatus.COMPLETED || order.getStatus() == OrderStatus.AWAITING_COMPLETION_CONFIRMATION) {
            throw new AppException(ErrorCode.CONFLICT, "Không thể hủy đơn hàng đã hoàn thành công việc");
        }

        // Phương án A: Khi thợ đang chuẩn bị đồ nghề và trên đường đến (AWAITING_SURVEY),
        // chặn hủy đơn 1 chạm để tránh gây thiệt hại chi phí xăng xe và thời gian cho thợ.
        // Khách cần liên hệ trực tiếp với thợ để trao đổi dời lịch hẹn hoặc thỏa thuận hủy.
        if (order.getStatus() == OrderStatus.AWAITING_SURVEY) {
            throw new AppException(
                ErrorCode.CONFLICT,
                "Thợ đang chuẩn bị đồ nghề và trên đường đến nhà bạn theo lịch hẹn. " +
                "Bạn không thể tự ý hủy đơn một chiều để tránh gây thiệt hại cho thợ. " +
                "Vui lòng gọi điện hoặc nhắn tin trực tiếp cho thợ để trao đổi dời lịch hẹn hoặc thỏa thuận hủy đơn."
            );
        }

        if (order.getStatus() == OrderStatus.IN_PROGRESS) {
            throw new AppException(
                ErrorCode.CONFLICT,
                "Thợ đang tiến hành sửa chữa tại chỗ. Không thể tự ý hủy đơn hàng. Vui lòng trao đổi trực tiếp với thợ hoặc liên hệ tổng đài hỗ trợ."
            );
        }

        // Nếu thợ đã đến khảo sát và gửi báo giá cuối mà có phí khảo sát/di chuyển -> chuyển sang DECLINED_AFTER_SURVEY
        if (order.getStatus() == OrderStatus.AWAITING_CUSTOMER_APPROVAL
            && ((order.getAgreedSurveyFee() != null && order.getAgreedSurveyFee() > 0)
                || (order.getAgreedTravelFee() != null && order.getAgreedTravelFee() > 0))) {
            declineAfterSurvey(customerUserId, orderId, reason);
            return;
        }

        String oldStatus = order.getStatus().name();
        order.setStatus(OrderStatus.CANCELED);
        order.setCancelReason(reason != null && !reason.isBlank() ? reason.trim() : "Khách hàng yêu cầu hủy");
        orderRepository.save(order);

        // Đóng các yêu cầu đang mở
        List<OrderRequest> requests = orderRequestRepository.findAllByOrderId(order.getId());
        for (OrderRequest req : requests) {
            if (req.getStatus() == OrderRequestStatus.PENDING_RESPONSE || req.getStatus() == OrderRequestStatus.QUOTED) {
                req.setStatus(OrderRequestStatus.CANCELED);
                orderRequestRepository.save(req);
            }
        }

        recordAuditLog(
            order,
            customerUserId,
            "CUSTOMER",
            "CANCEL_ORDER",
            oldStatus,
            order.getStatus().name(),
            order.getPaymentStatus().name(),
            order.getPaymentStatus().name(),
            "Khách hàng hủy đơn hàng. Lý do: " + order.getCancelReason()
        );
    }

    /**
     * Phương án A: Khách gửi thông báo yêu cầu hủy đơn / dời lịch hẹn tới thợ khi đơn đang ở AWAITING_SURVEY hoặc IN_PROGRESS.
     * Ghi nhận audit log yêu cầu hủy để thợ nắm bắt và phục vụ thống kê/xử lý lạm dụng hủy/boom đơn về sau.
     */
    @Transactional
    public CustomerOrderDetailResponse notifyCancelRequest(UUID customerUserId, UUID orderId, String reason) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn hàng"));

        if (!order.getCustomer().getId().equals(customerUserId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền thao tác trên đơn hàng này");
        }

        if (order.getStatus() != OrderStatus.AWAITING_SURVEY && order.getStatus() != OrderStatus.IN_PROGRESS) {
            throw new AppException(ErrorCode.CONFLICT, "Chỉ có thể gửi thông báo yêu cầu hủy khi đơn đang chờ thợ đến khảo sát hoặc đang xử lý");
        }

        String cancelReason = (reason != null && !reason.isBlank()) ? reason.trim() : "Khách hàng bận việc đột xuất muốn trao đổi dời lịch hẹn hoặc hủy đơn";
        String providerName = order.getAssignedProvider() != null ? order.getAssignedProvider().getUser().getFullName() : "thợ phụ trách";
        String providerPhone = order.getAssignedProvider() != null ? order.getAssignedProvider().getUser().getPhone() : "";

        recordAuditLog(
            order,
            customerUserId,
            "CUSTOMER",
            "NOTIFY_CANCEL_REQUEST",
            order.getStatus().name(),
            order.getStatus().name(),
            order.getPaymentStatus().name(),
            order.getPaymentStatus().name(),
            "Khách hàng gửi thông báo muốn dời lịch hẹn / hủy đơn tới thợ " + providerName + " (" + providerPhone + "). Lý do: " + cancelReason
        );

        return buildOrderDetailResponse(order, false);
    }

    public CustomerOrderDetailResponse buildOrderDetailResponse(Order order, boolean includeFullPhoneAlways) {
        List<OrderImage> allImages = orderImageRepository.findAllByOrderId(order.getId());
        List<String> issueImages = allImages.stream()
            .filter(img -> "ISSUE_BEFORE".equals(img.getImageStage()) || img.getImageStage() == null)
            .map(OrderImage::getImageUrl)
            .toList();
        List<String> surveyImages = allImages.stream()
            .filter(img -> "SURVEY_EVIDENCE".equals(img.getImageStage()))
            .map(OrderImage::getImageUrl)
            .toList();
        List<String> completionImages = allImages.stream()
            .filter(img -> "COMPLETION_AFTER".equals(img.getImageStage()))
            .map(OrderImage::getImageUrl)
            .toList();

        List<QuotationItemResponse> quotations = orderRequestRepository.findAllByOrderIdWithProvider(order.getId())
            .stream()
            .map(this::mapToQuotationResponse)
            .toList();

        List<QuoteVersionResponse> quoteVersions = orderQuoteVersionRepository.findAllByOrderIdWithItems(order.getId())
            .stream()
            .map(this::mapToQuoteVersionResponse)
            .toList();

        List<OrderAuditLogResponse> auditLogs = orderAuditLogRepository.findAllByOrderIdOrderByCreatedAtAsc(order.getId())
            .stream()
            .map(this::mapToAuditLogResponse)
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
            if (includeFullPhoneAlways || order.getStatus() != OrderStatus.PENDING_PROVIDER) {
                assignedProviderPhone = provider.getUser().getPhone();
            }
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
            order.getUrgencyLevel(),
            order.getServiceMetadata(),
            order.getStatus().name(),
            order.getWorkflowMode() != null ? order.getWorkflowMode().name() : QuoteMode.SURVEY_REQUIRED.name(),
            order.getAgreedSurveyFee(),
            order.getAgreedTravelFee(),
            order.getWaiveSurveyIfRepaired(),
            order.getWaiveTravelIfRepaired(),
            order.getAppliedSurveyFee(),
            order.getAppliedTravelFee(),
            order.getFinalLaborFee(),
            order.getFinalMaterialsFee(),
            order.getFinalPrice(),
            order.getCommissionRateSnapshot(),
            order.getCommissionAmount(),
            order.getCompletionNote(),
            order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null,
            order.getPaymentStatus() != null ? order.getPaymentStatus().name() : PaymentStatus.UNPAID.name(),
            order.getOnlineTransactionRef(),
            order.getCustomerDeclaredAmount(),
            order.getCustomerPaymentNote(),
            order.getProviderConfirmedAmount(),
            order.getProviderPaymentConfirmedAt(),
            order.getDisputeReason(),
            order.getFlaggedAbnormal(),
            order.getAbnormalReason(),
            order.getCancelReason(),
            assignedProviderId,
            assignedProviderName,
            assignedProviderAvatar,
            assignedProviderPhone,
            issueImages,
            surveyImages,
            completionImages,
            quotations,
            quoteVersions,
            auditLogs,
            order.getCreatedAt(),
            order.getUpdatedAt()
        );
    }

    public QuotationItemResponse mapToQuotationResponse(OrderRequest req) {
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
            req.getQuoteMode() != null ? req.getQuoteMode().name() : QuoteMode.SURVEY_REQUIRED.name(),
            req.getSurveyFee(),
            req.getTravelFee(),
            req.getWaiveSurveyIfRepaired(),
            req.getWaiveTravelIfRepaired(),
            req.getEstimatedLaborFee(),
            req.getEstimatedMaterialsFee(),
            req.getQuotedPrice(),
            req.getProviderNote(),
            req.getScopeAndConditions(),
            req.getEstimatedArrivalTime(),
            req.getRejectReason(),
            req.getCreatedAt(),
            req.getUpdatedAt()
        );
    }

    public QuoteVersionResponse mapToQuoteVersionResponse(OrderQuoteVersion v) {
        List<QuoteItemDto> items = v.getItems() != null
            ? v.getItems().stream()
                .map((OrderQuoteItem item) -> new QuoteItemDto(
                    item.getId(),
                    item.getItemName(),
                    item.getUnit(),
                    item.getQuantity(),
                    item.getUnitPrice(),
                    item.getTotalPrice(),
                    item.getNote()
                ))
                .toList()
            : List.of();

        return new QuoteVersionResponse(
            v.getId(),
            v.getOrder().getId(),
            v.getRequest() != null ? v.getRequest().getId() : null,
            v.getProvider().getId(),
            v.getProvider().getUser().getFullName(),
            v.getVersionNumber(),
            v.getVersionType().name(),
            v.getQuoteMode().name(),
            v.getSurveyFee(),
            v.getTravelFee(),
            v.getWaiveSurveyIfRepaired(),
            v.getWaiveTravelIfRepaired(),
            v.getLaborFee(),
            v.getMaterialsFee(),
            v.getTotalAmount(),
            v.getDiagnosisOrReason(),
            v.getStatus().name(),
            items,
            v.getCreatedAt(),
            v.getRespondedAt()
        );
    }

    public OrderAuditLogResponse mapToAuditLogResponse(OrderAuditLog log) {
        return new OrderAuditLogResponse(
            log.getId(),
            log.getActorUserId(),
            log.getActorRole(),
            log.getActionType(),
            log.getOldOrderStatus(),
            log.getNewOrderStatus(),
            log.getOldPaymentStatus(),
            log.getNewPaymentStatus(),
            log.getDescription(),
            log.getCreatedAt()
        );
    }

    private void recordAuditLog(
        Order order,
        UUID actorUserId,
        String actorRole,
        String actionType,
        String oldOrderStatus,
        String newOrderStatus,
        String oldPaymentStatus,
        String newPaymentStatus,
        String description
    ) {
        OrderAuditLog log = new OrderAuditLog(
            order,
            actorUserId,
            actorRole,
            actionType,
            oldOrderStatus,
            newOrderStatus,
            oldPaymentStatus,
            newPaymentStatus,
            description
        );
        orderAuditLogRepository.save(log);
    }

    private String generateOrderCode() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomPart = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
        return "ORD-" + datePart + "-" + randomPart;
    }
}
