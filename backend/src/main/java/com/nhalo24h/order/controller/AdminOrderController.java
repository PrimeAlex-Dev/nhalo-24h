package com.nhalo24h.order.controller;

import com.nhalo24h.order.domain.OrderStatus;
import com.nhalo24h.order.dto.AdminOrderSummaryResponse;
import com.nhalo24h.order.dto.CustomerOrderDetailResponse;
import com.nhalo24h.order.service.AdminOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.UUID;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Orders", description = "Các API phục vụ quản trị và giám sát đơn hàng toàn hệ thống (Yêu cầu quyền ADMIN)")
public class AdminOrderController {

    private final AdminOrderService adminOrderService;

    public AdminOrderController(AdminOrderService adminOrderService) {
        this.adminOrderService = adminOrderService;
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách đơn hàng toàn hệ thống", description = "Quản trị viên xem danh sách toàn bộ đơn hàng, có hỗ trợ lọc theo trạng thái, danh mục, tìm kiếm và phân trang.")
    public ResponseEntity<Page<AdminOrderSummaryResponse>> getOrders(
        @Parameter(description = "Lọc theo trạng thái đơn (PENDING_PROVIDER, IN_PROGRESS, COMPLETED, CANCELED)")
        @RequestParam(required = false) OrderStatus status,

        @Parameter(description = "Lọc theo ID danh mục dịch vụ")
        @RequestParam(required = false) UUID categoryId,

        @Parameter(description = "Từ khóa tìm kiếm theo mã đơn, tiêu đề, tên khách, SĐT hoặc địa chỉ")
        @RequestParam(required = false) String search,

        @ParameterObject @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<AdminOrderSummaryResponse> response = adminOrderService.getOrders(status, categoryId, search, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết đơn hàng", description = "Xem chi tiết đầy đủ một đơn hàng kèm ảnh hiện trường và danh sách báo giá của các thợ.")
    public ResponseEntity<CustomerOrderDetailResponse> getOrderDetail(@PathVariable UUID id) {
        CustomerOrderDetailResponse response = adminOrderService.getOrderDetail(id);
        return ResponseEntity.ok(response);
    }
}
