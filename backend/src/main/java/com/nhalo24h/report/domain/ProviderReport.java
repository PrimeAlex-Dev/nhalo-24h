package com.nhalo24h.report.domain;

import com.nhalo24h.order.domain.Order;
import com.nhalo24h.provider.domain.ProviderProfile;
import com.nhalo24h.user.domain.User;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "provider_reports")
public class ProviderReport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "report_code", length = 32, nullable = false, unique = true)
    private String reportCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private ProviderProfile provider;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @Enumerated(EnumType.STRING)
    @Column(name = "reason_type", length = 50, nullable = false)
    private ReportReasonType reasonType;

    @Column(name = "title", length = 200, nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "evidence_images", columnDefinition = "TEXT")
    private String evidenceImages;

    @Column(name = "expected_resolution", length = 100)
    private String expectedResolution;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30, nullable = false)
    private ReportStatus status = ReportStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "penalty_type", length = 30, nullable = false)
    private PenaltyType penaltyType = PenaltyType.NONE;

    @Column(name = "penalty_amount", nullable = false)
    private Long penaltyAmount = 0L;

    @Column(name = "ban_duration_days")
    private Integer banDurationDays;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by")
    private User resolvedBy;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @Column(name = "refunded_at")
    private Instant refundedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "refunded_by")
    private User refundedBy;

    @Column(name = "refund_reason", columnDefinition = "TEXT")
    private String refundReason;

    @Column(name = "compensation_amount", nullable = false)
    private Long compensationAmount = 0L;

    @Enumerated(EnumType.STRING)
    @Column(name = "compensation_status", length = 30, nullable = false)
    private CompensationStatus compensationStatus = CompensationStatus.NONE;

    @Column(name = "customer_bank_code", length = 20)
    private String customerBankCode;

    @Column(name = "customer_account_number", length = 50)
    private String customerAccountNumber;

    @Column(name = "customer_account_holder", length = 100)
    private String customerAccountHolder;

    @Column(name = "compensation_payout_ref", length = 100)
    private String compensationPayoutRef;

    @Column(name = "compensation_payout_at")
    private Instant compensationPayoutAt;

    @Column(name = "suspension_lifted_at")
    private Instant suspensionLiftedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "suspension_lifted_by")
    private User suspensionLiftedBy;

    @Column(name = "suspension_lifted_reason", columnDefinition = "TEXT")
    private String suspensionLiftedReason;


    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public ProviderReport() {
    }

    public ProviderReport(String reportCode, Order order, ProviderProfile provider, User reporter,
                          ReportReasonType reasonType, String title, String description) {
        this.reportCode = reportCode;
        this.order = order;
        this.provider = provider;
        this.reporter = reporter;
        this.reasonType = reasonType;
        this.title = title;
        this.description = description;
        this.status = ReportStatus.PENDING;
        this.penaltyType = PenaltyType.NONE;
        this.penaltyAmount = 0L;
        this.compensationAmount = 0L;
        this.compensationStatus = CompensationStatus.NONE;
    }

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        if (this.createdAt == null) {
            this.createdAt = now;
        }
        if (this.updatedAt == null) {
            this.updatedAt = now;
        }
        if (this.status == null) {
            this.status = ReportStatus.PENDING;
        }
        if (this.penaltyType == null) {
            this.penaltyType = PenaltyType.NONE;
        }
        if (this.penaltyAmount == null) {
            this.penaltyAmount = 0L;
        }
        if (this.compensationAmount == null) {
            this.compensationAmount = 0L;
        }
        if (this.compensationStatus == null) {
            this.compensationStatus = CompensationStatus.NONE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getReportCode() {
        return reportCode;
    }

    public void setReportCode(String reportCode) {
        this.reportCode = reportCode;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public ProviderProfile getProvider() {
        return provider;
    }

    public void setProvider(ProviderProfile provider) {
        this.provider = provider;
    }

    public User getReporter() {
        return reporter;
    }

    public void setReporter(User reporter) {
        this.reporter = reporter;
    }

    public ReportReasonType getReasonType() {
        return reasonType;
    }

    public void setReasonType(ReportReasonType reasonType) {
        this.reasonType = reasonType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getEvidenceImages() {
        return evidenceImages;
    }

    public void setEvidenceImages(String evidenceImages) {
        this.evidenceImages = evidenceImages;
    }

    public String getExpectedResolution() {
        return expectedResolution;
    }

    public void setExpectedResolution(String expectedResolution) {
        this.expectedResolution = expectedResolution;
    }

    public ReportStatus getStatus() {
        return status;
    }

    public void setStatus(ReportStatus status) {
        this.status = status;
    }

    public PenaltyType getPenaltyType() {
        return penaltyType;
    }

    public void setPenaltyType(PenaltyType penaltyType) {
        this.penaltyType = penaltyType;
    }

    public Long getPenaltyAmount() {
        return penaltyAmount;
    }

    public void setPenaltyAmount(Long penaltyAmount) {
        this.penaltyAmount = penaltyAmount;
    }

    public Integer getBanDurationDays() {
        return banDurationDays;
    }

    public void setBanDurationDays(Integer banDurationDays) {
        this.banDurationDays = banDurationDays;
    }

    public String getAdminNotes() {
        return adminNotes;
    }

    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
    }

    public User getResolvedBy() {
        return resolvedBy;
    }

    public void setResolvedBy(User resolvedBy) {
        this.resolvedBy = resolvedBy;
    }

    public Instant getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(Instant resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public Instant getRefundedAt() {
        return refundedAt;
    }

    public void setRefundedAt(Instant refundedAt) {
        this.refundedAt = refundedAt;
    }

    public User getRefundedBy() {
        return refundedBy;
    }

    public void setRefundedBy(User refundedBy) {
        this.refundedBy = refundedBy;
    }

    public String getRefundReason() {
        return refundReason;
    }

    public void setRefundReason(String refundReason) {
        this.refundReason = refundReason;
    }

    public Long getCompensationAmount() {
        return compensationAmount;
    }

    public void setCompensationAmount(Long compensationAmount) {
        this.compensationAmount = compensationAmount;
    }

    public CompensationStatus getCompensationStatus() {
        return compensationStatus;
    }

    public void setCompensationStatus(CompensationStatus compensationStatus) {
        this.compensationStatus = compensationStatus;
    }

    public String getCustomerBankCode() {
        return customerBankCode;
    }

    public void setCustomerBankCode(String customerBankCode) {
        this.customerBankCode = customerBankCode;
    }

    public String getCustomerAccountNumber() {
        return customerAccountNumber;
    }

    public void setCustomerAccountNumber(String customerAccountNumber) {
        this.customerAccountNumber = customerAccountNumber;
    }

    public String getCustomerAccountHolder() {
        return customerAccountHolder;
    }

    public void setCustomerAccountHolder(String customerAccountHolder) {
        this.customerAccountHolder = customerAccountHolder;
    }

    public String getCompensationPayoutRef() {
        return compensationPayoutRef;
    }

    public void setCompensationPayoutRef(String compensationPayoutRef) {
        this.compensationPayoutRef = compensationPayoutRef;
    }

    public Instant getCompensationPayoutAt() {
        return compensationPayoutAt;
    }

    public void setCompensationPayoutAt(Instant compensationPayoutAt) {
        this.compensationPayoutAt = compensationPayoutAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProviderReport that = (ProviderReport) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    public Instant getSuspensionLiftedAt() {
        return suspensionLiftedAt;
    }

    public void setSuspensionLiftedAt(Instant suspensionLiftedAt) {
        this.suspensionLiftedAt = suspensionLiftedAt;
    }

    public User getSuspensionLiftedBy() {
        return suspensionLiftedBy;
    }

    public void setSuspensionLiftedBy(User suspensionLiftedBy) {
        this.suspensionLiftedBy = suspensionLiftedBy;
    }

    public String getSuspensionLiftedReason() {
        return suspensionLiftedReason;
    }

    public void setSuspensionLiftedReason(String suspensionLiftedReason) {
        this.suspensionLiftedReason = suspensionLiftedReason;
    }

}