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
  Square
} from 'lucide-react';
import type { ProviderJobItem } from '../../../types/order';
import './CompleteJobModal.css';

interface CompleteJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: ProviderJobItem | null;
  onConfirmComplete: (orderId: string) => Promise<void>;
}

export function CompleteJobModal({
  isOpen,
  onClose,
  job,
  onConfirmComplete,
}: CompleteJobModalProps) {
  const [checklist, setChecklist] = useState({
    finishedWork: true,
    testedTogether: true,
    cleanedUp: true,
    collectedPayment: true,
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setChecklist({
        finishedWork: true,
        testedTogether: true,
        cleanedUp: true,
        collectedPayment: true,
      });
      setLoading(false);
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen || !job) return null;

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(checklist).every(Boolean);

  const handleConfirm = async () => {
    if (!allChecked) {
      setErrorMsg('Vui lòng kiểm tra và xác nhận đầy đủ các tiêu chí nghiệm thu trước khi hoàn tất.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      await onConfirmComplete(job.orderId);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể hoàn tất đơn hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

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
            <Sparkles size={22} />
          </div>
          <div className="complete-header-texts">
            <h3 className="complete-modal-title">Nghiệm thu & Hoàn thành đơn</h3>
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
              <span>Số tiền thu thực tế</span>
            </div>
            <div className="complete-payment-amount">
              {job.quotedPrice ? `${job.quotedPrice.toLocaleString('vi-VN')} đ` : 'Chưa có giá thỏa thuận'}
            </div>
            <div className="complete-payment-customer-row">
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

          {/* Checklist */}
          <div className="complete-checklist-section">
            <div className="checklist-title-row">
              <h4 className="checklist-heading">Tiêu chí xác nhận hoàn tất</h4>
              <button
                type="button"
                className="checklist-check-all-btn"
                onClick={() => {
                  const targetState = !allChecked;
                  setChecklist({
                    finishedWork: targetState,
                    testedTogether: targetState,
                    cleanedUp: targetState,
                    collectedPayment: targetState,
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
                  Đã thi công, sửa chữa hoàn chỉnh theo đúng yêu cầu công việc
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
                  Đã vận hành thử nghiệm và khách hàng đã trực tiếp nghiệm thu
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

              <div 
                className={`checklist-item ${checklist.collectedPayment ? 'checked' : ''}`}
                onClick={() => toggleCheck('collectedPayment')}
              >
                {checklist.collectedPayment ? (
                  <CheckSquare size={18} className="check-icon checked" />
                ) : (
                  <Square size={18} className="check-icon unchecked" />
                )}
                <span className="checklist-text">
                  Đã thu đủ số tiền thỏa thuận từ khách hàng (tiền mặt / chuyển khoản)
                </span>
              </div>
            </div>
          </div>

          {/* Post-completion Note */}
          <div className="complete-notice-box">
            <ShieldCheck size={18} className="notice-icon" />
            <div className="notice-text">
              Sau khi xác nhận, đơn hàng sẽ được lưu vào lịch sử hoàn thành, doanh thu ghi nhận vào tài khoản của bạn và khách hàng sẽ nhận thông báo đánh giá dịch vụ.
            </div>
          </div>
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
            disabled={loading || !allChecked}
          >
            {loading ? (
              <>
                <Loader2 size={17} className="btn-spinner" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={17} />
                <span>Xác nhận hoàn tất đơn</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
