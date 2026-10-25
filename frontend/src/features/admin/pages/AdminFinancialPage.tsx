import { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  Wallet, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Search,
  DollarSign
} from 'lucide-react';
import { adminFinancialService } from '../../../services';
import type { 
  FinancialDashboardSummaryResponse, 
  PayoutRequestResponse,
  ProviderWalletResponse
} from '../../../types/wallet';
import './AdminFinancialPage.css';

export function AdminFinancialPage() {
  const [activeTab, setActiveTab] = useState<'PAYOUTS' | 'DEPOSIT_MANAGEMENT'>('PAYOUTS');
  const [summary, setSummary] = useState<FinancialDashboardSummaryResponse | null>(null);
  const [payouts, setPayouts] = useState<PayoutRequestResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Review modal state
  const [reviewingPayout, setReviewingPayout] = useState<PayoutRequestResponse | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [adminNote, setAdminNote] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Provider deposit management state
  const [searchProviderId, setSearchProviderId] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<ProviderWalletResponse | null>(null);
  const [searchingWallet, setSearchingWallet] = useState(false);
  
  // Deposit actions modal
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState('600000');
  const [topupNote, setTopupNote] = useState('');

  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  const [penaltyAmount, setPenaltyAmount] = useState('500000');
  const [penaltyReason, setPenaltyReason] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [sumRes, payoutsRes] = await Promise.all([
        adminFinancialService.getFinancialSummary(),
        adminFinancialService.getAllPayoutRequests(0, 50)
      ]);
      setSummary(sumRes);
      setPayouts(payoutsRes.content || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải dữ liệu tài chính';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearchWallet = async () => {
    if (!searchProviderId.trim()) return;
    setSearchingWallet(true);
    setErrorMsg(null);
    try {
      const wallet = await adminFinancialService.getProviderWallet(searchProviderId.trim());
      setSelectedWallet(wallet);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không tìm thấy thông tin ví thợ';
      setErrorMsg(msg);
      setSelectedWallet(null);
    } finally {
      setSearchingWallet(false);
    }
  };

  const handleConfirmReview = async () => {
    if (!reviewingPayout) return;
    setSubmittingReview(true);
    try {
      await adminFinancialService.reviewPayout(reviewingPayout.id, {
        action: reviewAction,
        adminNote: adminNote.trim() || undefined
      });
      setSuccessMsg(reviewAction === 'APPROVE' ? 'Đã duyệt lệnh rút tiền thành công!' : 'Đã từ chối lệnh rút tiền.');
      setReviewingPayout(null);
      setAdminNote('');
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Thao tác duyệt lệnh thất bại';
      alert(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleConfirmTopup = async () => {
    if (!selectedWallet) return;
    const amountNum = parseInt(topupAmount.replace(/\D/g, ''), 10);
    if (!amountNum || amountNum <= 0) {
      alert('Vui lòng nhập số tiền nạp bù hợp lệ');
      return;
    }
    setSubmittingReview(true);
    try {
      const updated = await adminFinancialService.topupDeposit(selectedWallet.providerId, {
        amount: amountNum,
        note: topupNote.trim() || 'Thợ nộp tiền mặt bù ký quỹ tại văn phòng'
      });
      setSelectedWallet(updated);
      setShowTopupModal(false);
      setTopupNote('');
      setSuccessMsg('Ghi nhận nạp bù ký quỹ thành công!');
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Nạp bù ký quỹ thất bại';
      alert(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleConfirmPenalty = async () => {
    if (!selectedWallet) return;
    const amountNum = parseInt(penaltyAmount.replace(/\D/g, ''), 10);
    if (!amountNum || amountNum <= 0) {
      alert('Vui lòng nhập số tiền phạt hợp lệ');
      return;
    }
    if (!penaltyReason.trim()) {
      alert('Vui lòng nhập lý do trích phạt bảo hành');
      return;
    }
    setSubmittingReview(true);
    try {
      const updated = await adminFinancialService.deductDisputePenalty(selectedWallet.providerId, {
        penaltyAmount: amountNum,
        reason: penaltyReason.trim()
      });
      setSelectedWallet(updated);
      setShowPenaltyModal(false);
      setPenaltyReason('');
      setSuccessMsg('Đã trích phạt ký quỹ bồi thường thành công!');
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Trích phạt ký quỹ thất bại';
      alert(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="admin-financial-page">
      {/* Page Header */}
      <div className="admin-financial-header">
        <div>
          <h1 className="admin-financial-title">Trung Tâm Tài Chính & Đối Soát</h1>
          <p className="admin-financial-subtitle">
            Quản trị dòng tiền thu hộ, hoa hồng sàn 10% tiền công, quỹ ký quỹ bảo hành 2 triệu và duyệt lệnh rút tiền
          </p>
        </div>
        <button type="button" className="admin-refresh-btn" onClick={loadData} disabled={loading}>
          <RotateCcw size={16} className={loading ? 'spin-icon' : ''} />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {successMsg && (
        <div className="financial-alert-banner success">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
          <button type="button" onClick={() => setSuccessMsg(null)}>✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="financial-alert-banner error">
          <AlertTriangle size={18} />
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg(null)}>✕</button>
        </div>
      )}

      {/* 4 Financial Metric Cards */}
      <div className="financial-metrics-grid">
        <div className="financial-metric-card">
          <div className="metric-header">
            <span className="metric-label">Tổng GMV Giao Dịch</span>
            <div className="metric-icon-wrap gmv">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="metric-value">
            {summary?.totalGmv ? summary.totalGmv.toLocaleString('vi-VN') : '0'} đ
          </div>
          <span className="metric-hint">Tổng giá trị thanh toán khách trả</span>
        </div>

        <div className="financial-metric-card highlight">
          <div className="metric-header">
            <span className="metric-label">Doanh Thu Sàn (10% Công)</span>
            <div className="metric-icon-wrap revenue">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="metric-value">
            {summary?.totalPlatformRevenue ? summary.totalPlatformRevenue.toLocaleString('vi-VN') : '0'} đ
          </div>
          <span className="metric-hint">Hoa hồng thực thu trên tiền công thợ</span>
        </div>

        <div className="financial-metric-card">
          <div className="metric-header">
            <span className="metric-label">Tổng Quỹ Ký Quỹ Thợ</span>
            <div className="metric-icon-wrap deposit">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="metric-value">
            {summary?.totalDepositFunds ? summary.totalDepositFunds.toLocaleString('vi-VN') : '0'} đ
          </div>
          <span className="metric-hint">
            {summary?.activeProvidersCount || 0} thợ đủ cọc (2tr/thợ)
            {summary?.deficitProvidersCount ? ` • ${summary.deficitProvidersCount} thợ hụt cọc` : ''}
          </span>
        </div>

        <div className="financial-metric-card">
          <div className="metric-header">
            <span className="metric-label">Lệnh Rút Tiền Chờ Duyệt</span>
            <div className="metric-icon-wrap pending">
              <Clock size={20} />
            </div>
          </div>
          <div className="metric-value">
            {summary?.totalPendingPayoutAmount ? summary.totalPendingPayoutAmount.toLocaleString('vi-VN') : '0'} đ
          </div>
          <span className="metric-hint">Yêu cầu rút thu nhập đang chờ chuyển khoản</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="financial-tabs-wrap">
        <button
          type="button"
          className={`financial-tab-btn ${activeTab === 'PAYOUTS' ? 'active' : ''}`}
          onClick={() => setActiveTab('PAYOUTS')}
        >
          <Wallet size={18} />
          <span>Danh Sách Lệnh Rút Tiền ({payouts.length})</span>
        </button>

        <button
          type="button"
          className={`financial-tab-btn ${activeTab === 'DEPOSIT_MANAGEMENT' ? 'active' : ''}`}
          onClick={() => setActiveTab('DEPOSIT_MANAGEMENT')}
        >
          <ShieldCheck size={18} />
          <span>Quản Lý Ký Quỹ & Xử Lý Tranh Chấp Bảo Hành</span>
        </button>
      </div>

      {/* TAB 1: PAYOUTS */}
      {activeTab === 'PAYOUTS' && (
        <div className="financial-table-card">
          <div className="table-card-header">
            <div>
              <h2 className="table-card-title">Yêu cầu rút tiền từ Đối tác Thợ</h2>
              <p className="table-card-sub">
                Bao gồm lệnh rút thu nhập khả dụng và lệnh tất toán ký quỹ rời sàn (áp dụng thời gian treo 20 ngày)
              </p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="financial-data-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Thợ yêu cầu</th>
                  <th>Loại rút</th>
                  <th>Số tiền</th>
                  <th>Ngân hàng nhận</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {payouts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-table-cell">
                      Chưa có yêu cầu rút tiền nào trên hệ thống
                    </td>
                  </tr>
                ) : (
                  payouts.map((p) => {
                    const isCoolingWait = p.status === 'COOLING_WAIT';
                    const canApproveDeposit =
                      isCoolingWait && p.coolingEndsAt && new Date(p.coolingEndsAt) <= new Date();

                    return (
                      <tr key={p.id}>
                        <td>{new Date(p.createdAt).toLocaleString('vi-VN')}</td>
                        <td>
                          <div className="table-provider-name">{p.providerName || 'Thợ đối tác'}</div>
                          <span className="table-provider-sub">ID: {p.providerId.substring(0, 8)}...</span>
                        </td>
                        <td>
                          {p.sourceWalletType === 'DEPOSIT' ? (
                            <span className="payout-type-badge deposit">Rút Cọc Rời Sàn</span>
                          ) : (
                            <span className="payout-type-badge available">Rút Thu Nhập</span>
                          )}
                        </td>
                        <td className="payout-amount-cell">
                          <strong>{p.amount.toLocaleString('vi-VN')} đ</strong>
                        </td>
                        <td>
                          <div><strong>{p.bankCode}</strong> - {p.accountNumber}</div>
                          <span className="table-account-name">{p.accountHolderName}</span>
                        </td>
                        <td>
                          {p.status === 'PENDING' && <span className="status-badge-custom pending">Chờ duyệt</span>}
                          {p.status === 'COOLING_WAIT' && (
                            <div>
                              <span className="status-badge-custom warning">Đóng băng 20 ngày</span>
                              {p.coolingEndsAt && (
                                <div className="cooling-time-hint">
                                  Hạn mở: {new Date(p.coolingEndsAt).toLocaleDateString('vi-VN')}
                                </div>
                              )}
                            </div>
                          )}
                          {p.status === 'COMPLETED' && <span className="status-badge-custom completed">Đã hoàn tất</span>}
                          {p.status === 'REJECTED' && <span className="status-badge-custom canceled">Bị từ chối</span>}
                        </td>
                        <td>
                          {p.status === 'PENDING' && (
                            <div className="table-actions-row">
                              <button
                                type="button"
                                className="action-btn-mini approve"
                                onClick={() => {
                                  setReviewingPayout(p);
                                  setReviewAction('APPROVE');
                                }}
                              >
                                Duyệt
                              </button>
                              <button
                                type="button"
                                className="action-btn-mini reject"
                                onClick={() => {
                                  setReviewingPayout(p);
                                  setReviewAction('REJECT');
                                }}
                              >
                                Từ chối
                              </button>
                            </div>
                          )}

                          {p.status === 'COOLING_WAIT' && (
                            <div className="table-actions-row">
                              <button
                                type="button"
                                className={`action-btn-mini approve ${!canApproveDeposit ? 'disabled' : ''}`}
                                disabled={!canApproveDeposit}
                                title={!canApproveDeposit ? 'Chưa hết 20 ngày bảo hành, chưa thể mở cọc' : 'Duyệt tất toán cọc'}
                                onClick={() => {
                                  if (!canApproveDeposit) return;
                                  setReviewingPayout(p);
                                  setReviewAction('APPROVE');
                                }}
                              >
                                {canApproveDeposit ? 'Tất toán cọc' : 'Đang treo'}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DEPOSIT MANAGEMENT */}
      {activeTab === 'DEPOSIT_MANAGEMENT' && (
        <div className="deposit-management-card">
          <div className="deposit-search-box">
            <label className="deposit-search-label">Tra cứu ví thợ bằng Provider Profile ID:</label>
            <div className="deposit-search-input-wrap">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Nhập UUID của thợ (Ví dụ: 335c5684-58e9-452b-8988-...)"
                value={searchProviderId}
                onChange={(e) => setSearchProviderId(e.target.value)}
              />
              <button 
                type="button" 
                className="deposit-search-btn"
                onClick={handleSearchWallet}
                disabled={searchingWallet || !searchProviderId.trim()}
              >
                {searchingWallet ? 'Đang tìm...' : 'Tra cứu ví'}
              </button>
            </div>
          </div>

          {selectedWallet && (
            <div className="wallet-detail-box">
              <div className="wallet-detail-header">
                <div>
                  <h3 className="wallet-th-title">Ví Thợ ID: {selectedWallet.providerId}</h3>
                  <div className="wallet-status-row">
                    Trạng thái: 
                    {selectedWallet.status === 'ACTIVE' && <span className="status-badge-custom completed">Đủ cọc 2tr (Hoạt động)</span>}
                    {selectedWallet.status === 'DEPOSIT_DEFICIT' && <span className="status-badge-custom canceled">Bị hụt cọc & Tạm dừng nhận việc</span>}
                    {selectedWallet.status === 'FROZEN_COOLING' && <span className="status-badge-custom warning">Đang treo 20 ngày chờ rút cọc</span>}
                  </div>
                </div>
                <div className="wallet-action-buttons">
                  <button 
                    type="button" 
                    className="btn-deposit-action topup"
                    onClick={() => setShowTopupModal(true)}
                  >
                    Ghi nhận nạp bù cọc
                  </button>
                  <button 
                    type="button" 
                    className="btn-deposit-action penalty"
                    onClick={() => setShowPenaltyModal(true)}
                  >
                    Trích phạt bảo hành
                  </button>
                </div>
              </div>

              <div className="wallet-balances-grid">
                <div className="sub-wallet-block">
                  <span className="sub-wallet-label">Số dư ký quỹ bảo hành (Định mức 2.000.000đ)</span>
                  <div className="sub-wallet-value">{selectedWallet.depositBalance.toLocaleString('vi-VN')} đ</div>
                  {selectedWallet.depositBalance < selectedWallet.depositTarget && (
                    <span className="sub-wallet-warning">
                      ⚠️ Cần nạp bù {(selectedWallet.depositTarget - selectedWallet.depositBalance).toLocaleString('vi-VN')}đ để mở lại quyền nhận việc
                    </span>
                  )}
                </div>

                <div className="sub-wallet-block">
                  <span className="sub-wallet-label">Số dư thu nhập khả dụng</span>
                  <div className="sub-wallet-value">{selectedWallet.availableBalance.toLocaleString('vi-VN')} đ</div>
                  <span className="sub-wallet-hint">Thợ có thể bấm rút bất kỳ lúc nào</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: Review Payout */}
      {reviewingPayout && (
        <div className="modal-backdrop-custom">
          <div className="modal-dialog-custom">
            <h3 className="modal-title-custom">
              {reviewAction === 'APPROVE' ? 'Xác nhận duyệt lệnh rút tiền' : 'Xác nhận từ chối lệnh rút tiền'}
            </h3>
            <p className="modal-desc-custom">
              Thợ: <strong>{reviewingPayout.providerName || reviewingPayout.providerId}</strong> • Số tiền: <strong>{reviewingPayout.amount.toLocaleString('vi-VN')} đ</strong>
              <br />
              Tài khoản nhận: {reviewingPayout.bankCode} - {reviewingPayout.accountNumber} ({reviewingPayout.accountHolderName})
            </p>

            <div className="form-group-custom">
              <label>Ghi chú đối soát của Admin (nếu có):</label>
              <textarea
                rows={3}
                placeholder="Nhập mã giao dịch ngân hàng hoặc lý do từ chối hoàn tiền..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
            </div>

            <div className="modal-actions-custom">
              <button 
                type="button" 
                className="modal-btn cancel"
                onClick={() => setReviewingPayout(null)}
                disabled={submittingReview}
              >
                Hủy bỏ
              </button>
              <button 
                type="button" 
                className={`modal-btn ${reviewAction === 'APPROVE' ? 'confirm' : 'danger'}`}
                onClick={handleConfirmReview}
                disabled={submittingReview}
              >
                {submittingReview ? 'Đang xử lý...' : (reviewAction === 'APPROVE' ? 'Xác nhận duyệt chuyển khoản' : 'Xác nhận từ chối')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Topup Deposit */}
      {showTopupModal && selectedWallet && (
        <div className="modal-backdrop-custom">
          <div className="modal-dialog-custom">
            <h3 className="modal-title-custom">Ghi nhận Thợ nạp bù Ký quỹ</h3>
            <p className="modal-desc-custom">
              Dành cho trường hợp thợ nộp tiền mặt hoặc chuyển khoản trực tiếp bên ngoài cho Admin để bù cọc bị phạt.
            </p>

            <div className="form-group-custom">
              <label>Số tiền nạp bù (đ):</label>
              <input
                type="text"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
              />
            </div>

            <div className="form-group-custom">
              <label>Ghi chú biên nhận:</label>
              <input
                type="text"
                placeholder="Ví dụ: Thợ đã nộp tiền mặt tại văn phòng ngày 24/10..."
                value={topupNote}
                onChange={(e) => setTopupNote(e.target.value)}
              />
            </div>

            <div className="modal-actions-custom">
              <button type="button" className="modal-btn cancel" onClick={() => setShowTopupModal(false)}>Hủy</button>
              <button type="button" className="modal-btn confirm" onClick={handleConfirmTopup} disabled={submittingReview}>
                {submittingReview ? 'Đang lưu...' : 'Xác nhận nạp bù cọc'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Dispute Penalty */}
      {showPenaltyModal && selectedWallet && (
        <div className="modal-backdrop-custom">
          <div className="modal-dialog-custom">
            <h3 className="modal-title-custom" style={{ color: '#dc2626' }}>Trích phạt Ký quỹ bồi thường Bảo hành</h3>
            <p className="modal-desc-custom">
              Tiền sẽ được trừ trực tiếp từ số dư ký quỹ 2.000.000đ của thợ để bồi hoàn cho khách hàng do vi phạm cam kết bảo hành.
            </p>

            <div className="form-group-custom">
              <label>Số tiền trích phạt (đ):</label>
              <input
                type="text"
                value={penaltyAmount}
                onChange={(e) => setPenaltyAmount(e.target.value)}
              />
            </div>

            <div className="form-group-custom">
              <label>Lý do trích phạt (Bắt buộc):</label>
              <textarea
                rows={3}
                placeholder="Ví dụ: Khách khiếu nại vòi nước rỉ sau 3 ngày sửa, thợ từ chối quay lại bảo hành..."
                value={penaltyReason}
                onChange={(e) => setPenaltyReason(e.target.value)}
              />
            </div>

            <div className="modal-actions-custom">
              <button type="button" className="modal-btn cancel" onClick={() => setShowPenaltyModal(false)}>Hủy</button>
              <button type="button" className="modal-btn danger" onClick={handleConfirmPenalty} disabled={submittingReview}>
                {submittingReview ? 'Đang xử lý...' : 'Xác nhận trích phạt'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
