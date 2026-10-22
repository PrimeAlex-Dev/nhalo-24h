package com.nhalo24h.order.service;

import com.nhalo24h.category.domain.ServiceCategory;
import com.nhalo24h.category.repository.ServiceCategoryRepository;
import com.nhalo24h.common.error.AppException;
import com.nhalo24h.common.error.ErrorCode;
import com.nhalo24h.order.domain.Order;
import com.nhalo24h.order.domain.OrderImage;
import com.nhalo24h.order.domain.OrderRequest;
import com.nhalo24h.order.domain.OrderRequestStatus;
import com.nhalo24h.order.domain.OrderStatus;
import com.nhalo24h.order.dto.CreateOrderRequest;
import com.nhalo24h.order.dto.CustomerOrderDetailResponse;
import com.nhalo24h.order.dto.CustomerOrderSummaryResponse;
import com.nhalo24h.order.dto.DispatchOrderRequestsDto;
import com.nhalo24h.order.dto.QuotationItemResponse;
import com.nhalo24h.order.repository.OrderImageRepository;
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
    private final UserRepository userRepository;
    private final CustomerAddressRepository customerAddressRepository;
    private final ServiceCategoryRepository serviceCategoryRepository;
    private final ProviderProfileRepository providerProfileRepository;

    public CustomerOrderService(
        OrderRepository orderRepository,
        OrderImageRepository orderImageRepository,
        OrderRequestRepository orderRequestRepository,
        UserRepository userRepository,
        CustomerAddressRepository customerAddressRepository,
        ServiceCategoryRepository serviceCategoryRepository,
        ProviderProfileRepository providerProfileRepository
    ) {
        this.orderRepository = orderRepository;
        this.orderImageRepository = orderImageRepository;
        this.orderRequestRepository = orderRequestRepository;
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

        Order savedOrder = orderRepository.save(order);

        // Lưu ảnh sự cố nếu có
        List<String> savedImages = new ArrayList<>();
        if (request.imageUrls() != null && !request.imageUrls().isEmpty()) {
            for (String imgUrl : request.imageUrls()) {
                if (imgUrl != null && !imgUrl.isBlank()) {
                    OrderImage image = new OrderImage(savedOrder, imgUrl.trim());
                    orderImageRepository.save(image);
                    savedImages.add(imgUrl.trim());
                }
            }
        }

        // Gửi yêu cầu ban đầu tới danh sách thợ được chọn (nếu có)
        List<QuotationItemResponse> quotations = new ArrayList<>();
        if (request.initialProviderIds() != null && !request.initialProviderIds().isEmpty()) {
            for (UUID providerId : request.initialProviderIds()) {
                providerProfileRepository.findById(providerId).ifPresent(provider -> {
                    if (!orderRequestRepository.existsByOrderIdAndProviderId(savedOrder.getId(), provider.getId())) {
                        OrderRequest orderRequest = new OrderRequest(savedOrder, provider);
                        OrderRequest savedReq = orderRequestRepository.save(orderRequest);
                        quotations.add(mapToQuotationResponse(savedReq));
                    }
                });
            }
        }

        return mapToOrderDetailResponse(savedOrder, savedImages, quotations);
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
        Page<Order> orders = (status != null)
            ? orderRepository.findAllByCustomerIdAndStatusOrderByCreatedAtDesc(customerUserId, status, pageable)
            : orderRepository.findAllByCustomerIdOrderByCreatedAtDesc(customerUserId, pageable);

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
            order.getAddressSnapshot(),
            order.getExpectedScheduleTime(),
            order.getFinalPrice(),
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

        List<String> images = orderImageRepository.findAllByOrderId(order.getId())
            .stream()
            .map(OrderImage::getImageUrl)
            .toList();

        List<QuotationItemResponse> quotations = orderRequestRepository.findAllByOrderIdWithProvider(order.getId())
            .stream()
            .map(this::mapToQuotationResponse)
            .toList();

        return mapToOrderDetailResponse(order, images, quotations);
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

        for (UUID providerId : request.providerIds()) {
            if (!orderRequestRepository.existsByOrderIdAndProviderId(order.getId(), providerId)) {
                providerProfileRepository.findById(providerId).ifPresent(provider -> {
                    OrderRequest orderRequest = new OrderRequest(order, provider);
                    orderRequestRepository.save(orderRequest);
                });
            }
        }
    }

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

        // Chấp nhận báo giá
        chosenRequest.setStatus(OrderRequestStatus.ACCEPTED);
        orderRequestRepository.save(chosenRequest);

        // Chốt thợ và cập nhật trạng thái đơn hàng sang IN_PROGRESS
        order.setAssignedProvider(chosenRequest.getProvider());
        order.setFinalPrice(chosenRequest.getQuotedPrice());
        order.setStatus(OrderStatus.IN_PROGRESS);
        orderRepository.save(order);

        // Đóng tự động toàn bộ các yêu cầu của các thợ còn lại
        List<OrderRequest> otherRequests = orderRequestRepository.findAllByOrderIdAndIdNot(order.getId(), requestId);
        for (OrderRequest other : otherRequests) {
            if (other.getStatus() == OrderRequestStatus.PENDING_RESPONSE || other.getStatus() == OrderRequestStatus.QUOTED) {
                other.setStatus(OrderRequestStatus.CANCELED);
                orderRequestRepository.save(other);
            }
        }
    }

    @Transactional
    public void cancelOrder(UUID customerUserId, UUID orderId, String reason) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn hàng"));

        if (!order.getCustomer().getId().equals(customerUserId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền thao tác trên đơn hàng này");
        }

        if (order.getStatus() == OrderStatus.COMPLETED) {
            throw new AppException(ErrorCode.CONFLICT, "Không thể hủy đơn hàng đã hoàn thành");
        }

        order.setStatus(OrderStatus.CANCELED);
        order.setCancelReason(reason != null ? reason.trim() : "Khách hàng yêu cầu hủy");
        orderRepository.save(order);

        // Đóng các yêu cầu đang mở
        List<OrderRequest> requests = orderRequestRepository.findAllByOrderId(order.getId());
        for (OrderRequest req : requests) {
            if (req.getStatus() == OrderRequestStatus.PENDING_RESPONSE || req.getStatus() == OrderRequestStatus.QUOTED) {
                req.setStatus(OrderRequestStatus.CANCELED);
                orderRequestRepository.save(req);
            }
        }
    }

    private String generateOrderCode() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomPart = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
        return "ORD-" + datePart + "-" + randomPart;
    }

    private CustomerOrderDetailResponse mapToOrderDetailResponse(Order order, List<String> images, List<QuotationItemResponse> quotations) {
        UUID assignedProviderId = null;
        String assignedProviderName = null;
        String assignedProviderAvatar = null;
        String assignedProviderPhone = null;

        if (order.getAssignedProvider() != null) {
            ProviderProfile provider = order.getAssignedProvider();
            assignedProviderId = provider.getId();
            assignedProviderName = provider.getUser().getFullName();
            assignedProviderAvatar = provider.getAvatarUrl();
            if (order.getStatus() == OrderStatus.IN_PROGRESS || order.getStatus() == OrderStatus.COMPLETED) {
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
