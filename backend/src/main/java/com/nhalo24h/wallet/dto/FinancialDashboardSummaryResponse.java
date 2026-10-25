package com.nhalo24h.wallet.dto;

public record FinancialDashboardSummaryResponse(
        Long totalGmv,
        Long totalPlatformRevenue,
        Long totalProviderEarnings,
        Long totalDepositFunds,
        Long totalPendingPayoutAmount,
        long activeProvidersCount,
        long deficitProvidersCount
) {}
