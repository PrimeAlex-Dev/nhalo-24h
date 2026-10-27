package com.nhalo24h.report.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhalo24h.common.error.AppException;
import com.nhalo24h.common.error.ErrorCode;
import com.nhalo24h.order.domain.Order;
import com.nhalo24h.order.repository.OrderRepository;
import com.nhalo24h.provider.domain.ProviderProfile;
import com.nhalo24h.provider.repository.ProviderProfileRepository;
import com.nhalo24h.report.domain.CompensationStatus;
import com.nhalo24h.report.domain.PenaltyType;
import com.nhalo24h.report.domain.ProviderReport;
import com.nhalo24h.report.domain.ReportStatus;
import com.nhalo24h.report.dto.ConfirmCompensationPayoutRequest;
import com.nhalo24h.report.dto.CreateReportRequest;
import com.nhalo24h.report.dto.RefundPenaltyRequest;
import com.nhalo24h.report.dto.RevokeSuspensionRequest;
import com.nhalo24h.report.dto.ReportResponse;
import com.nhalo24h.report.dto.ResolveReportRequest;
import com.nhalo24h.report.repository.ProviderReportRepository;
import com.nhalo24h.user.domain.User;
import com.nhalo24h.user.domain.UserStatus;
import com.nhalo24h.user.repository.UserRepository;
import com.nhalo24h.wallet.domain.WalletStatus;
import com.nhalo24h.wallet.dto.AdminDisputePenaltyRequestDto;
import com.nhalo24h.wallet.repository.ProviderWalletRepository;
import com.nhalo24h.wallet.service.WalletService;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProviderReportService {

    private static final Logger log = LoggerFactory.getLogger(ProviderReportService.class);
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final ProviderReportRepository reportRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;
    private final ProviderWalletRepository walletRepository;

    public ProviderReportService(ProviderReportRepository reportRepository,
                                 ProviderProfileRepository providerProfileRepository,
                                 OrderRepository orderRepository,
                                 UserRepository userRepository,
                                 WalletService walletService,
                                 ProviderWalletRepository walletRepository) {
        this.reportRepository = reportRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.walletService = walletService;
        this.walletRepository = walletRepository;
    }

    @Transactional
    public ReportResponse createReport(UUID customerUserId, CreateReportRequest request) {
        User reporter = userRepository.findById(customerUserId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy người dùng khiếu nại"));

        ProviderProfile provider = providerProfileRepository.findById(request.providerId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hồ sơ thợ"));

        Order order = null;
        if (request.orderId() != null) {
            order = orderRepository.findById(request.orderId()).orElse(null);
            if (order != null && !order.getCustomer().getId().equals(customerUserId)) {
                throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền báo cáo sự cố cho đơn hàng này");
            }
        }

        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomSuffix = String.format("%04d", ThreadLocalRandom.current().nextInt(1000, 10000));
        String reportCode = "RP-" + datePrefix + "-" + randomSuffix;

        ProviderReport report = new ProviderReport(
                reportCode,
                order,
                provider,
                reporter,
                request.reasonType(),
                request.title(),
                request.description()
        );
        report.setExpectedResolution(request.expectedResolution());
        report.setStatus(ReportStatus.PENDING);

        if (request.evidenceImages() != null && !request.evidenceImages().isEmpty()) {
            report.setEvidenceImages(serializeList(request.evidenceImages()));
        }

        ProviderReport saved = reportRepository.save(report);

        // Tăng đếm report_count của thợ
        provider.setReportCount((provider.getReportCount() != null ? provider.getReportCount() : 0) + 1);
        providerProfileRepository.save(provider);

        log.info("Khách hàng {} đã tạo khiếu nại {} đối với thợ {}", reporter.getFullName(), reportCode, provider.getId());
        return ReportResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public Page<ReportResponse> getCustomerReports(UUID customerUserId, Pageable pageable) {
        return reportRepository.findByReporterId(customerUserId, pageable)
                .map(ReportResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<ReportResponse> getProviderReports(UUID providerUserId, Pageable pageable) {
        ProviderProfile profile = providerProfileRepository.findByUserId(providerUserId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hồ sơ thợ"));
        return reportRepository.findByProviderId(profile.getId(), pageable)
                .map(ReportResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<ReportResponse> getAdminReports(ReportStatus status, String keyword, Pageable pageable) {
        Specification<ProviderReport> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (keyword != null && !keyword.isBlank()) {
                String pattern = "%" + keyword.trim().toLowerCase() + "%";
                Join<ProviderReport, User> reporterJoin = root.join("reporter", JoinType.LEFT);
                Join<ProviderReport, ProviderProfile> providerJoin = root.join("provider", JoinType.LEFT);
                Join<ProviderProfile, User> providerUserJoin = providerJoin.join("user", JoinType.LEFT);

                Predicate searchPred = cb.or(
                    cb.like(cb.lower(root.get("reportCode")), pattern),
                    cb.like(cb.lower(root.get("title")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern),
                    cb.like(cb.lower(reporterJoin.get("fullName")), pattern),
                    cb.like(cb.lower(providerUserJoin.get("fullName")), pattern)
                );
                predicates.add(searchPred);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return reportRepository.findAll(spec, pageable).map(ReportResponse::from);
    }

    @Transactional(readOnly = true)
    public ReportResponse getReportById(UUID reportId) {
        ProviderReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hồ sơ khiếu nại"));
        return ReportResponse.from(report);
    }

    @Transactional
    public ReportResponse resolveReport(UUID reportId, ResolveReportRequest request, User adminUser) {
        ProviderReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hồ sơ khiếu nại"));

        report.setStatus(request.status());
        report.setAdminNotes(request.adminNotes());
        report.setResolvedBy(adminUser);
        report.setResolvedAt(Instant.now());

        PenaltyType penaltyType = request.penaltyType() != null ? request.penaltyType() : PenaltyType.NONE;
        report.setPenaltyType(penaltyType);

        ProviderProfile profile = report.getProvider();

        // 1. Chế tài DEPOSIT_DEDUCTION: Trừ tiền Quỹ Ký Quỹ
        if (penaltyType == PenaltyType.DEPOSIT_DEDUCTION) {
            Long amount = request.penaltyAmount() != null ? request.penaltyAmount() : 0L;
            if (amount <= 0) {
                throw new AppException(ErrorCode.INVALID_INPUT, "Số tiền trừ cọc bồi thường phải lớn hơn 0");
            }
            report.setPenaltyAmount(amount);

            String reason = "Admin giải quyết khiếu nại " + report.getReportCode() + ": " +
                    (request.adminNotes() != null ? request.adminNotes() : "Bồi thường vi phạm cho khách");

            UUID orderId = report.getOrder() != null ? report.getOrder().getId() : null;
            walletService.adminDeductDisputePenalty(
                    profile.getId(),
                    new AdminDisputePenaltyRequestDto(amount, reason, orderId),
                    adminUser
            );

            // Bồi thường cho khách hàng nếu có cấu hình
            if (request.compensationAmount() != null && request.compensationAmount() > 0) {
                report.setCompensationAmount(request.compensationAmount());
                report.setCompensationStatus(CompensationStatus.PENDING_PAYOUT);
                report.setCustomerBankCode(request.customerBankCode());
                report.setCustomerAccountNumber(request.customerAccountNumber());
                report.setCustomerAccountHolder(request.customerAccountHolder());
            }

            log.warn("Đã trích phạt ký quỹ {}đ của thợ {} theo vụ việc {}", amount, profile.getId(), report.getReportCode());
        }

        // 2. Chế tài WARNING: Cảnh cáo thợ với quy tắc 3-Strike
        if (penaltyType == PenaltyType.WARNING) {
            int currentWarnings = profile.getWarningCount() != null ? profile.getWarningCount() : 0;
            int newWarnings = currentWarnings + 1;

            // Quy tắc 3-Strike: Đạt 3 lần cảnh cáo -> tự động đình chỉ nhận việc 7 ngày và reset chu kỳ cảnh cáo
            if (newWarnings >= 3) {
                profile.setWarningCount(0);
                profile.setSuspendedUntil(Instant.now().plus(7, ChronoUnit.DAYS));
                profile.setIsAvailable(false);
                report.setBanDurationDays(7);
                log.warn("Thợ {} đạt 3 lần cảnh cáo -> Tự động đình chỉ nhận việc 7 ngày và reset chu kỳ cảnh cáo", profile.getId());
            } else {
                profile.setWarningCount(newWarnings);
            }
            providerProfileRepository.save(profile);
            log.info("Ghi nhận cảnh cáo cho thợ {}. Số cảnh cáo chu kỳ hiện tại: {}", profile.getId(), profile.getWarningCount());
        }

        // 3. Chế tài TEMPORARY_BAN: Đình chỉ nhận việc có thời hạn
        if (penaltyType == PenaltyType.TEMPORARY_BAN) {
            int days = (request.banDurationDays() != null && request.banDurationDays() > 0) ? request.banDurationDays() : 7;
            report.setBanDurationDays(days);
            profile.setSuspendedUntil(Instant.now().plus(days, ChronoUnit.DAYS));
            profile.setIsAvailable(false);
            providerProfileRepository.save(profile);
            log.warn("Thợ {} bị đình chỉ nhận việc {} ngày (đến {}) theo vụ việc {}", 
                    profile.getId(), days, profile.getSuspendedUntil(), report.getReportCode());
        }

        // 4. Chế tài PERMANENT_BAN: Khóa vĩnh viễn tài khoản thợ
        if (penaltyType == PenaltyType.PERMANENT_BAN) {
            User user = profile.getUser();
            if (user != null) {
                user.setStatus(UserStatus.DISABLED);
                userRepository.save(user);
            }
            profile.setIsAvailable(false);
            profile.setSuspendedUntil(Instant.now().plus(36500, ChronoUnit.DAYS)); // 100 năm
            providerProfileRepository.save(profile);

            // Đóng ví thợ
            walletRepository.findByProviderProfileId(profile.getId()).ifPresent(wallet -> {
                wallet.setStatus(WalletStatus.CLOSED);
                walletRepository.save(wallet);
            });

            log.error("Tài khoản thợ {} (User {}) đã bị KHÓA VĨNH VIỄN theo phán quyết kỷ luật", profile.getId(), user != null ? user.getId() : null);
        }

        ProviderReport saved = reportRepository.save(report);
        return ReportResponse.from(saved);
    }

    /**
     * Admin hoàn lại tiền phạt cọc cho thợ khi xử lý nhầm hoặc hai bên hòa giải thành công.
     */
    @Transactional
    public ReportResponse refundDisputePenalty(UUID reportId, RefundPenaltyRequest request, User adminUser) {
        ProviderReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hồ sơ khiếu nại"));

        if (report.getPenaltyType() != PenaltyType.DEPOSIT_DEDUCTION || report.getPenaltyAmount() <= 0) {
            throw new AppException(ErrorCode.INVALID_INPUT, "Hồ sơ khiếu nại này không có khoản phạt ký quỹ để hoàn trả");
        }

        if (report.getRefundedAt() != null) {
            throw new AppException(ErrorCode.CONFLICT, "Khoản phạt này đã được hoàn trả lúc: " + report.getRefundedAt());
        }

        UUID orderId = report.getOrder() != null ? report.getOrder().getId() : null;
        walletService.adminRefundDisputePenalty(
                report.getProvider().getId(),
                report.getPenaltyAmount(),
                request.reason(),
                orderId,
                adminUser
        );

        report.setRefundedAt(Instant.now());
        report.setRefundedBy(adminUser);
        report.setRefundReason(request.reason());

        ProviderReport saved = reportRepository.save(report);
        log.info("Admin {} đã hoàn cọc {}đ cho thợ {} theo vụ việc {}", 
                adminUser.getFullName(), report.getPenaltyAmount(), report.getProvider().getId(), report.getReportCode());
        return ReportResponse.from(saved);
    }

    /**
     * Admin xác nhận đã chuyển khoản tiền bồi thường cho Khách hàng.
     */
    @Transactional
    public ReportResponse confirmCompensationPayout(UUID reportId, ConfirmCompensationPayoutRequest request, User adminUser) {
        ProviderReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hồ sơ khiếu nại"));

        if (report.getCompensationStatus() != CompensationStatus.PENDING_PAYOUT) {
            throw new AppException(ErrorCode.CONFLICT, "Hồ sơ khiếu nại không ở trạng thái Chờ chi trả bồi thường");
        }

        report.setCompensationStatus(CompensationStatus.COMPLETED);
        report.setCompensationPayoutRef(request.payoutRef());
        report.setCompensationPayoutAt(Instant.now());

        if (request.note() != null && !request.note().isBlank()) {
            String noteAddition = "\n[Bồi thường KH lúc " + DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").format(Instant.now().atZone(java.time.ZoneId.of("Asia/Ho_Chi_Minh"))) + "]: " + request.note();
            report.setAdminNotes((report.getAdminNotes() != null ? report.getAdminNotes() : "") + noteAddition);
        }

        ProviderReport saved = reportRepository.save(report);
        log.info("Admin {} xác nhận đã chi trả bồi thường {}đ cho khách hàng theo vụ việc {}", 
                adminUser.getFullName(), report.getCompensationAmount(), report.getReportCode());
        return ReportResponse.from(saved);
    }

    /**
     * Admin gỡ đình chỉ / mở khóa tức thì cho thợ khi xử phạt nhầm hoặc các bên hòa giải.
     */
    @Transactional
    public ReportResponse revokeDisciplinaryAction(UUID reportId, RevokeSuspensionRequest request, User adminUser) {
        ProviderReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hồ sơ khiếu nại"));

        PenaltyType penaltyType = report.getPenaltyType();
        if (penaltyType != PenaltyType.TEMPORARY_BAN && penaltyType != PenaltyType.PERMANENT_BAN && penaltyType != PenaltyType.WARNING) {
            throw new AppException(ErrorCode.INVALID_INPUT, "Hồ sơ khiếu nại này không có chế tài đình chỉ hoặc cảnh cáo để gỡ bỏ");
        }

        if (report.getSuspensionLiftedAt() != null) {
            throw new AppException(ErrorCode.CONFLICT, "Án kỷ luật này đã được gỡ bỏ lúc: " + report.getSuspensionLiftedAt());
        }

        ProviderProfile profile = report.getProvider();
        User providerUser = profile.getUser();

        // 1. Gỡ đình chỉ nhận việc
        profile.setSuspendedUntil(null);
        profile.setIsAvailable(true);
        // Reset cảnh cáo về 0 để thợ có cơ hội làm lại từ đầu
        profile.setWarningCount(0);
        providerProfileRepository.save(profile);

        // 2. Mở khóa tài khoản User nếu đang bị DISABLED
        if (providerUser != null && providerUser.getStatus() == UserStatus.DISABLED) {
            providerUser.setStatus(UserStatus.ACTIVE);
            userRepository.save(providerUser);
            log.info("Đã mở lại tài khoản User {} từ DISABLED -> ACTIVE", providerUser.getId());
        }

        // 3. Khôi phục trạng thái ví nếu đang bị CLOSED
        walletRepository.findByProviderProfileId(profile.getId()).ifPresent(wallet -> {
            if (wallet.getStatus() == WalletStatus.CLOSED) {
                if (wallet.getDepositBalance() < 2_000_000L) {
                    wallet.setStatus(WalletStatus.DEPOSIT_DEFICIT);
                } else {
                    wallet.setStatus(WalletStatus.ACTIVE);
                }
                walletRepository.save(wallet);
                log.info("Đã mở lại ví của thợ {} về trạng thái {}", profile.getId(), wallet.getStatus());
            }
        });

        // 4. Lưu vết gỡ đình chỉ vào hồ sơ khiếu nại
        report.setSuspensionLiftedAt(Instant.now());
        report.setSuspensionLiftedBy(adminUser);
        report.setSuspensionLiftedReason(request.reason());

        ProviderReport saved = reportRepository.save(report);
        log.info("Admin {} đã gỡ kỷ luật/đình chỉ cho thợ {} theo vụ việc {}. Lý do: {}",
                adminUser.getFullName(), profile.getId(), report.getReportCode(), request.reason());
        return ReportResponse.from(saved);
    }

    private String serializeList(List<String> list) {
        try {
            return OBJECT_MAPPER.writeValueAsString(list);
        } catch (JsonProcessingException e) {
            return String.join(",", list);
        }
    }
}
