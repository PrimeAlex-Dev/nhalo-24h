import { request } from './apiClient';
import type {
  CreateReportPayload,
  ResolveReportPayload,
  RefundPenaltyPayload,
  ConfirmCompensationPayload,
  RevokeSuspensionPayload,
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
   * Thợ xem danh sách khiếu nại và kỷ luật liên quan đến mình
   */
  async getProviderMyDisputes(page = 0, size = 10): Promise<SpringPageResponse<ReportItem>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());

    return request<SpringPageResponse<ReportItem>>(
      `/api/v1/provider/reports/my-disputes?${params.toString()}`,
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

  /**
   * Admin hoàn trả tiền phạt ký quỹ cho thợ khi xử oan hoặc hòa giải
   */
  async refundDisputePenalty(
    reportId: string,
    payload: RefundPenaltyPayload
  ): Promise<ReportItem> {
    return request<ReportItem>(`/api/v1/admin/reports/${reportId}/refund-penalty`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Admin xác nhận đã chuyển khoản chi trả bồi thường cho khách hàng
   */
  async confirmCompensation(
    reportId: string,
    payload: ConfirmCompensationPayload
  ): Promise<ReportItem> {
    return request<ReportItem>(`/api/v1/admin/reports/${reportId}/confirm-compensation`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Admin gỡ đình chỉ / mở khóa tức thì cho thợ khi xử phạt nhầm hoặc hòa giải
   */
  async revokeSuspension(
    reportId: string,
    payload: RevokeSuspensionPayload
  ): Promise<ReportItem> {
    return request<ReportItem>(`/api/v1/admin/reports/${reportId}/revoke-suspension`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
