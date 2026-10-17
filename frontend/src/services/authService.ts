import { request, setAuthToken, removeAuthToken } from './apiClient';
import type { AuthResponse, AuthUser, LoginPayload, MessageResponse } from '../features/auth/types/auth';

export const authService = {
  /**
   * Đăng nhập hệ thống: Gửi email & password, nhận về JWT token và thông tin user
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await request<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: payload.email.trim(),
        password: payload.password,
      }),
    });

    if (response.accessToken) {
      setAuthToken(response.accessToken);
    }
    return response;
  },

  /**
   * Đăng xuất hệ thống: Gửi yêu cầu vô hiệu hóa token ở backend và xóa token ở client
   */
  async logout(): Promise<void> {
    try {
      await request<MessageResponse>('/api/v1/auth/logout', {
        method: 'POST',
      });
    } catch {
      // Dù API logout có thành công hay lỗi mạng thì vẫn tiến hành xóa token ở client
    } finally {
      removeAuthToken();
    }
  },

  /**
   * Lấy thông tin cá nhân của người dùng đang đăng nhập (/api/v1/auth/me)
   */
  async getCurrentUser(): Promise<AuthUser> {
    return request<AuthUser>('/api/v1/auth/me', {
      method: 'GET',
    });
  },
};
