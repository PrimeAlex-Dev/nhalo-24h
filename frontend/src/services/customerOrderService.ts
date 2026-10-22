import { request } from './apiClient';
import type {
  CreateOrderPayload,
  DispatchOrderRequestsPayload,
  CancelOrderPayload,
  CustomerOrderDetail,
  CustomerOrderSummary,
  OrderStatus,
  SpringPageResponse,
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
   * Lấy danh sách đơn hàng của khách hàng (có phân trang và lọc theo status)
   */
  async getMyOrders(
    status?: OrderStatus,
    page?: number,
    size?: number
  ): Promise<SpringPageResponse<CustomerOrderSummary>> {
    const params = new URLSearchParams();
    if (status) {
      params.append('status', status);
    }
    if (page !== undefined) {
      params.append('page', page.toString());
    }
    if (size !== undefined) {
      params.append('size', size.toString());
    }
    const qs = params.toString();
    const url = `/api/v1/customer/orders${qs ? `?${qs}` : ''}`;
    const response = await request<SpringPageResponse<CustomerOrderSummary> | CustomerOrderSummary[]>(url, {
      method: 'GET',
    });

    if (response && 'content' in response && Array.isArray(response.content)) {
      const pageMeta = (response as any).page;
      return {
        content: response.content,
        totalElements: response.totalElements ?? pageMeta?.totalElements ?? response.content.length,
        totalPages: response.totalPages ?? pageMeta?.totalPages ?? 1,
        number: response.number ?? pageMeta?.number ?? (page ?? 0),
        size: response.size ?? pageMeta?.size ?? (size ?? 5),
        first: response.first ?? (pageMeta ? pageMeta.number === 0 : true),
        last: response.last ?? (pageMeta ? pageMeta.number >= pageMeta.totalPages - 1 : true),
        empty: response.empty ?? response.content.length === 0,
      };
    }
    if (Array.isArray(response)) {
      const actualSize = size ?? 5;
      const actualPage = page ?? 0;
      const totalPages = Math.ceil(response.length / actualSize) || 1;
      const paginatedContent = response.slice(actualPage * actualSize, (actualPage + 1) * actualSize);
      return {
        content: paginatedContent,
        totalElements: response.length,
        totalPages: totalPages,
        number: actualPage,
        size: actualSize,
        first: actualPage === 0,
        last: actualPage >= totalPages - 1,
        empty: response.length === 0,
      };
    }
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: size ?? 5,
      first: true,
      last: true,
      empty: true,
    };
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
