import { useState, useEffect, useCallback } from 'react';
import { 
  ShieldAlert, 
  Search, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  XCircle, 
  Loader2, 
  X, 
  DollarSign, 
  FileText,
  AlertOctagon
} from 'lucide-react';
import { reportService } from '../../../services';
import type { 
  ReportItem, 
  ReportStatus, 
  ReportReasonType, 
  PenaltyType 
} from '../../../types/report';
import './AdminDisputesPage.css';

const REASON_LABELS: Record<ReportReasonType, { label: string; tone: 'danger' | 'warning' | 'info' }> = {
  OVERCHARGING_OR_OFF_PLATFORM: { label: 'Báo khống / Giao dịch ngoài', tone: 'danger' },
  POOR_QUALITY_OR_DAMAGE: { label: 'Tay nghề kém / Làm hỏng đồ', tone: 'danger' },
  NO_SHOW_OR_ABANDONMENT: { label: 'Bỏ việc / Không đến hẹn', tone: 'warning' },
  UNPROFESSIONAL_BEHAVIOR: { label: 'Thái độ thô lỗ / Bất lịch sự', tone: 'warning' },
  WARRANTY_REFUSAL: { label: 'Từ chối bảo hành', tone: 'danger' },
  FRAUD_OR_DISHONEST: { label: 'Gian lận / Tráo linh kiện', tone: 'danger' },
  OTHER: { label: 'Vi phạm khác', tone: 'info' },
};

export function AdminDisputesPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Modal resolve state
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [resolveStatus, setResolveStatus] = useState<ReportStatus>('RESOLVED');
  const [resolvePenaltyType, setResolvePenaltyType] = useState<PenaltyType>('DEPOSIT_DEDUCTION');
  const [resolvePenaltyAmount, setResolvePenaltyAmount] = useState<string>('200000');
  const [resolveAdminNotes, setResolveAdminNotes] = useState<string>('');
  const [submittingResolve, setSubmittingResolve] = useState<boolean>(false);

  // Image lightbox preview
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const statusParam = selectedStatus === 'ALL' ? undefined : (selectedStatus as ReportStatus);
      const res = await reportService.getAdminReports(statusParam, searchKeyword, 0, 50);
      setReports(res.content || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải danh sách khiếu nại';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, searchKeyword]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // KPI calculations
  const totalCount = reports.length;
  const pendingCount = reports.filter((r) => r.status === 'PENDING').length;
  const investigatingCount = reports.filter((r) => r.status === 'INVESTIGATING').length;
  const resolvedCount = reports.filter((r) => r.status === 'RESOLVED').length;
  const rejectedCount = reports.filter((r) => r.status === 'REJECTED').length;

  const handleOpenResolveModal = (report: ReportItem) => {
    setSelectedReport(report);
    setResolveStatus(report.status === 'PENDING' ? 'INVESTIGATING' : report.status);
    setResolvePenaltyType(report.penaltyType || 'NONE');
    setResolvePenaltyAmount(report.penaltyAmount ? String(report.penaltyAmount) : '200000');
    setResolveAdminNotes(report.adminNotes || '');
  };

  const handleCloseResolveModal = () => {
    setSelectedReport(null);
    setResolveAdminNotes('');
    setSubmittingResolve(false);
  };

  const handleSubmitResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    if (resolveStatus === 'RESOLVED' && !resolveAdminNotes.trim()) {
      setErrorMsg('Vui lòng nhập căn cứ kết luận của ban quản trị khi giải quyết khiếu nại');
      return;
    }

    setSubmittingResolve(true);
    setErrorMsg(null);

    try {
      const penaltyAmountNum = resolvePenaltyType === 'DEPOSIT_DEDUCTION' 
        ? Math.max(0, parseInt(resolvePenaltyAmount.replace(/\D/g, '') || '0', 10))
        : 0;

      await reportService.resolveReport(selectedReport.id, {
        status: resolveStatus,
        penaltyType: resolvePenaltyType,
        penaltyAmount: penaltyAmountNum,
        adminNotes: resolveAdminNotes.trim() || undefined,
      });

      setSuccessMsg(`Đã cập nhật xử lý khiếu nại #${selectedReport.reportCode} thành công!`);
      handleCloseResolveModal();
      fetchReports();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xử lý khiếu nại thất bại';
      setErrorMsg(msg);
    } finally {
      setSubmittingResolve(false);
    }
  };

  return (
    <div className="admin-disputes-page">
      {/* Header */}
      <div className="admin-disputes-header">
        <div>
          <h1 className="admin-disputes-title">
            <ShieldAlert size={28} color="#DC2626" />
            <span>Quản lý Khiếu nại & Tranh chấp</span>
          </h1>
          <p className="admin-disputes-sub">
            Tiếp nhận phản ánh của khách hàng, xác minh chứng cứ và trích phạt trừ tiền ký quỹ 2.000.000đ của thợ vi phạm theo quy chế sàn Nhà Lo 24h.
          </p>
        </div>

        <div className="admin-header-actions">
          <button type="button" className="btn-refresh-data" onClick={fetchReports} disabled={loading}>
            <RotateCcw size={16} className={loading ? 'spin-icon' : ''} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="admin-alert success" role="alert">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="admin-alert error" role="alert">
          <AlertTriangle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="admin-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap total">
            <FileText size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-value">{totalCount}</span>
            <span className="kpi-label">Tổng số khiếu nại</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap pending">
            <Clock size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-value">{pendingCount}</span>
            <span className="kpi-label">Chờ tiếp nhận</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap investigating">
            <UserCheck size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-value">{investigatingCount}</span>
            <span className="kpi-label">Đang xác minh</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap resolved">
            <CheckCircle2 size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-value">{resolvedCount}</span>
            <span className="kpi-label">Đã giải quyết</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap rejected">
            <XCircle size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-value">{rejectedCount}</span>
            <span className="kpi-label">Bác bỏ / Hủy</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-filter-bar">
        <div className="status-tabs-list">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'PENDING', label: 'Chờ tiếp nhận' },
            { id: 'INVESTIGATING', label: 'Đang xác minh' },
            { id: 'RESOLVED', label: 'Đã giải quyết' },
            { id: 'REJECTED', label: 'Bác bỏ' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`status-tab-btn ${selectedStatus === tab.id ? 'active' : ''}`}
              onClick={() => setSelectedStatus(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="search-input-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, khách, thợ..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="admin-table-card">
        {loading ? (
          <div className="empty-table-state">
            <Loader2 size={32} className="spin-icon" style={{ margin: '0 auto 1rem auto' }} />
            <p>Đang tải danh sách khiếu nại...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="empty-table-state">
            <h3>Không tìm thấy báo cáo khiếu nại nào</h3>
            <p>Không có khiếu nại nào phù hợp với bộ lọc hiện tại.</p>
          </div>
        ) : (
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Mã báo cáo</th>
                <th>Khách hàng</th>
                <th>Thợ bị khiếu nại</th>
                <th>Đơn hàng</th>
                <th>Hành vi vi phạm</th>
                <th>Trạng thái</th>
                <th>Chế tài</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => {
                const reasonInfo = REASON_LABELS[r.reasonType] || { label: r.reasonType, tone: 'info' };
                return (
                  <tr key={r.id}>
                    <td>
                      <span className="report-code-badge">#{r.reportCode}</span>
                      <div className="report-time-sub">
                        {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </td>

                    <td>
                      <div className="person-cell">
                        <span className="person-name">{r.reporterName}</span>
                        {r.reporterPhone && <span className="person-phone">{r.reporterPhone}</span>}
                      </div>
                    </td>

                    <td>
                      <div className="person-cell">
                        <span className="person-name">{r.providerName}</span>
                      </div>
                    </td>

                    <td>
                      {r.orderCode ? (
                        <span className="order-link-tag" title={r.orderTitle || ''}>
                          #{r.orderCode}
                        </span>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.82rem' }}>Không gắn đơn</span>
                      )}
                    </td>

                    <td>
                      <span className={`reason-tag ${reasonInfo.tone}`}>
                        {reasonInfo.label}
                      </span>
                    </td>

                    <td>
                      <span className={`status-badge ${r.status.toLowerCase()}`}>
                        {r.status === 'PENDING' && 'Chờ tiếp nhận'}
                        {r.status === 'INVESTIGATING' && 'Đang xác minh'}
                        {r.status === 'RESOLVED' && 'Đã giải quyết'}
                        {r.status === 'REJECTED' && 'Bác bỏ'}
                      </span>
                    </td>

                    <td>
                      {r.penaltyType === 'DEPOSIT_DEDUCTION' ? (
                        <span className="penalty-badge deposit">
                          Trừ cọc {Number(r.penaltyAmount).toLocaleString('vi-VN')}đ
                        </span>
                      ) : r.penaltyType === 'WARNING' ? (
                        <span className="penalty-badge warning">Cảnh cáo vi phạm</span>
                      ) : r.penaltyType === 'TEMPORARY_BAN' ? (
                        <span className="penalty-badge deposit">Khóa thợ 7 ngày</span>
                      ) : r.penaltyType === 'PERMANENT_BAN' ? (
                        <span className="penalty-badge deposit">Khóa vĩnh viễn</span>
                      ) : (
                        <span className="penalty-badge none">Không phạt</span>
                      )}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-resolve-action"
                        onClick={() => handleOpenResolveModal(r)}
                      >
                        Xử lý tranh chấp
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* RESOLVE DISPUTE MODAL */}
      {selectedReport && (
        <div className="resolve-modal-backdrop" onClick={handleCloseResolveModal}>
          <div 
            className="resolve-modal-card" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="resolve-modal-header">
              <div className="resolve-modal-title-wrap">
                <ShieldAlert size={22} color="#DC2626" />
                <h2>Hồ sơ Xử lý Khiếu nại #{selectedReport.reportCode}</h2>
              </div>
              <button 
                type="button" 
                className="btn-modal-close" 
                onClick={handleCloseResolveModal}
                aria-label="Đóng"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitResolve}>
              <div className="resolve-modal-body">
                {/* Summary of Complaint */}
                <div className="dispute-summary-box">
                  <div className="dispute-parties-grid">
                    <div className="party-box">
                      <span className="party-box-label">Khách hàng khiếu nại</span>
                      <span className="party-box-name">{selectedReport.reporterName}</span>
                      <span className="party-box-sub">SĐT: {selectedReport.reporterPhone || 'Chưa cung cấp'}</span>
                    </div>

                    <div className="party-box">
                      <span className="party-box-label">Thợ bị phản ánh</span>
                      <span className="party-box-name">{selectedReport.providerName}</span>
                      <span className="party-box-sub">Quỹ ký quỹ: 2.000.000đ (Bảo hành & Bồi thường)</span>
                    </div>
                  </div>

                  <div className="dispute-content-block">
                    <h4 className="dispute-content-title">Tiêu đề: {selectedReport.title}</h4>
                    <p className="dispute-content-desc">{selectedReport.description}</p>
                    
                    {selectedReport.expectedResolution && (
                      <p style={{ marginTop: '0.45rem', fontSize: '0.85rem', color: '#1E40AF' }}>
                        <strong>Yêu cầu của khách:</strong> {selectedReport.expectedResolution}
                      </p>
                    )}

                    {selectedReport.evidenceImages && selectedReport.evidenceImages.length > 0 && (
                      <div>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B' }}>
                          Hình ảnh chứng cứ ({selectedReport.evidenceImages.length} ảnh):
                        </span>
                        <div className="evidence-images-row">
                          {selectedReport.evidenceImages.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt="Chứng cứ vi phạm"
                              className="evidence-img-thumb"
                              onClick={() => setPreviewImage(img)}
                              title="Nhấp để phóng to ảnh"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Decision Form */}
                <div className="decision-form-box">
                  <div className="form-field-group">
                    <label htmlFor="resolveStatus">Trạng thái hồ sơ:</label>
                    <select
                      id="resolveStatus"
                      className="form-select"
                      value={resolveStatus}
                      onChange={(e) => setResolveStatus(e.target.value as ReportStatus)}
                    >
                      <option value="INVESTIGATING">Đang xác minh (Gọi đối chất khách và thợ)</option>
                      <option value="RESOLVED">Đã giải quyết (Kết luận và áp dụng chế tài)</option>
                      <option value="REJECTED">Bác bỏ khiếu nại (Không có căn cứ vi phạm)</option>
                    </select>
                  </div>

                  {resolveStatus === 'RESOLVED' && (
                    <>
                      <div className="form-field-group">
                        <label htmlFor="resolvePenaltyType">Hình thức chế tài xử phạt:</label>
                        <select
                          id="resolvePenaltyType"
                          className="form-select"
                          value={resolvePenaltyType}
                          onChange={(e) => setResolvePenaltyType(e.target.value as PenaltyType)}
                        >
                          <option value="NONE">Hòa giải thành công (Không phạt tiền)</option>
                          <option value="WARNING">Cảnh cáo vi phạm (Ghi điểm xấu vào hồ sơ thợ)</option>
                          <option value="DEPOSIT_DEDUCTION">Khấu trừ tiền Quỹ Ký Quỹ thợ 2.000.000đ</option>
                          <option value="TEMPORARY_BAN">Đình chỉ nhận đơn thợ 7 ngày</option>
                          <option value="PERMANENT_BAN">Khóa vĩnh viễn tài khoản thợ khỏi sàn</option>
                        </select>
                      </div>

                      {resolvePenaltyType === 'DEPOSIT_DEDUCTION' && (
                        <div className="form-field-group">
                          <label htmlFor="resolvePenaltyAmount">
                            <DollarSign size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
                            <span>Số tiền phạt khấu trừ từ Quỹ Ký Quỹ (VNĐ):</span>
                          </label>
                          <input
                            id="resolvePenaltyAmount"
                            type="text"
                            className="form-input-text"
                            value={resolvePenaltyAmount}
                            onChange={(e) => setResolvePenaltyAmount(e.target.value)}
                            placeholder="Ví dụ: 200000"
                            required
                          />
                          <div className="penalty-quick-presets">
                            {['200000', '500000', '1000000', '2000000'].map((amt) => (
                              <button
                                key={amt}
                                type="button"
                                className="btn-preset-pill"
                                onClick={() => setResolvePenaltyAmount(amt)}
                              >
                                {Number(amt).toLocaleString('vi-VN')}đ
                              </button>
                            ))}
                          </div>

                          <div className="deposit-penalty-alert">
                            <AlertOctagon size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>
                              Hệ thống sẽ trừ trực tiếp số tiền này từ Ví Ký Quỹ của thợ. Nếu số dư ký quỹ rơi xuống dưới 2.000.000đ, trạng thái ví của thợ sẽ chuyển sang <strong>Thiếu hụt ký quỹ (DEPOSIT_DEFICIT)</strong> và bị chặn nhận đơn mới ngay lập tức cho đến khi nạp bù.
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div className="form-field-group">
                    <label htmlFor="resolveAdminNotes">
                      Ghi chú kết luận & Căn cứ xử lý của Ban Quản Trị:
                    </label>
                    <textarea
                      id="resolveAdminNotes"
                      rows={3}
                      className="form-textarea-notes"
                      placeholder="Ghi rõ nội dung đối chất với thợ, kết quả nghiệm thu hoặc thỏa thuận bồi thường cho khách hàng..."
                      value={resolveAdminNotes}
                      onChange={(e) => setResolveAdminNotes(e.target.value)}
                      required={resolveStatus === 'RESOLVED'}
                    />
                  </div>
                </div>
              </div>

              <div className="resolve-modal-footer">
                <button
                  type="button"
                  className="btn-cancel-modal"
                  onClick={handleCloseResolveModal}
                  disabled={submittingResolve}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn-submit-resolve"
                  disabled={submittingResolve}
                >
                  {submittingResolve ? (
                    <>
                      <Loader2 size={16} className="spin-icon" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <span>Lưu kết luận xử lý</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Preview */}
      {previewImage && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
          onClick={() => setPreviewImage(null)}
        >
          <img 
            src={previewImage} 
            alt="Chứng cứ phóng to" 
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '12px' }} 
          />
        </div>
      )}
    </div>
  );
}

export default AdminDisputesPage;
