import { request } from './apiClient';
import type {
  CreateOrderPayload,
  DispatchOrderRequestsPayload,
  CancelOrderPayload,
  CustomerOrderDetail,
  CustomerOrderSummary,
  OrderStatus,
} from '../types/order';

export const customerOrderService = {
  /**
   * Tạo đơn hàng mới từ địa chỉ trong sổ địa chỉ của khách
   */
  async createOrder(payload: CreateOrderPayload): Promise<CustomerOrderDetail> {
    return request<CustomerOrderDetail>('/api/v1/customer/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Lấy danh sách đơn hàng của khách hàng (có thể lọc theo status)
   */
  async getMyOrders(status?: OrderStatus): Promise<CustomerOrderSummary[]> {
    const url = status
      ? `/api/v1/customer/orders?status=${encodeURIComponent(status)}`
      : '/api/v1/customer/orders';
    return request<CustomerOrderSummary[]>(url, {
      method: 'GET',
    });
  },

  /**
   * Xem chi tiết đơn hàng (gồm ảnh, thông tin liên lạc và danh sách các báo giá)
   */
  async getOrderDetail(id: string): Promise<CustomerOrderDetail> {
    return request<CustomerOrderDetail>(`/api/v1/customer/orders/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Gửi thêm yêu cầu báo giá tới các thợ khác
   */
  async dispatchRequests(id: string, payload: DispatchOrderRequestsPayload): Promise<void> {
    await request<void>(`/api/v1/customer/orders/${id}/dispatch`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Chấp nhận báo giá (Chốt thợ): chuyển đơn sang IN_PROGRESS và tự động hủy các báo giá khác
   */
  async acceptQuotation(requestId: string): Promise<void> {
    await request<void>(`/api/v1/customer/orders/requests/${requestId}/accept`, {
      method: 'POST',
    });
  },

  /**
   * Hủy đơn hàng
   */
  async cancelOrder(id: string, payload?: CancelOrderPayload): Promise<void> {
    await request<void>(`/api/v1/customer/orders/${id}/cancel`, {
      method: 'POST',
      body: payload ? JSON.stringify(payload) : undefined,
    });
  },
};
