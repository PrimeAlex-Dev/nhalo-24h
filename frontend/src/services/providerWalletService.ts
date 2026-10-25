import { request } from './apiClient';
import type { SpringPageResponse } from '../types/order';
import type {
  ProviderWalletResponse,
  WalletTransactionResponse,
  CreatePayoutRequestDto,
  RequestDepositRefundDto,
  PayoutRequestResponse,
} from '../types/wallet';

export const providerWalletService = {
  /**
   * Lấy tổng quan ví thợ (số dư khả dụng, số dư ký quỹ 2 triệu, trạng thái nhận đơn)
   */
  async getMyWallet(): Promise<ProviderWalletResponse> {
    return request<ProviderWalletResponse>('/api/v1/provider/wallet', {
      method: 'GET',
    });
  },

  /**
   * Xem lịch sử biến động số dư ví (tiền công 90%, tiền vật tư 100%, nạp bù cọc, trích phạt)
   */
  async getMyTransactions(
    page: number = 0,
    size: number = 20
  ): Promise<SpringPageResponse<WalletTransactionResponse>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    return request<SpringPageResponse<WalletTransactionResponse>>(
      `/api/v1/provider/wallet/transactions?${params.toString()}`,
      { method: 'GET' }
    );
  },

  /**
   * Tạo lệnh rút thu nhập khả dụng về tài khoản ngân hàng
   */
  async requestPayout(payload: CreatePayoutRequestDto): Promise<PayoutRequestResponse> {
    return request<PayoutRequestResponse>('/api/v1/provider/wallet/payouts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Xem danh sách các yêu cầu rút tiền của thợ
   */
  async getMyPayoutRequests(
    page: number = 0,
    size: number = 20
  ): Promise<SpringPageResponse<PayoutRequestResponse>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    return request<SpringPageResponse<PayoutRequestResponse>>(
      `/api/v1/provider/wallet/payouts?${params.toString()}`,
      { method: 'GET' }
    );
  },

  /**
   * Gửi yêu cầu rút tiền ký quỹ rời sàn (Áp dụng thời gian đóng băng 20 ngày)
   */
  async requestDepositRefund(payload: RequestDepositRefundDto): Promise<PayoutRequestResponse> {
    return request<PayoutRequestResponse>('/api/v1/provider/wallet/deposit-refund', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
