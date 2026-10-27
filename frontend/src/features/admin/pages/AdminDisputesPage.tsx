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
  AlertOctagon,
  Building
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
  // Bổ sung chế tài đình chỉ & bồi thường
  const [banDurationDays, setBanDurationDays] = useState<number>(7);
  const [hasCompensation, setHasCompensation] = useState<boolean>(false);
  const [compensationAmount, setCompensationAmount] = useState<string>('');
  const [customerBankCode, setCustomerBankCode] = useState<string>('MBBank');
  const [customerAccountNumber, setCustomerAccountNumber] = useState<string>('');
  const [customerAccountHolder, setCustomerAccountHolder] = useState<string>('');

  // Modal Hoàn cọc
  const [selectedReportForRefund, setSelectedReportForRefund] = useState<ReportItem | null>(null);
  const [refundReason, setRefundReason] = useState<string>('');
  const [submittingRefund, setSubmittingRefund] = useState<boolean>(false);

  // Modal Xác nhận Bồi thường
  const [selectedReportForComp, setSelectedReportForComp] = useState<ReportItem | null>(null);
  const [payoutRef, setPayoutRef] = useState<string>('');
  const [compNote, setCompNote] = useState<string>('');
  const [submittingComp, setSubmittingComp] = useState<boolean>(false);

  // Modal Gỡ đình chỉ / Mở khóa tức thì
  const [selectedReportForRevokeSuspension, setSelectedReportForRevokeSuspension] = useState<ReportItem | null>(null);
  const [revokeSuspensionReason, setRevokeSuspensionReason] = useState<string>('');
  const [submittingRevokeSuspension, setSubmittingRevokeSuspension] = useState<boolean>(false);


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
    setResolvePenaltyAmount(
      report.penaltyAmount && report.penaltyAmount > 0 
        ? Number(report.penaltyAmount).toLocaleString('vi-VN') 
        : '200.000'
    );
    setBanDurationDays(report.banDurationDays || 7);
    setHasCompensation(report.compensationAmount > 0);
    setCompensationAmount(report.compensationAmount > 0 ? Number(report.compensationAmount).toLocaleString('vi-VN') : '');
    setCustomerBankCode(report.customerBankCode || 'MBBank');
    setCustomerAccountNumber(report.customerAccountNumber || '');
    setCustomerAccountHolder(report.customerAccountHolder || (report.reporterName || '').toUpperCase());
    setResolveAdminNotes(report.adminNotes || '');
  };

  
  const handleOpenRefundModal = (report: ReportItem) => {
    setSelectedReportForRefund(report);
    setRefundReason('Hai bên đã hòa giải thành công / Khách hàng đã rút đơn khiếu nại');
  };

  const handleSubmitRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReportForRefund) return;
    if (!refundReason.trim()) {
      alert('Vui lòng nhập lý do hoàn cọc');
      return;
    }
    setSubmittingRefund(true);
    try {
      await reportService.refundDisputePenalty(selectedReportForRefund.id, { reason: refundReason.trim() });
      setSuccessMsg(`Đã hoàn lại tiền cọc ${Number(selectedReportForRefund.penaltyAmount).toLocaleString('vi-VN')} đ cho thợ thành công!`);
      setSelectedReportForRefund(null);
      fetchReports();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Hoàn cọc thất bại';
      alert(msg);
    } finally {
      setSubmittingRefund(false);
    }
  };

  const handleOpenCompModal = (report: ReportItem) => {
    setSelectedReportForComp(report);
    setPayoutRef('');
    setCompNote('');
  };

  const handleSubmitComp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReportForComp) return;
    if (!payoutRef.trim()) {
      alert('Vui lòng nhập mã giao dịch ngân hàng / Ủy nhiệm chi');
      return;
    }
    setSubmittingComp(true);
    try {
      await reportService.confirmCompensation(selectedReportForComp.id, {
        payoutRef: payoutRef.trim(),
        note: compNote.trim() || undefined,
      });
      setSuccessMsg(`Đã xác nhận chi trả bồi thường ${Number(selectedReportForComp.compensationAmount).toLocaleString('vi-VN')} đ cho khách hàng thành công!`);
      setSelectedReportForComp(null);
      fetchReports();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xác nhận bồi thường thất bại';
      alert(msg);
    } finally {
      setSubmittingComp(false);
    }
  };

  const handleOpenRevokeModal = (report: ReportItem) => {
    setSelectedReportForRevokeSuspension(report);
    setRevokeSuspensionReason('Hòa giải thành công / Xem xét lại chứng cứ không thỏa đáng');
  };

  const handleSubmitRevokeSuspension = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReportForRevokeSuspension) return;

    if (!revokeSuspensionReason.trim()) {
      alert('Vui lòng nhập lý do gỡ đình chỉ / mở khóa cho thợ');
      return;
    }

    setSubmittingRevokeSuspension(true);
    try {
      await reportService.revokeSuspension(selectedReportForRevokeSuspension.id, {
        reason: revokeSuspensionReason.trim(),
      });
      setSuccessMsg(`Đã gỡ án phạt và khôi phục trạng thái hoạt động cho thợ ${selectedReportForRevokeSuspension.providerName} thành công!`);
      setSelectedReportForRevokeSuspension(null);
      setRevokeSuspensionReason('');
      fetchReports();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gỡ đình chỉ thất bại';
      alert(msg);
    } finally {
      setSubmittingRevokeSuspension(false);
    }
  };

  const handlePenaltyAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setResolvePenaltyAmount('');
      return;
    }
    const num = parseInt(raw, 10);
    setResolvePenaltyAmount(num.toLocaleString('vi-VN'));
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

      const compAmtNum = (resolvePenaltyType === 'DEPOSIT_DEDUCTION' && hasCompensation)
        ? Math.max(0, parseInt(compensationAmount.replace(/\D/g, '') || '0', 10))
        : 0;

      await reportService.resolveReport(selectedReport.id, {
        status: resolveStatus,
        penaltyType: resolvePenaltyType,
        penaltyAmount: penaltyAmountNum,
        banDurationDays: resolvePenaltyType === 'TEMPORARY_BAN' ? banDurationDays : undefined,
        compensationAmount: compAmtNum > 0 ? compAmtNum : undefined,
        customerBankCode: compAmtNum > 0 ? customerBankCode : undefined,
        customerAccountNumber: compAmtNum > 0 ? customerAccountNumber : undefined,
        customerAccountHolder: compAmtNum > 0 ? customerAccountHolder : undefined,
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
                      <div>
                        {r.penaltyType === 'DEPOSIT_DEDUCTION' ? (
                          <div>
                            <span className="penalty-badge deposit">
                              Trừ cọc {Number(r.penaltyAmount).toLocaleString('vi-VN')}đ
                            </span>
                            {r.refundedAt ? (
                              <div style={{ marginTop: '4px' }}>
                                <span style={{ fontSize: '11px', background: '#DCFCE7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                  ✓ Đã hoàn cọc ({new Date(r.refundedAt).toLocaleDateString('vi-VN')})
                                </span>
                              </div>
                            ) : (
                              <div style={{ marginTop: '4px' }}>
                                <button
                                  type="button"
                                  style={{
                                    fontSize: '11px',
                                    color: '#C2410C',
                                    background: '#FFF7ED',
                                    border: '1px solid #FFEDD5',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                  }}
                                  onClick={() => handleOpenRefundModal(r)}
                                >
                                  Hoàn cọc xử nhầm
                                </button>
                              </div>
                            )}
                          </div>
                        ) : r.penaltyType === 'WARNING' ? (
                          <span className="penalty-badge warning">Cảnh cáo vi phạm</span>
                        ) : r.penaltyType === 'TEMPORARY_BAN' ? (
                          <div>
                            <span className="penalty-badge deposit">Đình chỉ {r.banDurationDays || 7} ngày</span>
                            {r.suspensionLiftedAt ? (
                              <div style={{ marginTop: '4px' }}>
                                <span style={{ fontSize: '11px', background: '#F0FDF4', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                  ✓ Đã gỡ đình chỉ
                                </span>
                              </div>
                            ) : (
                              <div style={{ marginTop: '4px' }}>
                                <button
                                  type="button"
                                  style={{
                                    fontSize: '11px',
                                    color: '#15803D',
                                    background: '#DCFCE7',
                                    border: '1px solid #BBF7D0',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                  }}
                                  onClick={() => handleOpenRevokeModal(r)}
                                >
                                  Gỡ đình chỉ ngay
                                </button>
                              </div>
                            )}
                          </div>
                        ) : r.penaltyType === 'PERMANENT_BAN' ? (
                          <div>
                            <span className="penalty-badge deposit" style={{ background: '#991B1B', color: '#fff' }}>Khóa vĩnh viễn</span>
                            {r.suspensionLiftedAt ? (
                              <div style={{ marginTop: '4px' }}>
                                <span style={{ fontSize: '11px', background: '#F0FDF4', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                  ✓ Đã mở khóa
                                </span>
                              </div>
                            ) : (
                              <div style={{ marginTop: '4px' }}>
                                <button
                                  type="button"
                                  style={{
                                    fontSize: '11px',
                                    color: '#15803D',
                                    background: '#DCFCE7',
                                    border: '1px solid #BBF7D0',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                  }}
                                  onClick={() => handleOpenRevokeModal(r)}
                                >
                                  Mở khóa tài khoản ngay
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="penalty-badge none">Không phạt</span>
                        )}

                        {/* Thông tin bồi thường khách hàng */}
                        {r.compensationStatus === 'PENDING_PAYOUT' && (
                          <div style={{ marginTop: '6px' }}>
                            <span style={{ fontSize: '11px', background: '#FEF3C7', color: '#92400E', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                              Chờ đền bù: {Number(r.compensationAmount).toLocaleString('vi-VN')}đ
                            </span>
                            <div style={{ marginTop: '2px' }}>
                              <button
                                type="button"
                                style={{
                                  fontSize: '11px',
                                  color: '#166534',
                                  background: '#DCFCE7',
                                  border: '1px solid #BBF7D0',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontWeight: 600
                                }}
                                onClick={() => handleOpenCompModal(r)}
                              >
                                Đã chuyển khoản KH
                              </button>
                            </div>
                          </div>
                        )}
                        {r.compensationStatus === 'COMPLETED' && (
                          <div style={{ marginTop: '4px' }}>
                            <span style={{ fontSize: '11px', background: '#F0FDF4', color: '#166534', padding: '2px 6px', borderRadius: '4px' }}>
                              Đã đền bù ({r.compensationPayoutRef || 'Đã CK'})
                            </span>
                          </div>
                        )}
                      </div>
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

            <form onSubmit={handleSubmitResolve} className="resolve-modal-form">
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

                      {resolvePenaltyType === 'TEMPORARY_BAN' && (
                        <div className="form-field-group">
                          <label htmlFor="resolveBanDuration">Thời gian đình chỉ nhận việc:</label>
                          <select
                            id="resolveBanDuration"
                            className="form-select"
                            value={banDurationDays}
                            onChange={(e) => setBanDurationDays(Number(e.target.value))}
                          >
                            <option value={3}>3 ngày (Vi phạm nhẹ lần đầu)</option>
                            <option value={7}>7 ngày (Mặc định - Cố tình vi phạm / Tái phạm)</option>
                            <option value={14}>14 ngày (Vi phạm nghiêm trọng)</option>
                            <option value={30}>30 ngày (Đình chỉ đặc biệt 1 tháng)</option>
                          </select>
                          <span style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                            Hệ thống sẽ tự động khóa công tắc nhận việc của thợ đến hết thời hạn và chặn gửi báo giá.
                          </span>
                        </div>
                      )}

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
                            onChange={handlePenaltyAmountChange}
                            placeholder="Ví dụ: 200.000"
                            required
                          />
                          <div className="penalty-quick-presets">
                            {['200000', '500000', '1000000', '2000000'].map((amt) => (
                              <button
                                key={amt}
                                type="button"
                                className="btn-preset-pill"
                                onClick={() => setResolvePenaltyAmount(Number(amt).toLocaleString('vi-VN'))}
                              >
                                {Number(amt).toLocaleString('vi-VN')}đ
                              </button>
                            ))}
                          </div>

                          <div className="deposit-penalty-alert">
                            <AlertOctagon size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>
                              Hệ thống sẽ trừ trực tiếp số tiền này từ Ví Ký Quỹ của thợ. Nếu số dư rơi xuống dưới 2.000.000đ, trạng thái ví sẽ chuyển sang <strong>Thiếu hụt ký quỹ (DEPOSIT_DEFICIT)</strong> và bị chặn nhận việc ngay.
                            </span>
                          </div>

                          {/* Bồi thường cho Khách hàng */}
                          <div style={{ marginTop: '14px', padding: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', color: '#1E293B' }}>
                              <input
                                type="checkbox"
                                checked={hasCompensation}
                                onChange={(e) => {
                                  setHasCompensation(e.target.checked);
                                  if (e.target.checked && !compensationAmount) {
                                    setCompensationAmount(resolvePenaltyAmount);
                                  }
                                }}
                              />
                              <span>Trích tiền này bồi thường trực tiếp cho Khách hàng</span>
                            </label>

                            {hasCompensation && (
                              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div>
                                  <label style={{ fontSize: '12px', color: '#475569', display: 'block' }}>Số tiền bồi thường cho khách (đ):</label>
                                  <input
                                    type="text"
                                    className="form-input-text"
                                    value={compensationAmount}
                                    onChange={(e) => setCompensationAmount(e.target.value.replace(/\D/g, ''))}
                                    placeholder="Ví dụ: 500000"
                                    style={{ marginTop: '2px' }}
                                  />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px' }}>
                                  <div>
                                    <label style={{ fontSize: '12px', color: '#475569', display: 'block' }}>Ngân hàng khách:</label>
                                    <input
                                      type="text"
                                      className="form-input-text"
                                      value={customerBankCode}
                                      onChange={(e) => setCustomerBankCode(e.target.value)}
                                      placeholder="MBBank / VCB"
                                    />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: '12px', color: '#475569', display: 'block' }}>Số tài khoản khách:</label>
                                    <input
                                      type="text"
                                      className="form-input-text"
                                      value={customerAccountNumber}
                                      onChange={(e) => setCustomerAccountNumber(e.target.value)}
                                      placeholder="Nhập số tài khoản khách"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label style={{ fontSize: '12px', color: '#475569', display: 'block' }}>Tên chủ tài khoản:</label>
                                  <input
                                    type="text"
                                    className="form-input-text"
                                    value={customerAccountHolder}
                                    onChange={(e) => setCustomerAccountHolder(e.target.value.toUpperCase())}
                                    placeholder="NGUYEN VAN A"
                                  />
                                </div>
                              </div>
                            )}
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

      
      {/* MODAL HOÀN CỌC XỬ NHẦM */}
      {selectedReportForRefund && (
        <div className="resolve-modal-backdrop" onClick={() => setSelectedReportForRefund(null)}>
          <div className="resolve-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="resolve-modal-header">
              <div className="resolve-modal-title-wrap">
                <CheckCircle2 size={22} color="#16A34A" />
                <h2>Hoàn Tiền Ký Quỹ Thợ #{selectedReportForRefund.reportCode}</h2>
              </div>
              <button type="button" className="btn-modal-close" onClick={() => setSelectedReportForRefund(null)}>✕</button>
            </div>
            <form onSubmit={handleSubmitRefund} className="resolve-modal-form">
              <div className="resolve-modal-body">
                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px' }}>
                  <div><strong>Thợ nhận cọc:</strong> {selectedReportForRefund.providerName}</div>
                  <div><strong>Số tiền hoàn lại:</strong> <span style={{ color: '#16A34A', fontWeight: 700 }}>+{Number(selectedReportForRefund.penaltyAmount).toLocaleString('vi-VN')} đ</span></div>
                  <div style={{ marginTop: '4px', color: '#64748B' }}>Hệ thống sẽ cộng lại số tiền này vào Quỹ Ký Quỹ của thợ và tự động khôi phục quyền nhận đơn nếu số dư đạt 2.000.000đ.</div>
                </div>

                <div className="form-field-group">
                  <label>Lý do hoàn cọc / Hủy quyết định phạt:</label>
                  <textarea
                    rows={3}
                    className="form-textarea-notes"
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="Ghi rõ lý do hòa giải, thỏa thuận hoặc khách hàng đã rút khiếu nại..."
                    required
                  />
                </div>
              </div>
              <div className="resolve-modal-footer">
                <button type="button" className="btn-cancel-modal" onClick={() => setSelectedReportForRefund(null)}>Hủy bỏ</button>
                <button type="submit" className="btn-submit-resolve" style={{ background: '#16A34A' }} disabled={submittingRefund}>
                  {submittingRefund ? 'Đang hoàn cọc...' : 'Xác nhận hoàn cọc cho thợ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN CHI TRẢ BỒI THƯỜNG CHO KHÁCH */}
      {selectedReportForComp && (
        <div className="resolve-modal-backdrop" onClick={() => setSelectedReportForComp(null)}>
          <div className="resolve-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="resolve-modal-header">
              <div className="resolve-modal-title-wrap">
                <Building size={22} color="#1D6AE5" />
                <h2>Xác Nhận Chi Trả Bồi Thường #{selectedReportForComp.reportCode}</h2>
              </div>
              <button type="button" className="btn-modal-close" onClick={() => setSelectedReportForComp(null)}>✕</button>
            </div>
            <form onSubmit={handleSubmitComp} className="resolve-modal-form">
              <div className="resolve-modal-body">
                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px' }}>
                  <div><strong>Khách hàng nhận:</strong> {selectedReportForComp.reporterName}</div>
                  <div><strong>Ngân hàng:</strong> {selectedReportForComp.customerBankCode || 'MBBank'}</div>
                  <div><strong>Số tài khoản:</strong> {selectedReportForComp.customerAccountNumber || 'Chưa cung cấp'}</div>
                  <div><strong>Chủ thẻ:</strong> {selectedReportForComp.customerAccountHolder || selectedReportForComp.reporterName}</div>
                  <div style={{ marginTop: '6px' }}><strong>Số tiền đền bù:</strong> <span style={{ color: '#DC2626', fontWeight: 700 }}>{Number(selectedReportForComp.compensationAmount).toLocaleString('vi-VN')} đ</span></div>
                </div>

                <div className="form-field-group">
                  <label>Mã giao dịch ngân hàng / Số bút toán ủy nhiệm chi:</label>
                  <input
                    type="text"
                    className="form-input-text"
                    value={payoutRef}
                    onChange={(e) => setPayoutRef(e.target.value)}
                    placeholder="Ví dụ: MB_FT2401239999"
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label>Ghi chú thêm:</label>
                  <textarea
                    rows={2}
                    className="form-textarea-notes"
                    value={compNote}
                    onChange={(e) => setCompNote(e.target.value)}
                    placeholder="Chuyển khoản thành công từ tài khoản BQT..."
                  />
                </div>
              </div>
              <div className="resolve-modal-footer">
                <button type="button" className="btn-cancel-modal" onClick={() => setSelectedReportForComp(null)}>Hủy bỏ</button>
                <button type="submit" className="btn-submit-resolve" disabled={submittingComp}>
                  {submittingComp ? 'Đang lưu...' : 'Xác nhận đã chuyển khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

            {/* MODAL GỠ ĐÌNH CHỈ / MỞ KHÓA CHO THỢ */}
      {selectedReportForRevokeSuspension && (
        <div className="resolve-modal-backdrop" onClick={() => setSelectedReportForRevokeSuspension(null)}>
          <div className="resolve-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="resolve-modal-header">
              <div className="resolve-modal-title-wrap">
                <CheckCircle2 size={22} color="#16A34A" />
                <h2>
                  {selectedReportForRevokeSuspension.penaltyType === 'PERMANENT_BAN'
                    ? `Mở Khóa Tài Khoản Thợ #${selectedReportForRevokeSuspension.reportCode}`
                    : `Gỡ Đình Chỉ Nhận Việc Thợ #${selectedReportForRevokeSuspension.reportCode}`}
                </h2>
              </div>
              <button type="button" className="btn-modal-close" onClick={() => setSelectedReportForRevokeSuspension(null)}>✕</button>
            </div>
            <form onSubmit={handleSubmitRevokeSuspension} className="resolve-modal-form">
              <div className="resolve-modal-body">
                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px' }}>
                  <div><strong>Thợ xử lý:</strong> {selectedReportForRevokeSuspension.providerName}</div>
                  <div>
                    <strong>Chế tài hiện tại:</strong>{' '}
                    <span style={{ color: '#DC2626', fontWeight: 700 }}>
                      {selectedReportForRevokeSuspension.penaltyType === 'PERMANENT_BAN'
                        ? 'Khóa tài khoản vĩnh viễn'
                        : `Đình chỉ ${selectedReportForRevokeSuspension.banDurationDays || 7} ngày`}
                    </span>
                  </div>
                  <div style={{ marginTop: '6px', color: '#475569', lineHeight: 1.4 }}>
                    Khi xác nhận gỡ phạt:
                    <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                      <li>Thời hạn đình chỉ được xóa bỏ ngay lập tức.</li>
                      <li>Bộ đếm cảnh cáo được reset về 0 (chu kỳ mới).</li>
                      {selectedReportForRevokeSuspension.penaltyType === 'PERMANENT_BAN' && (
                        <li>Tài khoản đăng nhập và ví thợ sẽ được kích hoạt trở lại.</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="form-field-group">
                  <label>Lý do gỡ đình chỉ / mở khóa:</label>
                  <textarea
                    rows={3}
                    className="form-textarea-notes"
                    value={revokeSuspensionReason}
                    onChange={(e) => setRevokeSuspensionReason(e.target.value)}
                    placeholder="Ghi rõ lý do hòa giải, thỏa thuận bồi thường hoàn tất hoặc xử phạt nhầm..."
                    required
                  />
                </div>
              </div>
              <div className="resolve-modal-footer">
                <button type="button" className="btn-cancel-modal" onClick={() => setSelectedReportForRevokeSuspension(null)}>Hủy bỏ</button>
                <button type="submit" className="btn-submit-resolve" style={{ background: '#16A34A' }} disabled={submittingRevokeSuspension}>
                  {submittingRevokeSuspension ? 'Đang xử lý...' : 'Xác nhận gỡ phạt / Mở khóa'}
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
