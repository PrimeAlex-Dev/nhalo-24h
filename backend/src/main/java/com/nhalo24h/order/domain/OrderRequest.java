package com.nhalo24h.order.domain;

import com.nhalo24h.provider.domain.ProviderProfile;
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
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "order_requests")
public class OrderRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private ProviderProfile provider;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private OrderRequestStatus status = OrderRequestStatus.PENDING_RESPONSE;

    @Enumerated(EnumType.STRING)
    @Column(name = "quote_mode", nullable = false, length = 30)
    private QuoteMode quoteMode = QuoteMode.SURVEY_REQUIRED;

    @Column(name = "survey_fee", nullable = false)
    private Long surveyFee = 0L;

    @Column(name = "travel_fee", nullable = false)
    private Long travelFee = 0L;

    @Column(name = "waive_survey_if_repaired", nullable = false)
    private Boolean waiveSurveyIfRepaired = true;

    @Column(name = "waive_travel_if_repaired", nullable = false)
    private Boolean waiveTravelIfRepaired = true;

    @Column(name = "estimated_labor_fee", nullable = false)
    private Long estimatedLaborFee = 0L;

    @Column(name = "estimated_materials_fee", nullable = false)
    private Long estimatedMaterialsFee = 0L;

    @Column(name = "quoted_price")
    private Long quotedPrice;

    @Column(name = "provider_note", columnDefinition = "TEXT")
    private String providerNote;

    @Column(name = "scope_and_conditions", columnDefinition = "TEXT")
    private String scopeAndConditions;

    @Column(name = "estimated_arrival_time")
    private Instant estimatedArrivalTime;

    @Column(name = "reject_reason", columnDefinition = "TEXT")
    private String rejectReason;

    @OneToMany(mappedBy = "orderRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderRequestMessage> messages = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public OrderRequest() {
    }

    public OrderRequest(Order order, ProviderProfile provider) {
        this.order = order;
        this.provider = provider;
        this.status = OrderRequestStatus.PENDING_RESPONSE;
        this.quoteMode = QuoteMode.SURVEY_REQUIRED;
        this.surveyFee = 0L;
        this.travelFee = 0L;
        this.waiveSurveyIfRepaired = true;
        this.waiveTravelIfRepaired = true;
        this.estimatedLaborFee = 0L;
        this.estimatedMaterialsFee = 0L;
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
        if (this.quoteMode == null) {
            this.quoteMode = QuoteMode.SURVEY_REQUIRED;
        }
        if (this.surveyFee == null) {
            this.surveyFee = 0L;
        }
        if (this.travelFee == null) {
            this.travelFee = 0L;
        }
        if (this.waiveSurveyIfRepaired == null) {
            this.waiveSurveyIfRepaired = true;
        }
        if (this.waiveTravelIfRepaired == null) {
            this.waiveTravelIfRepaired = true;
        }
        if (this.estimatedLaborFee == null) {
            this.estimatedLaborFee = 0L;
        }
        if (this.estimatedMaterialsFee == null) {
            this.estimatedMaterialsFee = 0L;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public void addMessage(OrderRequestMessage message) {
        messages.add(message);
        message.setOrderRequest(this);
    }

    // Getters and Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public OrderRequestStatus getStatus() {
        return status;
    }

    public void setStatus(OrderRequestStatus status) {
        this.status = status;
    }

    public QuoteMode getQuoteMode() {
        return quoteMode;
    }

    public void setQuoteMode(QuoteMode quoteMode) {
        this.quoteMode = quoteMode != null ? quoteMode : QuoteMode.SURVEY_REQUIRED;
    }

    public Long getSurveyFee() {
        return surveyFee;
    }

    public void setSurveyFee(Long surveyFee) {
        this.surveyFee = surveyFee != null ? surveyFee : 0L;
    }

    public Long getTravelFee() {
        return travelFee;
    }

    public void setTravelFee(Long travelFee) {
        this.travelFee = travelFee != null ? travelFee : 0L;
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

    public Long getEstimatedLaborFee() {
        return estimatedLaborFee;
    }

    public void setEstimatedLaborFee(Long estimatedLaborFee) {
        this.estimatedLaborFee = estimatedLaborFee != null ? estimatedLaborFee : 0L;
    }

    public Long getEstimatedMaterialsFee() {
        return estimatedMaterialsFee;
    }

    public void setEstimatedMaterialsFee(Long estimatedMaterialsFee) {
        this.estimatedMaterialsFee = estimatedMaterialsFee != null ? estimatedMaterialsFee : 0L;
    }

    public Long getQuotedPrice() {
        return quotedPrice;
    }

    public void setQuotedPrice(Long quotedPrice) {
        this.quotedPrice = quotedPrice;
    }

    public String getProviderNote() {
        return providerNote;
    }

    public void setProviderNote(String providerNote) {
        this.providerNote = providerNote;
    }

    public String getScopeAndConditions() {
        return scopeAndConditions;
    }

    public void setScopeAndConditions(String scopeAndConditions) {
        this.scopeAndConditions = scopeAndConditions;
    }

    public Instant getEstimatedArrivalTime() {
        return estimatedArrivalTime;
    }

    public void setEstimatedArrivalTime(Instant estimatedArrivalTime) {
        this.estimatedArrivalTime = estimatedArrivalTime;
    }

    public String getRejectReason() {
        return rejectReason;
    }

    public void setRejectReason(String rejectReason) {
        this.rejectReason = rejectReason;
    }

    public List<OrderRequestMessage> getMessages() {
        return messages;
    }

    public void setMessages(List<OrderRequestMessage> messages) {
        this.messages = messages;
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
        OrderRequest that = (OrderRequest) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
