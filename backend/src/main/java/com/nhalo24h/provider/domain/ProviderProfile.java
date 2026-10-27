package com.nhalo24h.provider.domain;

import com.nhalo24h.user.domain.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "provider_profiles")
public class ProviderProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "headline", length = 150)
    private String headline;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "experience_years")
    private Integer experienceYears = 0;

    @Column(name = "price_per_hour")
    private Long pricePerHour = 0L;

    @Column(name = "service_area", length = 255)
    private String serviceArea;

    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = true;

    @Column(name = "rating_average", nullable = false)
    private Double ratingAverage = 5.0;

    @Column(name = "review_count", nullable = false)
    private Integer reviewCount = 0;

    @Column(name = "report_count", nullable = false)
    private Integer reportCount = 0;

    @Column(name = "suspended_until")
    private Instant suspendedUntil;

    @Column(name = "warning_count", nullable = false)
    private Integer warningCount = 0;

    @OneToMany(mappedBy = "providerProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ProviderCategory> providerCategories = new HashSet<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public ProviderProfile() {
    }

    public ProviderProfile(User user) {
        this.user = user;
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
        if (this.experienceYears == null) {
            this.experienceYears = 0;
        }
        if (this.pricePerHour == null) {
            this.pricePerHour = 0L;
        }
        if (this.isAvailable == null) {
            this.isAvailable = true;
        }
        if (this.ratingAverage == null) {
            this.ratingAverage = 5.0;
        }
        if (this.reviewCount == null) {
            this.reviewCount = 0;
        }
        if (this.reportCount == null) {
            this.reportCount = 0;
        }
        if (this.warningCount == null) {
            this.warningCount = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public boolean isSuspended() {
        return suspendedUntil != null && Instant.now().isBefore(suspendedUntil);
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getHeadline() {
        return headline;
    }

    public void setHeadline(String headline) {
        this.headline = headline;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public Integer getExperienceYears() {
        return experienceYears;
    }

    public void setExperienceYears(Integer experienceYears) {
        this.experienceYears = experienceYears;
    }

    public Long getPricePerHour() {
        return pricePerHour;
    }

    public void setPricePerHour(Long pricePerHour) {
        this.pricePerHour = pricePerHour;
    }

    public String getServiceArea() {
        return serviceArea;
    }

    public void setServiceArea(String serviceArea) {
        this.serviceArea = serviceArea;
    }

    public Boolean getIsAvailable() {
        return isAvailable;
    }

    public void setIsAvailable(Boolean isAvailable) {
        this.isAvailable = isAvailable;
    }

    public Instant getSuspendedUntil() {
        return suspendedUntil;
    }

    public void setSuspendedUntil(Instant suspendedUntil) {
        this.suspendedUntil = suspendedUntil;
    }

    public Integer getWarningCount() {
        return warningCount;
    }

    public void setWarningCount(Integer warningCount) {
        this.warningCount = warningCount;
    }

    public Set<ProviderCategory> getProviderCategories() {
        return providerCategories;
    }

    public void setProviderCategories(Set<ProviderCategory> providerCategories) {
        this.providerCategories = providerCategories;
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

    public Double getRatingAverage() {
        return ratingAverage;
    }

    public void setRatingAverage(Double ratingAverage) {
        this.ratingAverage = ratingAverage;
    }

    public Integer getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Integer reviewCount) {
        this.reviewCount = reviewCount;
    }

    public Integer getReportCount() {
        return reportCount;
    }

    public void setReportCount(Integer reportCount) {
        this.reportCount = reportCount;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProviderProfile that = (ProviderProfile) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
