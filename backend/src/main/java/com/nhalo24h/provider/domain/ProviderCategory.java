package com.nhalo24h.provider.domain;

import com.nhalo24h.category.domain.ServiceCategory;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(
    name = "provider_categories",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_provider_category", columnNames = {"provider_profile_id", "category_id"})
    }
)
public class ProviderCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "provider_profile_id", nullable = false)
    private ProviderProfile providerProfile;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private ServiceCategory category;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public ProviderCategory() {
    }

    public ProviderCategory(ProviderProfile providerProfile, ServiceCategory category) {
        this.providerProfile = providerProfile;
        this.category = category;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public ProviderProfile getProviderProfile() {
        return providerProfile;
    }

    public void setProviderProfile(ProviderProfile providerProfile) {
        this.providerProfile = providerProfile;
    }

    public ServiceCategory getCategory() {
        return category;
    }

    public void setCategory(ServiceCategory category) {
        this.category = category;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ProviderCategory that)) return false;
        if (this.id != null && that.id != null) {
            return Objects.equals(this.id, that.id);
        }
        UUID thisCatId = this.category != null ? this.category.getId() : null;
        UUID thatCatId = that.category != null ? that.category.getId() : null;
        return Objects.equals(thisCatId, thatCatId);
    }

    @Override
    public int hashCode() {
        if (this.id != null) {
            return Objects.hash(this.id);
        }
        return Objects.hash(this.category != null ? this.category.getId() : null);
    }
}
