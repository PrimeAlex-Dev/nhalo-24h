package com.nhalo24h.category.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "service_categories")
public class ServiceCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "slug", nullable = false, length = 120)
    private String slug;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "icon_url", length = 500)
    private String iconUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private CategoryStatus status;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Column(name = "default_workflow_type", nullable = false, length = 30)
    private String defaultWorkflowType = "SURVEY_FIRST";

    @Column(name = "commission_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal commissionRate = new BigDecimal("10.00");

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public ServiceCategory() {
    }

    public ServiceCategory(String name, String slug, String description, String iconUrl, CategoryStatus status, Integer displayOrder) {
        this.name = name != null ? name.trim() : null;
        this.slug = slug != null ? slug.trim().toLowerCase() : null;
        this.description = normalizeString(description);
        this.iconUrl = normalizeString(iconUrl);
        this.status = status != null ? status : CategoryStatus.ACTIVE;
        this.displayOrder = displayOrder != null ? displayOrder : 0;
        this.defaultWorkflowType = "SURVEY_FIRST";
        this.commissionRate = new BigDecimal("10.00");
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
            this.status = CategoryStatus.ACTIVE;
        }
        if (this.displayOrder == null) {
            this.displayOrder = 0;
        }
        if (this.defaultWorkflowType == null || this.defaultWorkflowType.isBlank()) {
            this.defaultWorkflowType = "SURVEY_FIRST";
        }
        if (this.commissionRate == null) {
            this.commissionRate = new BigDecimal("10.00");
        }
        if (this.name != null) {
            this.name = this.name.trim();
        }
        if (this.slug != null) {
            this.slug = this.slug.trim().toLowerCase();
        }
        this.description = normalizeString(this.description);
        this.iconUrl = normalizeString(this.iconUrl);
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
        if (this.name != null) {
            this.name = this.name.trim();
        }
        if (this.slug != null) {
            this.slug = this.slug.trim().toLowerCase();
        }
        this.description = normalizeString(this.description);
        this.iconUrl = normalizeString(this.iconUrl);
    }

    private String normalizeString(String raw) {
        if (raw == null) {
            return null;
        }
        String trimmed = raw.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name != null ? name.trim() : null;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug != null ? slug.trim().toLowerCase() : null;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = normalizeString(description);
    }

    public String getIconUrl() {
        return iconUrl;
    }

    public void setIconUrl(String iconUrl) {
        this.iconUrl = normalizeString(iconUrl);
    }

    public CategoryStatus getStatus() {
        return status;
    }

    public void setStatus(CategoryStatus status) {
        this.status = status != null ? status : CategoryStatus.ACTIVE;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder != null ? displayOrder : 0;
    }

    public String getDefaultWorkflowType() {
        return defaultWorkflowType;
    }

    public void setDefaultWorkflowType(String defaultWorkflowType) {
        this.defaultWorkflowType = defaultWorkflowType != null ? defaultWorkflowType : "SURVEY_FIRST";
    }

    public BigDecimal getCommissionRate() {
        return commissionRate;
    }

    public void setCommissionRate(BigDecimal commissionRate) {
        this.commissionRate = commissionRate != null ? commissionRate : new BigDecimal("10.00");
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
        ServiceCategory that = (ServiceCategory) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
