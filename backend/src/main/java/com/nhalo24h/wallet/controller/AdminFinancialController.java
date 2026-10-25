package com.nhalo24h.wallet.controller;

import com.nhalo24h.auth.security.UserPrincipal;
import com.nhalo24h.common.error.AppException;
import com.nhalo24h.common.error.ErrorCode;
import com.nhalo24h.user.domain.User;
import com.nhalo24h.user.repository.UserRepository;
import com.nhalo24h.wallet.dto.AdminDisputePenaltyRequestDto;
import com.nhalo24h.wallet.dto.AdminReviewPayoutRequestDto;
import com.nhalo24h.wallet.dto.AdminTopupDepositRequestDto;
import com.nhalo24h.wallet.dto.FinancialDashboardSummaryResponse;
import com.nhalo24h.wallet.dto.PayoutRequestResponse;
import com.nhalo24h.wallet.dto.ProviderWalletResponse;
import com.nhalo24h.wallet.service.WalletService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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
@RequestMapping("/api/v1/admin/financial")
@Tag(name = "Admin Financial", description = "Trung tâm quản trị tài chính, đối soát doanh thu và duyệt lệnh rút tiền")
@PreAuthorize("hasRole('ADMIN')")
public class AdminFinancialController {

    private final WalletService walletService;
    private final UserRepository userRepository;

    public AdminFinancialController(WalletService walletService, UserRepository userRepository) {
        this.walletService = walletService;
        this.userRepository = userRepository;
    }

    private User getAdminUser(UserPrincipal principal) {
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy người dùng quản trị"));
    }

    @GetMapping("/summary")
    @Operation(summary = "Xem tổng quan chỉ số tài chính (GMV, Doanh thu sàn, Quỹ ký quỹ, Lệnh rút chờ duyệt)")
    public ResponseEntity<FinancialDashboardSummaryResponse> getSummary() {
        return ResponseEntity.ok(walletService.getFinancialSummary());
    }

    @GetMapping("/payouts")
    @Operation(summary = "Xem danh sách toàn bộ các yêu cầu rút tiền của thợ")
    public ResponseEntity<Page<PayoutRequestResponse>> getAllPayoutRequests(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(walletService.getAllPayoutRequests(pageable));
    }

    @PostMapping("/payouts/{id}/review")
    @Operation(summary = "Admin duyệt hoặc từ chối lệnh rút tiền của thợ")
    public ResponseEntity<PayoutRequestResponse> reviewPayout(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody AdminReviewPayoutRequestDto dto) {
        return ResponseEntity.ok(walletService.adminReviewPayout(id, dto, getAdminUser(principal)));
    }

    @GetMapping("/providers/{providerId}/wallet")
    @Operation(summary = "Xem chi tiết ví và số dư của một thợ cụ thể")
    public ResponseEntity<ProviderWalletResponse> getProviderWallet(@PathVariable UUID providerId) {
        return ResponseEntity.ok(walletService.getWalletSummary(providerId));
    }

    @PostMapping("/providers/{providerId}/topup-deposit")
    @Operation(summary = "Admin ghi nhận nạp bù tiền ký quỹ cho thợ khi thợ nộp tiền bên ngoài")
    public ResponseEntity<ProviderWalletResponse> topupDeposit(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID providerId,
            @Valid @RequestBody AdminTopupDepositRequestDto dto) {
        return ResponseEntity.ok(walletService.adminTopupDeposit(providerId, dto, getAdminUser(principal)));
    }

    @PostMapping("/providers/{providerId}/dispute-penalty")
    @Operation(summary = "Admin trích phạt tiền ký quỹ của thợ để bồi thường bảo hành cho khách")
    public ResponseEntity<ProviderWalletResponse> deductDisputePenalty(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID providerId,
            @Valid @RequestBody AdminDisputePenaltyRequestDto dto) {
        return ResponseEntity.ok(walletService.adminDeductDisputePenalty(providerId, dto, getAdminUser(principal)));
    }
}
