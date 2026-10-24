package com.nhalo24h.order.controller;

import com.nhalo24h.auth.security.UserPrincipal;
import com.nhalo24h.common.error.AppException;
import com.nhalo24h.common.error.ErrorCode;
import com.nhalo24h.order.domain.OrderStatus;
import com.nhalo24h.order.dto.CancelOrderDto;
import com.nhalo24h.order.dto.ConfirmOnlinePaymentRequest;
import com.nhalo24h.order.dto.CreateOrderRequest;
import com.nhalo24h.order.dto.CustomerOrderDetailResponse;
import com.nhalo24h.order.dto.CustomerOrderSummaryResponse;
import com.nhalo24h.order.dto.DeclareCashPaymentRequest;
import com.nhalo24h.order.dto.DispatchOrderRequestsDto;
import com.nhalo24h.order.dto.OnlinePaymentInitResponse;
import com.nhalo24h.order.service.CustomerOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
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
@RequestMapping("/api/v1/customer/orders")
@PreAuthorize("hasRole('CUSTOMER')")
@Tag(name = "Customer Orders", description = "Các API tạo đơn hàng, quản lý khảo sát, duyệt báo giá, nghiệm thu và thanh toán của khách hàng")
public class CustomerOrderController {

    private final CustomerOrderService customerOrderService;

    public CustomerOrderController(CustomerOrderService customerOrderService) {
        this.customerOrderService = customerOrderService;
    }

    @PostMapping
    @Operation(summary = "Tạo đơn hàng mới", description = "Khách hàng tạo đơn sửa chữa/vệ sinh mới từ địa chỉ đã lưu, đính kèm ảnh và tùy chọn gửi yêu cầu tới thợ ban đầu.")
    public ResponseEntity<CustomerOrderDetailResponse> createOrder(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody CreateOrderRequest request
    ) {
        validatePrincipal(principal);
        CustomerOrderDetailResponse response = customerOrderService.createOrder(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Danh sách đơn hàng của tôi", description = "Lấy danh sách các đơn hàng của khách hàng đang đăng nhập, có thể lọc theo trạng thái đơn và phân trang.")
    public ResponseEntity<Page<CustomerOrderSummaryResponse>> getMyOrders(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam(required = false) OrderStatus status,
        @ParameterObject @PageableDefault(size = 5, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        validatePrincipal(principal);
        Page<CustomerOrderSummaryResponse> response = customerOrderService.getMyOrders(principal.getId(), status, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết đơn hàng", description = "Xem chi tiết đơn hàng kèm 3 nhóm chi phí, lịch sử phiên bản báo giá, bảng kê vật tư, trạng thái thanh toán và nhật ký.")
    public ResponseEntity<CustomerOrderDetailResponse> getOrderDetail(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID id
    ) {
        validatePrincipal(principal);
        CustomerOrderDetailResponse response = customerOrderService.getOrderDetail(principal.getId(), id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/dispatch")
    @Operation(summary = "Gửi thêm yêu cầu báo giá tới các thợ", description = "Gửi lời mời báo giá cho đơn hàng tới thêm danh sách các thợ khác.")
    public ResponseEntity<Void> dispatchRequests(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID id,
        @Valid @RequestBody DispatchOrderRequestsDto request
    ) {
        validatePrincipal(principal);
        customerOrderService.dispatchRequests(principal.getId(), id, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/requests/{requestId}/accept")
    @Operation(summary = "Chọn thợ & Xác nhận khảo sát / Gói cố định", description = "Khách chọn 1 thợ: xác nhận mức phí khảo sát, phí di chuyển (chuyển sang AWAITING_SURVEY) hoặc vào thẳng IN_PROGRESS nếu là gói giá cố định cam kết.")
    public ResponseEntity<Void> acceptQuotation(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID requestId
    ) {
        validatePrincipal(principal);
        customerOrderService.acceptQuotation(principal.getId(), requestId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/approve-quote")
    @Operation(summary = "Đồng ý Báo giá cuối sau khảo sát hoặc Duyệt phát sinh", description = "Khách xác nhận đồng ý mức giá cuối cùng sau khảo sát (chuyển đơn sang IN_PROGRESS) hoặc duyệt yêu cầu phát sinh vật tư/công việc.")
    public ResponseEntity<CustomerOrderDetailResponse> approveLatestQuote(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID id
    ) {
        validatePrincipal(principal);
        CustomerOrderDetailResponse response = customerOrderService.approveLatestQuoteVersion(principal.getId(), id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/reject-change")
    @Operation(summary = "Từ chối khoản phát sinh trong khi sửa", description = "Khách từ chối yêu cầu điều chỉnh phát sinh của thợ, giữ nguyên báo giá đã duyệt trước đó.")
    public ResponseEntity<CustomerOrderDetailResponse> rejectChangeRequest(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID id,
        @RequestBody(required = false) CancelOrderDto reasonDto
    ) {
        validatePrincipal(principal);
        String reason = reasonDto != null ? reasonDto.reason() : null;
        CustomerOrderDetailResponse response = customerOrderService.rejectChangeRequest(principal.getId(), id, reason);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/decline-after-survey")
    @Operation(summary = "Từ chối sửa sau khi khảo sát", description = "Khách không đồng ý sửa sau khi thợ khảo sát: đơn chuyển sang DECLINED_AFTER_SURVEY, chỉ tính phí khảo sát và phí di chuyển theo thỏa thuận.")
    public ResponseEntity<CustomerOrderDetailResponse> declineAfterSurvey(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID id,
        @RequestBody(required = false) CancelOrderDto reasonDto
    ) {
        validatePrincipal(principal);
        String reason = reasonDto != null ? reasonDto.reason() : null;
        CustomerOrderDetailResponse response = customerOrderService.declineAfterSurvey(principal.getId(), id, reason);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/pay-cash")
    @Operation(summary = "Khai báo thanh toán tiền mặt (Bước 1)", description = "Khách khai báo số tiền mặt thực tế đã đưa cho thợ, chuyển trạng thái thanh toán sang CASH_PENDING_CONFIRMATION chờ thợ xác nhận.")
    public ResponseEntity<CustomerOrderDetailResponse> declareCashPayment(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID id,
        @Valid @RequestBody DeclareCashPaymentRequest request
    ) {
        validatePrincipal(principal);
        CustomerOrderDetailResponse response = customerOrderService.declareCashPayment(principal.getId(), id, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/pay-online/init")
    @Operation(summary = "Khởi tạo giao dịch thanh toán Online", description = "Tạo giao dịch thanh toán trực tuyến với mã đơn và số tiền hóa đơn chính xác.")
    public ResponseEntity<OnlinePaymentInitResponse> initOnlinePayment(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID id
    ) {
        validatePrincipal(principal);
        OnlinePaymentInitResponse response = customerOrderService.initOnlinePayment(principal.getId(), id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/pay-online/confirm")
    @Operation(summary = "Xác nhận kết quả thanh toán Online (Mock Gateway Callback)", description = "Xác nhận kết quả thanh toán từ cổng thanh toán, chuyển trạng thái sang PAID_ONLINE và hoàn tất đơn hàng.")
    public ResponseEntity<CustomerOrderDetailResponse> confirmOnlinePayment(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID id,
        @Valid @RequestBody ConfirmOnlinePaymentRequest request
    ) {
        validatePrincipal(principal);
        CustomerOrderDetailResponse response = customerOrderService.confirmOnlinePayment(principal.getId(), id, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Hủy đơn hàng", description = "Khách hàng hủy đơn hàng khi chưa chọn thợ (PENDING_PROVIDER). Không cho phép tự hủy khi thợ đang chuẩn bị đến (AWAITING_SURVEY) hoặc đang sửa (IN_PROGRESS).")
    public ResponseEntity<Void> cancelOrder(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID id,
        @RequestBody(required = false) CancelOrderDto cancelDto
    ) {
        validatePrincipal(principal);
        String reason = cancelDto != null ? cancelDto.reason() : null;
        customerOrderService.cancelOrder(principal.getId(), id, reason);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/notify-cancel")
    @Operation(summary = "Gửi thông báo yêu cầu dời hẹn / hủy đơn tới thợ (Phương án A)", description = "Khi thợ đang trên đường đến (AWAITING_SURVEY) hoặc đang xử lý, khách gửi thông báo yêu cầu dời lịch / hủy đơn kèm lý do để thợ chủ động liên hệ trao đổi.")
    public ResponseEntity<CustomerOrderDetailResponse> notifyCancelRequest(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID id,
        @RequestBody(required = false) CancelOrderDto reasonDto
    ) {
        validatePrincipal(principal);
        String reason = reasonDto != null ? reasonDto.reason() : null;
        CustomerOrderDetailResponse response = customerOrderService.notifyCancelRequest(principal.getId(), id, reason);
        return ResponseEntity.ok(response);
    }

    private void validatePrincipal(UserPrincipal principal) {
        if (principal == null || principal.getId() == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ hoặc đã hết hạn");
        }
    }
}
