package com.nhalo24h.wallet.domain;

import com.nhalo24h.order.domain.Order;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "platform_financial_records")
public class PlatformFinancialRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Column(name = "total_paid", nullable = false)
    private Long totalPaid;

    @Column(name = "labor_fee", nullable = false)
    private Long laborFee = 0L;

    @Column(name = "materials_fee", nullable = false)
    private Long materialsFee = 0L;

    @Column(name = "platform_commission", nullable = false)
    private Long platformCommission = 0L;

    @Column(name = "provider_earning", nullable = false)
    private Long providerEarning = 0L;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public PlatformFinancialRecord() {}

    public PlatformFinancialRecord(
            Order order,
            Long totalPaid,
            Long laborFee,
            Long materialsFee,
            Long platformCommission,
            Long providerEarning) {
        this.order = order;
        this.totalPaid = totalPaid;
        this.laborFee = laborFee != null ? laborFee : 0L;
        this.materialsFee = materialsFee != null ? materialsFee : 0L;
        this.platformCommission = platformCommission != null ? platformCommission : 0L;
        this.providerEarning = providerEarning != null ? providerEarning : 0L;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public Long getTotalPaid() { return totalPaid; }
    public void setTotalPaid(Long totalPaid) { this.totalPaid = totalPaid; }

    public Long getLaborFee() { return laborFee; }
    public void setLaborFee(Long laborFee) { this.laborFee = laborFee; }

    public Long getMaterialsFee() { return materialsFee; }
    public void setMaterialsFee(Long materialsFee) { this.materialsFee = materialsFee; }

    public Long getPlatformCommission() { return platformCommission; }
    public void setPlatformCommission(Long platformCommission) { this.platformCommission = platformCommission; }

    public Long getProviderEarning() { return providerEarning; }
    public void setProviderEarning(Long providerEarning) { this.providerEarning = providerEarning; }

    public Instant getCreatedAt() { return createdAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PlatformFinancialRecord that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
