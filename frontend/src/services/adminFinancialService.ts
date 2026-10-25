import { request } from './apiClient';
import type { SpringPageResponse } from '../types/order';
import type {
  FinancialDashboardSummaryResponse,
  PayoutRequestResponse,
  AdminReviewPayoutRequestDto,
  ProviderWalletResponse,
  AdminTopupDepositRequestDto,
  AdminDisputePenaltyRequestDto,
} from '../types/wallet';

export const adminFinancialService = {
  /**
   * Lấy tổng quan chỉ số tài chính (GMV, Doanh thu sàn 10%, Quỹ cọc, Lệnh rút chờ duyệt)
   */
  async getFinancialSummary(): Promise<FinancialDashboardSummaryResponse> {
    return request<FinancialDashboardSummaryResponse>('/api/v1/admin/financial/summary', {
      method: 'GET',
    });
  },

  /**
   * Lấy danh sách toàn bộ các yêu cầu rút tiền của thợ
   */
  async getAllPayoutRequests(
    page: number = 0,
    size: number = 20
  ): Promise<SpringPageResponse<PayoutRequestResponse>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    return request<SpringPageResponse<PayoutRequestResponse>>(
      `/api/v1/admin/financial/payouts?${params.toString()}`,
      { method: 'GET' }
    );
  },

  /**
   * Admin duyệt hoặc từ chối lệnh rút tiền của thợ
   */
  async reviewPayout(
    payoutId: string,
    payload: AdminReviewPayoutRequestDto
  ): Promise<PayoutRequestResponse> {
    return request<PayoutRequestResponse>(`/api/v1/admin/financial/payouts/${payoutId}/review`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Xem chi tiết ví của một thợ cụ thể
   */
  async getProviderWallet(providerId: string): Promise<ProviderWalletResponse> {
    return request<ProviderWalletResponse>(`/api/v1/admin/financial/providers/${providerId}/wallet`, {
      method: 'GET',
    });
  },

  /**
   * Admin ghi nhận nạp bù tiền ký quỹ cho thợ khi thợ nộp tiền bên ngoài
   */
  async topupDeposit(
    providerId: string,
    payload: AdminTopupDepositRequestDto
  ): Promise<ProviderWalletResponse> {
    return request<ProviderWalletResponse>(
      `/api/v1/admin/financial/providers/${providerId}/topup-deposit`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * Admin trích phạt tiền ký quỹ của thợ để bồi thường bảo hành cho khách
   */
  async deductDisputePenalty(
    providerId: string,
    payload: AdminDisputePenaltyRequestDto
  ): Promise<ProviderWalletResponse> {
    return request<ProviderWalletResponse>(
      `/api/v1/admin/financial/providers/${providerId}/dispute-penalty`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },
};
