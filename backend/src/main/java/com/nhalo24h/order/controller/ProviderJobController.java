package com.nhalo24h.order.controller;

import com.nhalo24h.auth.security.UserPrincipal;
import com.nhalo24h.common.error.AppException;
import com.nhalo24h.common.error.ErrorCode;
import com.nhalo24h.order.domain.OrderRequestStatus;
import com.nhalo24h.order.domain.OrderStatus;
import com.nhalo24h.order.dto.ProviderJobResponse;
import com.nhalo24h.order.dto.RejectOrderRequestDto;
import com.nhalo24h.order.dto.SubmitQuotationRequest;
import com.nhalo24h.order.service.ProviderJobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/provider")
@PreAuthorize("hasRole('PROVIDER')")
@Tag(name = "Provider Jobs", description = "Các API nhận yêu cầu báo giá, gửi báo giá và quản lý việc nhận làm của thợ")
public class ProviderJobController {

    private final ProviderJobService providerJobService;

    public ProviderJobController(ProviderJobService providerJobService) {
        this.providerJobService = providerJobService;
    }

    @GetMapping("/requests")
    @Operation(summary = "Danh sách yêu cầu báo giá", description = "Lấy danh sách các yêu cầu báo giá gửi đến thợ, có thể lọc theo trạng thái (PENDING_RESPONSE, QUOTED, REJECTED, ACCEPTED, CANCELED).")
    public ResponseEntity<List<ProviderJobResponse>> getIncomingRequests(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam(required = false) OrderRequestStatus status
    ) {
        validatePrincipal(principal);
        List<ProviderJobResponse> response = providerJobService.getIncomingRequests(principal.getId(), status);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/requests/{requestId}")
    @Operation(summary = "Xem chi tiết một yêu cầu công việc", description = "Xem chi tiết sự cố, hình ảnh, thời gian mong muốn và thông tin liên quan của yêu cầu.")
    public ResponseEntity<ProviderJobResponse> getJobDetail(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID requestId
    ) {
        validatePrincipal(principal);
        ProviderJobResponse response = providerJobService.getJobDetail(principal.getId(), requestId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/requests/{requestId}/quote")
    @Operation(summary = "Gửi báo giá cho khách", description = "Thợ nhập giá tiền, ghi chú cam kết/vật tư và giờ ước tính có mặt để gửi cho khách.")
    public ResponseEntity<Void> submitQuotation(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID requestId,
        @Valid @RequestBody SubmitQuotationRequest request
    ) {
        validatePrincipal(principal);
        providerJobService.submitQuotation(principal.getId(), requestId, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/requests/{requestId}/reject")
    @Operation(summary = "Từ chối nhận việc", description = "Thợ từ chối yêu cầu báo giá kèm theo lý do cụ thể.")
    public ResponseEntity<Void> rejectRequest(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID requestId,
        @Valid @RequestBody RejectOrderRequestDto request
    ) {
        validatePrincipal(principal);
        providerJobService.rejectRequest(principal.getId(), requestId, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/orders")
    @Operation(summary = "Danh sách việc đã nhận làm", description = "Lấy danh sách các công việc thợ đã được khách chốt chọn (IN_PROGRESS hoặc COMPLETED).")
    public ResponseEntity<List<ProviderJobResponse>> getAssignedOrders(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam(required = false) OrderStatus status
    ) {
        validatePrincipal(principal);
        List<ProviderJobResponse> response = providerJobService.getAssignedOrders(principal.getId(), status);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/orders/{orderId}/complete")
    @Operation(summary = "Đánh dấu hoàn thành công việc", description = "Thợ bấm hoàn thành khi đã sửa chữa xong, chuyển trạng thái đơn hàng sang COMPLETED.")
    public ResponseEntity<Void> completeOrder(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID orderId
    ) {
        validatePrincipal(principal);
        providerJobService.completeOrder(principal.getId(), orderId);
        return ResponseEntity.ok().build();
    }

    private void validatePrincipal(UserPrincipal principal) {
        if (principal == null || principal.getId() == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ hoặc đã hết hạn");
        }
    }
}
