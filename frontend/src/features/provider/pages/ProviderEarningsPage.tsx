import { useState, useEffect, useCallback } from 'react';
import { 
  ArrowUpRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  RotateCcw,
  Building,
  UserCheck,
  PlusCircle,
  ShieldAlert
} from 'lucide-react';
import { providerWalletService } from '../../../services';
import { reportService } from '../../../services/reportService';
import type { ReportItem } from '../../../types/report';
import type { 
  ProviderWalletResponse, 
  WalletTransactionResponse, 
  PayoutRequestResponse 
} from '../../../types/wallet';
import './ProviderEarningsPage.css';

const COMMON_BANKS = [
  'Vietcombank',
  'MBBank',
  'Techcombank',
  'BIDV',
  'VietinBank',
  'ACB',
  'VPBank',
  'TPBank',
  'SeABank',
  'Sacombank',
];

export function ProviderEarningsPage() {
  const [wallet, setWallet] = useState<ProviderWalletResponse | null>(null);
  const [transactions, setTransactions] = useState<WalletTransactionResponse[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequestResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal: Rút thu nhập khả dụng
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('200000');
  const [bankCode, setBankCode] = useState('MBBank');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);

  // Modal: Rút cọc rời sàn (Cooling 20 ngày)
  const [showDepositRefundModal, setShowDepositRefundModal] = useState(false);
  const [depositReason, setDepositReason] = useState('');
  const [submittingDepositRefund, setSubmittingDepositRefund] = useState(false);
  // Modal: Nạp bù ký quỹ
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupTab, setTopupTab] = useState<'available' | 'vietqr'>('available');
  const [topupAmount, setTopupAmount] = useState('500000');
  const [submittingTopup, setSubmittingTopup] = useState(false);

  // Danh sách khiếu nại & kỷ luật
  const [disputes, setDisputes] = useState<ReportItem[]>([]);



  const loadWalletData = useCallback(async () => {
    setLoading(true);
    try {
      const [walletRes, txRes, payoutRes, disputeRes] = await Promise.all([
        providerWalletService.getMyWallet(),
        providerWalletService.getMyTransactions(0, 30),
        providerWalletService.getMyPayoutRequests(0, 20),
        reportService.getProviderMyDisputes(0, 20),
      ]);
      setWallet(walletRes);
      setTransactions(txRes.content || []);
      setPayouts(payoutRes.content || []);
      setDisputes(disputeRes.content || []);
    } catch (err: unknown) {
      console.error('Không thể tải thông tin ví:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWalletData();
  }, [loadWalletData]);

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(withdrawAmount.replace(/\D/g, ''), 10);
    if (!amountNum || amountNum < 50000) {
      alert('Số tiền rút tối thiểu là 50.000 đ');
      return;
    }
    if (!accountNumber.trim() || !accountHolderName.trim()) {
      alert('Vui lòng nhập đầy đủ thông tin số tài khoản và tên chủ thẻ');
      return;
    }

    setSubmittingWithdraw(true);
    try {
      await providerWalletService.requestPayout({
        amount: amountNum,
        bankCode,
        accountNumber: accountNumber.trim(),
        accountHolderName: accountHolderName.trim().toUpperCase(),
      });
      setShowWithdrawModal(false);
      setActionNotice({
        type: 'success',
        text: `Đã gửi yêu cầu rút ${amountNum.toLocaleString('vi-VN')} đ về ngân hàng ${bankCode}. Admin sẽ duyệt chuyển khoản sớm nhất!`,
      });
      loadWalletData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Yêu cầu rút tiền thất bại';
      alert(msg);
    } finally {
      setSubmittingWithdraw(false);
    }
  };

  
  const handleTopupFromAvailable = async (amountNum: number) => {
    if (!wallet || wallet.availableBalance < amountNum) {
      alert('Số dư khả dụng không đủ để trích nạp bù!');
      return;
    }
    setSubmittingTopup(true);
    try {
      await providerWalletService.topupDepositFromAvailable({ amount: amountNum });
      setShowTopupModal(false);
      setActionNotice({
        type: 'success',
        text: `Đã trích thành công ${amountNum.toLocaleString('vi-VN')} đ từ ví thu nhập sang Quỹ Ký Quỹ! Tài khoản đã sẵn sàng nhận đơn.`,
      });
      loadWalletData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Nạp bù ký quỹ thất bại';
      alert(msg);
    } finally {
      setSubmittingTopup(false);
    }
  };

  const handleTopupVietQrConfirm = async (amountNum: number) => {
    setSubmittingTopup(true);
    try {
      await providerWalletService.topupDepositVietQrDemo({ 
        amount: amountNum,
        note: 'Nạp bù ký quỹ bảo hành 2tr qua VietQR MBBank'
      });
      setShowTopupModal(false);
      setActionNotice({
        type: 'success',
        text: `Xác nhận chuyển khoản VietQR thành công! Đã nạp bù ${amountNum.toLocaleString('vi-VN')} đ vào Quỹ Ký Quỹ bảo hành.`,
      });
      loadWalletData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xác nhận nạp bù thất bại';
      alert(msg);
    } finally {
      setSubmittingTopup(false);
    }
  };

  const handleDepositRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber.trim() || !accountHolderName.trim()) {
      alert('Vui lòng nhập số tài khoản và tên chủ thẻ nhận cọc');
      return;
    }

    setSubmittingDepositRefund(true);
    try {
      const res = await providerWalletService.requestDepositRefund({
        bankCode,
        accountNumber: accountNumber.trim(),
        accountHolderName: accountHolderName.trim().toUpperCase(),
        reason: depositReason.trim(),
      });
      setShowDepositRefundModal(false);
      const coolingDate = res.coolingEndsAt
        ? new Date(res.coolingEndsAt).toLocaleDateString('vi-VN')
        : '20 ngày';
      setActionNotice({
        type: 'success',
        text: `Đã tiếp nhận yêu cầu rút ký quỹ rời sàn. Hệ thống đã khóa nhận việc và kích hoạt thời gian bảo hành 20 ngày (đến ngày ${coolingDate}).`,
      });
      loadWalletData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gửi yêu cầu rút cọc thất bại';
      alert(msg);
    } finally {
      setSubmittingDepositRefund(false);
    }
  };

  const getTxTypeBadge = (type: string) => {
    switch (type) {
      case 'ORDER_INCOME_LABOR':
        return <span className="tx-badge labor">Tiền công (90%)</span>;
      case 'ORDER_INCOME_MATERIALS':
        return <span className="tx-badge materials">Tiền vật tư (100%)</span>;
      case 'WITHDRAW_AVAILABLE':
        return <span className="tx-badge withdraw">Rút thu nhập</span>;
      case 'ADMIN_INITIAL_DEPOSIT':
        return <span className="tx-badge deposit-init">Cấp cọc ban đầu</span>;
      case 'ADMIN_TOPUP_DEPOSIT':
        return <span className="tx-badge deposit-topup">Nạp bù cọc</span>;
      case 'DISPUTE_PENALTY':
        return <span className="tx-badge penalty">Trích phạt bảo hành</span>;
      case 'DEPOSIT_REFUND':
        return <span className="tx-badge refund">Tất toán cọc rời sàn</span>;
      case 'TOPUP_DEPOSIT_FROM_AVAILABLE':
        return <span className="tx-badge deposit-topup">Trích ví thu nhập bù cọc</span>;
      case 'TOPUP_DEPOSIT_VIETQR':
        return <span className="tx-badge deposit-topup">Nạp bù cọc VietQR</span>;
      case 'DISPUTE_PENALTY_REFUND':
        return <span className="tx-badge labor">Hoàn cọc xử nhầm/hòa giải</span>;
      default:
        return <span className="tx-badge">{type}</span>;
    }
  };

  return (
    <div className="provider-earnings-page">
      <div className="provider-earnings-header-row">
        <div>
          <h1 className="provider-earnings-title">Ví & Thu nhập Đối tác</h1>
          <p className="provider-earnings-subtitle">
            Minh bạch dòng tiền: 10% hoa hồng công thợ, hoàn 100% tiền vật tư, và ký quỹ bảo hành 2.000.000 đ
          </p>
        </div>
        <button
          type="button"
          className="earnings-reload-btn"
          onClick={loadWalletData}
          disabled={loading}
        >
          <RotateCcw size={16} className={loading ? 'spin-icon' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      {actionNotice && (
        <div className={`earnings-action-alert ${actionNotice.type}`}>
          {actionNotice.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{actionNotice.text}</span>
          <button type="button" onClick={() => setActionNotice(null)}>✕</button>
        </div>
      )}

      {/* TWO SUB-WALLETS OVERVIEW */}
      <div className="two-wallets-grid">
        {/* WALLET 1: THU NHẬP KHẢ DỤNG */}
        <div className="sub-wallet-card available-card">
          <div className="wallet-card-top">
            <span className="wallet-card-tag available">SỐ DƯ KHẢ DỤNG</span>
            <span className="wallet-card-subtext">Rút về ngân hàng bất kỳ lúc nào</span>
          </div>

          <div className="wallet-amount-big">
            {wallet?.availableBalance ? wallet.availableBalance.toLocaleString('vi-VN') : '0'} đ
          </div>

          <p className="wallet-card-desc">
            Tiền công sau trừ 10% hoa hồng sàn + 100% tiền vật tư khách đã thanh toán.
          </p>

          <div className="wallet-card-actions">
            <button
              type="button"
              className="wallet-action-btn primary"
              onClick={() => setShowWithdrawModal(true)}
              disabled={!wallet || wallet.availableBalance < 50000}
            >
              <ArrowUpRight size={18} />
              <span>Rút tiền về ngân hàng</span>
            </button>
          </div>
        </div>

        {/* WALLET 2: KÝ QUỸ BẢO HÀNH 2TR */}
        <div className="sub-wallet-card deposit-card">
          <div className="wallet-card-top">
            <span className="wallet-card-tag deposit">KÝ QUỸ BẢO HÀNH</span>
            <span className="wallet-card-subtext">Định mức cố định: 2.000.000 đ</span>
          </div>

          <div className="wallet-amount-big">
            {wallet?.depositBalance ? wallet.depositBalance.toLocaleString('vi-VN') : '0'} đ
          </div>

          <div className="wallet-deposit-status">
            {wallet?.status === 'ACTIVE' && (
              <div className="deposit-status-pill ok">
                <ShieldCheck size={16} />
                <span>Đủ cọc bảo hành • Đang sẵn sàng nhận cuốc</span>
              </div>
            )}
            {wallet?.status === 'DEPOSIT_DEFICIT' && (
              <div className="deposit-status-pill deficit">
                <AlertTriangle size={16} />
                <span>Hụt cọc dưới 2tr • Tạm dừng nhận việc (Cần nạp bù)</span>
              </div>
            )}
            {wallet?.status === 'FROZEN_COOLING' && (
              <div className="deposit-status-pill cooling">
                <Clock size={16} />
                <span>Đang trong thời gian bảo hành 20 ngày chờ rút cọc</span>
              </div>
            )}
          </div>

          <div className="wallet-card-actions">
            {wallet?.status === 'DEPOSIT_DEFICIT' && (
              <button
                type="button"
                className="wallet-action-btn primary"
                style={{ backgroundColor: '#EA580C', borderColor: '#EA580C', color: '#fff' }}
                onClick={() => {
                  const needed = Math.max(0, (wallet.depositTarget || 2000000) - (wallet.depositBalance || 0));
                  setTopupAmount(needed > 0 ? needed.toString() : '500000');
                  setShowTopupModal(true);
                }}
              >
                <PlusCircle size={18} />
                <span>Nạp bù ký quỹ ngay</span>
              </button>
            )}
            {wallet?.status === 'ACTIVE' && (
              <button
                type="button"
                className="wallet-action-btn secondary"
                onClick={() => setShowDepositRefundModal(true)}
              >
                <span>Yêu cầu rút cọc rời sàn</span>
              </button>
            )}
          </div>
        </div>
      </div>

      
      {/* SECTION: LỊCH SỬ KHIẾU NẠI & KỶ LUẬT */}
      <div className="earnings-section-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 className="earnings-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={20} color="#DC2626" />
              <span>Hồ sơ Khiếu nại & Kỷ luật Bảo hành</span>
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
              Minh bạch các vụ việc khiếu nại chất lượng dịch vụ, phán quyết của BQT và tình trạng chế tài.
            </p>
          </div>
        </div>

        {disputes.length === 0 ? (
          <div className="empty-tx-box">
            <ShieldCheck size={40} color="#10B981" />
            <p>Hồ sơ kỷ luật trong sạch! Bạn chưa có bất kỳ khiếu nại hoặc án phạt nào.</p>
          </div>
        ) : (
          <div className="disputes-provider-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {disputes.map((d) => (
              <div 
                key={d.id} 
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '16px',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px', color: '#1E293B' }}>#{d.reportCode}</span>
                    {d.orderCode && (
                      <span style={{ fontSize: '12px', background: '#F1F5F9', padding: '2px 8px', borderRadius: '4px', color: '#475569' }}>
                        Đơn: {d.orderCode}
                      </span>
                    )}
                  </div>
                  <div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: '12px',
                      backgroundColor: d.status === 'RESOLVED' ? '#DCFCE7' : d.status === 'REJECTED' ? '#F1F5F9' : '#FEF3C7',
                      color: d.status === 'RESOLVED' ? '#166534' : d.status === 'REJECTED' ? '#475569' : '#92400E'
                    }}>
                      {d.status === 'PENDING' && 'Chờ tiếp nhận'}
                      {d.status === 'INVESTIGATING' && 'Đang xác minh'}
                      {d.status === 'RESOLVED' && 'Đã có kết luận BQT'}
                      {d.status === 'REJECTED' && 'Bác bỏ khiếu nại'}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>
                  {d.title}
                </div>
                <div style={{ fontSize: '13px', color: '#64748B' }}>
                  {d.description}
                </div>

                {d.status === 'RESOLVED' && (
                  <div style={{ background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '8px', padding: '10px 12px', marginTop: '6px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B', marginBottom: '4px' }}>
                      Phán quyết của Ban Quản Trị:
                    </div>
                    <div style={{ fontSize: '13px', color: '#475569' }}>
                      {d.adminNotes || 'Đã hòa giải thành công'}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {d.penaltyType === 'DEPOSIT_DEDUCTION' && (
                        <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                          Khấu trừ cọc: -{d.penaltyAmount?.toLocaleString('vi-VN')} đ
                        </span>
                      )}
                      {d.penaltyType === 'WARNING' && (
                        <span style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                          Cảnh cáo vi phạm (Strike)
                        </span>
                      )}
                      {d.penaltyType === 'TEMPORARY_BAN' && (
                        <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                          Đình chỉ nhận đơn {d.banDurationDays || 7} ngày
                        </span>
                      )}
                      {d.penaltyType === 'PERMANENT_BAN' && (
                        <span style={{ background: '#991B1B', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                          Khóa tài khoản vĩnh viễn
                        </span>
                      )}

                      {d.refundedAt && (
                        <span style={{ background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                          ✓ Đã hoàn cọc lại cho thợ: +{d.penaltyAmount?.toLocaleString('vi-VN')} đ ({new Date(d.refundedAt).toLocaleDateString('vi-VN')})
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RECENT PAYOUT REQUESTS */}
      {payouts.length > 0 && (
        <div className="earnings-section-box">
          <h2 className="earnings-section-title">Lịch sử Lệnh Rút Tiền Gần Đây</h2>
          <div className="payouts-cards-list">
            {payouts.map((p) => (
              <div key={p.id} className="payout-item-card">
                <div className="payout-item-left">
                  <div className="payout-item-amount">{p.amount.toLocaleString('vi-VN')} đ</div>
                  <div className="payout-item-meta">
                    {p.sourceWalletType === 'DEPOSIT' ? 'Tất toán cọc rời sàn' : 'Rút thu nhập khả dụng'} •{' '}
                    {p.bankCode} ({p.accountNumber})
                  </div>
                  <div className="payout-item-date">{new Date(p.createdAt).toLocaleString('vi-VN')}</div>
                </div>

                <div className="payout-item-right">
                  {p.status === 'PENDING' && (
                    <span className="payout-status-badge pending">Chờ Admin duyệt</span>
                  )}
                  {p.status === 'COOLING_WAIT' && (
                    <div className="payout-status-cooling-wrap">
                      <span className="payout-status-badge warning">Đóng băng 20 ngày</span>
                      {p.coolingEndsAt && (
                        <div className="cooling-date-hint">
                          Hạn mở: {new Date(p.coolingEndsAt).toLocaleDateString('vi-VN')}
                        </div>
                      )}
                    </div>
                  )}
                  {p.status === 'COMPLETED' && (
                    <span className="payout-status-badge completed">Đã chuyển khoản</span>
                  )}
                  {p.status === 'REJECTED' && (
                    <span className="payout-status-badge rejected">Bị từ chối</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TRANSACTIONS AUDIT TABLE */}
      <div className="earnings-section-box">
        <h2 className="earnings-section-title">Lịch Sử Biến Động Số Dư (Sổ Cái)</h2>
        <div className="table-responsive">
          <table className="earnings-tx-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Phân loại</th>
                <th>Số tiền</th>
                <th>Số dư sau</th>
                <th>Ghi chú giao dịch</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-tx-cell">Chưa có giao dịch biến động số dư nào</td>
                </tr>
              ) : (
                transactions.map((t) => {
                  const isPositive = t.amount > 0;
                  return (
                    <tr key={t.id}>
                      <td>{new Date(t.createdAt).toLocaleString('vi-VN')}</td>
                      <td>{getTxTypeBadge(t.type)}</td>
                      <td className={`tx-amount-cell ${isPositive ? 'plus' : 'minus'}`}>
                        {isPositive ? `+${t.amount.toLocaleString('vi-VN')}` : `${t.amount.toLocaleString('vi-VN')}`} đ
                      </td>
                      <td className="tx-balance-after">{t.balanceAfter.toLocaleString('vi-VN')} đ</td>
                      <td className="tx-note-cell">{t.note || '-'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: RÚT THU NHẬP */}
      {showWithdrawModal && (
        <div className="earnings-modal-backdrop" onClick={() => setShowWithdrawModal(false)}>
          <div className="earnings-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-heading">Rút thu nhập về tài khoản Ngân hàng</h3>
            <p className="modal-sub">
              Số dư khả dụng hiện tại: <strong>{wallet?.availableBalance.toLocaleString('vi-VN')} đ</strong> (Rút tối thiểu 50.000 đ)
            </p>

            <form onSubmit={handleWithdrawSubmit}>
              <div className="form-field">
                <label>Số tiền muốn rút (đ):</label>
                <input
                  type="text"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Nhập số tiền..."
                  required
                />
              </div>

              <div className="form-field">
                <label>Chọn Ngân hàng:</label>
                <div className="input-with-icon">
                  <Building size={16} />
                  <select value={bankCode} onChange={(e) => setBankCode(e.target.value)}>
                    {COMMON_BANKS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label>Số tài khoản:</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Nhập số tài khoản ngân hàng..."
                  required
                />
              </div>

              <div className="form-field">
                <label>Tên chủ tài khoản (In hoa không dấu):</label>
                <div className="input-with-icon">
                  <UserCheck size={16} />
                  <input
                    type="text"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    placeholder="VÍ DỤ: NGUYEN VAN TAI"
                    required
                  />
                </div>
              </div>

              <div className="modal-btn-row">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setShowWithdrawModal(false)}
                  disabled={submittingWithdraw}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-modal-submit"
                  disabled={submittingWithdraw}
                >
                  {submittingWithdraw ? 'Đang gửi lệnh...' : 'Xác nhận tạo lệnh rút'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RÚT KÝ QUỸ RỜI SÀN */}

      {/* MODAL: NẠP BÙ QUỸ KÝ QUỸ */}
      {showTopupModal && (
        <div className="modal-backdrop" onClick={() => setShowTopupModal(false)}>
          <div className="earnings-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-card-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <PlusCircle size={20} color="#EA580C" />
                <span>Nạp Bù Quỹ Ký Quỹ Bảo Hành</span>
              </h3>
              <button 
                type="button" 
                className="btn-modal-close" 
                onClick={() => setShowTopupModal(false)}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', marginTop: '12px' }}>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: '10px',
                  border: 'none',
                  background: 'none',
                  borderBottom: topupTab === 'available' ? '2px solid #EA580C' : 'none',
                  color: topupTab === 'available' ? '#EA580C' : '#64748B',
                  fontWeight: topupTab === 'available' ? 700 : 500,
                  cursor: 'pointer'
                }}
                onClick={() => setTopupTab('available')}
              >
                1. Trích từ ví thu nhập
              </button>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: '10px',
                  border: 'none',
                  background: 'none',
                  borderBottom: topupTab === 'vietqr' ? '2px solid #EA580C' : 'none',
                  color: topupTab === 'vietqr' ? '#EA580C' : '#64748B',
                  fontWeight: topupTab === 'vietqr' ? 700 : 500,
                  cursor: 'pointer'
                }}
                onClick={() => setTopupTab('vietqr')}
              >
                2. Quét mã VietQR
              </button>
            </div>

            <div style={{ padding: '16px 0' }}>
              {topupTab === 'available' ? (
                <div>
                  <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#64748B' }}>Số dư thu nhập khả dụng:</span>
                      <strong style={{ color: '#16A34A', fontSize: '14px' }}>
                        {wallet?.availableBalance ? wallet.availableBalance.toLocaleString('vi-VN') : '0'} đ
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Số tiền cọc cần bù thêm:</span>
                      <strong style={{ color: '#EA580C', fontSize: '14px' }}>
                        {wallet ? Math.max(0, 2000000 - wallet.depositBalance).toLocaleString('vi-VN') : '0'} đ
                      </strong>
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Số tiền muốn trích nạp bù (đ):</label>
                    <input
                      type="text"
                      value={Number(topupAmount).toLocaleString('vi-VN')}
                      onChange={(e) => setTopupAmount(e.target.value.replace(/\D/g, ''))}
                      placeholder="500.000"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px', marginBottom: '16px' }}>
                    {[200000, 500000, 1000000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          background: '#F8FAFC',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                        onClick={() => setTopupAmount(amt.toString())}
                      >
                        {amt.toLocaleString('vi-VN')}đ
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="btn-modal-submit"
                    style={{ width: '100%', backgroundColor: '#EA580C', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                    disabled={submittingTopup || !wallet || wallet.availableBalance < Number(topupAmount)}
                    onClick={() => handleTopupFromAvailable(Number(topupAmount))}
                  >
                    {submittingTopup 
                      ? 'Đang xử lý...' 
                      : (wallet && wallet.availableBalance < Number(topupAmount) 
                          ? 'Số dư thu nhập không đủ (Chọn quét VietQR)' 
                          : `Xác nhận trích ${Number(topupAmount).toLocaleString('vi-VN')} đ nạp bù cọc`)}
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#475569' }}>
                    Quét mã QR dưới đây bằng bất kỳ App Ngân Hàng nào để chuyển tiền nạp bù cọc:
                  </p>

                  <div style={{ display: 'inline-block', padding: '12px', background: '#F1F5F9', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '12px' }}>
                    <img
                      src={`https://img.vietqr.io/image/MB-0786871062-compact.png?amount=${topupAmount}&addInfo=NAP%20COC%20THO%20${wallet?.providerId?.substring(0, 8)}&accountName=NGUYEN%20THANH%20HUY`}
                      alt="VietQR nạp ký quỹ"
                      style={{ width: '220px', height: '220px', display: 'block', margin: '0 auto', borderRadius: '6px' }}
                    />
                  </div>

                  <div style={{ fontSize: '13px', textAlign: 'left', background: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px' }}>
                    <div><strong>Ngân hàng:</strong> MBBank (Quân Đội)</div>
                    <div><strong>Số tài khoản:</strong> 0786871062</div>
                    <div><strong>Chủ tài khoản:</strong> NGUYEN THANH HUY</div>
                    <div><strong>Số tiền:</strong> {Number(topupAmount).toLocaleString('vi-VN')} đ</div>
                  </div>

                  <button
                    type="button"
                    style={{ width: '100%', backgroundColor: '#16A34A', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                    disabled={submittingTopup}
                    onClick={() => handleTopupVietQrConfirm(Number(topupAmount))}
                  >
                    {submittingTopup ? 'Đang cập nhật...' : 'Xác nhận đã chuyển tiền thành công (Test Demo)'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showDepositRefundModal && (
        <div className="earnings-modal-backdrop" onClick={() => setShowDepositRefundModal(false)}>
          <div className="earnings-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-heading" style={{ color: '#b45309' }}>Yêu cầu Rút tiền Ký quỹ rời sàn</h3>
            <div className="modal-warning-box">
              <AlertTriangle size={20} />
              <div>
                <strong>Quy tắc đóng băng 20 ngày:</strong>
                <p>
                  Khi bấm rút ký quỹ, hệ thống sẽ <strong>ngừng cấp đơn mới</strong> và bắt đầu đếm 20 ngày kể từ đơn hàng hoàn thành cuối cùng để đảm bảo hết thời hạn bảo hành cho khách hàng. Sau 20 ngày không phát sinh khiếu nại, cọc 2.000.000 đ sẽ được tất toán về ngân hàng của bạn.
                </p>
              </div>
            </div>

            <form onSubmit={handleDepositRefundSubmit}>
              <div className="form-field">
                <label>Ngân hàng nhận cọc:</label>
                <select value={bankCode} onChange={(e) => setBankCode(e.target.value)}>
                  {COMMON_BANKS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Số tài khoản nhận cọc:</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Nhập số tài khoản..."
                  required
                />
              </div>

              <div className="form-field">
                <label>Tên chủ tài khoản:</label>
                <input
                  type="text"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="VÍ DỤ: NGUYEN VAN TAI"
                  required
                />
              </div>

              <div className="form-field">
                <label>Lý do ngừng hợp tác:</label>
                <textarea
                  rows={2}
                  value={depositReason}
                  onChange={(e) => setDepositReason(e.target.value)}
                  placeholder="Nhập lý do (chuyển chỗ ở, đổi nghề...)"
                />
              </div>

              <div className="modal-btn-row">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setShowDepositRefundModal(false)}
                  disabled={submittingDepositRefund}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-modal-submit warning"
                  disabled={submittingDepositRefund}
                >
                  {submittingDepositRefund ? 'Đang gửi...' : 'Đồng ý quy tắc & Gửi yêu cầu rút cọc'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
