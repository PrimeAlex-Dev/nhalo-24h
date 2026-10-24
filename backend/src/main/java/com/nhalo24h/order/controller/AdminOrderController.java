package com.nhalo24h.order.controller;

import com.nhalo24h.auth.security.UserPrincipal;
import com.nhalo24h.order.domain.OrderStatus;
import com.nhalo24h.order.domain.PaymentStatus;
import com.nhalo24h.order.dto.AdjustInvoiceRequest;
import com.nhalo24h.order.dto.AdminOrderSummaryResponse;
import com.nhalo24h.order.dto.CustomerOrderDetailResponse;
import com.nhalo24h.order.dto.DismissAbnormalFlagRequest;
import com.nhalo24h.order.dto.ResolveDisputeRequest;
import com.nhalo24h.order.service.AdminOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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
@RequestMapping("/api/v1/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Orders", description = "Các API phục vụ quản trị, giám sát đối soát hoa hồng và xử lý tranh chấp đơn hàng toàn hệ thống (Yêu cầu quyền ADMIN)")
public class AdminOrderController {

    private final AdminOrderService adminOrderService;

    public AdminOrderController(AdminOrderService adminOrderService) {
        this.adminOrderService = adminOrderService;
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách đơn hàng toàn hệ thống", description = "Quản trị viên xem danh sách toàn bộ đơn hàng, hỗ trợ lọc theo trạng thái công việc, trạng thái thanh toán, cờ bất thường, danh mục, tìm kiếm và phân trang.")
    public ResponseEntity<Page<AdminOrderSummaryResponse>> getOrders(
        @Parameter(description = "Lọc theo trạng thái công việc")
        @RequestParam(required = false) OrderStatus status,

        @Parameter(description = "Lọc theo trạng thái thanh toán")
        @RequestParam(required = false) PaymentStatus paymentStatus,

        @Parameter(description = "Chỉ hiển thị các đơn có cờ cảnh báo bất thường")
        @RequestParam(required = false) Boolean flaggedOnly,

        @Parameter(description = "Lọc theo ID danh mục dịch vụ")
        @RequestParam(required = false) UUID categoryId,

        @Parameter(description = "Từ khóa tìm kiếm theo mã đơn, tiêu đề, tên khách, SĐT hoặc địa chỉ")
        @RequestParam(required = false) String search,

        @ParameterObject @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<AdminOrderSummaryResponse> response = adminOrderService.getOrders(status, paymentStatus, flaggedOnly, categoryId, search, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết đơn hàng", description = "Xem chi tiết đầy đủ một đơn hàng kèm 3 nhóm chi phí, lịch sử phiên bản báo giá, hoa hồng và nhật ký hành động.")
    public ResponseEntity<CustomerOrderDetailResponse> getOrderDetail(@PathVariable UUID id) {
        CustomerOrderDetailResponse response = adminOrderService.getOrderDetail(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/resolve-payment")
    @Operation(summary = "Xử lý tranh chấp thanh toán tiền mặt & Chốt hoa hồng", description = "Quản trị viên xác minh tiền công, vật tư và tổng tiền thực thanh toán để giải quyết đơn tranh chấp tiền mặt (PAYMENT_DISPUTED).")
    public ResponseEntity<CustomerOrderDetailResponse> resolvePaymentDispute(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID id,
        @Valid @RequestBody ResolveDisputeRequest request
    ) {
        UUID adminId = principal != null ? principal.getId() : null;
        CustomerOrderDetailResponse response = adminOrderService.resolvePaymentDispute(adminId, id, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/adjust-invoice")
    @Operation(summary = "Điều chỉnh hóa đơn hòa giải (Trước thanh toán)", description = "Quản trị viên cập nhật lại tiền công, vật tư theo thỏa thuận hòa giải khi khách chưa thanh toán. Trạng thái giữ nguyên để khách tự bấm thanh toán.")
    public ResponseEntity<CustomerOrderDetailResponse> adjustInvoice(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID id,
        @Valid @RequestBody AdjustInvoiceRequest request
    ) {
        UUID adminId = principal != null ? principal.getId() : null;
        CustomerOrderDetailResponse response = adminOrderService.adjustInvoice(adminId, id, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/dismiss-abnormal-flag")
    @Operation(summary = "Gỡ bỏ cờ cảnh báo bất thường", description = "Quản trị viên xác nhận thông tin giải trình của thợ là hợp lý và gỡ cờ cảnh báo bất thường mà không đổi trạng thái đơn.")
    public ResponseEntity<CustomerOrderDetailResponse> dismissAbnormalFlag(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID id,
        @Valid @RequestBody DismissAbnormalFlagRequest request
    ) {
        UUID adminId = principal != null ? principal.getId() : null;
        CustomerOrderDetailResponse response = adminOrderService.dismissAbnormalFlag(adminId, id, request);
        return ResponseEntity.ok(response);
    }
}
