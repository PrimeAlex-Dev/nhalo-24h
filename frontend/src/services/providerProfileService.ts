import { request } from './apiClient';

export interface ProviderCategoryItem {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string | null;
}

export interface ProviderProfileData {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string | null;
  headline?: string | null;
  bio?: string | null;
  experienceYears: number;
  pricePerHour: number;
  serviceArea?: string | null;
  isAvailable: boolean;
  categories: ProviderCategoryItem[];
  ratingAverage?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProviderProfilePayload {
  fullName?: string;
  avatarUrl?: string | null;
  headline?: string | null;
  bio?: string | null;
  experienceYears?: number;
  pricePerHour?: number;
  serviceArea?: string | null;
  isAvailable?: boolean;
  categoryIds?: string[];
}

export interface PublicProviderItem {
  id: string;
  userId: string;
  name: string;
  avatar?: string | null;
  headline?: string | null;
  company: string;
  about?: string | null;
  experienceYears: number;
  pricePerHour: number;
  serviceArea: string;
  distance: string;
  responseTime: string;
  isAvailable: boolean;
  availability: 'Available today' | 'Available soon' | string;
  category: string;
  categories: ProviderCategoryItem[];
  rating: number;
  reviewsCount: number;
  completedJobsCount: string;
  verified: boolean;
  isTopRated: boolean;
}

export interface GetPublicProvidersParams {
  category?: string;
  search?: string;
  availableOnly?: boolean;
}

export const providerProfileService = {
  /**
   * Lấy hồ sơ nghề nghiệp của thợ đang đăng nhập
   */
  async getMyProfile(): Promise<ProviderProfileData> {
    return request<ProviderProfileData>('/api/v1/provider/profile/me', {
      method: 'GET',
    });
  },

  /**
   * Cập nhật thông tin nghề nghiệp của thợ
   */
  async updateMyProfile(payload: UpdateProviderProfilePayload): Promise<ProviderProfileData> {
    return request<ProviderProfileData>('/api/v1/provider/profile/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Tải lên ảnh đại diện thợ (1-chạm, lưu file và xóa ảnh cũ tự động)
   */
  async uploadAvatar(file: File): Promise<ProviderProfileData> {
    const formData = new FormData();
    formData.append('file', file);
    return request<ProviderProfileData>('/api/v1/provider/profile/me/avatar', {
      method: 'POST',
      body: formData,
    });
  },

  /**
   * Xóa ảnh đại diện thợ và xóa file ảnh trên máy chủ
   */
  async deleteAvatar(): Promise<ProviderProfileData> {
    return request<ProviderProfileData>('/api/v1/provider/profile/me/avatar', {
      method: 'DELETE',
    });
  },

  /**
   * Cập nhật danh mục dịch vụ thợ đảm nhận
   */
  async updateMyCategories(categoryIds: string[]): Promise<ProviderProfileData> {
    return request<ProviderProfileData>('/api/v1/provider/profile/me/categories', {
      method: 'PUT',
      body: JSON.stringify(categoryIds),
    });
  },

  /**
   * Khách hàng lấy danh sách thợ công khai từ database
   */
  async getPublicProviders(params: GetPublicProvidersParams = {}): Promise<PublicProviderItem[]> {
    const query = new URLSearchParams();
    if (params.category && params.category.trim() && params.category !== 'All services') {
      query.append('category', params.category.trim());
    }
    if (params.search && params.search.trim()) {
      query.append('search', params.search.trim());
    }
    if (params.availableOnly) {
      query.append('availableOnly', 'true');
    }

    const qs = query.toString();
    const endpoint = `/api/v1/providers${qs ? `?${qs}` : ''}`;
    return request<PublicProviderItem[]>(endpoint, {
      method: 'GET',
    });
  },

  /**
   * Khách hàng xem chi tiết một thợ công khai
   */
  async getPublicProviderById(id: string): Promise<PublicProviderItem> {
    return request<PublicProviderItem>(`/api/v1/providers/${id}`, {
      method: 'GET',
    });
  },
};
