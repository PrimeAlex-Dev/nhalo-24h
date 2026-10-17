package com.nhalo24h.user.controller;

import com.nhalo24h.auth.security.UserPrincipal;
import com.nhalo24h.common.error.AppException;
import com.nhalo24h.common.error.ErrorCode;
import com.nhalo24h.user.dto.CustomerProfileResponse;
import com.nhalo24h.user.dto.UpdateCustomerProfileRequest;
import com.nhalo24h.user.service.CustomerProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/customer/profile")
@PreAuthorize("hasRole('CUSTOMER')")
@Tag(name = "Customer Profile", description = "Các API dành cho khách hàng: Xem và cập nhật hồ sơ cá nhân")
public class CustomerProfileController {

    private final CustomerProfileService customerProfileService;

    public CustomerProfileController(CustomerProfileService customerProfileService) {
        this.customerProfileService = customerProfileService;
    }

    @GetMapping
    @Operation(summary = "Xem hồ sơ khách hàng", description = "Lấy thông tin cá nhân của khách hàng đang đăng nhập từ access token.")
    public ResponseEntity<CustomerProfileResponse> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Bạn chưa đăng nhập hoặc phiên làm việc đã kết thúc");
        }
        CustomerProfileResponse response = customerProfileService.getProfile(principal.getId());
        return ResponseEntity.ok(response);
    }

    @PatchMapping
    @Operation(summary = "Cập nhật hồ sơ khách hàng", description = "Cập nhật họ tên, giới tính và địa chỉ của khách hàng đang đăng nhập.")
    public ResponseEntity<CustomerProfileResponse> updateProfile(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody UpdateCustomerProfileRequest request
    ) {
        if (principal == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Bạn chưa đăng nhập hoặc phiên làm việc đã kết thúc");
        }
        CustomerProfileResponse response = customerProfileService.updateProfile(principal.getId(), request);
        return ResponseEntity.ok(response);
    }
}
