import { request } from './apiClient';
import type {
  ProviderJobItem,
  SubmitQuotationPayload,
  RejectOrderRequestPayload,
  OrderRequestStatus,
  OrderStatus,
} from '../types/order';

export const providerJobService = {
  /**
   * Lấy danh sách yêu cầu báo giá gửi đến thợ
   */
  async getIncomingRequests(status?: OrderRequestStatus): Promise<ProviderJobItem[]> {
    const url = status
      ? `/api/v1/provider/requests?status=${encodeURIComponent(status)}`
      : '/api/v1/provider/requests';
    return request<ProviderJobItem[]>(url, {
      method: 'GET',
    });
  },

  /**
   * Xem chi tiết 1 yêu cầu công việc
   */
  async getJobDetail(requestId: string): Promise<ProviderJobItem> {
    return request<ProviderJobItem>(`/api/v1/provider/requests/${requestId}`, {
      method: 'GET',
    });
  },

  /**
   * Gửi báo giá cho khách hàng
   */
  async submitQuotation(requestId: string, payload: SubmitQuotationPayload): Promise<void> {
    await request<void>(`/api/v1/provider/requests/${requestId}/quote`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Từ chối yêu cầu nhận việc
   */
  async rejectRequest(requestId: string, payload: RejectOrderRequestPayload): Promise<void> {
    await request<void>(`/api/v1/provider/requests/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Lấy danh sách việc đã nhận làm (IN_PROGRESS hoặc COMPLETED)
   */
  async getAssignedOrders(status?: OrderStatus): Promise<ProviderJobItem[]> {
    const url = status
      ? `/api/v1/provider/orders?status=${encodeURIComponent(status)}`
      : '/api/v1/provider/orders';
    return request<ProviderJobItem[]>(url, {
      method: 'GET',
    });
  },

  /**
   * Đánh dấu hoàn thành công việc
   */
  async completeOrder(orderId: string): Promise<void> {
    await request<void>(`/api/v1/provider/orders/${orderId}/complete`, {
      method: 'POST',
    });
  },
};
