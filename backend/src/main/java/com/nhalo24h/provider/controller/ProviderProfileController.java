package com.nhalo24h.provider.controller;

import com.nhalo24h.auth.security.UserPrincipal;
import com.nhalo24h.common.error.AppException;
import com.nhalo24h.common.error.ErrorCode;
import com.nhalo24h.provider.dto.ProviderProfileResponse;
import com.nhalo24h.provider.dto.UpdateProviderProfileRequest;
import com.nhalo24h.provider.service.ProviderProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/provider/profile")
@PreAuthorize("hasRole('PROVIDER')")
@Tag(name = "Provider Profile Management", description = "Các API dành cho thợ: Xem và cập nhật hồ sơ cá nhân & thông tin nghề nghiệp")
public class ProviderProfileController {

    private final ProviderProfileService providerProfileService;

    public ProviderProfileController(ProviderProfileService providerProfileService) {
        this.providerProfileService = providerProfileService;
    }

    @GetMapping("/me")
    @Operation(summary = "Xem hồ sơ thợ", description = "Lấy toàn bộ thông tin hồ sơ nghề nghiệp của thợ đang đăng nhập.")
    public ResponseEntity<ProviderProfileResponse> getMyProfile(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Bạn chưa đăng nhập hoặc phiên làm việc đã kết thúc");
        }
        ProviderProfileResponse response = providerProfileService.getProfile(principal.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    @Operation(summary = "Cập nhật hồ sơ thợ", description = "Cập nhật các thông tin cơ bản: Tiêu đề nghề nghiệp, bio, năm kinh nghiệm, đơn giá, khu vực và trạng thái nhận việc.")
    public ResponseEntity<ProviderProfileResponse> updateMyProfile(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody UpdateProviderProfileRequest request
    ) {
        if (principal == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Bạn chưa đăng nhập hoặc phiên làm việc đã kết thúc");
        }
        ProviderProfileResponse response = providerProfileService.updateProfile(principal.getId(), request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me/categories")
    @Operation(summary = "Cập nhật danh mục phụ trách", description = "Cập nhật danh sách các danh mục dịch vụ thợ nhận làm.")
    public ResponseEntity<ProviderProfileResponse> updateMyCategories(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestBody List<UUID> categoryIds
    ) {
        if (principal == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Bạn chưa đăng nhập hoặc phiên làm việc đã kết thúc");
        }
        ProviderProfileResponse response = providerProfileService.updateCategories(principal.getId(), categoryIds);
        return ResponseEntity.ok(response);
    }
}
