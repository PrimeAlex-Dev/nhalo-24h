import { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  DollarSign, 
  User, 
  MapPin, 
  ShieldCheck, 
  AlertCircle,
  Loader2,
  Sparkles,
  CheckSquare,
  Square,
  Banknote,
  AlertTriangle
} from 'lucide-react';
import type { ProviderJobItem, ConfirmCashPaymentPayload } from '../../../types/order';
import './CompleteJobModal.css';

interface CompleteJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: ProviderJobItem | null;
  mode?: 'COMPLETE_JOB' | 'CONFIRM_CASH';
  onConfirmComplete: (orderId: string, completionNote?: string) => Promise<void>;
  onConfirmCash?: (orderId: string, payload: ConfirmCashPaymentPayload) => Promise<void>;
}

export function CompleteJobModal({
  isOpen,
  onClose,
  job,
  mode = 'COMPLETE_JOB',
  onConfirmComplete,
  onConfirmCash,
}: CompleteJobModalProps) {
  const [checklist, setChecklist] = useState({
    finishedWork: true,
    testedTogether: true,
    cleanedUp: true,
  });
  const [completionNote, setCompletionNote] = useState('');
  const [cashConfirmed, setCashConfirmed] = useState<boolean>(true);
  const [actualReceivedStr, setActualReceivedStr] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const effectiveMode =
    job?.paymentStatus === 'CASH_PENDING_CONFIRMATION' ? 'CONFIRM_CASH' : mode;

  useEffect(() => {
    if (isOpen && job) {
      setChecklist({
        finishedWork: true,
        testedTogether: true,
        cleanedUp: true,
      });
      setCompletionNote(job.completionNote || '');
      setCashConfirmed(true);
      setActualReceivedStr(
        job.customerDeclaredAmount !== undefined && job.customerDeclaredAmount !== null
          ? job.customerDeclaredAmount.toLocaleString('vi-VN')
          : ''
      );
      setDisputeReason('');
      setLoading(false);
      setErrorMsg(null);
    }
  }, [isOpen, job]);

  if (!isOpen || !job) return null;

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(checklist).every(Boolean);

  const parseCurrency = (val: string): number => {
    const raw = val.replace(/\D/g, '');
    return raw ? parseInt(raw, 10) : 0;
  };

  const handleConfirm = async () => {
    if (effectiveMode === 'CONFIRM_CASH') {
      if (!onConfirmCash) return;
      if (!cashConfirmed && !disputeReason.trim()) {
        setErrorMsg('Vui lòng nhập lý do chênh lệch / giải trình khi báo số tiền không khớp.');
        return;
      }
      try {
        setLoading(true);
        setErrorMsg(null);
        await onConfirmCash(job.orderId, {
          confirmed: cashConfirmed,
          actualReceivedAmount: cashConfirmed
            ? job.customerDeclaredAmount
            : parseCurrency(actualReceivedStr),
          disputeReason: cashConfirmed ? undefined : disputeReason.trim(),
        });
        onClose();
      } catch (err: any) {
        setErrorMsg(err.message || 'Không thể xác nhận thanh toán tiền mặt. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!allChecked) {
      setErrorMsg('Vui lòng kiểm tra và xác nhận đầy đủ các tiêu chí nghiệm thu trước khi báo hoàn thành.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      await onConfirmComplete(job.orderId, completionNote.trim() || undefined);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể báo hoàn thành đơn hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const invoiceTotal = job.quotedPrice ?? 0;
  const declaredAmount = job.customerDeclaredAmount ?? invoiceTotal;
  const isAmountMismatchWithInvoice = declaredAmount !== invoiceTotal;

  return (
    <div className="complete-modal-backdrop" onClick={onClose}>
      <div 
        className="complete-modal-sheet" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="complete-modal-header">
          <div className="complete-header-icon-wrap">
            {effectiveMode === 'CONFIRM_CASH' ? <Banknote size={22} /> : <Sparkles size={22} />}
          </div>
          <div className="complete-header-texts">
            <h3 className="complete-modal-title">
              {effectiveMode === 'CONFIRM_CASH'
                ? 'Xác nhận Thu Tiền Mặt (Bước 2/2)'
                : 'Báo cáo Hoàn thành & Gửi Nghiệm thu'}
            </h3>
            <p className="complete-modal-subtitle">
              Mã đơn: #{job.orderCode} · {job.title}
            </p>
          </div>
          <button 
            type="button" 
            className="complete-modal-close-btn" 
            onClick={onClose}
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="complete-modal-alert">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Body */}
        <div className="complete-modal-body">
          {/* Highlight Payment Card */}
          <div className="complete-payment-card">
            <div className="complete-payment-badge">
              <DollarSign size={16} />
              <span>
                {effectiveMode === 'CONFIRM_CASH'
                  ? 'Số tiền mặt khách khai báo đã đưa'
                  : 'Tổng hóa đơn quyết toán'}
              </span>
            </div>
            <div className="complete-payment-amount">
              {effectiveMode === 'CONFIRM_CASH'
                ? `${declaredAmount.toLocaleString('vi-VN')} đ`
                : invoiceTotal > 0
                ? `${invoiceTotal.toLocaleString('vi-VN')} đ`
                : 'Chưa có giá thỏa thuận'}
            </div>

            {/* Chi tiết 3 nhóm chi phí & Hoa hồng */}
            <div style={{
              marginTop: '0.65rem',
              padding: '0.65rem 0.85rem',
              background: 'rgba(255,255,255,0.75)',
              borderRadius: '8px',
              fontSize: '0.82rem',
              color: '#334155',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tiền công thực hiện:</span>
                <strong>{(job.laborFee ?? 0).toLocaleString('vi-VN')} đ</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tiền vật tư / linh kiện:</span>
                <strong>{(job.materialsFee ?? 0).toLocaleString('vi-VN')} đ</strong>
              </div>
              {((job.appliedSurveyFee ?? 0) > 0 || (job.appliedTravelFee ?? 0) > 0) && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Phí khảo sát & di chuyển áp dụng:</span>
                  <strong>{((job.appliedSurveyFee ?? 0) + (job.appliedTravelFee ?? 0)).toLocaleString('vi-VN')} đ</strong>
                </div>
              )}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '1px dashed #cbd5e1',
                paddingTop: '0.35rem',
                marginTop: '0.15rem',
                color: '#0f766e'
              }}>
                <span>Hoa hồng nền tảng ({job.commissionRateSnapshot ?? 10}% tiền công):</span>
                <strong>{(job.commissionAmount ?? 0).toLocaleString('vi-VN')} đ</strong>
              </div>
            </div>

            <div className="complete-payment-customer-row" style={{ marginTop: '0.65rem' }}>
              <span className="customer-info-item">
                <User size={14} />
                <strong>{job.customerName}</strong>
                {job.customerPhone && !job.customerPhone.includes('*') && ` (${job.customerPhone})`}
              </span>
            </div>
            <div className="complete-payment-address">
              <MapPin size={13} />
              <span>{job.addressSnapshot}</span>
            </div>
          </div>

          {effectiveMode === 'CONFIRM_CASH' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {isAmountMismatchWithInvoice && (
                <div style={{
                  padding: '0.75rem',
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  color: '#92400e',
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'flex-start'
                }}>
                  <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Lưu ý chênh lệch hóa đơn:</strong> Số tiền khách khai báo ({declaredAmount.toLocaleString('vi-VN')} đ) khác với hóa đơn chốt ({invoiceTotal.toLocaleString('vi-VN')} đ).
                    {job.customerPaymentNote && (
                      <div style={{ marginTop: '0.25rem' }}>
                        Lý do khách giải trình: <em>"{job.customerPaymentNote}"</em>
                      </div>
                    )}
                    <div style={{ marginTop: '0.25rem' }}>
                      Đơn sẽ được chuyển cho Quản trị viên đối soát trước khi chốt hoa hồng.
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b' }}>
                  Xác nhận của bạn về số tiền mặt thực nhận:
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: cashConfirmed ? '2px solid #16a34a' : '1px solid #cbd5e1',
                    background: cashConfirmed ? '#f0fdf4' : '#fff',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="cashConfirmOption"
                    checked={cashConfirmed}
                    onChange={() => setCashConfirmed(true)}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#166534' }}>
                      Tôi xác nhận đã nhận đủ {declaredAmount.toLocaleString('vi-VN')} đ tiền mặt từ khách
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#475569' }}>
                      Khớp với số tiền khách hàng đã khai báo trên hệ thống
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: !cashConfirmed ? '2px solid #dc2626' : '1px solid #cbd5e1',
                    background: !cashConfirmed ? '#fef2f2' : '#fff',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="cashConfirmOption"
                    checked={!cashConfirmed}
                    onChange={() => setCashConfirmed(false)}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#991b1b' }}>
                      Số tiền khách khai báo KHÔNG khớp với thực tế tôi nhận
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#475569' }}>
                      Gửi yêu cầu đối soát lên Quản trị viên (không tự động trừ hoa hồng sai lệch)
                    </div>
                  </div>
                </label>
              </div>

              {!cashConfirmed && (
                <div style={{
                  padding: '0.85rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem'
                }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      Số tiền thực tế bạn nhận được (VNĐ)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={actualReceivedStr}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        setActualReceivedStr(raw ? parseInt(raw, 10).toLocaleString('vi-VN') : '');
                      }}
                      placeholder="Nhập số tiền thực nhận..."
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.7rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.88rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      Lý do chênh lệch / Giải trình chi tiết *
                    </label>
                    <textarea
                      rows={2}
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      placeholder="Mô tả rõ tình huống để Admin đối soát với khách hàng..."
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.7rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Checklist */}
              <div className="complete-checklist-section">
                <div className="checklist-title-row">
                  <h4 className="checklist-heading">Tiêu chí xác nhận hoàn tất kỹ thuật</h4>
                  <button
                    type="button"
                    className="checklist-check-all-btn"
                    onClick={() => {
                      const targetState = !allChecked;
                      setChecklist({
                        finishedWork: targetState,
                        testedTogether: targetState,
                        cleanedUp: targetState,
                      });
                    }}
                  >
                    {allChecked ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </button>
                </div>

                <div className="checklist-items">
                  <div 
                    className={`checklist-item ${checklist.finishedWork ? 'checked' : ''}`}
                    onClick={() => toggleCheck('finishedWork')}
                  >
                    {checklist.finishedWork ? (
                      <CheckSquare size={18} className="check-icon checked" />
                    ) : (
                      <Square size={18} className="check-icon unchecked" />
                    )}
                    <span className="checklist-text">
                      Đã thi công, sửa chữa/vệ sinh hoàn chỉnh theo đúng hạng mục đã được duyệt
                    </span>
                  </div>

                  <div 
                    className={`checklist-item ${checklist.testedTogether ? 'checked' : ''}`}
                    onClick={() => toggleCheck('testedTogether')}
                  >
                    {checklist.testedTogether ? (
                      <CheckSquare size={18} className="check-icon checked" />
                    ) : (
                      <Square size={18} className="check-icon unchecked" />
                    )}
                    <span className="checklist-text">
                      Đã vận hành thử nghiệm và bàn giao trực tiếp cho khách hàng kiểm tra
                    </span>
                  </div>

                  <div 
                    className={`checklist-item ${checklist.cleanedUp ? 'checked' : ''}`}
                    onClick={() => toggleCheck('cleanedUp')}
                  >
                    {checklist.cleanedUp ? (
                      <CheckSquare size={18} className="check-icon checked" />
                    ) : (
                      <Square size={18} className="check-icon unchecked" />
                    )}
                    <span className="checklist-text">
                      Đã thu dọn dụng cụ và vệ sinh khu vực thi công sạch sẽ
                    </span>
                  </div>
                </div>
              </div>

              {/* Completion Note */}
              <div style={{ marginTop: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.35rem' }}>
                  Ghi chú nghiệm thu & Cam kết bảo hành (tùy chọn)
                </label>
                <textarea
                  rows={2}
                  value={completionNote}
                  onChange={(e) => setCompletionNote(e.target.value)}
                  placeholder="VD: Đã thay tụ quạt và vệ sinh dàn lạnh sạch sẽ, bảo hành kỹ thuật 3 tháng..."
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              {/* Post-completion Note */}
              <div className="complete-notice-box">
                <ShieldCheck size={18} className="notice-icon" />
                <div className="notice-text">
                  Sau khi bạn báo hoàn thành, đơn hàng sẽ chuyển sang <strong>Chờ khách nghiệm thu & Thanh toán</strong>. Khách hàng sẽ chọn Thanh toán Online hoặc Tiền mặt để hoàn tất đơn.
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="complete-modal-footer">
          <button
            type="button"
            className="complete-btn-back"
            onClick={onClose}
            disabled={loading}
          >
            Quay lại
          </button>
          <button
            type="button"
            className="complete-btn-confirm"
            onClick={handleConfirm}
            disabled={loading || (effectiveMode === 'COMPLETE_JOB' && !allChecked)}
          >
            {loading ? (
              <>
                <Loader2 size={17} className="btn-spinner" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={17} />
                <span>
                  {effectiveMode === 'CONFIRM_CASH'
                    ? (cashConfirmed ? 'Xác nhận đã thu tiền mặt' : 'Gửi báo cáo lệch tiền')
                    : 'Gửi yêu cầu nghiệm thu'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
