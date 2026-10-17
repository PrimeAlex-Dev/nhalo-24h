package com.nhalo24h.auth.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "invalidated_tokens")
public class InvalidatedToken {

    @Id
    @Column(name = "id", nullable = false, length = 100)
    private String id;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "expiry_time", nullable = false)
    private Instant expiryTime;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public InvalidatedToken() {
    }

    public InvalidatedToken(String id, UUID userId, Instant expiryTime) {
        this.id = id;
        this.userId = userId;
        this.expiryTime = expiryTime;
        this.createdAt = Instant.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public Instant getExpiryTime() {
        return expiryTime;
    }

    public void setExpiryTime(Instant expiryTime) {
        this.expiryTime = expiryTime;
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
        if (o == null || getClass() != o.getClass()) return false;
        InvalidatedToken that = (InvalidatedToken) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
