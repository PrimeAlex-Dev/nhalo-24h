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
  async getOrders(params: AdminOrderQuery = {}): Promise<CustomerOrderSummary[]> {
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

      if (Array.isArray(response)) {
        return response;
      }
      if (response && Array.isArray(response.content)) {
        return response.content;
      }
      return [];
    } catch {
      // Backend chưa có endpoint admin orders -> trả về rỗng an toàn
      return [];
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
