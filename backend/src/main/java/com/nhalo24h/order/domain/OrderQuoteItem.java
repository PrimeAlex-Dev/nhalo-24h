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
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "order_quote_items")
public class OrderQuoteItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quote_version_id", nullable = false)
    private OrderQuoteVersion quoteVersion;

    @Column(name = "item_name", nullable = false, length = 200)
    private String itemName;

    @Column(name = "unit", length = 50)
    private String unit;

    @Column(name = "quantity", nullable = false)
    private Integer quantity = 1;

    @Column(name = "unit_price", nullable = false)
    private Long unitPrice = 0L;

    @Column(name = "total_price", nullable = false)
    private Long totalPrice = 0L;

    @Column(name = "note", length = 500)
    private String note;

    public OrderQuoteItem() {
    }

    public OrderQuoteItem(String itemName, String unit, Integer quantity, Long unitPrice, String note) {
        this.itemName = itemName;
        this.unit = unit != null && !unit.isBlank() ? unit.trim() : "Cái";
        this.quantity = quantity != null && quantity > 0 ? quantity : 1;
        this.unitPrice = unitPrice != null && unitPrice >= 0 ? unitPrice : 0L;
        this.totalPrice = this.quantity * this.unitPrice;
        this.note = note;
    }

    @PrePersist
    protected void onCreate() {
        if (this.quantity == null || this.quantity <= 0) {
            this.quantity = 1;
        }
        if (this.unitPrice == null || this.unitPrice < 0) {
            this.unitPrice = 0L;
        }
        this.totalPrice = this.quantity * this.unitPrice;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public OrderQuoteVersion getQuoteVersion() {
        return quoteVersion;
    }

    public void setQuoteVersion(OrderQuoteVersion quoteVersion) {
        this.quoteVersion = quoteVersion;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Long getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(Long unitPrice) {
        this.unitPrice = unitPrice;
    }

    public Long getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(Long totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        OrderQuoteItem that = (OrderQuoteItem) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
