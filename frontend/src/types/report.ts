export type ReportReasonType =
  | 'OVERCHARGING_OR_OFF_PLATFORM'
  | 'POOR_QUALITY_OR_DAMAGE'
  | 'NO_SHOW_OR_ABANDONMENT'
  | 'UNPROFESSIONAL_BEHAVIOR'
  | 'WARRANTY_REFUSAL'
  | 'FRAUD_OR_DISHONEST'
  | 'OTHER';

export type ReportStatus = 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'REJECTED';

export type PenaltyType =
  | 'NONE'
  | 'WARNING'
  | 'DEPOSIT_DEDUCTION'
  | 'TEMPORARY_BAN'
  | 'PERMANENT_BAN';

export type CompensationStatus = 'NONE' | 'PENDING_PAYOUT' | 'COMPLETED';

export interface CreateReportPayload {
  orderId?: string;
  providerId: string;
  reasonType: ReportReasonType;
  title: string;
  description: string;
  evidenceImages?: string[];
  expectedResolution?: string;
}

export interface ResolveReportPayload {
  status: ReportStatus;
  penaltyType?: PenaltyType;
  penaltyAmount?: number;
  banDurationDays?: number;
  compensationAmount?: number;
  customerBankCode?: string;
  customerAccountNumber?: string;
  customerAccountHolder?: string;
  adminNotes?: string;
}

export interface RefundPenaltyPayload {
  reason: string;
}


export interface RevokeSuspensionPayload {
  reason: string;
}

export interface ConfirmCompensationPayload {
  payoutRef: string;
  note?: string;
}

export interface ReportItem {
  id: string;
  reportCode: string;
  orderId?: string | null;
  orderCode?: string | null;
  orderTitle?: string | null;
  providerId: string;
  providerName: string;
  providerAvatar?: string | null;
  reporterId: string;
  reporterName: string;
  reporterPhone?: string | null;
  reasonType: ReportReasonType;
  title: string;
  description: string;
  evidenceImages: string[];
  expectedResolution?: string | null;
  status: ReportStatus;
  penaltyType: PenaltyType;
  penaltyAmount: number;
  banDurationDays?: number | null;
  adminNotes?: string | null;
  resolvedByName?: string | null;
  resolvedAt?: string | null;
  refundedAt?: string | null;
  refundedByName?: string | null;
  refundReason?: string | null;
  suspensionLiftedAt?: string | null;
  suspensionLiftedByName?: string | null;
  suspensionLiftedReason?: string | null;
  isSuspensionActive?: boolean;
  compensationAmount: number;
  compensationStatus: CompensationStatus;
  customerBankCode?: string | null;
  customerAccountNumber?: string | null;
  customerAccountHolder?: string | null;
  compensationPayoutRef?: string | null;
  compensationPayoutAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
