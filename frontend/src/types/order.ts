export type OrderStatus =
  | 'PENDING_PROVIDER'
  | 'AWAITING_SURVEY'
  | 'AWAITING_CUSTOMER_APPROVAL'
  | 'IN_PROGRESS'
  | 'AWAITING_COMPLETION_CONFIRMATION'
  | 'DECLINED_AFTER_SURVEY'
  | 'COMPLETED'
  | 'CANCELED'
  | 'DISPUTED';

export type PaymentStatus =
  | 'UNPAID'
  | 'PAYMENT_PENDING'
  | 'PAID_ONLINE'
  | 'CASH_PENDING_CONFIRMATION'
  | 'CASH_CONFIRMED'
  | 'PAYMENT_DISPUTED'
  | 'REFUNDED';

export type PaymentMethod = 'CASH' | 'ONLINE';

export type QuoteMode = 'SURVEY_REQUIRED' | 'COMMITTED_FIXED';

export type QuoteVersionType =
  | 'INITIAL_ESTIMATE'
  | 'POST_SURVEY_FINAL'
  | 'IN_PROGRESS_CHANGE'
  | 'COMPLETION_INVOICE';

export type QuoteVersionStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUPERSEDED';

export type OrderRequestStatus =
  | 'PENDING_RESPONSE'
  | 'QUOTED'
  | 'REJECTED'
  | 'ACCEPTED'
  | 'CANCELED';

export type MessageSenderRole = 'CUSTOMER' | 'PROVIDER';

export interface QuoteItemDto {
  id?: string;
  itemName: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  note?: string;
}

export interface QuoteVersionItem {
  id: string;
  orderId: string;
  requestId?: string;
  providerId: string;
  providerName: string;
  versionNumber: number;
  versionType: QuoteVersionType;
  quoteMode: QuoteMode;
  surveyFee: number;
  travelFee: number;
  waiveSurveyIfRepaired: boolean;
  waiveTravelIfRepaired: boolean;
  laborFee: number;
  materialsFee: number;
  totalAmount: number;
  diagnosisOrReason?: string;
  status: QuoteVersionStatus;
  items: QuoteItemDto[];
  createdAt: string;
  respondedAt?: string;
}

export interface OrderAuditLogItem {
  id: string;
  actorUserId?: string;
  actorRole?: string;
  actionType: string;
  oldOrderStatus?: string;
  newOrderStatus?: string;
  oldPaymentStatus?: string;
  newPaymentStatus?: string;
  description?: string;
  createdAt: string;
}

export interface CreateOrderPayload {
  categoryId: string;
  addressId: string;
  title: string;
  description: string;
  expectedScheduleTime: string;
  contactName?: string;
  contactPhone?: string;
  imageUrls?: string[];
  initialProviderIds?: string[];
  urgencyLevel?: string;
  serviceMetadata?: string;
}

export interface DispatchOrderRequestsPayload {
  providerIds: string[];
}

export interface SubmitQuotationPayload {
  quotedPrice?: number;
  providerNote?: string;
  estimatedArrivalTime?: string;
  quoteMode?: QuoteMode;
  surveyFee?: number;
  travelFee?: number;
  waiveSurveyIfRepaired?: boolean;
  waiveTravelIfRepaired?: boolean;
  estimatedLaborFee?: number;
  estimatedMaterialsFee?: number;
  scopeAndConditions?: string;
  items?: QuoteItemDto[];
}

export interface SubmitSurveyQuotePayload {
  laborFee: number;
  diagnosisOrReason: string;
  items?: QuoteItemDto[];
  surveyImageUrls?: string[];
}

export interface CompleteOrderPayload {
  completionNote?: string;
  completionImageUrls?: string[];
}

export interface DeclareCashPaymentPayload {
  declaredAmount: number;
  note?: string;
}

export interface ConfirmCashPaymentPayload {
  confirmed: boolean;
  actualReceivedAmount?: number;
  disputeReason?: string;
}

export interface OnlinePaymentInitResponse {
  orderId: string;
  orderCode: string;
  transactionRef: string;
  amountToPay: number;
  laborFee: number;
  materialsFee: number;
  appliedSurveyFee: number;
  appliedTravelFee: number;
  paymentStatus: PaymentStatus;
  gatewayProvider: string;
  createdAt: string;
}

export interface ConfirmOnlinePaymentPayload {
  transactionRef: string;
  success: boolean;
}

export interface ResolveDisputePayload {
  verifiedLaborFee: number;
  verifiedMaterialsFee: number;
  verifiedTotalPaid: number;
  resolutionNote: string;
}

export interface AdjustInvoicePayload {
  adjustedLaborFee: number;
  adjustedMaterialsFee: number;
  adminNote: string;
}

export interface DismissAbnormalFlagPayload {
  note: string;
}

export interface RejectOrderRequestPayload {
  rejectReason: string;
}

export interface CancelOrderPayload {
  reason?: string;
}

export interface SendChatMessagePayload {
  content: string;
}

export interface QuotationItem {
  requestId: string;
  providerId: string;
  providerUserId: string;
  providerName: string;
  providerAvatar?: string;
  providerHeadline?: string;
  pricePerHour?: number;
  status: OrderRequestStatus;
  quoteMode?: QuoteMode;
  surveyFee?: number;
  travelFee?: number;
  waiveSurveyIfRepaired?: boolean;
  waiveTravelIfRepaired?: boolean;
  estimatedLaborFee?: number;
  estimatedMaterialsFee?: number;
  quotedPrice?: number;
  providerNote?: string;
  scopeAndConditions?: string;
  estimatedArrivalTime?: string;
  rejectReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerOrderSummary {
  id: string;
  orderCode: string;
  title: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  workflowMode?: QuoteMode;
  urgencyLevel?: string;
  addressSnapshot: string;
  contactName?: string;
  contactPhone?: string;
  expectedScheduleTime: string;
  appliedSurveyFee?: number;
  appliedTravelFee?: number;
  finalLaborFee?: number;
  finalMaterialsFee?: number;
  finalPrice?: number;
  commissionRateSnapshot?: number;
  commissionAmount?: number;
  customerDeclaredAmount?: number;
  isFlaggedAbnormal?: boolean;
  abnormalReason?: string;
  disputeReason?: string;
  cancelReason?: string;
  assignedProviderId?: string;
  assignedProviderName?: string;
  assignedProviderPhone?: string;
  assignedProviderAvatar?: string;
  quotationCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CustomerOrderDetail {
  id: string;
  orderCode: string;
  title: string;
  description: string;
  categoryId?: string;
  categoryName?: string;
  addressSnapshot: string;
  contactName: string;
  contactPhone: string;
  expectedScheduleTime: string;
  urgencyLevel?: string;
  serviceMetadata?: string;
  status: OrderStatus;
  workflowMode?: QuoteMode;
  agreedSurveyFee?: number;
  agreedTravelFee?: number;
  waiveSurveyIfRepaired?: boolean;
  waiveTravelIfRepaired?: boolean;
  appliedSurveyFee?: number;
  appliedTravelFee?: number;
  finalLaborFee?: number;
  finalMaterialsFee?: number;
  finalPrice?: number;
  commissionRateSnapshot?: number;
  commissionAmount?: number;
  completionNote?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  onlineTransactionRef?: string;
  customerDeclaredAmount?: number;
  customerPaymentNote?: string;
  providerConfirmedAmount?: number;
  providerPaymentConfirmedAt?: string;
  disputeReason?: string;
  isFlaggedAbnormal?: boolean;
  abnormalReason?: string;
  cancelReason?: string;
  assignedProviderId?: string;
  assignedProviderName?: string;
  assignedProviderAvatar?: string;
  assignedProviderPhone?: string;
  images: string[];
  surveyImages?: string[];
  completionImages?: string[];
  quotations: QuotationItem[];
  quoteVersions?: QuoteVersionItem[];
  auditLogs?: OrderAuditLogItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ProviderJobItem {
  requestId: string;
  orderId: string;
  orderCode: string;
  title: string;
  description: string;
  categoryName?: string;
  customerName: string;
  customerPhone?: string;
  addressSnapshot: string;
  expectedScheduleTime: string;
  urgencyLevel?: string;
  serviceMetadata?: string;
  images: string[];
  surveyImages?: string[];
  completionImages?: string[];
  requestStatus: OrderRequestStatus;
  orderStatus: OrderStatus;
  quoteMode?: QuoteMode;
  surveyFee?: number;
  travelFee?: number;
  waiveSurveyIfRepaired?: boolean;
  waiveTravelIfRepaired?: boolean;
  appliedSurveyFee?: number;
  appliedTravelFee?: number;
  laborFee?: number;
  materialsFee?: number;
  quotedPrice?: number;
  commissionRateSnapshot?: number;
  commissionAmount?: number;
  providerNote?: string;
  scopeAndConditions?: string;
  completionNote?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  customerDeclaredAmount?: number;
  customerPaymentNote?: string;
  disputeReason?: string;
  estimatedArrivalTime?: string;
  rejectReason?: string;
  quoteVersions?: QuoteVersionItem[];
  createdAt: string;
}

export interface ChatMessageItem {
  id: string;
  requestId: string;
  senderUserId: string;
  senderRole: MessageSenderRole;
  senderName: string;
  content: string;
  createdAt: string;
}

export interface SpringPageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
