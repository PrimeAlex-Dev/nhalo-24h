package com.nhalo24h.order.service;

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
import com.nhalo24h.order.domain.PaymentStatus;
import com.nhalo24h.order.domain.QuoteMode;
import com.nhalo24h.order.domain.QuoteVersionStatus;
import com.nhalo24h.order.domain.QuoteVersionType;
import com.nhalo24h.order.dto.CompleteOrderRequest;
import com.nhalo24h.order.dto.ConfirmCashPaymentRequest;
import com.nhalo24h.order.dto.ProviderJobResponse;
import com.nhalo24h.order.dto.QuoteItemDto;
import com.nhalo24h.order.dto.QuoteVersionResponse;
import com.nhalo24h.order.dto.RejectOrderRequestDto;
import com.nhalo24h.order.dto.SubmitQuotationRequest;
import com.nhalo24h.order.dto.SubmitSurveyQuoteRequest;
import com.nhalo24h.order.repository.OrderAuditLogRepository;
import com.nhalo24h.order.repository.OrderImageRepository;
import com.nhalo24h.order.repository.OrderQuoteVersionRepository;
import com.nhalo24h.order.repository.OrderRepository;
import com.nhalo24h.order.repository.OrderRequestRepository;
import com.nhalo24h.provider.domain.ProviderProfile;
import com.nhalo24h.provider.repository.ProviderProfileRepository;
import com.nhalo24h.wallet.domain.WalletStatus;
import com.nhalo24h.wallet.repository.ProviderWalletRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
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
    private final OrderQuoteVersionRepository orderQuoteVersionRepository;
    private final OrderAuditLogRepository orderAuditLogRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final ProviderWalletRepository walletRepository;

    public ProviderJobService(
        OrderRepository orderRepository,
        OrderRequestRepository orderRequestRepository,
        OrderImageRepository orderImageRepository,
        OrderQuoteVersionRepository orderQuoteVersionRepository,
        OrderAuditLogRepository orderAuditLogRepository,
        ProviderProfileRepository providerProfileRepository,
        ProviderWalletRepository walletRepository
    ) {
        this.orderRepository = orderRepository;
        this.orderRequestRepository = orderRequestRepository;
        this.orderImageRepository = orderImageRepository;
        this.orderQuoteVersionRepository = orderQuoteVersionRepository;
        this.orderAuditLogRepository = orderAuditLogRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.walletRepository = walletRepository;
    }

    @Transactional(readOnly = true)
    public int getPendingRequestsCount(UUID providerUserId) {
        ProviderProfile profile = getProviderProfileByUserId(providerUserId);

        // Kiểm tra điều kiện ví thợ (ký quỹ & trạng thái bảo hành rút cọc)
        walletRepository.findByProviderProfileId(profile.getId()).ifPresent(wallet -> {
            if (!wallet.isEligibleToAcceptOrders()) {
                if (wallet.getStatus() == WalletStatus.FROZEN_COOLING) {
                    throw new AppException(ErrorCode.CONFLICT,
                            "Bạn đang trong thời hạn 20 ngày chờ rút ký quỹ rời sàn, không thể gửi báo giá hoặc nhận thêm việc mới.");
                }
                if (wallet.getStatus() == WalletStatus.DEPOSIT_DEFICIT || wallet.getDepositBalance() < wallet.getDepositTarget()) {
                    throw new AppException(ErrorCode.CONFLICT,
                            "Số dư ký quỹ của bạn đang dưới định mức 2.000.000đ. Vui lòng liên hệ Admin nạp bù để tiếp tục nhận việc.");
                }
                throw new AppException(ErrorCode.CONFLICT, "Ví của bạn hiện đang bị khóa nhận đơn mới.");
            }
        });
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

        List<Order> orders;
        if (status == null) {
            orders = orderRepository.findAllByAssignedProviderIdOrderByCreatedAtDesc(profile.getId());
        } else if (status == OrderStatus.IN_PROGRESS) {
            orders = orderRepository.findAllByAssignedProviderIdAndStatusInOrderByCreatedAtDesc(
                profile.getId(),
                List.of(
                    OrderStatus.AWAITING_SURVEY,
                    OrderStatus.AWAITING_CUSTOMER_APPROVAL,
                    OrderStatus.IN_PROGRESS,
                    OrderStatus.AWAITING_COMPLETION_CONFIRMATION,
                    OrderStatus.DISPUTED
                )
            );
        } else if (status == OrderStatus.COMPLETED) {
            orders = orderRepository.findAllByAssignedProviderIdAndStatusInOrderByCreatedAtDesc(
                profile.getId(),
                List.of(OrderStatus.COMPLETED, OrderStatus.DECLINED_AFTER_SURVEY)
            );
        } else {
            orders = orderRepository.findAllByAssignedProviderIdAndStatusOrderByCreatedAtDesc(profile.getId(), status);
        }

        return orders.stream().map(order -> mapAssignedOrderToJobResponse(order, profile)).toList();
    }

    @Transactional(readOnly = true)
    public Page<ProviderJobResponse> getAssignedOrders(UUID providerUserId, OrderStatus status, Pageable pageable) {
        ProviderProfile profile = getProviderProfileByUserId(providerUserId);

        Page<Order> orders;
        if (status == null) {
            orders = orderRepository.findAllByAssignedProviderIdOrderByCreatedAtDesc(profile.getId(), pageable);
        } else if (status == OrderStatus.IN_PROGRESS) {
            orders = orderRepository.findAllByAssignedProviderIdAndStatusInOrderByCreatedAtDesc(
                profile.getId(),
                List.of(
                    OrderStatus.AWAITING_SURVEY,
                    OrderStatus.AWAITING_CUSTOMER_APPROVAL,
                    OrderStatus.IN_PROGRESS,
                    OrderStatus.AWAITING_COMPLETION_CONFIRMATION,
                    OrderStatus.DISPUTED,
                    OrderStatus.DECLINED_AFTER_SURVEY
                ),
                pageable
            );
        } else if (status == OrderStatus.COMPLETED) {
            orders = orderRepository.findAllByAssignedProviderIdAndStatusInOrderByCreatedAtDesc(
                profile.getId(),
                List.of(OrderStatus.COMPLETED, OrderStatus.DECLINED_AFTER_SURVEY),
                pageable
            );
        } else {
            orders = orderRepository.findAllByAssignedProviderIdAndStatusOrderByCreatedAtDesc(profile.getId(), status, pageable);
        }

        return orders.map(order -> mapAssignedOrderToJobResponse(order, profile));
    }

    private ProviderJobResponse mapAssignedOrderToJobResponse(Order order, ProviderProfile profile) {
        OrderRequest matchedRequest = orderRequestRepository.findByOrderIdAndProviderId(order.getId(), profile.getId())
            .orElse(null);

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

        List<QuoteVersionResponse> quoteVersions = orderQuoteVersionRepository.findAllByOrderIdWithItems(order.getId())
            .stream()
            .map(this::mapToQuoteVersionResponse)
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
            order.getUrgencyLevel(),
            order.getServiceMetadata(),
            issueImages,
            surveyImages,
            completionImages,
            matchedRequest != null ? matchedRequest.getStatus().name() : OrderRequestStatus.ACCEPTED.name(),
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
            matchedRequest != null ? matchedRequest.getProviderNote() : null,
            matchedRequest != null ? matchedRequest.getScopeAndConditions() : null,
            order.getCompletionNote(),
            order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null,
            order.getPaymentStatus() != null ? order.getPaymentStatus().name() : PaymentStatus.UNPAID.name(),
            order.getCustomerDeclaredAmount(),
            order.getCustomerPaymentNote(),
            order.getDisputeReason(),
            matchedRequest != null ? matchedRequest.getEstimatedArrivalTime() : null,
            null,
            quoteVersions,
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

    /**
     * Bước 2: Thợ gửi báo giá sơ bộ (bóc tách 3 nhóm chi phí: Phí khảo sát, Phí di chuyển, Tiền công & Vật tư dự kiến).
     */
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

        QuoteMode quoteMode = request.quoteMode() != null ? request.quoteMode() : QuoteMode.SURVEY_REQUIRED;
        long surveyFee = request.surveyFee() != null ? request.surveyFee() : 0L;
        long travelFee = request.travelFee() != null ? request.travelFee() : 0L;
        boolean waiveSurvey = request.waiveSurveyIfRepaired() != null ? request.waiveSurveyIfRepaired() : true;
        boolean waiveTravel = request.waiveTravelIfRepaired() != null ? request.waiveTravelIfRepaired() : true;

        long materialsFeeFromItems = 0L;
        if (request.items() != null && !request.items().isEmpty()) {
            for (QuoteItemDto item : request.items()) {
                int qty = item.quantity() != null && item.quantity() > 0 ? item.quantity() : 1;
                long unitPrice = item.unitPrice() != null && item.unitPrice() >= 0 ? item.unitPrice() : 0L;
                materialsFeeFromItems += (qty * unitPrice);
            }
        }
        long estimatedMaterialsFee = (request.items() != null && !request.items().isEmpty())
            ? materialsFeeFromItems
            : (request.estimatedMaterialsFee() != null ? request.estimatedMaterialsFee() : 0L);

        long estimatedLaborFee;
        if (request.estimatedLaborFee() != null) {
            estimatedLaborFee = request.estimatedLaborFee();
        } else if (request.quotedPrice() != null) {
            estimatedLaborFee = Math.max(0L, request.quotedPrice() - estimatedMaterialsFee);
        } else {
            estimatedLaborFee = 0L;
        }

        long appliedSurvey = waiveSurvey ? 0L : surveyFee;
        long appliedTravel = waiveTravel ? 0L : travelFee;
        long totalEstimated = appliedSurvey + appliedTravel + estimatedLaborFee + estimatedMaterialsFee;

        if (totalEstimated <= 0 && surveyFee <= 0 && travelFee <= 0) {
            throw new AppException(ErrorCode.INVALID_INPUT, "Vui lòng nhập tiền công dự kiến hoặc phí khảo sát/di chuyển lớn hơn 0");
        }

        orderRequest.setQuoteMode(quoteMode);
        orderRequest.setSurveyFee(surveyFee);
        orderRequest.setTravelFee(travelFee);
        orderRequest.setWaiveSurveyIfRepaired(waiveSurvey);
        orderRequest.setWaiveTravelIfRepaired(waiveTravel);
        orderRequest.setEstimatedLaborFee(estimatedLaborFee);
        orderRequest.setEstimatedMaterialsFee(estimatedMaterialsFee);
        orderRequest.setQuotedPrice(totalEstimated > 0 ? totalEstimated : (surveyFee + travelFee));
        orderRequest.setProviderNote(request.providerNote() != null ? request.providerNote().trim() : null);
        orderRequest.setScopeAndConditions(request.scopeAndConditions() != null ? request.scopeAndConditions().trim() : null);
        orderRequest.setEstimatedArrivalTime(request.estimatedArrivalTime());
        orderRequest.setStatus(OrderRequestStatus.QUOTED);

        orderRequestRepository.save(orderRequest);

        // Đánh dấu các bản INITIAL_ESTIMATE cũ của cùng thợ trên đơn này thành SUPERSEDED
        List<OrderQuoteVersion> existingVersions = orderQuoteVersionRepository
            .findAllByOrderIdAndProviderIdOrderByVersionNumberDesc(order.getId(), profile.getId());
        for (OrderQuoteVersion oldVer : existingVersions) {
            if (oldVer.getStatus() == QuoteVersionStatus.PENDING_APPROVAL) {
                oldVer.setStatus(QuoteVersionStatus.SUPERSEDED);
                orderQuoteVersionRepository.save(oldVer);
            }
        }

        // Lưu Version 1 (INITIAL_ESTIMATE) vào bảng lịch sử báo giá
        OrderQuoteVersion version = new OrderQuoteVersion();
        version.setOrder(order);
        version.setRequest(orderRequest);
        version.setProvider(profile);
        version.setVersionNumber(1);
        version.setVersionType(QuoteVersionType.INITIAL_ESTIMATE);
        version.setQuoteMode(quoteMode);
        version.setSurveyFee(surveyFee);
        version.setTravelFee(travelFee);
        version.setWaiveSurveyIfRepaired(waiveSurvey);
        version.setWaiveTravelIfRepaired(waiveTravel);
        version.setLaborFee(estimatedLaborFee);
        version.setMaterialsFee(estimatedMaterialsFee);
        version.setTotalAmount(orderRequest.getQuotedPrice());
        version.setDiagnosisOrReason(request.providerNote());
        version.setStatus(QuoteVersionStatus.PENDING_APPROVAL);

        if (request.items() != null) {
            for (QuoteItemDto dto : request.items()) {
                version.addItem(new OrderQuoteItem(dto.itemName(), dto.unit(), dto.quantity(), dto.unitPrice(), dto.note()));
            }
        }
        orderQuoteVersionRepository.save(version);

        recordAuditLog(
            order,
            providerUserId,
            "PROVIDER",
            "SUBMIT_INITIAL_QUOTE",
            order.getStatus().name(),
            order.getStatus().name(),
            order.getPaymentStatus().name(),
            order.getPaymentStatus().name(),
            "Thợ " + profile.getUser().getFullName() + " gửi báo giá (" + quoteMode.name() + "): Công "
                + estimatedLaborFee + "đ, Vật tư " + estimatedMaterialsFee + "đ, KS " + surveyFee + "đ, Di chuyển " + travelFee + "đ"
        );
    }

    /**
     * Bước 4: Thợ đến kiểm tra thực tế và gửi Báo giá cuối (POST_SURVEY_FINAL) kèm danh sách vật tư.
     */
    @Transactional
    public ProviderJobResponse submitSurveyQuote(UUID providerUserId, UUID orderId, SubmitSurveyQuoteRequest request) {
        ProviderProfile profile = getProviderProfileByUserId(providerUserId);

        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn hàng"));

        if (order.getAssignedProvider() == null || !order.getAssignedProvider().getId().equals(profile.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không phải thợ được chỉ định cho đơn hàng này");
        }

        if (order.getStatus() != OrderStatus.AWAITING_SURVEY && order.getStatus() != OrderStatus.AWAITING_CUSTOMER_APPROVAL) {
            throw new AppException(ErrorCode.CONFLICT, "Chỉ có thể gửi báo giá khảo sát khi đơn đang ở trạng thái Chờ khảo sát hoặc Chờ khách duyệt giá");
        }

        long materialsFee = calculateMaterialsTotal(request.items());
        long laborFee = request.laborFee() != null ? request.laborFee() : 0L;

        // Kiểm tra chênh lệch bất thường so với báo giá ban đầu để lưu vết giám sát
        OrderRequest initialReq = orderRequestRepository.findByOrderIdAndProviderId(order.getId(), profile.getId()).orElse(null);
        if (initialReq != null) {
            long initialLabor = initialReq.getEstimatedLaborFee() != null ? initialReq.getEstimatedLaborFee() : 0L;
            long initialTotal = (initialReq.getEstimatedLaborFee() != null ? initialReq.getEstimatedLaborFee() : 0L)
                + (initialReq.getEstimatedMaterialsFee() != null ? initialReq.getEstimatedMaterialsFee() : 0L);
            long newTotal = laborFee + materialsFee;

            if (initialTotal > 0 && newTotal > initialTotal * 2) {
                order.flagAbnormal("Báo giá sau khảo sát (" + newTotal + "đ) tăng hơn gấp đôi so với báo giá dự kiến ban đầu (" + initialTotal + "đ)");
            }
            if (initialLabor > 0 && laborFee < initialLabor / 2) {
                order.flagAbnormal("Tiền công sau khảo sát (" + laborFee + "đ) giảm hơn 50% so với dự kiến ban đầu (" + initialLabor + "đ) - lưu ý kiểm tra hoa hồng");
            }
        }

        // Lưu ảnh khảo sát hiện trường nếu có
        if (request.surveyImageUrls() != null && !request.surveyImageUrls().isEmpty()) {
            for (String imgUrl : request.surveyImageUrls()) {
                if (imgUrl != null && !imgUrl.isBlank()) {
                    orderImageRepository.save(new OrderImage(order, imgUrl.trim(), "SURVEY_EVIDENCE", "PROVIDER"));
                }
            }
        }

        // Đánh dấu các phiên bản đang chờ duyệt trước đó là SUPERSEDED
        List<OrderQuoteVersion> existingVersions = orderQuoteVersionRepository.findAllByOrderIdOrderByVersionNumberAsc(order.getId());
        int nextVersionNum = existingVersions.size() + 1;
        for (OrderQuoteVersion v : existingVersions) {
            if (v.getStatus() == QuoteVersionStatus.PENDING_APPROVAL) {
                v.setStatus(QuoteVersionStatus.SUPERSEDED);
                orderQuoteVersionRepository.save(v);
            }
        }

        long appliedSurvey = Boolean.TRUE.equals(order.getWaiveSurveyIfRepaired()) ? 0L : order.getAgreedSurveyFee();
        long appliedTravel = Boolean.TRUE.equals(order.getWaiveTravelIfRepaired()) ? 0L : order.getAgreedTravelFee();
        long totalAmount = appliedSurvey + appliedTravel + laborFee + materialsFee;

        OrderQuoteVersion surveyVersion = new OrderQuoteVersion();
        surveyVersion.setOrder(order);
        surveyVersion.setRequest(initialReq);
        surveyVersion.setProvider(profile);
        surveyVersion.setVersionNumber(nextVersionNum);
        surveyVersion.setVersionType(QuoteVersionType.POST_SURVEY_FINAL);
        surveyVersion.setQuoteMode(order.getWorkflowMode());
        surveyVersion.setSurveyFee(order.getAgreedSurveyFee());
        surveyVersion.setTravelFee(order.getAgreedTravelFee());
        surveyVersion.setWaiveSurveyIfRepaired(order.getWaiveSurveyIfRepaired());
        surveyVersion.setWaiveTravelIfRepaired(order.getWaiveTravelIfRepaired());
        surveyVersion.setLaborFee(laborFee);
        surveyVersion.setMaterialsFee(materialsFee);
        surveyVersion.setTotalAmount(totalAmount);
        surveyVersion.setDiagnosisOrReason(request.diagnosisOrReason().trim());
        surveyVersion.setStatus(QuoteVersionStatus.PENDING_APPROVAL);

        if (request.items() != null) {
            for (QuoteItemDto dto : request.items()) {
                surveyVersion.addItem(new OrderQuoteItem(dto.itemName(), dto.unit(), dto.quantity(), dto.unitPrice(), dto.note()));
            }
        }
        orderQuoteVersionRepository.save(surveyVersion);

        String oldStatus = order.getStatus().name();
        order.setStatus(OrderStatus.AWAITING_CUSTOMER_APPROVAL);
        Order savedOrder = orderRepository.save(order);

        recordAuditLog(
            savedOrder,
            providerUserId,
            "PROVIDER",
            "SUBMIT_SURVEY_QUOTE",
            oldStatus,
            savedOrder.getStatus().name(),
            savedOrder.getPaymentStatus().name(),
            savedOrder.getPaymentStatus().name(),
            "Thợ gửi báo giá cuối sau khảo sát (Phiên bản #" + nextVersionNum + "): Tiền công "
                + laborFee + "đ, Vật tư " + materialsFee + "đ, Tổng " + totalAmount + "đ. Chẩn đoán: " + request.diagnosisOrReason().trim()
        );

        return mapAssignedOrderToJobResponse(savedOrder, profile);
    }

    /**
     * Bước 6: Khi đang sửa chữa (IN_PROGRESS), nếu phát sinh thêm vật tư/công việc,
     * thợ gửi yêu cầu điều chỉnh báo giá chờ khách xác nhận trước khi áp dụng vào hóa đơn cuối.
     */
    @Transactional
    public ProviderJobResponse submitChangeRequest(UUID providerUserId, UUID orderId, SubmitSurveyQuoteRequest request) {
        ProviderProfile profile = getProviderProfileByUserId(providerUserId);

        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn hàng"));

        if (order.getAssignedProvider() == null || !order.getAssignedProvider().getId().equals(profile.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không phải thợ được chỉ định cho đơn hàng này");
        }

        if (order.getStatus() != OrderStatus.IN_PROGRESS) {
            throw new AppException(ErrorCode.CONFLICT, "Chỉ có thể gửi yêu cầu điều chỉnh phát sinh khi đơn đang trong trạng thái Đang thực hiện");
        }

        long materialsFee = calculateMaterialsTotal(request.items());
        long laborFee = request.laborFee() != null ? request.laborFee() : 0L;

        if (order.getFinalLaborFee() != null && laborFee < order.getFinalLaborFee()) {
            order.flagAbnormal("Điều chỉnh giảm tiền công trong khi làm từ " + order.getFinalLaborFee() + "đ xuống " + laborFee + "đ - Lý do: " + request.diagnosisOrReason().trim());
        }

        List<OrderQuoteVersion> existingVersions = orderQuoteVersionRepository.findAllByOrderIdOrderByVersionNumberAsc(order.getId());
        int nextVersionNum = existingVersions.size() + 1;
        for (OrderQuoteVersion v : existingVersions) {
            if (v.getStatus() == QuoteVersionStatus.PENDING_APPROVAL) {
                v.setStatus(QuoteVersionStatus.SUPERSEDED);
                orderQuoteVersionRepository.save(v);
            }
        }

        long appliedSurvey = Boolean.TRUE.equals(order.getWaiveSurveyIfRepaired()) ? 0L : order.getAgreedSurveyFee();
        long appliedTravel = Boolean.TRUE.equals(order.getWaiveTravelIfRepaired()) ? 0L : order.getAgreedTravelFee();
        long totalAmount = appliedSurvey + appliedTravel + laborFee + materialsFee;

        OrderRequest initialReq = orderRequestRepository.findByOrderIdAndProviderId(order.getId(), profile.getId()).orElse(null);

        OrderQuoteVersion changeVersion = new OrderQuoteVersion();
        changeVersion.setOrder(order);
        changeVersion.setRequest(initialReq);
        changeVersion.setProvider(profile);
        changeVersion.setVersionNumber(nextVersionNum);
        changeVersion.setVersionType(QuoteVersionType.IN_PROGRESS_CHANGE);
        changeVersion.setQuoteMode(order.getWorkflowMode());
        changeVersion.setSurveyFee(order.getAgreedSurveyFee());
        changeVersion.setTravelFee(order.getAgreedTravelFee());
        changeVersion.setWaiveSurveyIfRepaired(order.getWaiveSurveyIfRepaired());
        changeVersion.setWaiveTravelIfRepaired(order.getWaiveTravelIfRepaired());
        changeVersion.setLaborFee(laborFee);
        changeVersion.setMaterialsFee(materialsFee);
        changeVersion.setTotalAmount(totalAmount);
        changeVersion.setDiagnosisOrReason(request.diagnosisOrReason().trim());
        changeVersion.setStatus(QuoteVersionStatus.PENDING_APPROVAL);

        if (request.items() != null) {
            for (QuoteItemDto dto : request.items()) {
                changeVersion.addItem(new OrderQuoteItem(dto.itemName(), dto.unit(), dto.quantity(), dto.unitPrice(), dto.note()));
            }
        }
        orderQuoteVersionRepository.save(changeVersion);

        Order savedOrder = orderRepository.save(order);

        recordAuditLog(
            savedOrder,
            providerUserId,
            "PROVIDER",
            "SUBMIT_CHANGE_REQUEST",
            savedOrder.getStatus().name(),
            savedOrder.getStatus().name(),
            savedOrder.getPaymentStatus().name(),
            savedOrder.getPaymentStatus().name(),
            "Thợ gửi yêu cầu điều chỉnh chi phí / phát sinh vật tư (Phiên bản #" + nextVersionNum + "): Tiền công mới "
                + laborFee + "đ, Vật tư mới " + materialsFee + "đ, Tổng " + totalAmount + "đ. Chờ khách xác nhận."
        );

        return mapAssignedOrderToJobResponse(savedOrder, profile);
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

    /**
     * Bước 7: Thợ báo hoàn thành công việc, gửi tổng kết và ảnh nghiệm thu -> Chuyển đơn sang AWAITING_COMPLETION_CONFIRMATION.
     * Quy tắc cứng: Chỉ tính hóa đơn dựa trên phiên bản báo giá đã được khách APPROVED, không tự ý cộng phát sinh chưa duyệt!
     */
    @Transactional
    public ProviderJobResponse completeOrder(UUID providerUserId, UUID orderId, CompleteOrderRequest request) {
        ProviderProfile profile = getProviderProfileByUserId(providerUserId);

        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn hàng"));

        if (order.getAssignedProvider() == null || !order.getAssignedProvider().getId().equals(profile.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không phải thợ được chỉ định cho đơn hàng này");
        }

        if (order.getStatus() != OrderStatus.IN_PROGRESS) {
            throw new AppException(ErrorCode.INVALID_INPUT, "Chỉ có thể báo hoàn thành cho đơn hàng đang trong trạng thái Đang thực hiện");
        }

        // Hủy các bản điều chỉnh phát sinh mà khách chưa đồng ý (không tự động ghi vào hóa đơn cuối)
        List<OrderQuoteVersion> existingVersions = orderQuoteVersionRepository.findAllByOrderIdOrderByVersionNumberAsc(order.getId());
        for (OrderQuoteVersion v : existingVersions) {
            if (v.getStatus() == QuoteVersionStatus.PENDING_APPROVAL) {
                v.setStatus(QuoteVersionStatus.SUPERSEDED);
                orderQuoteVersionRepository.save(v);
            }
        }

        if (request != null) {
            if (request.completionNote() != null && !request.completionNote().isBlank()) {
                order.setCompletionNote(request.completionNote().trim());
            }
            if (request.completionImageUrls() != null && !request.completionImageUrls().isEmpty()) {
                for (String imgUrl : request.completionImageUrls()) {
                    if (imgUrl != null && !imgUrl.isBlank()) {
                        orderImageRepository.save(new OrderImage(order, imgUrl.trim(), "COMPLETION_AFTER", "PROVIDER"));
                    }
                }
            }
        }

        String oldStatus = order.getStatus().name();
        order.recalculateFinancials(false);
        order.setStatus(OrderStatus.AWAITING_COMPLETION_CONFIRMATION);
        Order savedOrder = orderRepository.save(order);

        recordAuditLog(
            savedOrder,
            providerUserId,
            "PROVIDER",
            "REPORT_COMPLETION",
            oldStatus,
            savedOrder.getStatus().name(),
            savedOrder.getPaymentStatus().name(),
            savedOrder.getPaymentStatus().name(),
            "Thợ báo hoàn thành công việc. Hóa đơn quyết toán: Tiền công " + savedOrder.getFinalLaborFee()
                + "đ, Vật tư " + savedOrder.getFinalMaterialsFee() + "đ, Tổng khách trả " + savedOrder.getFinalPrice()
                + "đ (Hoa hồng dự kiến: " + savedOrder.getCommissionAmount() + "đ). Chờ khách nghiệm thu & thanh toán."
        );

        return mapAssignedOrderToJobResponse(savedOrder, profile);
    }

    /**
     * Nhánh B Thanh toán — Bước 3 & 4: Thợ xác nhận số tiền mặt khách đã khai báo.
     */
    @Transactional
    public ProviderJobResponse confirmCashPayment(UUID providerUserId, UUID orderId, ConfirmCashPaymentRequest request) {
        ProviderProfile profile = getProviderProfileByUserId(providerUserId);

        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn hàng"));

        if (order.getAssignedProvider() == null || !order.getAssignedProvider().getId().equals(profile.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không phải thợ được chỉ định cho đơn hàng này");
        }

        if (order.getPaymentStatus() != PaymentStatus.CASH_PENDING_CONFIRMATION) {
            throw new AppException(ErrorCode.CONFLICT, "Đơn hàng chưa có khai báo thanh toán tiền mặt nào từ khách hàng đang chờ xác nhận");
        }

        String oldOrderStatus = order.getStatus().name();
        String oldPaymentStatus = order.getPaymentStatus().name();
        Long customerDeclared = order.getCustomerDeclaredAmount() != null ? order.getCustomerDeclaredAmount() : 0L;
        Long invoiceTotal = order.getFinalPrice() != null ? order.getFinalPrice() : 0L;

        if (Boolean.TRUE.equals(request.confirmed())) {
            order.setProviderConfirmedAmount(customerDeclared);
            order.setProviderPaymentConfirmedAt(Instant.now());

            // Lớp bảo vệ 3 & 4: Nếu số tiền 2 bên khai báo lệch với hóa đơn đã chốt, đưa vào hàng chờ xử lý PAYMENT_DISPUTED
            if (!customerDeclared.equals(invoiceTotal)) {
                order.setPaymentStatus(PaymentStatus.PAYMENT_DISPUTED);
                order.setDisputeReason("Số tiền mặt khai báo (" + customerDeclared + "đ) lệch với hóa đơn (" + invoiceTotal + "đ), chờ Quản trị viên đối soát.");
                order.flagAbnormal("Hai bên xác nhận số tiền mặt (" + customerDeclared + "đ) khác với hóa đơn chốt (" + invoiceTotal + "đ)");
                Order savedOrder = orderRepository.save(order);

                recordAuditLog(
                    savedOrder,
                    providerUserId,
                    "PROVIDER",
                    "CONFIRM_CASH_MISMATCH_INVOICE",
                    oldOrderStatus,
                    savedOrder.getStatus().name(),
                    oldPaymentStatus,
                    savedOrder.getPaymentStatus().name(),
                    "Thợ xác nhận đã thu " + customerDeclared + "đ (khác hóa đơn " + invoiceTotal + "đ). Chuyển sang chờ Admin đối soát."
                );
                return mapAssignedOrderToJobResponse(savedOrder, profile);
            }

            // Hai bên xác nhận khớp hoàn toàn với hóa đơn -> Chốt thanh toán và hoàn tất đơn
            order.setPaymentStatus(PaymentStatus.CASH_CONFIRMED);
            if (order.getStatus() == OrderStatus.AWAITING_COMPLETION_CONFIRMATION) {
                order.setStatus(OrderStatus.COMPLETED);
            }
            Order savedOrder = orderRepository.save(order);

            recordAuditLog(
                savedOrder,
                providerUserId,
                "PROVIDER",
                "CONFIRM_CASH_PAYMENT",
                oldOrderStatus,
                savedOrder.getStatus().name(),
                oldPaymentStatus,
                savedOrder.getPaymentStatus().name(),
                "Thợ xác nhận đã nhận đủ tiền mặt " + customerDeclared + "đ khớp với hóa đơn. Hoa hồng nền tảng: " + savedOrder.getCommissionAmount() + "đ."
            );

            return mapAssignedOrderToJobResponse(savedOrder, profile);
        } else {
            // Thợ báo số tiền khách khai không khớp với thực tế nhận
            long actualReceived = request.actualReceivedAmount() != null ? request.actualReceivedAmount() : 0L;
            String reason = (request.disputeReason() != null && !request.disputeReason().isBlank())
                ? request.disputeReason().trim()
                : "Thợ báo số tiền thực nhận (" + actualReceived + "đ) không khớp với số tiền khách khai (" + customerDeclared + "đ)";

            order.setProviderConfirmedAmount(actualReceived);
            order.setDisputeReason(reason);
            order.setPaymentStatus(PaymentStatus.PAYMENT_DISPUTED);
            order.flagAbnormal("Tranh chấp tiền mặt giữa khách (" + customerDeclared + "đ) và thợ (" + actualReceived + "đ): " + reason);

            Order savedOrder = orderRepository.save(order);

            recordAuditLog(
                savedOrder,
                providerUserId,
                "PROVIDER",
                "DISPUTE_CASH_PAYMENT",
                oldOrderStatus,
                savedOrder.getStatus().name(),
                oldPaymentStatus,
                savedOrder.getPaymentStatus().name(),
                "Thợ báo KHÔNG KHỚP số tiền mặt khách khai (" + customerDeclared + "đ). Lý do: " + reason
            );

            return mapAssignedOrderToJobResponse(savedOrder, profile);
        }
    }

    /**
     * Thợ xác nhận hủy việc sau khi đã trao đổi/thống nhất với khách hàng hoặc gặp sự cố bất khả kháng.
     */
    @Transactional
    public ProviderJobResponse cancelAssignedOrder(UUID providerUserId, UUID orderId, String reason) {
        ProviderProfile profile = getProviderProfileByUserId(providerUserId);

        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn hàng"));

        if (order.getAssignedProvider() == null || !order.getAssignedProvider().getId().equals(profile.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không phải thợ được phân công cho đơn hàng này");
        }

        if (order.getStatus() == OrderStatus.COMPLETED || order.getStatus() == OrderStatus.AWAITING_COMPLETION_CONFIRMATION) {
            throw new AppException(ErrorCode.CONFLICT, "Không thể hủy đơn hàng đã hoàn thành công việc");
        }

        if (order.getStatus() == OrderStatus.CANCELED) {
            throw new AppException(ErrorCode.CONFLICT, "Đơn hàng đã ở trạng thái hủy trước đó");
        }

        String oldStatus = order.getStatus().name();
        order.setStatus(OrderStatus.CANCELED);
        String cancelNote = (reason != null && !reason.isBlank()) ? reason.trim() : "Thợ hủy theo thỏa thuận với khách hàng";
        order.setCancelReason("Thợ xác nhận hủy: " + cancelNote);
        Order savedOrder = orderRepository.save(order);

        recordAuditLog(
            savedOrder,
            providerUserId,
            "PROVIDER",
            "PROVIDER_CANCEL_ORDER",
            oldStatus,
            savedOrder.getStatus().name(),
            savedOrder.getPaymentStatus().name(),
            savedOrder.getPaymentStatus().name(),
            "Thợ xác nhận hủy đơn hàng. Lý do: " + cancelNote
        );

        return mapAssignedOrderToJobResponse(savedOrder, profile);
    }

    private long calculateMaterialsTotal(List<QuoteItemDto> items) {
        if (items == null || items.isEmpty()) {
            return 0L;
        }
        long sum = 0L;
        for (QuoteItemDto item : items) {
            int qty = item.quantity() != null && item.quantity() > 0 ? item.quantity() : 1;
            long unitPrice = item.unitPrice() != null && item.unitPrice() >= 0 ? item.unitPrice() : 0L;
            sum += (qty * unitPrice);
        }
        return sum;
    }

    private ProviderProfile getProviderProfileByUserId(UUID userId) {
        return providerProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new AppException(ErrorCode.FORBIDDEN, "Tài khoản chưa đăng ký hồ sơ thợ"));
    }

    private ProviderJobResponse mapToProviderJobResponse(OrderRequest request) {
        Order order = request.getOrder();
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

        List<QuoteVersionResponse> quoteVersions = orderQuoteVersionRepository.findAllByOrderIdWithItems(order.getId())
            .stream()
            .map(this::mapToQuoteVersionResponse)
            .toList();

        // Bảo mật thông tin liên lạc: Chỉ hiện SĐT khách khi thợ đã được chọn
        boolean isAssigned = (request.getStatus() == OrderRequestStatus.ACCEPTED)
            || (order.getAssignedProvider() != null && order.getAssignedProvider().getId().equals(request.getProvider().getId()));

        String visiblePhone = isAssigned ? order.getContactPhone() : maskPhone(order.getContactPhone());

        long labor = isAssigned ? order.getFinalLaborFee() : request.getEstimatedLaborFee();
        long materials = isAssigned ? order.getFinalMaterialsFee() : request.getEstimatedMaterialsFee();
        BigDecimal rate = order.getCommissionRateSnapshot() != null ? order.getCommissionRateSnapshot() : new BigDecimal("10.00");
        long estimatedCommission = BigDecimal.valueOf(labor)
            .multiply(rate)
            .divide(new BigDecimal("100"), 0, RoundingMode.HALF_UP)
            .longValue();

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
            order.getUrgencyLevel(),
            order.getServiceMetadata(),
            issueImages,
            surveyImages,
            completionImages,
            request.getStatus().name(),
            order.getStatus().name(),
            request.getQuoteMode() != null ? request.getQuoteMode().name() : QuoteMode.SURVEY_REQUIRED.name(),
            request.getSurveyFee(),
            request.getTravelFee(),
            request.getWaiveSurveyIfRepaired(),
            request.getWaiveTravelIfRepaired(),
            order.getAppliedSurveyFee(),
            order.getAppliedTravelFee(),
            labor,
            materials,
            isAssigned && order.getFinalPrice() != null ? order.getFinalPrice() : request.getQuotedPrice(),
            rate,
            isAssigned ? order.getCommissionAmount() : estimatedCommission,
            request.getProviderNote(),
            request.getScopeAndConditions(),
            order.getCompletionNote(),
            order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null,
            order.getPaymentStatus() != null ? order.getPaymentStatus().name() : PaymentStatus.UNPAID.name(),
            order.getCustomerDeclaredAmount(),
            order.getCustomerPaymentNote(),
            order.getDisputeReason(),
            request.getEstimatedArrivalTime(),
            request.getRejectReason(),
            quoteVersions,
            request.getCreatedAt()
        );
    }

    private QuoteVersionResponse mapToQuoteVersionResponse(OrderQuoteVersion v) {
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

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 7) {
            return "***-***";
        }
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 3);
    }
}
