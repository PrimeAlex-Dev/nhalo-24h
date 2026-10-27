export type WalletStatus = 'ACTIVE' | 'DEPOSIT_DEFICIT' | 'FROZEN_COOLING' | 'CLOSED';

export type WalletBalanceType = 'AVAILABLE' | 'DEPOSIT';

export type WalletTransactionType =
  | 'ADMIN_INITIAL_DEPOSIT'
  | 'ADMIN_TOPUP_DEPOSIT'
  | 'ORDER_INCOME_LABOR'
  | 'ORDER_INCOME_MATERIALS'
  | 'WITHDRAW_AVAILABLE'
  | 'DISPUTE_PENALTY'
  | 'DEPOSIT_REFUND'
  | 'TOPUP_DEPOSIT_FROM_AVAILABLE'
  | 'TOPUP_DEPOSIT_VIETQR'
  | 'DISPUTE_PENALTY_REFUND';

export type PayoutStatus = 'PENDING' | 'COOLING_WAIT' | 'COMPLETED' | 'REJECTED';

export interface ProviderWalletResponse {
  id: string;
  providerId: string;
  availableBalance: number;
  depositBalance: number;
  depositTarget: number;
  status: WalletStatus;
  coolingEndsAt: string | null;
  lastCompletedOrderAt: string | null;
  eligibleToAcceptOrders: boolean;
}

export interface WalletTransactionResponse {
  id: string;
  balanceType: WalletBalanceType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  type: WalletTransactionType;
  referenceId: string | null;
  createdBy: string | null;
  note: string | null;
  createdAt: string;
}

export interface CreatePayoutRequestDto {
  amount: number;
  bankCode: string;
  accountNumber: string;
  accountHolderName: string;
}

export interface RequestDepositRefundDto {
  bankCode: string;
  accountNumber: string;
  accountHolderName: string;
  reason?: string;
}

export interface TopupDepositFromAvailableDto {
  amount: number;
}

export interface TopupDepositVietQrDto {
  amount: number;
  note?: string;
}

export interface PayoutRequestResponse {
  id: string;
  providerId: string;
  providerName: string | null;
  amount: number;
  sourceWalletType: WalletBalanceType;
  bankCode: string;
  accountNumber: string;
  accountHolderName: string;
  reason: string | null;
  status: PayoutStatus;
  coolingEndsAt: string | null;
  adminNote: string | null;
  processedBy: string | null;
  processedAt: string | null;
  createdAt: string;
}

export interface AdminReviewPayoutRequestDto {
  action: 'APPROVE' | 'REJECT';
  adminNote?: string;
}

export interface AdminTopupDepositRequestDto {
  amount: number;
  note?: string;
}

export interface AdminDisputePenaltyRequestDto {
  penaltyAmount: number;
  reason: string;
  disputeOrderId?: string;
}

export interface FinancialDashboardSummaryResponse {
  totalGmv: number;
  totalPlatformCommission: number;
  totalProviderEarnings: number;
  totalDepositHeld?: number;
  totalPendingPayoutAmount?: number;
  activeWalletsCount?: number;
  deficitWalletsCount?: number;
  // Aliases for compatibility
  totalPlatformRevenue?: number;
  totalDepositFunds?: number;
  activeProvidersCount?: number;
  deficitProvidersCount?: number;
}
