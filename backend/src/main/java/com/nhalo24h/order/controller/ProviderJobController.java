package com.nhalo24h.order.controller;

import com.nhalo24h.auth.security.UserPrincipal;
import com.nhalo24h.common.error.AppException;
import com.nhalo24h.common.error.ErrorCode;
import com.nhalo24h.order.domain.OrderRequestStatus;
import com.nhalo24h.order.domain.OrderStatus;
import com.nhalo24h.order.dto.CancelOrderDto;
import com.nhalo24h.order.dto.CompleteOrderRequest;
import com.nhalo24h.order.dto.ConfirmCashPaymentRequest;
import com.nhalo24h.order.dto.ProviderJobResponse;
import com.nhalo24h.order.dto.RejectOrderRequestDto;
import com.nhalo24h.order.dto.SubmitQuotationRequest;
import com.nhalo24h.order.dto.SubmitSurveyQuoteRequest;
import com.nhalo24h.order.service.ProviderJobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.Map;
import java.util.UUID;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
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
@Tag(name = "Provider Jobs", description = "Các API nhận yêu cầu báo giá, khảo sát, cập nhật vật tư, báo hoàn thành và xác nhận thu tiền mặt của thợ")
public class ProviderJobController {

    private final ProviderJobService providerJobService;

    public ProviderJobController(ProviderJobService providerJobService) {
        this.providerJobService = providerJobService;
    }

    @GetMapping("/requests/count-pending")
    @Operation(summary = "Đếm số lượng yêu cầu mới chờ phản hồi", description = "Đếm nhanh số yêu cầu báo giá PENDING_RESPONSE để hiển thị badge trên Navbar của thợ.")
    public ResponseEntity<Map<String, Integer>> getPendingRequestsCount(@AuthenticationPrincipal UserPrincipal principal) {
        validatePrincipal(principal);
        int count = providerJobService.getPendingRequestsCount(principal.getId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping("/requests")
    @Operation(summary = "Danh sách yêu cầu báo giá", description = "Lấy danh sách các yêu cầu báo giá gửi đến thợ, có phân trang và lọc theo trạng thái.")
    public ResponseEntity<Page<ProviderJobResponse>> getIncomingRequests(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam(required = false) OrderRequestStatus status,
        @ParameterObject @PageableDefault(size = 5, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        validatePrincipal(principal);
        Page<ProviderJobResponse> response = providerJobService.getIncomingRequests(principal.getId(), status, pageable);
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
    @Operation(summary = "Gửi báo giá ban đầu (3 nhóm chi phí)", description = "Thợ nhập phí khảo sát, phí di chuyển, chính sách miễn giảm, tiền công & vật tư dự kiến.")
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
    @Operation(summary = "Danh sách việc đã nhận làm", description = "Lấy danh sách các công việc thợ đã được khách chọn, có phân trang.")
    public ResponseEntity<Page<ProviderJobResponse>> getAssignedOrders(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam(required = false) OrderStatus status,
        @ParameterObject @PageableDefault(size = 5, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        validatePrincipal(principal);
        Page<ProviderJobResponse> response = providerJobService.getAssignedOrders(principal.getId(), status, pageable);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/orders/{orderId}/survey-quote")
    @Operation(summary = "Gửi Báo giá cuối sau khảo sát thực tế", description = "Thợ cập nhật kết quả kiểm tra hiện trạng, tiền công chốt và danh sách linh kiện/vật tư cần thay để khách xác nhận trước khi sửa.")
    public ResponseEntity<ProviderJobResponse> submitSurveyQuote(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID orderId,
        @Valid @RequestBody SubmitSurveyQuoteRequest request
    ) {
        validatePrincipal(principal);
        ProviderJobResponse response = providerJobService.submitSurveyQuote(principal.getId(), orderId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/orders/{orderId}/change-request")
    @Operation(summary = "Gửi Yêu cầu điều chỉnh phát sinh trong khi sửa", description = "Khi phát sinh thêm vật tư hoặc công việc ngoài dự kiến, thợ gửi yêu cầu điều chỉnh chờ khách đồng ý trước khi làm.")
    public ResponseEntity<ProviderJobResponse> submitChangeRequest(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID orderId,
        @Valid @RequestBody SubmitSurveyQuoteRequest request
    ) {
        validatePrincipal(principal);
        ProviderJobResponse response = providerJobService.submitChangeRequest(principal.getId(), orderId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/orders/{orderId}/complete")
    @Operation(summary = "Báo hoàn thành công việc & Gửi hóa đơn nghiệm thu", description = "Thợ báo đã sửa chữa xong kèm ghi chú và ảnh nghiệm thu, chuyển đơn sang AWAITING_COMPLETION_CONFIRMATION chờ khách kiểm tra và thanh toán.")
    public ResponseEntity<ProviderJobResponse> completeOrder(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID orderId,
        @RequestBody(required = false) CompleteOrderRequest request
    ) {
        validatePrincipal(principal);
        ProviderJobResponse response = providerJobService.completeOrder(principal.getId(), orderId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/orders/{orderId}/confirm-cash")
    @Operation(summary = "Xác nhận thu tiền mặt (Bước 2)", description = "Thợ xác nhận đã nhận đúng số tiền mặt khách khai báo hoặc báo không khớp.")
    public ResponseEntity<ProviderJobResponse> confirmCashPayment(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID orderId,
        @Valid @RequestBody ConfirmCashPaymentRequest request
    ) {
        validatePrincipal(principal);
        ProviderJobResponse response = providerJobService.confirmCashPayment(principal.getId(), orderId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/orders/{orderId}/cancel")
    @Operation(summary = "Thợ xác nhận hủy đơn việc", description = "Thợ xác nhận hủy đơn khi đã thỏa thuận với khách hàng hoặc gặp sự cố bất khả kháng.")
    public ResponseEntity<ProviderJobResponse> cancelAssignedOrder(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID orderId,
        @RequestBody(required = false) CancelOrderDto request
    ) {
        validatePrincipal(principal);
        String reason = (request != null && request.reason() != null) ? request.reason() : null;
        ProviderJobResponse response = providerJobService.cancelAssignedOrder(principal.getId(), orderId, reason);
        return ResponseEntity.ok(response);
    }

    private void validatePrincipal(UserPrincipal principal) {
        if (principal == null || principal.getId() == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ hoặc đã hết hạn");
        }
    }
}
