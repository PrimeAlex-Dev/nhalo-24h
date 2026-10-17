import { request } from './apiClient';
import type {
  UserAddress,
  CreateCustomerAddressRequest,
  UpdateCustomerAddressRequest,
} from '../features/customer/types/customer';

export const customerAddressService = {
  /**
   * Lấy toàn bộ danh sách địa chỉ trong sổ địa chỉ của khách hàng (/api/v1/customer/addresses)
   */
  async getAddresses(): Promise<UserAddress[]> {
    return request<UserAddress[]>('/api/v1/customer/addresses', {
      method: 'GET',
    });
  },

  /**
   * Thêm một địa chỉ mới vào sổ địa chỉ
   */
  async createAddress(payload: CreateCustomerAddressRequest): Promise<UserAddress> {
    return request<UserAddress>('/api/v1/customer/addresses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Cập nhật địa chỉ theo ID
   */
  async updateAddress(id: string, payload: UpdateCustomerAddressRequest): Promise<UserAddress> {
    return request<UserAddress>(`/api/v1/customer/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Xóa một địa chỉ khỏi sổ địa chỉ
   */
  async deleteAddress(id: string): Promise<void> {
    await request<void>(`/api/v1/customer/addresses/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Đặt một địa chỉ làm địa chỉ mặc định
   */
  async setDefaultAddress(id: string): Promise<UserAddress> {
    return request<UserAddress>(`/api/v1/customer/addresses/${id}/default`, {
      method: 'PATCH',
    });
  },
};
