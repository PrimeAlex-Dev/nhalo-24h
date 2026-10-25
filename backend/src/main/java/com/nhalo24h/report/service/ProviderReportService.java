package com.nhalo24h.report.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhalo24h.common.error.AppException;
import com.nhalo24h.common.error.ErrorCode;
import com.nhalo24h.order.domain.Order;
import com.nhalo24h.order.repository.OrderRepository;
import com.nhalo24h.provider.domain.ProviderProfile;
import com.nhalo24h.provider.repository.ProviderProfileRepository;
import com.nhalo24h.report.domain.PenaltyType;
import com.nhalo24h.report.domain.ProviderReport;
import com.nhalo24h.report.domain.ReportStatus;
import com.nhalo24h.report.dto.CreateReportRequest;
import com.nhalo24h.report.dto.ReportResponse;
import com.nhalo24h.report.dto.ResolveReportRequest;
import com.nhalo24h.report.repository.ProviderReportRepository;
import com.nhalo24h.user.domain.User;
import com.nhalo24h.user.repository.UserRepository;
import com.nhalo24h.wallet.dto.AdminDisputePenaltyRequestDto;
import com.nhalo24h.wallet.service.WalletService;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class ProviderReportService {

    private static final Logger log = LoggerFactory.getLogger(ProviderReportService.class);
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final ProviderReportRepository reportRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;

    public ProviderReportService(ProviderReportRepository reportRepository,
                                 ProviderProfileRepository providerProfileRepository,
                                 OrderRepository orderRepository,
                                 UserRepository userRepository,
                                 WalletService walletService) {
        this.reportRepository = reportRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.walletService = walletService;
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
                    report.getProvider().getId(),
                    new AdminDisputePenaltyRequestDto(amount, reason, orderId),
                    adminUser
            );
            log.warn("Đã trích phạt ký quỹ {}đ của thợ {} theo vụ việc {}", amount, report.getProvider().getId(), report.getReportCode());
        }

        if (penaltyType == PenaltyType.TEMPORARY_BAN || penaltyType == PenaltyType.PERMANENT_BAN) {
            ProviderProfile profile = report.getProvider();
            profile.setIsAvailable(false);
            providerProfileRepository.save(profile);
            log.warn("Tài khoản thợ {} đã bị khóa theo phán quyết kỷ luật: {}", profile.getId(), penaltyType);
        }

        ProviderReport saved = reportRepository.save(report);
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
