package com.nhalo24h.order.domain;

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
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "order_audit_logs")
public class OrderAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "actor_user_id")
    private UUID actorUserId;

    @Column(name = "actor_role", length = 30)
    private String actorRole;

    @Column(name = "action_type", nullable = false, length = 50)
    private String actionType;

    @Column(name = "old_order_status", length = 50)
    private String oldOrderStatus;

    @Column(name = "new_order_status", length = 50)
    private String newOrderStatus;

    @Column(name = "old_payment_status", length = 50)
    private String oldPaymentStatus;

    @Column(name = "new_payment_status", length = 50)
    private String newPaymentStatus;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public OrderAuditLog() {
    }

    public OrderAuditLog(
        Order order,
        UUID actorUserId,
        String actorRole,
        String actionType,
        String oldOrderStatus,
        String newOrderStatus,
        String oldPaymentStatus,
        String newPaymentStatus,
        String description
    ) {
        this.order = order;
        this.actorUserId = actorUserId;
        this.actorRole = actorRole;
        this.actionType = actionType;
        this.oldOrderStatus = oldOrderStatus;
        this.newOrderStatus = newOrderStatus;
        this.oldPaymentStatus = oldPaymentStatus;
        this.newPaymentStatus = newPaymentStatus;
        this.description = description;
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

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public UUID getActorUserId() {
        return actorUserId;
    }

    public void setActorUserId(UUID actorUserId) {
        this.actorUserId = actorUserId;
    }

    public String getActorRole() {
        return actorRole;
    }

    public void setActorRole(String actorRole) {
        this.actorRole = actorRole;
    }

    public String getActionType() {
        return actionType;
    }

    public void setActionType(String actionType) {
        this.actionType = actionType;
    }

    public String getOldOrderStatus() {
        return oldOrderStatus;
    }

    public void setOldOrderStatus(String oldOrderStatus) {
        this.oldOrderStatus = oldOrderStatus;
    }

    public String getNewOrderStatus() {
        return newOrderStatus;
    }

    public void setNewOrderStatus(String newOrderStatus) {
        this.newOrderStatus = newOrderStatus;
    }

    public String getOldPaymentStatus() {
        return oldPaymentStatus;
    }

    public void setOldPaymentStatus(String oldPaymentStatus) {
        this.oldPaymentStatus = oldPaymentStatus;
    }

    public String getNewPaymentStatus() {
        return newPaymentStatus;
    }

    public void setNewPaymentStatus(String newPaymentStatus) {
        this.newPaymentStatus = newPaymentStatus;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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
        OrderAuditLog that = (OrderAuditLog) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
