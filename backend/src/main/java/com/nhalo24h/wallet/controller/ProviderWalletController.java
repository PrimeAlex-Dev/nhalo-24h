package com.nhalo24h.wallet.controller;

import com.nhalo24h.auth.security.UserPrincipal;
import com.nhalo24h.user.domain.User;
import com.nhalo24h.wallet.dto.TopupDepositFromAvailableRequestDto;
import com.nhalo24h.wallet.dto.TopupDepositVietQrRequestDto;
import com.nhalo24h.wallet.dto.CreatePayoutRequestDto;
import com.nhalo24h.wallet.dto.PayoutRequestResponse;
import com.nhalo24h.wallet.dto.ProviderWalletResponse;
import com.nhalo24h.wallet.dto.RequestDepositRefundDto;
import com.nhalo24h.wallet.dto.WalletTransactionResponse;
import com.nhalo24h.wallet.service.WalletService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/provider/wallet")
@Tag(name = "Provider Wallet", description = "Quản lý ví, lịch sử thu nhập và yêu cầu rút tiền cho Thợ")
@PreAuthorize("hasRole('PROVIDER')")
public class ProviderWalletController {

    private final WalletService walletService;

    public ProviderWalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping
    @Operation(summary = "Xem tổng quan ví thợ (Số dư khả dụng & Số dư ký quỹ)")
    public ResponseEntity<ProviderWalletResponse> getMyWallet(@AuthenticationPrincipal UserPrincipal principal) {
        var wallet = walletService.getWalletByProviderUserId(principal.getId());
        return ResponseEntity.ok(ProviderWalletResponse.from(wallet));
    }

    @GetMapping("/transactions")
    @Operation(summary = "Xem lịch sử giao dịch biến động số dư ví")
    public ResponseEntity<Page<WalletTransactionResponse>> getMyTransactions(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(size = 20) Pageable pageable) {
        var wallet = walletService.getWalletByProviderUserId(principal.getId());
        return ResponseEntity.ok(walletService.getTransactions(wallet.getProviderProfile().getId(), pageable));
    }

    @PostMapping("/payouts")
    @Operation(summary = "Yêu cầu rút tiền thu nhập khả dụng về tài khoản ngân hàng")
    public ResponseEntity<PayoutRequestResponse> requestPayout(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreatePayoutRequestDto dto) {
        var wallet = walletService.getWalletByProviderUserId(principal.getId());
        return ResponseEntity.ok(walletService.createAvailablePayoutRequest(wallet.getProviderProfile().getId(), dto));
    }

    @GetMapping("/payouts")
    @Operation(summary = "Xem danh sách các lệnh rút tiền của tôi")
    public ResponseEntity<Page<PayoutRequestResponse>> getMyPayoutRequests(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(size = 20) Pageable pageable) {
        var wallet = walletService.getWalletByProviderUserId(principal.getId());
        return ResponseEntity.ok(walletService.getProviderPayoutRequests(wallet.getProviderProfile().getId(), pageable));
    }

    @PostMapping("/deposit-refund")
    @Operation(summary = "Yêu cầu rút tiền ký quỹ rời sàn (Áp dụng thời gian đóng băng 20 ngày)")
    public ResponseEntity<PayoutRequestResponse> requestDepositRefund(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody RequestDepositRefundDto dto) {
        var wallet = walletService.getWalletByProviderUserId(principal.getId());
        return ResponseEntity.ok(walletService.requestDepositRefund(wallet.getProviderProfile().getId(), dto));
    }

    @PostMapping("/topup-deposit-from-available")
    @Operation(summary = "Trích số dư thu nhập khả dụng nạp bù Quỹ Ký Quỹ 2.000.000đ")
    public ResponseEntity<ProviderWalletResponse> topupDepositFromAvailable(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody TopupDepositFromAvailableRequestDto dto) {
        var wallet = walletService.getWalletByProviderUserId(principal.getId());
        User user = new User();
        user.setId(principal.getId());
        return ResponseEntity.ok(walletService.topupDepositFromAvailable(wallet.getProviderProfile().getId(), dto, user));
    }

    @PostMapping("/topup-deposit-vietqr-demo")
    @Operation(summary = "Xác nhận nạp bù Quỹ Ký Quỹ qua chuyển khoản VietQR MBBank")
    public ResponseEntity<ProviderWalletResponse> topupDepositVietQrDemo(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody TopupDepositVietQrRequestDto dto) {
        var wallet = walletService.getWalletByProviderUserId(principal.getId());
        User user = new User();
        user.setId(principal.getId());
        return ResponseEntity.ok(walletService.topupDepositVietQrDemo(wallet.getProviderProfile().getId(), dto, user));
    }
}
