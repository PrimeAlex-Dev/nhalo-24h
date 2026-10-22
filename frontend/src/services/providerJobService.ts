import { request } from './apiClient';
import type {
  ProviderJobItem,
  SubmitQuotationPayload,
  RejectOrderRequestPayload,
  OrderRequestStatus,
  OrderStatus,
  SpringPageResponse,
} from '../types/order';

export const providerJobService = {
  /**
   * Đếm nhanh số lượng yêu cầu mới đang chờ phản hồi (để hiển thị badge navbar)
   */
  async getPendingRequestsCount(): Promise<number> {
    try {
      const res = await request<{ count: number }>('/api/v1/provider/requests/count-pending', {
        method: 'GET',
      });
      return res.count ?? 0;
    } catch {
      return 0;
    }
  },

  /**
   * Lấy danh sách yêu cầu báo giá gửi đến thợ (có phân trang và lọc theo status)
   */
  async getIncomingRequests(
    status?: OrderRequestStatus,
    page?: number,
    size?: number
  ): Promise<SpringPageResponse<ProviderJobItem>> {
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
    const url = `/api/v1/provider/requests${qs ? `?${qs}` : ''}`;
    const response = await request<SpringPageResponse<ProviderJobItem> | ProviderJobItem[]>(url, {
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
   * Lấy danh sách việc đã nhận làm (IN_PROGRESS hoặc COMPLETED), có phân trang
   */
  async getAssignedOrders(
    status?: OrderStatus,
    page?: number,
    size?: number
  ): Promise<SpringPageResponse<ProviderJobItem>> {
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
    const url = `/api/v1/provider/orders${qs ? `?${qs}` : ''}`;
    const response = await request<SpringPageResponse<ProviderJobItem> | ProviderJobItem[]>(url, {
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
   * Đánh dấu hoàn thành công việc
   */
  async completeOrder(orderId: string): Promise<void> {
    await request<void>(`/api/v1/provider/orders/${orderId}/complete`, {
      method: 'POST',
    });
  },
};
