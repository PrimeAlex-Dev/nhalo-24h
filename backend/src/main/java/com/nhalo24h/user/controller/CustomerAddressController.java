package com.nhalo24h.user.controller;

import com.nhalo24h.auth.security.UserPrincipal;
import com.nhalo24h.common.error.AppException;
import com.nhalo24h.common.error.ErrorCode;
import com.nhalo24h.user.dto.CreateCustomerAddressRequest;
import com.nhalo24h.user.dto.CustomerAddressResponse;
import com.nhalo24h.user.dto.UpdateCustomerAddressRequest;
import com.nhalo24h.user.service.CustomerAddressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/customer/addresses")
@PreAuthorize("hasRole('CUSTOMER')")
@Tag(name = "Customer Addresses", description = "Các API phục vụ quản lý sổ địa chỉ của khách hàng: Xem, Thêm, Sửa, Xóa, Đặt mặc định")
public class CustomerAddressController {

    private final CustomerAddressService customerAddressService;

    public CustomerAddressController(CustomerAddressService customerAddressService) {
        this.customerAddressService = customerAddressService;
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách địa chỉ", description = "Lấy toàn bộ danh sách địa chỉ trong sổ địa chỉ của khách hàng đang đăng nhập.")
    public ResponseEntity<List<CustomerAddressResponse>> getAddresses(@AuthenticationPrincipal UserPrincipal principal) {
        validatePrincipal(principal);
        List<CustomerAddressResponse> response = customerAddressService.getAddresses(principal.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Thêm địa chỉ mới", description = "Thêm một địa chỉ mới vào sổ địa chỉ của khách hàng.")
    public ResponseEntity<CustomerAddressResponse> createAddress(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody CreateCustomerAddressRequest request
    ) {
        validatePrincipal(principal);
        CustomerAddressResponse response = customerAddressService.createAddress(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật địa chỉ", description = "Cập nhật thông tin tên gợi nhớ, địa chỉ chi tiết hoặc trạng thái mặc định của địa chỉ.")
    public ResponseEntity<CustomerAddressResponse> updateAddress(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID id,
        @Valid @RequestBody UpdateCustomerAddressRequest request
    ) {
        validatePrincipal(principal);
        CustomerAddressResponse response = customerAddressService.updateAddress(principal.getId(), id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa địa chỉ", description = "Xóa một địa chỉ khỏi sổ địa chỉ của khách hàng.")
    public ResponseEntity<Void> deleteAddress(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID id
    ) {
        validatePrincipal(principal);
        customerAddressService.deleteAddress(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/default")
    @Operation(summary = "Đặt làm địa chỉ mặc định", description = "Chỉ định một địa chỉ làm địa chỉ mặc định ưu tiên của khách hàng.")
    public ResponseEntity<CustomerAddressResponse> setDefaultAddress(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID id
    ) {
        validatePrincipal(principal);
        CustomerAddressResponse response = customerAddressService.setDefaultAddress(principal.getId(), id);
        return ResponseEntity.ok(response);
    }

    private void validatePrincipal(UserPrincipal principal) {
        if (principal == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Bạn chưa đăng nhập hoặc phiên làm việc đã kết thúc");
        }
    }
}
