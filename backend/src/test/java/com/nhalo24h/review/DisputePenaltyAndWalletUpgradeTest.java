package com.nhalo24h.review;

import static org.junit.jupiter.api.Assertions.*;

import com.nhalo24h.common.error.AppException;
import com.nhalo24h.common.error.ErrorCode;
import com.nhalo24h.provider.domain.ProviderProfile;
import com.nhalo24h.provider.dto.UpdateProviderProfileRequest;
import com.nhalo24h.provider.repository.ProviderProfileRepository;
import com.nhalo24h.provider.service.ProviderProfileService;
import com.nhalo24h.report.domain.CompensationStatus;
import com.nhalo24h.report.domain.PenaltyType;
import com.nhalo24h.report.domain.ProviderReport;
import com.nhalo24h.report.domain.ReportReasonType;
import com.nhalo24h.report.domain.ReportStatus;
import com.nhalo24h.report.dto.ConfirmCompensationPayoutRequest;
import com.nhalo24h.report.dto.RefundPenaltyRequest;
import com.nhalo24h.report.dto.RevokeSuspensionRequest;
import com.nhalo24h.report.dto.ReportResponse;
import com.nhalo24h.report.dto.ResolveReportRequest;
import com.nhalo24h.report.repository.ProviderReportRepository;
import com.nhalo24h.report.service.ProviderReportService;
import com.nhalo24h.user.domain.User;
import com.nhalo24h.user.domain.UserRole;
import com.nhalo24h.user.domain.UserStatus;
import com.nhalo24h.user.repository.UserRepository;
import com.nhalo24h.wallet.domain.ProviderWallet;
import com.nhalo24h.wallet.domain.WalletStatus;
import com.nhalo24h.wallet.dto.TopupDepositFromAvailableRequestDto;
import com.nhalo24h.wallet.repository.ProviderWalletRepository;
import com.nhalo24h.wallet.service.WalletService;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class DisputePenaltyAndWalletUpgradeTest {

    @Autowired
    private ProviderReportService reportService;

    @Autowired
    private ProviderProfileService providerProfileService;

    @Autowired
    private WalletService walletService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProviderProfileRepository providerProfileRepository;

    @Autowired
    private ProviderWalletRepository walletRepository;

    @Autowired
    private ProviderReportRepository reportRepository;

    private User admin;
    private User customer;
    private User providerUser;
    private ProviderProfile providerProfile;
    private ProviderWallet wallet;

    @BeforeEach
    void setUp() {
        admin = new User("Admin Test", "admin_test@nhalo24h.com", "0901000001", UserRole.ADMIN);
        admin = userRepository.save(admin);

        customer = new User("Customer Test", "customer_test@nhalo24h.com", "0901000002", UserRole.CUSTOMER);
        customer = userRepository.save(customer);

        providerUser = new User("Provider Test", "provider_test@nhalo24h.com", "0901000003", UserRole.PROVIDER);
        providerUser = userRepository.save(providerUser);

        providerProfile = new ProviderProfile(providerUser);
        providerProfile.setIsAvailable(true);
        providerProfile = providerProfileRepository.save(providerProfile);

        wallet = walletService.getOrCreateWallet(providerProfile.getId());
    }

    @Test
    @DisplayName("Test 1: Cảnh cáo lần 3 tự động kích hoạt đình chỉ nhận việc 7 ngày")
    void testThreeStrikeRule() {
        ProviderReport r1 = createTestReport("RP-WARN-01");
        ProviderReport r2 = createTestReport("RP-WARN-02");
        ProviderReport r3 = createTestReport("RP-WARN-03");

        reportService.resolveReport(r1.getId(), new ResolveReportRequest(ReportStatus.RESOLVED, PenaltyType.WARNING, 0L, "Cảnh cáo 1"), admin);
        providerProfile = providerProfileRepository.findById(providerProfile.getId()).orElseThrow();
        assertEquals(1, providerProfile.getWarningCount());
        assertFalse(providerProfile.isSuspended());

        reportService.resolveReport(r2.getId(), new ResolveReportRequest(ReportStatus.RESOLVED, PenaltyType.WARNING, 0L, "Cảnh cáo 2"), admin);
        providerProfile = providerProfileRepository.findById(providerProfile.getId()).orElseThrow();
        assertEquals(2, providerProfile.getWarningCount());
        assertFalse(providerProfile.isSuspended());

        reportService.resolveReport(r3.getId(), new ResolveReportRequest(ReportStatus.RESOLVED, PenaltyType.WARNING, 0L, "Cảnh cáo 3"), admin);
        providerProfile = providerProfileRepository.findById(providerProfile.getId()).orElseThrow();
        // Chuẩn hóa: Đạt 3 lần cảnh cáo sẽ tự động đình chỉ 7 ngày và reset bộ đếm chu kỳ về 0
        assertEquals(0, providerProfile.getWarningCount());
        assertTrue(providerProfile.isSuspended());
        assertFalse(providerProfile.getIsAvailable());
    }

    @Test
    @DisplayName("Test 2: Thợ đang bị đình chỉ không thể tự ý gạt bật lại nhận việc")
    void testCannotToggleAvailableWhileSuspended() {
        ProviderReport r = createTestReport("RP-BAN-01");
        reportService.resolveReport(r.getId(), new ResolveReportRequest(
                ReportStatus.RESOLVED, PenaltyType.TEMPORARY_BAN, 0L, 7, 0L, null, null, null, "Đình chỉ 7 ngày"
        ), admin);

        providerProfile = providerProfileRepository.findById(providerProfile.getId()).orElseThrow();
        assertTrue(providerProfile.isSuspended());
        assertFalse(providerProfile.getIsAvailable());

        // Thử gạt bật lại isAvailable = true
        UpdateProviderProfileRequest req = new UpdateProviderProfileRequest(
                null, null, null, null, null, null, null, true, null
        );

        AppException ex = assertThrows(AppException.class, () -> {
            providerProfileService.updateProfile(providerUser.getId(), req);
        });

        assertEquals(ErrorCode.FORBIDDEN, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("đang bị đình chỉ"));
    }

    @Test
    @DisplayName("Test 3: Thợ trích ví thu nhập khả dụng nạp bù ký quỹ khi bị trừ cọc")
    void testTopupDepositFromAvailable() {
        // Giả sử ví khả dụng có 1.000.000đ
        wallet.creditAvailable(1000000L);
        // Bị phạt trừ cọc 500.000đ (cọc còn 1.500.000đ -> DEPOSIT_DEFICIT)
        wallet.debitDeposit(500000L);
        walletRepository.save(wallet);

        assertEquals(1500000L, wallet.getDepositBalance());
        assertEquals(WalletStatus.DEPOSIT_DEFICIT, wallet.getStatus());

        // Thợ bấm nạp bù 500.000đ từ ví thu nhập
        walletService.topupDepositFromAvailable(providerProfile.getId(), new TopupDepositFromAvailableRequestDto(500000L), providerUser);

        ProviderWallet updatedWallet = walletRepository.findById(wallet.getId()).orElseThrow();
        assertEquals(500000L, updatedWallet.getAvailableBalance());
        assertEquals(2000000L, updatedWallet.getDepositBalance());
        assertEquals(WalletStatus.ACTIVE, updatedWallet.getStatus());
    }

    @Test
    @DisplayName("Test 4: Admin hoàn lại tiền cọc đã trừ khi hòa giải hoặc xử oan")
    void testRefundDisputePenalty() {
        ProviderReport r = createTestReport("RP-DEDUCT-01");
        reportService.resolveReport(r.getId(), new ResolveReportRequest(
                ReportStatus.RESOLVED, PenaltyType.DEPOSIT_DEDUCTION, 400000L, 0, 0L, null, null, null, "Trừ cọc 400k"
        ), admin);

        ProviderWallet wAfter = walletRepository.findById(wallet.getId()).orElseThrow();
        assertEquals(1600000L, wAfter.getDepositBalance());
        assertEquals(WalletStatus.DEPOSIT_DEFICIT, wAfter.getStatus());

        // Admin hoàn cọc
        ReportResponse refunded = reportService.refundDisputePenalty(r.getId(), new RefundPenaltyRequest("Hai bên đã hòa giải, hoàn lại cọc"), admin);
        assertNotNull(refunded.refundedAt());
        assertEquals("Admin Test", refunded.refundedByName());

        ProviderWallet wRestored = walletRepository.findById(wallet.getId()).orElseThrow();
        assertEquals(2000000L, wRestored.getDepositBalance());
        assertEquals(WalletStatus.ACTIVE, wRestored.getStatus());
    }

    @Test
    @DisplayName("Test 5: Luồng bồi thường khách hàng và Admin xác nhận chuyển khoản")
    void testCustomerCompensationFlow() {
        ProviderReport r = createTestReport("RP-COMP-01");
        reportService.resolveReport(r.getId(), new ResolveReportRequest(
                ReportStatus.RESOLVED, PenaltyType.DEPOSIT_DEDUCTION, 600000L, 0, 600000L, "MB", "0786871062", "NGUYEN THANH HUY", "Trừ cọc 600k đền bù khách"
        ), admin);

        ProviderReport rAfter = reportRepository.findById(r.getId()).orElseThrow();
        assertEquals(CompensationStatus.PENDING_PAYOUT, rAfter.getCompensationStatus());
        assertEquals(600000L, rAfter.getCompensationAmount());
        assertEquals("0786871062", rAfter.getCustomerAccountNumber());

        // Admin xác nhận đã chuyển khoản đền bù
        ReportResponse completed = reportService.confirmCompensationPayout(
                r.getId(), new ConfirmCompensationPayoutRequest("MB_UNC_998877", "Đã chuyển khoản qua app MBBank"), admin
        );

        assertEquals(CompensationStatus.COMPLETED, completed.compensationStatus());
        assertEquals("MB_UNC_998877", completed.compensationPayoutRef());
        assertNotNull(completed.compensationPayoutAt());
    }

    private ProviderReport createTestReport(String code) {
        ProviderReport report = new ProviderReport(
                code, null, providerProfile, customer, ReportReasonType.POOR_QUALITY_OR_DAMAGE, "Tiêu đề test " + code, "Mô tả test"
        );
        return reportRepository.save(report);
    }

    @Test
    @DisplayName("Chuẩn hóa cảnh cáo: Đủ 3 lần cảnh cáo sẽ tự động đình chỉ 7 ngày và reset bộ đếm về 0")
    void testWarningStrikeThreeResetsCountAndBans() {
        providerProfile.setWarningCount(2);
        providerProfileRepository.save(providerProfile);

        ProviderReport r = createTestReport("RP-WARN-3");
        ResolveReportRequest req = new ResolveReportRequest(
                ReportStatus.RESOLVED,
                PenaltyType.WARNING,
                0L,
                null,
                0L,
                null,
                null,
                null,
                "Cảnh cáo lần thứ 3"
        );

        reportService.resolveReport(r.getId(), req, admin);

        ProviderProfile updated = providerProfileRepository.findById(providerProfile.getId()).orElseThrow();
        // Bộ đếm chu kỳ phải reset về 0 sau khi nhận đủ 3 gậy và chuyển thành đình chỉ 7 ngày
        assertEquals(0, updated.getWarningCount());
        assertNotNull(updated.getSuspendedUntil());
        assertTrue(updated.isSuspended());
        assertFalse(updated.getIsAvailable());
    }

    @Test
    @DisplayName("Admin gỡ đình chỉ / mở khóa tức thì: Xóa suspendedUntil, khôi phục trạng thái hoạt động")
    void testRevokeDisciplinaryActionRestoresProviderAndClearsSuspension() {
        ProviderReport r = createTestReport("RP-BAN-REVOKE");
        ResolveReportRequest banReq = new ResolveReportRequest(
                ReportStatus.RESOLVED,
                PenaltyType.TEMPORARY_BAN,
                0L,
                14,
                0L,
                null,
                null,
                null,
                "Đình chỉ 14 ngày do khách tố cáo"
        );

        reportService.resolveReport(r.getId(), banReq, admin);

        ProviderProfile suspendedProv = providerProfileRepository.findById(providerProfile.getId()).orElseThrow();
        assertTrue(suspendedProv.isSuspended());

        // Admin gỡ án phạt nhầm
        RevokeSuspensionRequest revokeReq = new RevokeSuspensionRequest("Hai bên đã thương lượng hòa giải thành công, mở khóa cho thợ");
        ReportResponse response = reportService.revokeDisciplinaryAction(r.getId(), revokeReq, admin);

        assertNotNull(response.suspensionLiftedAt());
        assertEquals("Admin Test", response.suspensionLiftedByName());
        assertEquals("Hai bên đã thương lượng hòa giải thành công, mở khóa cho thợ", response.suspensionLiftedReason());
        assertFalse(response.isSuspensionActive());

        ProviderProfile restoredProv = providerProfileRepository.findById(providerProfile.getId()).orElseThrow();
        assertNull(restoredProv.getSuspendedUntil());
        assertEquals(0, restoredProv.getWarningCount());
        assertTrue(restoredProv.getIsAvailable());
    }
}
