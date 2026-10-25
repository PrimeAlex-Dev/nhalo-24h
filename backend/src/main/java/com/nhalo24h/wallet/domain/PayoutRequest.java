package com.nhalo24h.wallet.domain;

import com.nhalo24h.provider.domain.ProviderProfile;
import com.nhalo24h.user.domain.User;
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
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "payout_requests")
public class PayoutRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private ProviderProfile providerProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    private ProviderWallet wallet;

    @Column(name = "amount", nullable = false)
    private Long amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_wallet_type", nullable = false, length = 30)
    private WalletBalanceType sourceWalletType = WalletBalanceType.AVAILABLE;

    @Column(name = "bank_code", nullable = false, length = 30)
    private String bankCode;

    @Column(name = "account_number", nullable = false, length = 50)
    private String accountNumber;

    @Column(name = "account_holder_name", nullable = false, length = 100)
    private String accountHolderName;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private PayoutStatus status = PayoutStatus.PENDING;

    @Column(name = "cooling_ends_at")
    private Instant coolingEndsAt;

    @Column(name = "admin_note", columnDefinition = "TEXT")
    private String adminNote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private User processedBy;

    @Column(name = "processed_at")
    private Instant processedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public PayoutRequest() {}

    public PayoutRequest(
            ProviderProfile providerProfile,
            ProviderWallet wallet,
            Long amount,
            WalletBalanceType sourceWalletType,
            String bankCode,
            String accountNumber,
            String accountHolderName) {
        this.providerProfile = providerProfile;
        this.wallet = wallet;
        this.amount = amount;
        this.sourceWalletType = sourceWalletType != null ? sourceWalletType : WalletBalanceType.AVAILABLE;
        this.bankCode = bankCode;
        this.accountNumber = accountNumber;
        this.accountHolderName = accountHolderName;
        this.status = this.sourceWalletType == WalletBalanceType.DEPOSIT ? PayoutStatus.COOLING_WAIT : PayoutStatus.PENDING;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        if (this.status == null) {
            this.status = this.sourceWalletType == WalletBalanceType.DEPOSIT ? PayoutStatus.COOLING_WAIT : PayoutStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public ProviderProfile getProviderProfile() { return providerProfile; }
    public void setProviderProfile(ProviderProfile providerProfile) { this.providerProfile = providerProfile; }

    public ProviderWallet getWallet() { return wallet; }
    public void setWallet(ProviderWallet wallet) { this.wallet = wallet; }

    public Long getAmount() { return amount; }
    public void setAmount(Long amount) { this.amount = amount; }

    public WalletBalanceType getSourceWalletType() { return sourceWalletType; }
    public void setSourceWalletType(WalletBalanceType sourceWalletType) { this.sourceWalletType = sourceWalletType; }

    public String getBankCode() { return bankCode; }
    public void setBankCode(String bankCode) { this.bankCode = bankCode; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public String getAccountHolderName() { return accountHolderName; }
    public void setAccountHolderName(String accountHolderName) { this.accountHolderName = accountHolderName; }

    public PayoutStatus getStatus() { return status; }
    public void setStatus(PayoutStatus status) { this.status = status; }

    public Instant getCoolingEndsAt() { return coolingEndsAt; }
    public void setCoolingEndsAt(Instant coolingEndsAt) { this.coolingEndsAt = coolingEndsAt; }

    public String getAdminNote() { return adminNote; }
    public void setAdminNote(String adminNote) { this.adminNote = adminNote; }

    public User getProcessedBy() { return processedBy; }
    public void setProcessedBy(User processedBy) { this.processedBy = processedBy; }

    public Instant getProcessedAt() { return processedAt; }
    public void setProcessedAt(Instant processedAt) { this.processedAt = processedAt; }

    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PayoutRequest that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
