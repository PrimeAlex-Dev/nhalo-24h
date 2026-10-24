package com.nhalo24h.order.domain;

import com.nhalo24h.category.domain.ServiceCategory;
import com.nhalo24h.provider.domain.ProviderProfile;
import com.nhalo24h.user.domain.CustomerAddress;
import com.nhalo24h.user.domain.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "order_code", nullable = false, unique = true, length = 32)
    private String orderCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private ServiceCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id")
    private CustomerAddress address;

    @Column(name = "address_snapshot", nullable = false, length = 500)
    private String addressSnapshot;

    @Column(name = "contact_name", nullable = false, length = 100)
    private String contactName;

    @Column(name = "contact_phone", nullable = false, length = 20)
    private String contactPhone;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "expected_schedule_time", nullable = false)
    private Instant expectedScheduleTime;

    @Column(name = "urgency_level", nullable = false, length = 20)
    private String urgencyLevel = "NORMAL";

    @Column(name = "service_metadata", columnDefinition = "TEXT")
    private String serviceMetadata;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private OrderStatus status = OrderStatus.PENDING_PROVIDER;

    @Enumerated(EnumType.STRING)
    @Column(name = "workflow_mode", nullable = false, length = 50)
    private QuoteMode workflowMode = QuoteMode.SURVEY_REQUIRED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_provider_id")
    private ProviderProfile assignedProvider;

    @Column(name = "agreed_survey_fee", nullable = false)
    private Long agreedSurveyFee = 0L;

    @Column(name = "agreed_travel_fee", nullable = false)
    private Long agreedTravelFee = 0L;

    @Column(name = "waive_survey_if_repaired", nullable = false)
    private Boolean waiveSurveyIfRepaired = true;

    @Column(name = "waive_travel_if_repaired", nullable = false)
    private Boolean waiveTravelIfRepaired = true;

    @Column(name = "applied_survey_fee", nullable = false)
    private Long appliedSurveyFee = 0L;

    @Column(name = "applied_travel_fee", nullable = false)
    private Long appliedTravelFee = 0L;

    @Column(name = "final_labor_fee", nullable = false)
    private Long finalLaborFee = 0L;

    @Column(name = "final_materials_fee", nullable = false)
    private Long finalMaterialsFee = 0L;

    @Column(name = "final_price")
    private Long finalPrice;

    @Column(name = "commission_rate_snapshot", nullable = false, precision = 5, scale = 2)
    private BigDecimal commissionRateSnapshot = new BigDecimal("10.00");

    @Column(name = "commission_amount", nullable = false)
    private Long commissionAmount = 0L;

    @Column(name = "completion_note", columnDefinition = "TEXT")
    private String completionNote;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 30)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 50)
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    @Column(name = "online_transaction_ref", length = 64)
    private String onlineTransactionRef;

    @Column(name = "customer_declared_amount")
    private Long customerDeclaredAmount;

    @Column(name = "customer_payment_note", columnDefinition = "TEXT")
    private String customerPaymentNote;

    @Column(name = "provider_confirmed_amount")
    private Long providerConfirmedAmount;

    @Column(name = "provider_payment_confirmed_at")
    private Instant providerPaymentConfirmedAt;

    @Column(name = "dispute_reason", columnDefinition = "TEXT")
    private String disputeReason;

    @Column(name = "is_flagged_abnormal", nullable = false)
    private Boolean flaggedAbnormal = false;

    @Column(name = "abnormal_reason", columnDefinition = "TEXT")
    private String abnormalReason;

    @Column(name = "cancel_reason", columnDefinition = "TEXT")
    private String cancelReason;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderRequest> requests = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Order() {
    }

    public Order(User customer, ServiceCategory category, CustomerAddress address, String addressSnapshot,
                 String contactName, String contactPhone, String title, String description,
                 Instant expectedScheduleTime) {
        this.customer = customer;
        this.category = category;
        this.address = address;
        this.addressSnapshot = addressSnapshot;
        this.contactName = contactName;
        this.contactPhone = contactPhone;
        this.title = title;
        this.description = description;
        this.expectedScheduleTime = expectedScheduleTime;
        this.status = OrderStatus.PENDING_PROVIDER;
        this.paymentStatus = PaymentStatus.UNPAID;
        if (category != null && category.getCommissionRate() != null) {
            this.commissionRateSnapshot = category.getCommissionRate();
        } else {
            this.commissionRateSnapshot = new BigDecimal("10.00");
        }
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
        if (this.urgencyLevel == null || this.urgencyLevel.isBlank()) {
            this.urgencyLevel = "NORMAL";
        }
        if (this.workflowMode == null) {
            this.workflowMode = QuoteMode.SURVEY_REQUIRED;
        }
        if (this.paymentStatus == null) {
            this.paymentStatus = PaymentStatus.UNPAID;
        }
        if (this.agreedSurveyFee == null) this.agreedSurveyFee = 0L;
        if (this.agreedTravelFee == null) this.agreedTravelFee = 0L;
        if (this.waiveSurveyIfRepaired == null) this.waiveSurveyIfRepaired = true;
        if (this.waiveTravelIfRepaired == null) this.waiveTravelIfRepaired = true;
        if (this.appliedSurveyFee == null) this.appliedSurveyFee = 0L;
        if (this.appliedTravelFee == null) this.appliedTravelFee = 0L;
        if (this.finalLaborFee == null) this.finalLaborFee = 0L;
        if (this.finalMaterialsFee == null) this.finalMaterialsFee = 0L;
        if (this.commissionRateSnapshot == null) this.commissionRateSnapshot = new BigDecimal("10.00");
        if (this.commissionAmount == null) this.commissionAmount = 0L;
        if (this.flaggedAbnormal == null) this.flaggedAbnormal = false;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    /**
     * Tính toán lại toàn bộ bảng chi phí và hoa hồng nền tảng.
     * Quy tắc cốt lõi:
     * - Nếu khách từ chối sửa sau khảo sát (isDeclinedAfterSurvey = true):
     *   Khách chỉ trả Phí khảo sát + Phí di chuyển (không miễn giảm), Tiền công = 0, Vật tư = 0, Hoa hồng = 0.
     * - Nếu khách đồng ý sửa (isDeclinedAfterSurvey = false):
     *   Áp dụng miễn giảm phí khảo sát / di chuyển theo chính sách đã thỏa thuận.
     *   Hoa hồng chỉ tính trên Tiền công thực tế (finalLaborFee), không tính trên vật tư/khảo sát/di chuyển.
     */
    public void recalculateFinancials(boolean isDeclinedAfterSurvey) {
        long survey = this.agreedSurveyFee != null ? this.agreedSurveyFee : 0L;
        long travel = this.agreedTravelFee != null ? this.agreedTravelFee : 0L;

        if (isDeclinedAfterSurvey) {
            this.appliedSurveyFee = survey;
            this.appliedTravelFee = travel;
            this.finalLaborFee = 0L;
            this.finalMaterialsFee = 0L;
            this.finalPrice = this.appliedSurveyFee + this.appliedTravelFee;
            this.commissionAmount = 0L;
        } else {
            this.appliedSurveyFee = Boolean.TRUE.equals(this.waiveSurveyIfRepaired) ? 0L : survey;
            this.appliedTravelFee = Boolean.TRUE.equals(this.waiveTravelIfRepaired) ? 0L : travel;
            long labor = this.finalLaborFee != null ? this.finalLaborFee : 0L;
            long materials = this.finalMaterialsFee != null ? this.finalMaterialsFee : 0L;
            this.finalPrice = this.appliedSurveyFee + this.appliedTravelFee + labor + materials;

            BigDecimal rate = this.commissionRateSnapshot != null ? this.commissionRateSnapshot : new BigDecimal("10.00");
            this.commissionAmount = BigDecimal.valueOf(labor)
                .multiply(rate)
                .divide(new BigDecimal("100"), 0, RoundingMode.HALF_UP)
                .longValue();
        }
    }

    public void flagAbnormal(String reason) {
        this.flaggedAbnormal = true;
        if (this.abnormalReason == null || this.abnormalReason.isBlank()) {
            this.abnormalReason = reason;
        } else if (!this.abnormalReason.contains(reason)) {
            this.abnormalReason = this.abnormalReason + " | " + reason;
        }
    }

    public void addImage(OrderImage image) {
        images.add(image);
        image.setOrder(this);
    }

    public void removeImage(OrderImage image) {
        images.remove(image);
        image.setOrder(null);
    }

    public void addRequest(OrderRequest request) {
        requests.add(request);
        request.setOrder(this);
    }

    // Getters and Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getOrderCode() {
        return orderCode;
    }

    public void setOrderCode(String orderCode) {
        this.orderCode = orderCode;
    }

    public User getCustomer() {
        return customer;
    }

    public void setCustomer(User customer) {
        this.customer = customer;
    }

    public ServiceCategory getCategory() {
        return category;
    }

    public void setCategory(ServiceCategory category) {
        this.category = category;
    }

    public CustomerAddress getAddress() {
        return address;
    }

    public void setAddress(CustomerAddress address) {
        this.address = address;
    }

    public String getAddressSnapshot() {
        return addressSnapshot;
    }

    public void setAddressSnapshot(String addressSnapshot) {
        this.addressSnapshot = addressSnapshot;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
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

    public Instant getExpectedScheduleTime() {
        return expectedScheduleTime;
    }

    public void setExpectedScheduleTime(Instant expectedScheduleTime) {
        this.expectedScheduleTime = expectedScheduleTime;
    }

    public String getUrgencyLevel() {
        return urgencyLevel;
    }

    public void setUrgencyLevel(String urgencyLevel) {
        this.urgencyLevel = urgencyLevel != null ? urgencyLevel : "NORMAL";
    }

    public String getServiceMetadata() {
        return serviceMetadata;
    }

    public void setServiceMetadata(String serviceMetadata) {
        this.serviceMetadata = serviceMetadata;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public QuoteMode getWorkflowMode() {
        return workflowMode;
    }

    public void setWorkflowMode(QuoteMode workflowMode) {
        this.workflowMode = workflowMode != null ? workflowMode : QuoteMode.SURVEY_REQUIRED;
    }

    public ProviderProfile getAssignedProvider() {
        return assignedProvider;
    }

    public void setAssignedProvider(ProviderProfile assignedProvider) {
        this.assignedProvider = assignedProvider;
    }

    public Long getAgreedSurveyFee() {
        return agreedSurveyFee;
    }

    public void setAgreedSurveyFee(Long agreedSurveyFee) {
        this.agreedSurveyFee = agreedSurveyFee != null ? agreedSurveyFee : 0L;
    }

    public Long getAgreedTravelFee() {
        return agreedTravelFee;
    }

    public void setAgreedTravelFee(Long agreedTravelFee) {
        this.agreedTravelFee = agreedTravelFee != null ? agreedTravelFee : 0L;
    }

    public Boolean getWaiveSurveyIfRepaired() {
        return waiveSurveyIfRepaired;
    }

    public void setWaiveSurveyIfRepaired(Boolean waiveSurveyIfRepaired) {
        this.waiveSurveyIfRepaired = waiveSurveyIfRepaired != null ? waiveSurveyIfRepaired : true;
    }

    public Boolean getWaiveTravelIfRepaired() {
        return waiveTravelIfRepaired;
    }

    public void setWaiveTravelIfRepaired(Boolean waiveTravelIfRepaired) {
        this.waiveTravelIfRepaired = waiveTravelIfRepaired != null ? waiveTravelIfRepaired : true;
    }

    public Long getAppliedSurveyFee() {
        return appliedSurveyFee;
    }

    public void setAppliedSurveyFee(Long appliedSurveyFee) {
        this.appliedSurveyFee = appliedSurveyFee != null ? appliedSurveyFee : 0L;
    }

    public Long getAppliedTravelFee() {
        return appliedTravelFee;
    }

    public void setAppliedTravelFee(Long appliedTravelFee) {
        this.appliedTravelFee = appliedTravelFee != null ? appliedTravelFee : 0L;
    }

    public Long getFinalLaborFee() {
        return finalLaborFee;
    }

    public void setFinalLaborFee(Long finalLaborFee) {
        this.finalLaborFee = finalLaborFee != null ? finalLaborFee : 0L;
    }

    public Long getFinalMaterialsFee() {
        return finalMaterialsFee;
    }

    public void setFinalMaterialsFee(Long finalMaterialsFee) {
        this.finalMaterialsFee = finalMaterialsFee != null ? finalMaterialsFee : 0L;
    }

    public Long getFinalPrice() {
        return finalPrice;
    }

    public void setFinalPrice(Long finalPrice) {
        this.finalPrice = finalPrice;
    }

    public BigDecimal getCommissionRateSnapshot() {
        return commissionRateSnapshot;
    }

    public void setCommissionRateSnapshot(BigDecimal commissionRateSnapshot) {
        this.commissionRateSnapshot = commissionRateSnapshot;
    }

    public Long getCommissionAmount() {
        return commissionAmount;
    }

    public void setCommissionAmount(Long commissionAmount) {
        this.commissionAmount = commissionAmount != null ? commissionAmount : 0L;
    }

    public String getCompletionNote() {
        return completionNote;
    }

    public void setCompletionNote(String completionNote) {
        this.completionNote = completionNote;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus != null ? paymentStatus : PaymentStatus.UNPAID;
    }

    public String getOnlineTransactionRef() {
        return onlineTransactionRef;
    }

    public void setOnlineTransactionRef(String onlineTransactionRef) {
        this.onlineTransactionRef = onlineTransactionRef;
    }

    public Long getCustomerDeclaredAmount() {
        return customerDeclaredAmount;
    }

    public void setCustomerDeclaredAmount(Long customerDeclaredAmount) {
        this.customerDeclaredAmount = customerDeclaredAmount;
    }

    public String getCustomerPaymentNote() {
        return customerPaymentNote;
    }

    public void setCustomerPaymentNote(String customerPaymentNote) {
        this.customerPaymentNote = customerPaymentNote;
    }

    public Long getProviderConfirmedAmount() {
        return providerConfirmedAmount;
    }

    public void setProviderConfirmedAmount(Long providerConfirmedAmount) {
        this.providerConfirmedAmount = providerConfirmedAmount;
    }

    public Instant getProviderPaymentConfirmedAt() {
        return providerPaymentConfirmedAt;
    }

    public void setProviderPaymentConfirmedAt(Instant providerPaymentConfirmedAt) {
        this.providerPaymentConfirmedAt = providerPaymentConfirmedAt;
    }

    public String getDisputeReason() {
        return disputeReason;
    }

    public void setDisputeReason(String disputeReason) {
        this.disputeReason = disputeReason;
    }

    public Boolean getFlaggedAbnormal() {
        return flaggedAbnormal;
    }

    public void setFlaggedAbnormal(Boolean flaggedAbnormal) {
        this.flaggedAbnormal = flaggedAbnormal != null ? flaggedAbnormal : false;
    }

    public String getAbnormalReason() {
        return abnormalReason;
    }

    public void setAbnormalReason(String abnormalReason) {
        this.abnormalReason = abnormalReason;
    }

    public String getCancelReason() {
        return cancelReason;
    }

    public void setCancelReason(String cancelReason) {
        this.cancelReason = cancelReason;
    }

    public List<OrderImage> getImages() {
        return images;
    }

    public void setImages(List<OrderImage> images) {
        this.images = images;
    }

    public List<OrderRequest> getRequests() {
        return requests;
    }

    public void setRequests(List<OrderRequest> requests) {
        this.requests = requests;
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
        Order order = (Order) o;
        return Objects.equals(id, order.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
