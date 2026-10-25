package com.nhalo24h.wallet.domain;

import com.nhalo24h.provider.domain.ProviderProfile;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "provider_wallets")
public class ProviderWallet {

    public static final long DEFAULT_DEPOSIT_TARGET = 2000000L; // 2.000.000 VND

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false, unique = true)
    private ProviderProfile providerProfile;

    @Column(name = "available_balance", nullable = false)
    private Long availableBalance = 0L;

    @Column(name = "deposit_balance", nullable = false)
    private Long depositBalance = 0L;

    @Column(name = "deposit_target", nullable = false)
    private Long depositTarget = DEFAULT_DEPOSIT_TARGET;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private WalletStatus status = WalletStatus.ACTIVE;

    @Column(name = "cooling_ends_at")
    private Instant coolingEndsAt;

    @Column(name = "last_completed_order_at")
    private Instant lastCompletedOrderAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public ProviderWallet() {}

    public ProviderWallet(ProviderProfile providerProfile, Long depositBalance) {
        this.providerProfile = providerProfile;
        this.availableBalance = 0L;
        this.depositBalance = depositBalance != null ? depositBalance : DEFAULT_DEPOSIT_TARGET;
        this.depositTarget = DEFAULT_DEPOSIT_TARGET;
        this.status = this.depositBalance >= this.depositTarget ? WalletStatus.ACTIVE : WalletStatus.DEPOSIT_DEFICIT;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        if (this.availableBalance == null) this.availableBalance = 0L;
        if (this.depositBalance == null) this.depositBalance = 0L;
        if (this.depositTarget == null) this.depositTarget = DEFAULT_DEPOSIT_TARGET;
        if (this.status == null) this.status = WalletStatus.ACTIVE;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public boolean isEligibleToAcceptOrders() {
        return this.status == WalletStatus.ACTIVE && this.depositBalance >= this.depositTarget;
    }

    public void creditAvailable(long amount) {
        if (amount < 0) throw new IllegalArgumentException("Số tiền cộng vào ví khả dụng phải > 0");
        this.availableBalance += amount;
    }

    public void debitAvailable(long amount) {
        if (amount <= 0) throw new IllegalArgumentException("Số tiền rút khỏi ví khả dụng phải > 0");
        if (this.availableBalance < amount) {
            throw new IllegalStateException("Số dư khả dụng không đủ để thực hiện giao dịch (Số dư: " 
                + this.availableBalance + ", Yêu cầu: " + amount + ")");
        }
        this.availableBalance -= amount;
    }

    public void creditDeposit(long amount) {
        if (amount <= 0) throw new IllegalArgumentException("Số tiền nạp ký quỹ phải > 0");
        this.depositBalance += amount;
        if (this.status == WalletStatus.DEPOSIT_DEFICIT && this.depositBalance >= this.depositTarget) {
            this.status = WalletStatus.ACTIVE;
        }
    }

    public void debitDeposit(long amount) {
        if (amount <= 0) throw new IllegalArgumentException("Số tiền trừ ký quỹ phải > 0");
        this.depositBalance = Math.max(0L, this.depositBalance - amount);
        if (this.depositBalance < this.depositTarget && this.status == WalletStatus.ACTIVE) {
            this.status = WalletStatus.DEPOSIT_DEFICIT;
        }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public ProviderProfile getProviderProfile() { return providerProfile; }
    public void setProviderProfile(ProviderProfile providerProfile) { this.providerProfile = providerProfile; }

    public Long getAvailableBalance() { return availableBalance; }
    public void setAvailableBalance(Long availableBalance) { this.availableBalance = availableBalance; }

    public Long getDepositBalance() { return depositBalance; }
    public void setDepositBalance(Long depositBalance) { this.depositBalance = depositBalance; }

    public Long getDepositTarget() { return depositTarget; }
    public void setDepositTarget(Long depositTarget) { this.depositTarget = depositTarget; }

    public WalletStatus getStatus() { return status; }
    public void setStatus(WalletStatus status) { this.status = status; }

    public Instant getCoolingEndsAt() { return coolingEndsAt; }
    public void setCoolingEndsAt(Instant coolingEndsAt) { this.coolingEndsAt = coolingEndsAt; }

    public Instant getLastCompletedOrderAt() { return lastCompletedOrderAt; }
    public void setLastCompletedOrderAt(Instant lastCompletedOrderAt) { this.lastCompletedOrderAt = lastCompletedOrderAt; }

    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ProviderWallet that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
