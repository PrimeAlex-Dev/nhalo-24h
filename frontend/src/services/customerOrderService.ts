import { request } from './apiClient';
import type {
  CreateOrderPayload,
  DispatchOrderRequestsPayload,
  CancelOrderPayload,
  DeclareCashPaymentPayload,
  ConfirmOnlinePaymentPayload,
  OnlinePaymentInitResponse,
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
   * Xem chi tiết đơn hàng (gồm 3 nhóm chi phí, lịch sử phiên bản báo giá, thanh toán và nhật ký)
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
   * Khách chọn 1 thợ (Đồng ý điều kiện khảo sát AWAITING_SURVEY hoặc vào thẳng IN_PROGRESS nếu gói cố định)
   */
  async acceptQuotation(requestId: string): Promise<void> {
    await request<void>(`/api/v1/customer/orders/requests/${requestId}/accept`, {
      method: 'POST',
    });
  },

  /**
   * Khách đồng ý Báo giá cuối sau khảo sát hoặc đồng ý Yêu cầu điều chỉnh phát sinh
   */
  async approveLatestQuote(orderId: string): Promise<CustomerOrderDetail> {
    return request<CustomerOrderDetail>(`/api/v1/customer/orders/${orderId}/approve-quote`, {
      method: 'POST',
    });
  },

  /**
   * Khách từ chối khoản phát sinh trong khi sửa (giữ nguyên báo giá đã duyệt trước đó)
   */
  async rejectChangeRequest(orderId: string, payload?: CancelOrderPayload): Promise<CustomerOrderDetail> {
    return request<CustomerOrderDetail>(`/api/v1/customer/orders/${orderId}/reject-change`, {
      method: 'POST',
      body: payload ? JSON.stringify(payload) : undefined,
    });
  },

  /**
   * Khách từ chối sửa sau khảo sát (Đơn chuyển sang DECLINED_AFTER_SURVEY, chỉ tính phí khảo sát + di chuyển)
   */
  async declineAfterSurvey(orderId: string, payload?: CancelOrderPayload): Promise<CustomerOrderDetail> {
    return request<CustomerOrderDetail>(`/api/v1/customer/orders/${orderId}/decline-after-survey`, {
      method: 'POST',
      body: payload ? JSON.stringify(payload) : undefined,
    });
  },

  /**
   * Khách khai báo số tiền mặt thực tế đã đưa cho thợ (Bước 1 thanh toán tiền mặt)
   */
  async declareCashPayment(orderId: string, payload: DeclareCashPaymentPayload): Promise<CustomerOrderDetail> {
    return request<CustomerOrderDetail>(`/api/v1/customer/orders/${orderId}/pay-cash`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Khởi tạo giao dịch thanh toán Online giả lập (Mock Gateway)
   */
  async initOnlinePayment(orderId: string): Promise<OnlinePaymentInitResponse> {
    return request<OnlinePaymentInitResponse>(`/api/v1/customer/orders/${orderId}/pay-online/init`, {
      method: 'POST',
    });
  },

  /**
   * Xác nhận kết quả thanh toán Online (Mock Gateway Callback)
   */
  async confirmOnlinePayment(
    orderId: string,
    payload: ConfirmOnlinePaymentPayload
  ): Promise<CustomerOrderDetail> {
    return request<CustomerOrderDetail>(`/api/v1/customer/orders/${orderId}/pay-online/confirm`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Hủy đơn hàng (Chỉ cho phép khi chưa chọn thợ: PENDING_PROVIDER)
   */
  async cancelOrder(id: string, payload?: CancelOrderPayload): Promise<void> {
    await request<void>(`/api/v1/customer/orders/${id}/cancel`, {
      method: 'POST',
      body: payload ? JSON.stringify(payload) : undefined,
    });
  },

  /**
   * Phương án A: Gửi thông báo yêu cầu dời lịch / hủy đơn tới thợ khi thợ đang đến khảo sát (AWAITING_SURVEY)
   */
  async notifyCancelRequest(id: string, payload?: CancelOrderPayload): Promise<CustomerOrderDetail> {
    return request<CustomerOrderDetail>(`/api/v1/customer/orders/${id}/notify-cancel`, {
      method: 'POST',
      body: payload ? JSON.stringify(payload) : undefined,
    });
  },
};
