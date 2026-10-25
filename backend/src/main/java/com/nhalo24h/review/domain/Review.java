package com.nhalo24h.review.domain;

import com.nhalo24h.order.domain.Order;
import com.nhalo24h.provider.domain.ProviderProfile;
import com.nhalo24h.user.domain.User;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_profile_id", nullable = false)
    private ProviderProfile providerProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @Column(name = "rating", nullable = false)
    private Short rating;

    @Column(name = "punctuality_rating")
    private Short punctualityRating;

    @Column(name = "skill_rating")
    private Short skillRating;

    @Column(name = "attitude_rating")
    private Short attitudeRating;

    @Column(name = "price_rating")
    private Short priceRating;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @Column(name = "tags", length = 500)
    private String tags;

    @Column(name = "images", columnDefinition = "TEXT")
    private String images;

    @Column(name = "is_anonymous", nullable = false)
    private Boolean isAnonymous = false;

    @Column(name = "is_visible", nullable = false)
    private Boolean isVisible = true;

    @Column(name = "provider_reply", columnDefinition = "TEXT")
    private String providerReply;

    @Column(name = "provider_replied_at")
    private Instant providerRepliedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Review() {
    }

    public Review(Order order, ProviderProfile providerProfile, User customer, Short rating) {
        this.order = order;
        this.providerProfile = providerProfile;
        this.customer = customer;
        this.rating = rating;
        this.isAnonymous = false;
        this.isVisible = true;
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
        if (this.isAnonymous == null) {
            this.isAnonymous = false;
        }
        if (this.isVisible == null) {
            this.isVisible = true;
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

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public ProviderProfile getProviderProfile() {
        return providerProfile;
    }

    public void setProviderProfile(ProviderProfile providerProfile) {
        this.providerProfile = providerProfile;
    }

    public User getCustomer() {
        return customer;
    }

    public void setCustomer(User customer) {
        this.customer = customer;
    }

    public Short getRating() {
        return rating;
    }

    public void setRating(Short rating) {
        this.rating = rating;
    }

    public Short getPunctualityRating() {
        return punctualityRating;
    }

    public void setPunctualityRating(Short punctualityRating) {
        this.punctualityRating = punctualityRating;
    }

    public Short getSkillRating() {
        return skillRating;
    }

    public void setSkillRating(Short skillRating) {
        this.skillRating = skillRating;
    }

    public Short getAttitudeRating() {
        return attitudeRating;
    }

    public void setAttitudeRating(Short attitudeRating) {
        this.attitudeRating = attitudeRating;
    }

    public Short getPriceRating() {
        return priceRating;
    }

    public void setPriceRating(Short priceRating) {
        this.priceRating = priceRating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public String getImages() {
        return images;
    }

    public void setImages(String images) {
        this.images = images;
    }

    public Boolean getIsAnonymous() {
        return isAnonymous;
    }

    public void setIsAnonymous(Boolean anonymous) {
        isAnonymous = anonymous;
    }

    public Boolean getIsVisible() {
        return isVisible;
    }

    public void setIsVisible(Boolean visible) {
        isVisible = visible;
    }

    public String getProviderReply() {
        return providerReply;
    }

    public void setProviderReply(String providerReply) {
        this.providerReply = providerReply;
    }

    public Instant getProviderRepliedAt() {
        return providerRepliedAt;
    }

    public void setProviderRepliedAt(Instant providerRepliedAt) {
        this.providerRepliedAt = providerRepliedAt;
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
        Review review = (Review) o;
        return Objects.equals(id, review.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
