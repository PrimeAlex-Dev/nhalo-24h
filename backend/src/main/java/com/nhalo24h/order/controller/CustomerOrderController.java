package com.nhalo24h.order.controller;

import com.nhalo24h.auth.security.UserPrincipal;
import com.nhalo24h.common.error.AppException;
import com.nhalo24h.common.error.ErrorCode;
import com.nhalo24h.order.domain.OrderStatus;
import com.nhalo24h.order.dto.CancelOrderDto;
import com.nhalo24h.order.dto.CreateOrderRequest;
import com.nhalo24h.order.dto.CustomerOrderDetailResponse;
import com.nhalo24h.order.dto.CustomerOrderSummaryResponse;
import com.nhalo24h.order.dto.DispatchOrderRequestsDto;
import com.nhalo24h.order.service.CustomerOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
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
@Tag(name = "Customer Orders", description = "Các API tạo đơn hàng, quản lý đơn hàng và chọn thợ của khách hàng")
public class CustomerOrderController {

    private final CustomerOrderService customerOrderService;

    public CustomerOrderController(CustomerOrderService customerOrderService) {
        this.customerOrderService = customerOrderService;
    }

    @PostMapping
    @Operation(summary = "Tạo đơn hàng mới", description = "Khách hàng tạo đơn sửa chữa mới từ địa chỉ đã lưu trong sổ địa chỉ, đính kèm ảnh và tùy chọn gửi yêu cầu tới thợ ban đầu.")
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
    @Operation(summary = "Xem chi tiết đơn hàng", description = "Xem chi tiết một đơn hàng kèm danh sách toàn bộ báo giá nhận được từ các thợ.")
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
    @Operation(summary = "Chấp nhận báo giá (Chốt thợ)", description = "Khách chọn 1 báo giá ưng ý: hệ thống gán thợ vào đơn, chuyển đơn sang IN_PROGRESS và tự động hủy các báo giá khác.")
    public ResponseEntity<Void> acceptQuotation(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID requestId
    ) {
        validatePrincipal(principal);
        customerOrderService.acceptQuotation(principal.getId(), requestId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Hủy đơn hàng", description = "Khách hàng hủy đơn hàng khi chưa hoàn thành công việc.")
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

    private void validatePrincipal(UserPrincipal principal) {
        if (principal == null || principal.getId() == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ hoặc đã hết hạn");
        }
    }
}
