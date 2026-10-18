import { request } from './apiClient';
import type {
  AdminCategoryItem,
  SpringPageResponse,
  CategoryStatus,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  UpdateCategoryStatusPayload,
} from '../features/admin/types/admin';

export type { AdminCategoryItem, CategoryStatus };

export interface GetCategoriesParams {
  status?: CategoryStatus;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const categoryService = {
  /**
   * UC-CAT-02: Lấy danh sách danh mục dịch vụ có phân trang, lọc theo status và tìm kiếm
   */
  async getCategories(params: GetCategoriesParams = {}): Promise<SpringPageResponse<AdminCategoryItem>> {
    const query = new URLSearchParams();

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
    const endpoint = `/api/v1/service-categories${queryString ? `?${queryString}` : ''}`;
    return request<SpringPageResponse<AdminCategoryItem>>(endpoint, {
      method: 'GET',
    });
  },

  /**
   * UC-CAT-02: Lấy chi tiết một danh mục dịch vụ theo UUID
   */
  async getCategoryById(id: string): Promise<AdminCategoryItem> {
    return request<AdminCategoryItem>(`/api/v1/service-categories/${id}`, {
      method: 'GET',
    });
  },

  /**
   * UC-CAT-01: Tạo danh mục dịch vụ mới
   */
  async createCategory(payload: CreateCategoryPayload): Promise<AdminCategoryItem> {
    return request<AdminCategoryItem>('/api/v1/service-categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * UC-CAT-03: Cập nhật thông tin danh mục dịch vụ (tên, slug, mô tả, iconUrl, thứ tự hiển thị)
   */
  async updateCategory(id: string, payload: UpdateCategoryPayload): Promise<AdminCategoryItem> {
    return request<AdminCategoryItem>(`/api/v1/service-categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  /**
   * UC-CAT-04: Cập nhật trạng thái danh mục dịch vụ (ACTIVE / INACTIVE)
   */
  async updateCategoryStatus(id: string, payload: UpdateCategoryStatusPayload): Promise<AdminCategoryItem> {
    return request<AdminCategoryItem>(`/api/v1/service-categories/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};
