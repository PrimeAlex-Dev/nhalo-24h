export type OrderStatus = 'PENDING_PROVIDER' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';

export type OrderRequestStatus = 'PENDING_RESPONSE' | 'QUOTED' | 'REJECTED' | 'ACCEPTED' | 'CANCELED';

export type MessageSenderRole = 'CUSTOMER' | 'PROVIDER';

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
}

export interface DispatchOrderRequestsPayload {
  providerIds: string[];
}

export interface SubmitQuotationPayload {
  quotedPrice: number;
  providerNote?: string;
  estimatedArrivalTime?: string;
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
  quotedPrice?: number;
  providerNote?: string;
  estimatedArrivalTime?: string;
  rejectReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerOrderSummary {
  id: string;
  orderCode: string;
  title: string;
  categoryName?: string;
  status: OrderStatus;
  addressSnapshot: string;
  expectedScheduleTime: string;
  finalPrice?: number;
  assignedProviderId?: string;
  assignedProviderName?: string;
  assignedProviderAvatar?: string;
  quotationCount: number;
  createdAt: string;
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
  status: OrderStatus;
  finalPrice?: number;
  cancelReason?: string;
  assignedProviderId?: string;
  assignedProviderName?: string;
  assignedProviderAvatar?: string;
  assignedProviderPhone?: string;
  images: string[];
  quotations: QuotationItem[];
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
  images: string[];
  requestStatus: OrderRequestStatus;
  orderStatus: OrderStatus;
  quotedPrice?: number;
  providerNote?: string;
  estimatedArrivalTime?: string;
  rejectReason?: string;
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
