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
  adminNotes?: string;
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
  adminNotes?: string | null;
  resolvedByName?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
