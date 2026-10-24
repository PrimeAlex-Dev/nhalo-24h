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
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "order_quote_versions")
public class OrderQuoteVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id")
    private OrderRequest request;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private ProviderProfile provider;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber = 1;

    @Enumerated(EnumType.STRING)
    @Column(name = "version_type", nullable = false, length = 30)
    private QuoteVersionType versionType;

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

    @Column(name = "labor_fee", nullable = false)
    private Long laborFee = 0L;

    @Column(name = "materials_fee", nullable = false)
    private Long materialsFee = 0L;

    @Column(name = "total_amount", nullable = false)
    private Long totalAmount = 0L;

    @Column(name = "diagnosis_or_reason", columnDefinition = "TEXT")
    private String diagnosisOrReason;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private QuoteVersionStatus status = QuoteVersionStatus.PENDING_APPROVAL;

    @OneToMany(mappedBy = "quoteVersion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderQuoteItem> items = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "responded_at")
    private Instant respondedAt;

    public OrderQuoteVersion() {
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        if (this.versionNumber == null) {
            this.versionNumber = 1;
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
        if (this.laborFee == null) {
            this.laborFee = 0L;
        }
        if (this.materialsFee == null) {
            this.materialsFee = 0L;
        }
        if (this.totalAmount == null) {
            this.totalAmount = 0L;
        }
        if (this.status == null) {
            this.status = QuoteVersionStatus.PENDING_APPROVAL;
        }
    }

    public void addItem(OrderQuoteItem item) {
        items.add(item);
        item.setQuoteVersion(this);
    }

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

    public OrderRequest getRequest() {
        return request;
    }

    public void setRequest(OrderRequest request) {
        this.request = request;
    }

    public ProviderProfile getProvider() {
        return provider;
    }

    public void setProvider(ProviderProfile provider) {
        this.provider = provider;
    }

    public Integer getVersionNumber() {
        return versionNumber;
    }

    public void setVersionNumber(Integer versionNumber) {
        this.versionNumber = versionNumber;
    }

    public QuoteVersionType getVersionType() {
        return versionType;
    }

    public void setVersionType(QuoteVersionType versionType) {
        this.versionType = versionType;
    }

    public QuoteMode getQuoteMode() {
        return quoteMode;
    }

    public void setQuoteMode(QuoteMode quoteMode) {
        this.quoteMode = quoteMode;
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

    public Long getLaborFee() {
        return laborFee;
    }

    public void setLaborFee(Long laborFee) {
        this.laborFee = laborFee != null ? laborFee : 0L;
    }

    public Long getMaterialsFee() {
        return materialsFee;
    }

    public void setMaterialsFee(Long materialsFee) {
        this.materialsFee = materialsFee != null ? materialsFee : 0L;
    }

    public Long getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Long totalAmount) {
        this.totalAmount = totalAmount != null ? totalAmount : 0L;
    }

    public String getDiagnosisOrReason() {
        return diagnosisOrReason;
    }

    public void setDiagnosisOrReason(String diagnosisOrReason) {
        this.diagnosisOrReason = diagnosisOrReason;
    }

    public QuoteVersionStatus getStatus() {
        return status;
    }

    public void setStatus(QuoteVersionStatus status) {
        this.status = status;
    }

    public List<OrderQuoteItem> getItems() {
        return items;
    }

    public void setItems(List<OrderQuoteItem> items) {
        this.items = items;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getRespondedAt() {
        return respondedAt;
    }

    public void setRespondedAt(Instant respondedAt) {
        this.respondedAt = respondedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        OrderQuoteVersion that = (OrderQuoteVersion) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
