package com.nhalo24h.order.controller;

import com.nhalo24h.auth.security.UserPrincipal;
import com.nhalo24h.common.error.AppException;
import com.nhalo24h.common.error.ErrorCode;
import com.nhalo24h.order.dto.ChatMessageResponse;
import com.nhalo24h.order.dto.SendChatMessageRequest;
import com.nhalo24h.order.service.OrderChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/orders/requests/{requestId}/messages")
@PreAuthorize("hasAnyRole('CUSTOMER', 'PROVIDER')")
@Tag(name = "Order Quotation Chat", description = "Các API nhắn tin trao đổi giữa khách hàng và thợ trong giai đoạn báo giá")
public class OrderChatController {

    private final OrderChatService orderChatService;

    public OrderChatController(OrderChatService orderChatService) {
        this.orderChatService = orderChatService;
    }

    @GetMapping
    @Operation(summary = "Lấy lịch sử tin nhắn của báo giá", description = "Lấy toàn bộ tin nhắn đã trao đổi giữa khách và thợ trong yêu cầu báo giá này.")
    public ResponseEntity<List<ChatMessageResponse>> getMessages(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID requestId
    ) {
        validatePrincipal(principal);
        List<ChatMessageResponse> messages = orderChatService.getMessages(principal.getId(), requestId);
        return ResponseEntity.ok(messages);
    }

    @PostMapping
    @Operation(summary = "Gửi tin nhắn trong báo giá", description = "Khách hoặc thợ gửi tin nhắn trao đổi về tình trạng sự cố, giờ giấc hoặc báo giá.")
    public ResponseEntity<ChatMessageResponse> sendMessage(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID requestId,
        @Valid @RequestBody SendChatMessageRequest request
    ) {
        validatePrincipal(principal);
        ChatMessageResponse response = orderChatService.sendMessage(
            principal.getId(),
            principal.getRole(),
            requestId,
            request
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    private void validatePrincipal(UserPrincipal principal) {
        if (principal == null || principal.getId() == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ hoặc đã hết hạn");
        }
    }
}
