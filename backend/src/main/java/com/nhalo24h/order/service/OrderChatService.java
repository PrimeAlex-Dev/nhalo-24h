package com.nhalo24h.order.service;

import com.nhalo24h.common.error.AppException;
import com.nhalo24h.common.error.ErrorCode;
import com.nhalo24h.order.domain.MessageSenderRole;
import com.nhalo24h.order.domain.OrderRequest;
import com.nhalo24h.order.domain.OrderRequestMessage;
import com.nhalo24h.order.dto.ChatMessageResponse;
import com.nhalo24h.order.dto.SendChatMessageRequest;
import com.nhalo24h.order.repository.OrderRequestMessageRepository;
import com.nhalo24h.order.repository.OrderRequestRepository;
import com.nhalo24h.user.domain.User;
import com.nhalo24h.user.domain.UserRole;
import com.nhalo24h.user.repository.UserRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderChatService {

    private final OrderRequestRepository orderRequestRepository;
    private final OrderRequestMessageRepository orderRequestMessageRepository;
    private final UserRepository userRepository;

    public OrderChatService(
        OrderRequestRepository orderRequestRepository,
        OrderRequestMessageRepository orderRequestMessageRepository,
        UserRepository userRepository
    ) {
        this.orderRequestRepository = orderRequestRepository;
        this.orderRequestMessageRepository = orderRequestMessageRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getMessages(UUID userId, UUID requestId) {
        OrderRequest request = orderRequestRepository.findById(requestId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy yêu cầu báo giá"));

        validateChatParticipant(userId, request);

        return orderRequestMessageRepository.findAllByRequestIdWithSender(requestId)
            .stream()
            .map(this::mapToChatMessageResponse)
            .toList();
    }

    @Transactional
    public ChatMessageResponse sendMessage(UUID userId, UserRole role, UUID requestId, SendChatMessageRequest requestDto) {
        OrderRequest request = orderRequestRepository.findById(requestId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy yêu cầu báo giá"));

        User sender = userRepository.findById(userId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy người gửi"));

        MessageSenderRole senderRole;
        if (role == UserRole.CUSTOMER) {
            if (!request.getOrder().getCustomer().getId().equals(userId)) {
                throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền gửi tin nhắn trong yêu cầu này");
            }
            senderRole = MessageSenderRole.CUSTOMER;
        } else if (role == UserRole.PROVIDER) {
            if (!request.getProvider().getUser().getId().equals(userId)) {
                throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền gửi tin nhắn trong yêu cầu này");
            }
            senderRole = MessageSenderRole.PROVIDER;
        } else {
            throw new AppException(ErrorCode.FORBIDDEN, "Vai trò không hợp lệ để gửi tin nhắn");
        }

        OrderRequestMessage message = new OrderRequestMessage(
            request,
            sender,
            senderRole,
            requestDto.content().trim()
        );

        OrderRequestMessage saved = orderRequestMessageRepository.save(message);
        return mapToChatMessageResponse(saved);
    }

    private void validateChatParticipant(UUID userId, OrderRequest request) {
        boolean isCustomer = request.getOrder().getCustomer().getId().equals(userId);
        boolean isProvider = request.getProvider().getUser().getId().equals(userId);

        if (!isCustomer && !isProvider) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền truy cập cuộc trao đổi này");
        }
    }

    private ChatMessageResponse mapToChatMessageResponse(OrderRequestMessage message) {
        return new ChatMessageResponse(
            message.getId(),
            message.getOrderRequest().getId(),
            message.getSenderUser().getId(),
            message.getSenderRole().name(),
            message.getSenderUser().getFullName(),
            message.getContent(),
            message.getCreatedAt()
        );
    }
}
