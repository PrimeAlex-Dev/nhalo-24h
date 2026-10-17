import { request } from './apiClient';
import type { CustomerProfile, UpdateCustomerProfileRequest } from '../features/customer/types/customer';

export const customerProfileService = {
  /**
   * Lấy thông tin hồ sơ của khách hàng đang đăng nhập (/api/v1/customer/profile)
   */
  async getProfile(): Promise<CustomerProfile> {
    return request<CustomerProfile>('/api/v1/customer/profile', {
      method: 'GET',
    });
  },

  /**
   * Cập nhật thông tin hồ sơ khách hàng (họ tên, giới tính, địa chỉ)
   */
  async updateProfile(payload: UpdateCustomerProfileRequest): Promise<CustomerProfile> {
    return request<CustomerProfile>('/api/v1/customer/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};
