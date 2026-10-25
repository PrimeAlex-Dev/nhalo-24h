import { request } from './apiClient';
import type {
  CreateReviewPayload,
  ReviewItem,
  ProviderRatingSummary,
} from '../types/review';
import type { SpringPageResponse } from '../types/order';

export const reviewService = {
  /**
   * Khách hàng gửi đánh giá cho đơn hàng đã hoàn tất
   */
  async createReview(payload: CreateReviewPayload): Promise<ReviewItem> {
    return request<ReviewItem>('/api/v1/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Lấy thông tin đánh giá theo mã đơn hàng
   */
  async getReviewByOrder(orderId: string): Promise<ReviewItem> {
    return request<ReviewItem>(`/api/v1/reviews/order/${orderId}`, {
      method: 'GET',
    });
  },

  /**
   * Lấy danh sách đánh giá công khai của thợ (có phân trang & lọc theo sao)
   */
  async getPublicReviews(
    providerId: string,
    star?: number,
    page = 0,
    size = 10
  ): Promise<SpringPageResponse<ReviewItem>> {
    const params = new URLSearchParams();
    if (star !== undefined && star > 0) {
      params.append('star', star.toString());
    }
    params.append('page', page.toString());
    params.append('size', size.toString());

    return request<SpringPageResponse<ReviewItem>>(
      `/api/v1/providers/${providerId}/reviews?${params.toString()}`,
      { method: 'GET' }
    );
  },

  /**
   * Lấy thống kê điểm số và phân bố sao của thợ
   */
  async getRatingSummary(providerId: string): Promise<ProviderRatingSummary> {
    return request<ProviderRatingSummary>(
      `/api/v1/providers/${providerId}/rating-summary`,
      { method: 'GET' }
    );
  },

  /**
   * Thợ xem các đánh giá mà khách hàng đã gửi cho mình
   */
  async getMyReviews(page = 0, size = 10): Promise<SpringPageResponse<ReviewItem>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());

    return request<SpringPageResponse<ReviewItem>>(
      `/api/v1/provider/reviews?${params.toString()}`,
      { method: 'GET' }
    );
  },

  /**
   * Thợ phản hồi cho một đánh giá
   */
  async replyToReview(reviewId: string, replyComment: string): Promise<ReviewItem> {
    return request<ReviewItem>(`/api/v1/provider/reviews/${reviewId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ replyComment }),
    });
  },

  /**
   * Admin xem toàn bộ đánh giá trên hệ thống
   */
  async getAllReviewsAdmin(page = 0, size = 15): Promise<SpringPageResponse<ReviewItem>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());

    return request<SpringPageResponse<ReviewItem>>(
      `/api/v1/admin/reviews?${params.toString()}`,
      { method: 'GET' }
    );
  },

  /**
   * Admin ẩn/hiện đánh giá
   */
  async toggleVisibilityAdmin(reviewId: string, visible: boolean): Promise<ReviewItem> {
    return request<ReviewItem>(
      `/api/v1/admin/reviews/${reviewId}/visibility?visible=${visible}`,
      { method: 'PUT' }
    );
  },
};
