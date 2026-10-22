import { request } from './apiClient';
import type { CustomerOrderDetail, CustomerOrderSummary, OrderStatus } from '../types/order';

export interface AdminOrderQuery {
  status?: OrderStatus | 'ALL';
  categoryId?: string;
  search?: string;
  page?: number;
  size?: number;
}

export interface AdminOrderResponse {
  content: CustomerOrderSummary[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const adminOrderService = {
  /**
   * Lấy danh sách đơn hàng cho Quản trị viên
   * Nếu backend chưa cung cấp endpoint quản trị /api/v1/admin/orders,
   * hàm bắt lỗi và trả về danh sách rỗng để UI render trạng thái thông báo sạch sẽ.
   */
  async getOrders(params: AdminOrderQuery = {}): Promise<AdminOrderResponse> {
    try {
      const query = new URLSearchParams();
      if (params.status && params.status !== 'ALL') {
        query.append('status', params.status);
      }
      if (params.categoryId && params.categoryId !== 'all') {
        query.append('categoryId', params.categoryId);
      }
      if (params.search && params.search.trim()) {
        query.append('search', params.search.trim());
      }
      if (params.page !== undefined) {
        query.append('page', params.page.toString());
      }
      if (params.size !== undefined) {
        query.append('size', params.size.toString());
      }

      const qs = query.toString();
      const endpoint = `/api/v1/admin/orders${qs ? `?${qs}` : ''}`;
      const response = await request<AdminOrderResponse | CustomerOrderSummary[]>(endpoint, {
        method: 'GET',
      });

      if (response && 'content' in response && Array.isArray(response.content)) {
        const pageMeta = (response as any).page;
        return {
          content: response.content,
          totalElements: response.totalElements ?? pageMeta?.totalElements ?? response.content.length,
          totalPages: response.totalPages ?? pageMeta?.totalPages ?? 1,
          number: response.number ?? pageMeta?.number ?? (params.page ?? 0),
          size: response.size ?? pageMeta?.size ?? (params.size ?? 10),
        };
      }
      if (Array.isArray(response)) {
        const actualSize = params.size ?? 10;
        const actualPage = params.page ?? 0;
        const totalPages = Math.ceil(response.length / actualSize) || 1;
        const paginatedContent = response.slice(actualPage * actualSize, (actualPage + 1) * actualSize);
        return {
          content: paginatedContent,
          totalElements: response.length,
          totalPages: totalPages,
          number: actualPage,
          size: actualSize,
        };
      }
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: params.size ?? 10,
      };
    } catch {
      // Backend chưa có endpoint admin orders -> trả về rỗng an toàn
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: params.size ?? 10,
      };
    }
  },

  /**
   * Xem chi tiết một đơn hàng từ góc nhìn Quản trị
   */
  async getOrderDetail(orderId: string): Promise<CustomerOrderDetail | null> {
    try {
      return await request<CustomerOrderDetail>(`/api/v1/admin/orders/${orderId}`, {
        method: 'GET',
      });
    } catch {
      return null;
    }
  },
};
