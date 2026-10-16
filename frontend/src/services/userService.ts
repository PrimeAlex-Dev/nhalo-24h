import { request } from './apiClient';
import type { 
  AdminUserItem, 
  SpringPageResponse, 
  CreateUserPayload, 
  UpdateUserPayload, 
  UpdateUserStatusPayload, 
  UserRole, 
  UserStatus 
} from '../features/admin/types/admin';

export interface GetUsersParams {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const userService = {
  /**
   * UC-USER-02: Lấy danh sách người dùng có phân trang, lọc và tìm kiếm từ backend
   */
  async getUsers(params: GetUsersParams = {}): Promise<SpringPageResponse<AdminUserItem>> {
    const query = new URLSearchParams();

    if (params.role) {
      query.append('role', params.role);
    }
    if (params.status) {
      query.append('status', params.status);
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
    if (params.sort) {
      query.append('sort', params.sort);
    }

    const queryString = query.toString();
    const endpoint = `/api/v1/users${queryString ? `?${queryString}` : ''}`;
    return request<SpringPageResponse<AdminUserItem>>(endpoint, {
      method: 'GET',
    });
  },

  /**
   * UC-USER-02: Xem chi tiết một người dùng theo UUID
   */
  async getUserById(id: string): Promise<AdminUserItem> {
    return request<AdminUserItem>(`/api/v1/users/${id}`, {
      method: 'GET',
    });
  },

  /**
   * UC-USER-01: Tạo người dùng mới
   */
  async createUser(payload: CreateUserPayload): Promise<AdminUserItem> {
    return request<AdminUserItem>('/api/v1/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * UC-USER-03: Cập nhật thông tin hồ sơ người dùng (họ tên, số điện thoại)
   */
  async updateUser(id: string, payload: UpdateUserPayload): Promise<AdminUserItem> {
    return request<AdminUserItem>(`/api/v1/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  /**
   * UC-USER-04: Vô hiệu hóa hoặc kích hoạt lại tài khoản người dùng
   */
  async updateUserStatus(id: string, payload: UpdateUserStatusPayload): Promise<AdminUserItem> {
    return request<AdminUserItem>(`/api/v1/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};
