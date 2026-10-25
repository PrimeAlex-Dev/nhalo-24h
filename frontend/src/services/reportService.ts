import { request } from './apiClient';
import type {
  CreateReportPayload,
  ResolveReportPayload,
  ReportItem,
  ReportStatus,
} from '../types/report';
import type { SpringPageResponse } from '../types/order';

export const reportService = {
  /**
   * Khách hàng gửi khiếu nại / báo cáo vi phạm thợ
   */
  async createReport(payload: CreateReportPayload): Promise<ReportItem> {
    return request<ReportItem>('/api/v1/reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Khách hàng xem danh sách khiếu nại đã gửi
   */
  async getMyReports(page = 0, size = 10): Promise<SpringPageResponse<ReportItem>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());

    return request<SpringPageResponse<ReportItem>>(
      `/api/v1/reports/my?${params.toString()}`,
      { method: 'GET' }
    );
  },

  /**
   * Xem chi tiết một khiếu nại
   */
  async getReportDetail(reportId: string): Promise<ReportItem> {
    return request<ReportItem>(`/api/v1/reports/${reportId}`, {
      method: 'GET',
    });
  },

  /**
   * Admin xem danh sách khiếu nại
   */
  async getAdminReports(
    status?: ReportStatus,
    search?: string,
    page = 0,
    size = 15
  ): Promise<SpringPageResponse<ReportItem>> {
    const params = new URLSearchParams();
    if (status) {
      params.append('status', status);
    }
    if (search && search.trim()) {
      params.append('search', search.trim());
    }
    params.append('page', page.toString());
    params.append('size', size.toString());

    return request<SpringPageResponse<ReportItem>>(
      `/api/v1/admin/reports?${params.toString()}`,
      { method: 'GET' }
    );
  },

  /**
   * Admin kết luận xử lý khiếu nại, chế tài và trích phạt cọc ký quỹ thợ
   */
  async resolveReport(
    reportId: string,
    payload: ResolveReportPayload
  ): Promise<ReportItem> {
    return request<ReportItem>(`/api/v1/admin/reports/${reportId}/resolve`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
