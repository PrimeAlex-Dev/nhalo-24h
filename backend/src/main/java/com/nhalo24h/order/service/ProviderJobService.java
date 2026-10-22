package com.nhalo24h.order.service;

import com.nhalo24h.common.error.AppException;
import com.nhalo24h.common.error.ErrorCode;
import com.nhalo24h.order.domain.Order;
import com.nhalo24h.order.domain.OrderImage;
import com.nhalo24h.order.domain.OrderRequest;
import com.nhalo24h.order.domain.OrderRequestStatus;
import com.nhalo24h.order.domain.OrderStatus;
import com.nhalo24h.order.dto.ProviderJobResponse;
import com.nhalo24h.order.dto.RejectOrderRequestDto;
import com.nhalo24h.order.dto.SubmitQuotationRequest;
import com.nhalo24h.order.repository.OrderImageRepository;
import com.nhalo24h.order.repository.OrderRepository;
import com.nhalo24h.order.repository.OrderRequestRepository;
import com.nhalo24h.provider.domain.ProviderProfile;
import com.nhalo24h.provider.repository.ProviderProfileRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProviderJobService {

    private final OrderRepository orderRepository;
    private final OrderRequestRepository orderRequestRepository;
    private final OrderImageRepository orderImageRepository;
    private final ProviderProfileRepository providerProfileRepository;

    public ProviderJobService(
        OrderRepository orderRepository,
        OrderRequestRepository orderRequestRepository,
        OrderImageRepository orderImageRepository,
        ProviderProfileRepository providerProfileRepository
    ) {
        this.orderRepository = orderRepository;
        this.orderRequestRepository = orderRequestRepository;
        this.orderImageRepository = orderImageRepository;
        this.providerProfileRepository = providerProfileRepository;
    }

    @Transactional(readOnly = true)
    public int getPendingRequestsCount(UUID providerUserId) {
        ProviderProfile profile = getProviderProfileByUserId(providerUserId);
        return orderRequestRepository.countPendingIncomingRequests(profile.getId());
    }

    @Transactional(readOnly = true)
    public List<ProviderJobResponse> getIncomingRequests(UUID providerUserId, OrderRequestStatus status) {
        ProviderProfile profile = getProviderProfileByUserId(providerUserId);

        List<OrderRequest> requests = (status != null)
            ? orderRequestRepository.findAllByProviderIdAndStatusWithOrder(profile.getId(), status)
            : orderRequestRepository.findAllByProviderIdWithOrder(profile.getId());

        return requests.stream().map(this::mapToProviderJobResponse).toList();
    }

    @Transactional(readOnly = true)
    public Page<ProviderJobResponse> getIncomingRequests(UUID providerUserId, OrderRequestStatus status, Pageable pageable) {
        ProviderProfile profile = getProviderProfileByUserId(providerUserId);

        Page<OrderRequest> requests = (status != null)
            ? orderRequestRepository.findAllByProviderIdAndStatusWithOrder(profile.getId(), status, pageable)
            : orderRequestRepository.findAllByProviderIdWithOrder(profile.getId(), pageable);

        return requests.map(this::mapToProviderJobResponse);
    }

    @Transactional(readOnly = true)
    public List<ProviderJobResponse> getAssignedOrders(UUID providerUserId, OrderStatus status) {
        ProviderProfile profile = getProviderProfileByUserId(providerUserId);

        List<Order> orders = (status != null)
            ? orderRepository.findAllByAssignedProviderIdAndStatusOrderByCreatedAtDesc(profile.getId(), status)
            : orderRepository.findAllByAssignedProviderIdOrderByCreatedAtDesc(profile.getId());

        return orders.stream().map(order -> mapAssignedOrderToJobResponse(order, profile)).toList();
    }

    @Transactional(readOnly = true)
    public Page<ProviderJobResponse> getAssignedOrders(UUID providerUserId, OrderStatus status, Pageable pageable) {
        ProviderProfile profile = getProviderProfileByUserId(providerUserId);

        Page<Order> orders = (status != null)
            ? orderRepository.findAllByAssignedProviderIdAndStatusOrderByCreatedAtDesc(profile.getId(), status, pageable)
            : orderRepository.findAllByAssignedProviderIdOrderByCreatedAtDesc(profile.getId(), pageable);

        return orders.map(order -> mapAssignedOrderToJobResponse(order, profile));
    }

    private ProviderJobResponse mapAssignedOrderToJobResponse(Order order, ProviderProfile profile) {
        OrderRequest matchedRequest = orderRequestRepository.findByOrderIdAndProviderId(order.getId(), profile.getId())
            .orElse(null);

        List<String> images = orderImageRepository.findAllByOrderId(order.getId())
            .stream()
            .map(OrderImage::getImageUrl)
            .toList();

        return new ProviderJobResponse(
            matchedRequest != null ? matchedRequest.getId() : null,
            order.getId(),
            order.getOrderCode(),
            order.getTitle(),
            order.getDescription(),
            order.getCategory() != null ? order.getCategory().getName() : null,
            order.getContactName(),
            order.getContactPhone(),
            order.getAddressSnapshot(),
            order.getExpectedScheduleTime(),
            images,
            matchedRequest != null ? matchedRequest.getStatus().name() : OrderRequestStatus.ACCEPTED.name(),
            order.getStatus().name(),
            order.getFinalPrice(),
            matchedRequest != null ? matchedRequest.getProviderNote() : null,
            matchedRequest != null ? matchedRequest.getEstimatedArrivalTime() : null,
            null,
            order.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public ProviderJobResponse getJobDetail(UUID providerUserId, UUID requestId) {
        ProviderProfile profile = getProviderProfileByUserId(providerUserId);

        OrderRequest request = orderRequestRepository.findById(requestId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy yêu cầu công việc"));

        if (!request.getProvider().getId().equals(profile.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền xem thông tin yêu cầu này");
        }

        return mapToProviderJobResponse(request);
    }

    @Transactional
    public void submitQuotation(UUID providerUserId, UUID requestId, SubmitQuotationRequest request) {
        ProviderProfile profile = getProviderProfileByUserId(providerUserId);

        OrderRequest orderRequest = orderRequestRepository.findById(requestId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy yêu cầu công việc"));

        if (!orderRequest.getProvider().getId().equals(profile.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền báo giá cho yêu cầu này");
        }

        Order order = orderRequest.getOrder();
        if (order.getStatus() != OrderStatus.PENDING_PROVIDER) {
            throw new AppException(ErrorCode.CONFLICT, "Đơn hàng này không còn ở trạng thái nhận báo giá (đã có thợ nhận hoặc đã kết thúc)");
        }

        if (orderRequest.getStatus() == OrderRequestStatus.REJECTED || orderRequest.getStatus() == OrderRequestStatus.CANCELED) {
            throw new AppException(ErrorCode.INVALID_INPUT, "Không thể báo giá cho yêu cầu đã bị hủy hoặc từ chối");
        }

        orderRequest.setQuotedPrice(request.quotedPrice());
        orderRequest.setProviderNote(request.providerNote() != null ? request.providerNote().trim() : null);
        orderRequest.setEstimatedArrivalTime(request.estimatedArrivalTime());
        orderRequest.setStatus(OrderRequestStatus.QUOTED);

        orderRequestRepository.save(orderRequest);
    }

    @Transactional
    public void rejectRequest(UUID providerUserId, UUID requestId, RejectOrderRequestDto request) {
        ProviderProfile profile = getProviderProfileByUserId(providerUserId);

        OrderRequest orderRequest = orderRequestRepository.findById(requestId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy yêu cầu công việc"));

        if (!orderRequest.getProvider().getId().equals(profile.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền thao tác trên yêu cầu này");
        }

        if (orderRequest.getStatus() == OrderRequestStatus.ACCEPTED) {
            throw new AppException(ErrorCode.CONFLICT, "Không thể từ chối yêu cầu đã được chấp nhận làm việc");
        }

        orderRequest.setStatus(OrderRequestStatus.REJECTED);
        orderRequest.setRejectReason(request.rejectReason().trim());

        orderRequestRepository.save(orderRequest);
    }

    @Transactional
    public void completeOrder(UUID providerUserId, UUID orderId) {
        ProviderProfile profile = getProviderProfileByUserId(providerUserId);

        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn hàng"));

        if (order.getAssignedProvider() == null || !order.getAssignedProvider().getId().equals(profile.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không phải thợ được chỉ định cho đơn hàng này");
        }

        if (order.getStatus() != OrderStatus.IN_PROGRESS) {
            throw new AppException(ErrorCode.INVALID_INPUT, "Chỉ có thể đánh dấu hoàn thành cho đơn hàng đang trong trạng thái Đang thực hiện");
        }

        order.setStatus(OrderStatus.COMPLETED);
        orderRepository.save(order);
    }

    private ProviderProfile getProviderProfileByUserId(UUID userId) {
        return providerProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new AppException(ErrorCode.FORBIDDEN, "Tài khoản chưa đăng ký hồ sơ thợ"));
    }

    private ProviderJobResponse mapToProviderJobResponse(OrderRequest request) {
        Order order = request.getOrder();
        List<String> images = orderImageRepository.findAllByOrderId(order.getId())
            .stream()
            .map(OrderImage::getImageUrl)
            .toList();

        // Bảo mật thông tin liên lạc: Chỉ hiện SĐT khách khi thợ đã được chọn hoặc việc đang làm
        boolean isAssigned = (request.getStatus() == OrderRequestStatus.ACCEPTED)
            || (order.getStatus() == OrderStatus.IN_PROGRESS && order.getAssignedProvider() != null && order.getAssignedProvider().getId().equals(request.getProvider().getId()));

        String visiblePhone = isAssigned ? order.getContactPhone() : maskPhone(order.getContactPhone());

        return new ProviderJobResponse(
            request.getId(),
            order.getId(),
            order.getOrderCode(),
            order.getTitle(),
            order.getDescription(),
            order.getCategory() != null ? order.getCategory().getName() : null,
            order.getContactName(),
            visiblePhone,
            order.getAddressSnapshot(),
            order.getExpectedScheduleTime(),
            images,
            request.getStatus().name(),
            order.getStatus().name(),
            request.getQuotedPrice(),
            request.getProviderNote(),
            request.getEstimatedArrivalTime(),
            request.getRejectReason(),
            request.getCreatedAt()
        );
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 7) {
            return "***-***";
        }
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 3);
    }
}
