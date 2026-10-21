import { getAuthToken, ApiError, type ApiErrorResponse } from './apiClient';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface FileUploadResponse {
  fileUrls: string[];
}

export const fileService = {
  /**
   * Tải lên danh sách ảnh sự cố từ thiết bị của khách hàng
   * @param files Danh sách các file ảnh cần tải lên
   * @returns Danh sách các đường dẫn URL ảnh đã lưu trên hệ thống
   */
  async uploadOrderImages(files: File[]): Promise<string[]> {
    if (!files || files.length === 0) {
      return [];
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const url = `${BASE_URL}/api/v1/files/upload-images`;
    const token = getAuthToken();
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : 'Lỗi kết nối mạng';
      throw new ApiError(0, `Không thể kết nối đến máy chủ tải ảnh (${errMessage}).`);
    }

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorData = data as ApiErrorResponse;
      const errorMessage = errorData?.message || `Tải ảnh thất bại (Mã lỗi ${response.status})`;
      throw new ApiError(response.status, errorMessage, errorData?.errorCode, errorData?.details);
    }

    const result = data as FileUploadResponse;
    return result.fileUrls || [];
  },
};
