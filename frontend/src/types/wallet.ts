export type WalletStatus = 'ACTIVE' | 'DEPOSIT_DEFICIT' | 'FROZEN_COOLING' | 'CLOSED';

export type WalletBalanceType = 'AVAILABLE' | 'DEPOSIT';

export type WalletTransactionType =
  | 'ADMIN_INITIAL_DEPOSIT'
  | 'ADMIN_TOPUP_DEPOSIT'
  | 'ORDER_INCOME_LABOR'
  | 'ORDER_INCOME_MATERIALS'
  | 'WITHDRAW_AVAILABLE'
  | 'DISPUTE_PENALTY'
  | 'DEPOSIT_REFUND';

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

export interface PayoutRequestResponse {
  id: string;
  providerId: string;
  providerName: string | null;
  amount: number;
  sourceWalletType: WalletBalanceType;
  bankCode: string;
  accountNumber: string;
  accountHolderName: string;
  status: PayoutStatus;
  coolingEndsAt: string | null;
  adminNote: string | null;
  processedByName: string | null;
  processedAt: string | null;
  createdAt: string;
}

export interface FinancialDashboardSummaryResponse {
  totalGmv: number;
  totalPlatformRevenue: number;
  totalProviderEarnings: number;
  totalDepositFunds: number;
  totalPendingPayoutAmount: number;
  activeProvidersCount: number;
  deficitProvidersCount: number;
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
