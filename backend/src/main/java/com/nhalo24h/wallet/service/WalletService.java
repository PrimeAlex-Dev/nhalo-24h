package com.nhalo24h.wallet.service;

import com.nhalo24h.common.error.AppException;
import com.nhalo24h.common.error.ErrorCode;
import com.nhalo24h.order.domain.Order;
import com.nhalo24h.order.domain.OrderStatus;
import com.nhalo24h.order.repository.OrderRepository;
import com.nhalo24h.provider.domain.ProviderProfile;
import com.nhalo24h.provider.repository.ProviderProfileRepository;
import com.nhalo24h.user.domain.User;
import com.nhalo24h.wallet.domain.PayoutRequest;
import com.nhalo24h.wallet.domain.PayoutStatus;
import com.nhalo24h.wallet.domain.PlatformFinancialRecord;
import com.nhalo24h.wallet.domain.ProviderWallet;
import com.nhalo24h.wallet.domain.WalletBalanceType;
import com.nhalo24h.wallet.domain.WalletStatus;
import com.nhalo24h.wallet.domain.WalletTransaction;
import com.nhalo24h.wallet.domain.WalletTransactionType;
import com.nhalo24h.wallet.dto.AdminDisputePenaltyRequestDto;
import com.nhalo24h.wallet.dto.AdminReviewPayoutRequestDto;
import com.nhalo24h.wallet.dto.AdminTopupDepositRequestDto;
import com.nhalo24h.wallet.dto.CreatePayoutRequestDto;
import com.nhalo24h.wallet.dto.FinancialDashboardSummaryResponse;
import com.nhalo24h.wallet.dto.PayoutRequestResponse;
import com.nhalo24h.wallet.dto.ProviderWalletResponse;
import com.nhalo24h.wallet.dto.RequestDepositRefundDto;
import com.nhalo24h.wallet.dto.TopupDepositFromAvailableRequestDto;
import com.nhalo24h.wallet.dto.TopupDepositVietQrRequestDto;
import com.nhalo24h.wallet.dto.WalletTransactionResponse;
import com.nhalo24h.wallet.repository.PayoutRequestRepository;
import com.nhalo24h.wallet.repository.PlatformFinancialRecordRepository;
import com.nhalo24h.wallet.repository.ProviderWalletRepository;
import com.nhalo24h.wallet.repository.WalletTransactionRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WalletService {

    private static final Logger log = LoggerFactory.getLogger(WalletService.class);
    public static final int COOLING_PERIOD_DAYS = 20;

    private static final Set<OrderStatus> ACTIVE_ORDER_STATUSES = Set.of(
            OrderStatus.AWAITING_SURVEY,
            OrderStatus.AWAITING_CUSTOMER_APPROVAL,
            OrderStatus.IN_PROGRESS,
            OrderStatus.AWAITING_COMPLETION_CONFIRMATION
    );

    private final ProviderWalletRepository walletRepository;
    private final WalletTransactionRepository transactionRepository;
    private final PayoutRequestRepository payoutRequestRepository;
    private final PlatformFinancialRecordRepository financialRecordRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final OrderRepository orderRepository;

    public WalletService(
            ProviderWalletRepository walletRepository,
            WalletTransactionRepository transactionRepository,
            PayoutRequestRepository payoutRequestRepository,
            PlatformFinancialRecordRepository financialRecordRepository,
            ProviderProfileRepository providerProfileRepository,
            OrderRepository orderRepository) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.payoutRequestRepository = payoutRequestRepository;
        this.financialRecordRepository = financialRecordRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.orderRepository = orderRepository;
    }

    /**
     * Lấy hoặc tự động khởi tạo ví với ký quỹ mặc định 2 triệu nếu chưa có.
     */
    @Transactional
    public ProviderWallet getOrCreateWallet(UUID providerProfileId) {
        return walletRepository.findByProviderProfileId(providerProfileId).orElseGet(() -> {
            ProviderProfile profile = providerProfileRepository.findById(providerProfileId)
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hồ sơ thợ: " + providerProfileId));

            ProviderWallet newWallet = new ProviderWallet(profile, ProviderWallet.DEFAULT_DEPOSIT_TARGET);
            newWallet = walletRepository.save(newWallet);

            WalletTransaction initTx = new WalletTransaction(
                    newWallet,
                    WalletBalanceType.DEPOSIT,
                    ProviderWallet.DEFAULT_DEPOSIT_TARGET,
                    0L,
                    ProviderWallet.DEFAULT_DEPOSIT_TARGET,
                    WalletTransactionType.ADMIN_INITIAL_DEPOSIT,
                    null,
                    "ADMIN_SYSTEM",
                    "Cấp quỹ ký quỹ bảo hành ban đầu 2.000.000đ khi duyệt thợ"
            );
            transactionRepository.save(initTx);
            log.info("Khởi tạo ví mới và cấp ký quỹ 2.000.000đ cho thợ ID: {}", providerProfileId);
            return newWallet;
        });
    }

    @Transactional(readOnly = true)
    public boolean isProviderEligibleToAcceptOrders(UUID providerProfileId) {
        return walletRepository.findByProviderProfileId(providerProfileId)
                .map(ProviderWallet::isEligibleToAcceptOrders)
                .orElse(true);
    }

    @Transactional(readOnly = true)
    public void validateProviderCanAcceptOrders(UUID providerProfileId) {
        walletRepository.findByProviderProfileId(providerProfileId).ifPresent(wallet -> {
            if (!wallet.isEligibleToAcceptOrders()) {
                if (wallet.getStatus() == WalletStatus.FROZEN_COOLING) {
                    throw new AppException(ErrorCode.CONFLICT,
                            "Bạn đang trong thời hạn 20 ngày chờ rút ký quỹ rời sàn, hệ thống đã khóa nhận việc mới.");
                }
                if (wallet.getStatus() == WalletStatus.DEPOSIT_DEFICIT || wallet.getDepositBalance() < wallet.getDepositTarget()) {
                    throw new AppException(ErrorCode.CONFLICT,
                            "Số dư ký quỹ của bạn đang dưới định mức 2.000.000đ. Vui lòng liên hệ Admin nạp bù để tiếp tục nhận việc.");
                }
                throw new AppException(ErrorCode.CONFLICT, "Ví của bạn hiện đang bị khóa nhận đơn mới.");
            }
        });
    }

    @Transactional
    public ProviderWallet getWalletByProviderUserId(UUID userId) {
        ProviderProfile profile = providerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hồ sơ thợ cho người dùng: " + userId));
        return getOrCreateWallet(profile.getId());
    }

    @Transactional
    public ProviderWalletResponse getWalletSummary(UUID providerProfileId) {
        ProviderWallet wallet = getOrCreateWallet(providerProfileId);
        return ProviderWalletResponse.from(wallet);
    }

    @Transactional
    public Page<WalletTransactionResponse> getTransactions(UUID providerProfileId, Pageable pageable) {
        ProviderWallet wallet = getOrCreateWallet(providerProfileId);
        return transactionRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId(), pageable)
                .map(WalletTransactionResponse::from);
    }

    /**
     * Phân bổ dòng tiền khi đơn hàng hoàn tất:
     * - 10% tiền công -> Doanh thu sàn
     * - 90% tiền công + 100% tiền vật tư -> Ví thu nhập khả dụng của thợ
     */
    @Transactional
    public PlatformFinancialRecord processOrderRevenueDistribution(Order order) {
        if (order.getAssignedProvider() == null) {
            log.warn("Đơn hàng {} không có thợ được giao, bỏ qua phân bổ dòng tiền", order.getId());
            return null;
        }

        // Kiểm tra tính lũy đẳng (Idempotency)
        var existing = financialRecordRepository.findByOrderId(order.getId());
        if (existing.isPresent()) {
            log.info("Đơn hàng {} đã được phân bổ dòng tiền trước đó, bỏ qua", order.getId());
            return existing.get();
        }

        ProviderProfile provider = order.getAssignedProvider();
        ProviderWallet wallet = getOrCreateWallet(provider.getId());

        long laborFee = order.getFinalLaborFee() != null ? order.getFinalLaborFee() : 0L;
        long materialsFee = order.getFinalMaterialsFee() != null ? order.getFinalMaterialsFee() : 0L;
        long totalPaid = order.getFinalPrice() != null ? order.getFinalPrice() : (laborFee + materialsFee);

        BigDecimal commissionRate = order.getCommissionRateSnapshot() != null 
                ? order.getCommissionRateSnapshot() 
                : BigDecimal.valueOf(10.0);

        long platformCommission = Math.round(laborFee * (commissionRate.doubleValue() / 100.0));
        long providerLaborShare = Math.max(0L, laborFee - platformCommission);
        long providerTotalEarning = providerLaborShare + materialsFee;

        // Cập nhật doanh thu sàn vào order
        order.setCommissionAmount(platformCommission);
        orderRepository.save(order);

        // Tạo bản ghi tài chính sàn
        PlatformFinancialRecord finRecord = new PlatformFinancialRecord(
                order,
                totalPaid,
                laborFee,
                materialsFee,
                platformCommission,
                providerTotalEarning
        );
        finRecord = financialRecordRepository.save(finRecord);

        // Cộng vào số dư khả dụng của thợ
        long beforeAvail = wallet.getAvailableBalance();
        wallet.creditAvailable(providerTotalEarning);
        wallet.setLastCompletedOrderAt(Instant.now());
        walletRepository.save(wallet);

        // Ghi log giao dịch ví
        if (providerLaborShare > 0) {
            WalletTransaction laborTx = new WalletTransaction(
                    wallet,
                    WalletBalanceType.AVAILABLE,
                    providerLaborShare,
                    beforeAvail,
                    beforeAvail + providerLaborShare,
                    WalletTransactionType.ORDER_INCOME_LABOR,
                    order.getId().toString(),
                    "SYSTEM",
                    "Thu nhập công thợ (90% sau trừ 10% hoa hồng sàn) từ đơn #" + order.getOrderCode()
            );
            transactionRepository.save(laborTx);
            beforeAvail += providerLaborShare;
        }

        if (materialsFee > 0) {
            WalletTransaction matTx = new WalletTransaction(
                    wallet,
                    WalletBalanceType.AVAILABLE,
                    materialsFee,
                    beforeAvail,
                    beforeAvail + materialsFee,
                    WalletTransactionType.ORDER_INCOME_MATERIALS,
                    order.getId().toString(),
                    "SYSTEM",
                    "Hoàn lại 100% tiền vật tư/phát sinh từ đơn #" + order.getOrderCode()
            );
            transactionRepository.save(matTx);
        }

        log.info("Phân bổ đơn hàng {}: Khách trả {}, Hoa hồng sàn 10% công = {}, Thợ nhận = {}",
                order.getOrderCode(), totalPaid, platformCommission, providerTotalEarning);

        return finRecord;
    }

    /**
     * Thợ yêu cầu rút thu nhập khả dụng.
     */
    @Transactional
    public PayoutRequestResponse createAvailablePayoutRequest(UUID providerProfileId, CreatePayoutRequestDto dto) {
        ProviderWallet wallet = getOrCreateWallet(providerProfileId);

        if (wallet.getAvailableBalance() < dto.amount()) {
            throw new AppException(ErrorCode.INVALID_INPUT, 
                    "Số dư khả dụng hiện tại (" + wallet.getAvailableBalance() + "đ) không đủ để rút " + dto.amount() + "đ");
        }

        long beforeAvail = wallet.getAvailableBalance();
        wallet.debitAvailable(dto.amount());
        walletRepository.save(wallet);

        PayoutRequest payout = new PayoutRequest(
                wallet.getProviderProfile(),
                wallet,
                dto.amount(),
                WalletBalanceType.AVAILABLE,
                dto.bankCode(),
                dto.accountNumber(),
                dto.accountHolderName()
        );
        payout = payoutRequestRepository.save(payout);

        WalletTransaction tx = new WalletTransaction(
                wallet,
                WalletBalanceType.AVAILABLE,
                -dto.amount(),
                beforeAvail,
                wallet.getAvailableBalance(),
                WalletTransactionType.WITHDRAW_AVAILABLE,
                payout.getId().toString(),
                wallet.getProviderProfile().getUser().getId().toString(),
                "Yêu cầu rút tiền về ngân hàng " + dto.bankCode() + " - " + dto.accountNumber()
        );
        transactionRepository.save(tx);

        log.info("Thợ ID: {} tạo yêu cầu rút thu nhập: {}đ", providerProfileId, dto.amount());
        return PayoutRequestResponse.from(payout);
    }

    /**
     * Thợ yêu cầu rút ký quỹ rời sàn (Áp dụng thời gian đóng băng 20 ngày).
     */
    @Transactional
    public PayoutRequestResponse requestDepositRefund(UUID providerProfileId, RequestDepositRefundDto dto) {
        ProviderWallet wallet = getOrCreateWallet(providerProfileId);

        // 1. Kiểm tra đơn hàng đang thực hiện
        var activeOrders = orderRepository.findAllByAssignedProviderIdAndStatusInOrderByCreatedAtDesc(
                providerProfileId, ACTIVE_ORDER_STATUSES);
        if (!activeOrders.isEmpty()) {
            throw new AppException(ErrorCode.CONFLICT, 
                    "Bạn đang có " + activeOrders.size() + " đơn hàng đang thi công/chưa hoàn tất. Vui lòng hoàn thành trước khi yêu cầu rút cọc.");
        }

        if (wallet.getDepositBalance() <= 0) {
            throw new AppException(ErrorCode.INVALID_INPUT, "Số dư ký quỹ của bạn hiện bằng 0đ, không thể tạo yêu cầu rút.");
        }

        // 2. Tính toán ngày hết hạn đóng băng (20 ngày tính từ đơn hoàn thành cuối cùng)
        Instant baseTime = wallet.getLastCompletedOrderAt() != null ? wallet.getLastCompletedOrderAt() : wallet.getCreatedAt();
        Instant targetCooling = baseTime.plus(COOLING_PERIOD_DAYS, ChronoUnit.DAYS);
        Instant now = Instant.now();
        Instant coolingEndsAt = targetCooling.isAfter(now) ? targetCooling : now;

        wallet.setStatus(WalletStatus.FROZEN_COOLING);
        wallet.setCoolingEndsAt(coolingEndsAt);
        walletRepository.save(wallet);

        // Khóa nhận việc của thợ ngay lập tức trong thời gian 20 ngày bảo hành
        ProviderProfile profile = wallet.getProviderProfile();
        if (profile != null) {
            profile.setIsAvailable(false);
            providerProfileRepository.save(profile);
        }

        PayoutRequest payout = new PayoutRequest(
                wallet.getProviderProfile(),
                wallet,
                wallet.getDepositBalance(),
                WalletBalanceType.DEPOSIT,
                dto.bankCode(),
                dto.accountNumber(),
                dto.accountHolderName()
        );
        payout.setCoolingEndsAt(coolingEndsAt);
        payout.setAdminNote(dto.reason());
        payout = payoutRequestRepository.save(payout);

        log.info("Thợ ID: {} yêu cầu rút cọc rời sàn {}đ. Thời gian đóng băng đến: {}", 
                providerProfileId, wallet.getDepositBalance(), coolingEndsAt);
        return PayoutRequestResponse.from(payout);
    }

    /**
     * Admin duyệt hoặc từ chối lệnh rút tiền.
     */
    @Transactional
    public PayoutRequestResponse adminReviewPayout(UUID payoutRequestId, AdminReviewPayoutRequestDto dto, User adminUser) {
        PayoutRequest payout = payoutRequestRepository.findById(payoutRequestId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy yêu cầu rút tiền: " + payoutRequestId));

        if (payout.getStatus() == PayoutStatus.COMPLETED || payout.getStatus() == PayoutStatus.REJECTED) {
            throw new AppException(ErrorCode.CONFLICT, "Yêu cầu rút tiền này đã được xử lý trước đó");
        }

        ProviderWallet wallet = payout.getWallet();

        if ("REJECT".equalsIgnoreCase(dto.action())) {
            payout.setStatus(PayoutStatus.REJECTED);
            payout.setAdminNote(dto.adminNote());
            payout.setProcessedBy(adminUser);
            payout.setProcessedAt(Instant.now());

            if (payout.getSourceWalletType() == WalletBalanceType.AVAILABLE) {
                // Hoàn lại số dư khả dụng
                long before = wallet.getAvailableBalance();
                wallet.creditAvailable(payout.getAmount());
                walletRepository.save(wallet);

                WalletTransaction refundTx = new WalletTransaction(
                        wallet,
                        WalletBalanceType.AVAILABLE,
                        payout.getAmount(),
                        before,
                        wallet.getAvailableBalance(),
                        WalletTransactionType.ORDER_INCOME_LABOR, // Hoặc loại điều chỉnh hoàn tiền
                        payout.getId().toString(),
                        adminUser.getId().toString(),
                        "Hoàn lại tiền do Admin từ chối lệnh rút: " + dto.adminNote()
                );
                transactionRepository.save(refundTx);
            } else if (payout.getSourceWalletType() == WalletBalanceType.DEPOSIT) {
                // Mở lại trạng thái ví
                wallet.setStatus(wallet.getDepositBalance() >= wallet.getDepositTarget() ? WalletStatus.ACTIVE : WalletStatus.DEPOSIT_DEFICIT);
                wallet.setCoolingEndsAt(null);
                walletRepository.save(wallet);
            }
        } else if ("APPROVE".equalsIgnoreCase(dto.action())) {
            if (payout.getSourceWalletType() == WalletBalanceType.DEPOSIT) {
                // Kiểm tra đã hết thời hạn đóng băng 20 ngày chưa
                if (payout.getCoolingEndsAt() != null && Instant.now().isBefore(payout.getCoolingEndsAt())) {
                    throw new AppException(ErrorCode.CONFLICT, 
                            "Chưa hết thời hạn 20 ngày đóng băng bảo hành! Thời gian mở cọc dự kiến: " + payout.getCoolingEndsAt());
                }

                long before = wallet.getDepositBalance();
                wallet.debitDeposit(payout.getAmount());
                wallet.setStatus(WalletStatus.CLOSED);
                walletRepository.save(wallet);

                WalletTransaction refundTx = new WalletTransaction(
                        wallet,
                        WalletBalanceType.DEPOSIT,
                        -payout.getAmount(),
                        before,
                        wallet.getDepositBalance(),
                        WalletTransactionType.DEPOSIT_REFUND,
                        payout.getId().toString(),
                        adminUser.getId().toString(),
                        "Admin hoàn tất tất toán tiền cọc rời sàn: " + (dto.adminNote() != null ? dto.adminNote() : "")
                );
                transactionRepository.save(refundTx);
            }

            payout.setStatus(PayoutStatus.COMPLETED);
            payout.setAdminNote(dto.adminNote());
            payout.setProcessedBy(adminUser);
            payout.setProcessedAt(Instant.now());
        }

        payout = payoutRequestRepository.save(payout);
        return PayoutRequestResponse.from(payout);
    }

    /**
     * Admin ghi nhận thợ nộp bù tiền ký quỹ bên ngoài.
     */
    @Transactional
    public ProviderWalletResponse adminTopupDeposit(UUID providerProfileId, AdminTopupDepositRequestDto dto, User adminUser) {
        ProviderWallet wallet = getOrCreateWallet(providerProfileId);
        long before = wallet.getDepositBalance();

        wallet.creditDeposit(dto.amount());
        walletRepository.save(wallet);

        WalletTransaction tx = new WalletTransaction(
                wallet,
                WalletBalanceType.DEPOSIT,
                dto.amount(),
                before,
                wallet.getDepositBalance(),
                WalletTransactionType.ADMIN_TOPUP_DEPOSIT,
                null,
                adminUser.getId().toString(),
                "Admin ghi nhận nạp bù ký quỹ: " + (dto.note() != null ? dto.note() : "")
        );
        transactionRepository.save(tx);

        log.info("Admin {} nạp bù cọc {}đ cho thợ ID: {}", adminUser.getFullName(), dto.amount(), providerProfileId);
        return ProviderWalletResponse.from(wallet);
    }

    /**
     * Admin trích phạt ký quỹ để bồi thường bảo hành cho khách.
     */
    @Transactional
    public ProviderWalletResponse adminDeductDisputePenalty(UUID providerProfileId, AdminDisputePenaltyRequestDto dto, User adminUser) {
        ProviderWallet wallet = getOrCreateWallet(providerProfileId);
        long before = wallet.getDepositBalance();

        wallet.debitDeposit(dto.penaltyAmount());
        walletRepository.save(wallet);

        WalletTransaction tx = new WalletTransaction(
                wallet,
                WalletBalanceType.DEPOSIT,
                -dto.penaltyAmount(),
                before,
                wallet.getDepositBalance(),
                WalletTransactionType.DISPUTE_PENALTY,
                dto.disputeOrderId() != null ? dto.disputeOrderId().toString() : null,
                adminUser.getId().toString(),
                "Admin trích ký quỹ đền bù bảo hành: " + dto.reason()
        );
        transactionRepository.save(tx);

        log.warn("Admin {} trích cọc {}đ của thợ ID: {} do vi phạm bảo hành: {}", 
                adminUser.getFullName(), dto.penaltyAmount(), providerProfileId, dto.reason());
        return ProviderWalletResponse.from(wallet);
    }

    /**
     * Thống kê tổng quan tài chính cho Admin Dashboard.
     */
    @Transactional(readOnly = true)
    public FinancialDashboardSummaryResponse getFinancialSummary() {
        Long totalGmv = financialRecordRepository.sumTotalPaid();
        Long totalCommission = financialRecordRepository.sumPlatformCommission();
        Long totalEarnings = financialRecordRepository.sumProviderEarning();

        List<ProviderWallet> allWallets = walletRepository.findAll();
        long totalDeposit = allWallets.stream().mapToLong(ProviderWallet::getDepositBalance).sum();
        long activeCount = allWallets.stream().filter(w -> w.getStatus() == WalletStatus.ACTIVE).count();
        long deficitCount = allWallets.stream().filter(w -> w.getStatus() == WalletStatus.DEPOSIT_DEFICIT).count();

        List<PayoutRequest> pendingPayouts = payoutRequestRepository.findByStatus(PayoutStatus.PENDING);
        long totalPendingPayout = pendingPayouts.stream().mapToLong(PayoutRequest::getAmount).sum();

        return new FinancialDashboardSummaryResponse(
                totalGmv != null ? totalGmv : 0L,
                totalCommission != null ? totalCommission : 0L,
                totalEarnings != null ? totalEarnings : 0L,
                totalDeposit,
                totalPendingPayout,
                activeCount,
                deficitCount
        );
    }

    @Transactional(readOnly = true)
    public Page<PayoutRequestResponse> getAllPayoutRequests(Pageable pageable) {
        return payoutRequestRepository.findAllByOrderByCreatedAtDesc(pageable).map(PayoutRequestResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<PayoutRequestResponse> getProviderPayoutRequests(UUID providerProfileId, Pageable pageable) {
        return payoutRequestRepository.findByProviderProfileIdOrderByCreatedAtDesc(providerProfileId, pageable)
                .map(PayoutRequestResponse::from);
    }

    /**
     * Thợ trích từ số dư thu nhập khả dụng để nạp bù Quỹ Ký Quỹ 2.000.000đ.
     */
    @Transactional
    public ProviderWalletResponse topupDepositFromAvailable(UUID providerProfileId, TopupDepositFromAvailableRequestDto dto, User providerUser) {
        ProviderWallet wallet = getOrCreateWallet(providerProfileId);

        if (wallet.getAvailableBalance() < dto.amount()) {
            throw new AppException(ErrorCode.CONFLICT, 
                    "Số dư khả dụng không đủ để trích nạp bù ký quỹ (Số dư: " + wallet.getAvailableBalance() + "đ, Yêu cầu: " + dto.amount() + "đ)");
        }

        long beforeAvailable = wallet.getAvailableBalance();
        long beforeDeposit = wallet.getDepositBalance();

        wallet.debitAvailable(dto.amount());
        wallet.creditDeposit(dto.amount());
        walletRepository.save(wallet);

        // Ghi nhận 2 giao dịch: Trừ ví khả dụng & Cộng ví ký quỹ
        WalletTransaction debitTx = new WalletTransaction(
                wallet,
                WalletBalanceType.AVAILABLE,
                -dto.amount(),
                beforeAvailable,
                wallet.getAvailableBalance(),
                WalletTransactionType.WITHDRAW_AVAILABLE,
                null,
                providerUser.getId().toString(),
                "Trích số dư khả dụng nạp bù Quỹ Ký Quỹ bảo hành"
        );
        transactionRepository.save(debitTx);

        WalletTransaction creditTx = new WalletTransaction(
                wallet,
                WalletBalanceType.DEPOSIT,
                dto.amount(),
                beforeDeposit,
                wallet.getDepositBalance(),
                WalletTransactionType.TOPUP_DEPOSIT_FROM_AVAILABLE,
                null,
                providerUser.getId().toString(),
                "Nạp bù Quỹ Ký Quỹ từ Số dư khả dụng"
        );
        transactionRepository.save(creditTx);

        log.info("Thợ {} trích {}đ từ ví khả dụng sang bù ký quỹ. Số dư cọc hiện tại: {}đ", 
                providerUser.getFullName(), dto.amount(), wallet.getDepositBalance());
        return ProviderWalletResponse.from(wallet);
    }

    /**
     * Thợ nạp bù Quỹ Ký Quỹ qua VietQR Napas ngân hàng (Test Demo / Xác nhận giao dịch).
     */
    @Transactional
    public ProviderWalletResponse topupDepositVietQrDemo(UUID providerProfileId, TopupDepositVietQrRequestDto dto, User providerUser) {
        ProviderWallet wallet = getOrCreateWallet(providerProfileId);
        long beforeDeposit = wallet.getDepositBalance();

        wallet.creditDeposit(dto.amount());
        walletRepository.save(wallet);

        WalletTransaction tx = new WalletTransaction(
                wallet,
                WalletBalanceType.DEPOSIT,
                dto.amount(),
                beforeDeposit,
                wallet.getDepositBalance(),
                WalletTransactionType.TOPUP_DEPOSIT_VIETQR,
                null,
                providerUser.getId().toString(),
                "Nạp bù Quỹ Ký Quỹ qua VietQR Napas: " + (dto.note() != null ? dto.note() : "Chuyển khoản MBBank")
        );
        transactionRepository.save(tx);

        log.info("Thợ {} nạp bù cọc {}đ qua VietQR. Số dư cọc hiện tại: {}đ", 
                providerUser.getFullName(), dto.amount(), wallet.getDepositBalance());
        return ProviderWalletResponse.from(wallet);
    }

    /**
     * Admin hoàn lại tiền phạt cọc cho thợ khi xử lý nhầm hoặc hai bên hòa giải.
     */
    @Transactional
    public ProviderWalletResponse adminRefundDisputePenalty(UUID providerProfileId, Long amount, String reason, UUID orderId, User adminUser) {
        ProviderWallet wallet = getOrCreateWallet(providerProfileId);
        long beforeDeposit = wallet.getDepositBalance();

        wallet.creditDeposit(amount);
        walletRepository.save(wallet);

        WalletTransaction tx = new WalletTransaction(
                wallet,
                WalletBalanceType.DEPOSIT,
                amount,
                beforeDeposit,
                wallet.getDepositBalance(),
                WalletTransactionType.DISPUTE_PENALTY_REFUND,
                orderId != null ? orderId.toString() : null,
                adminUser.getId().toString(),
                "Admin hoàn lại tiền phạt cọc xử nhầm/hòa giải: " + (reason != null ? reason : "")
        );
        transactionRepository.save(tx);

        log.info("Admin {} hoàn cọc {}đ cho thợ ID: {}. Lý do: {}", 
                adminUser.getFullName(), amount, providerProfileId, reason);
        return ProviderWalletResponse.from(wallet);
    }
}
