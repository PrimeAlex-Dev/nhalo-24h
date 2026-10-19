import { useState, useEffect } from 'react';
import { X, Ban, AlertCircle, Loader2 } from 'lucide-react';
import type { ProviderJobItem } from '../../../types/order';
import './RejectRequestModal.css';

interface RejectRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: ProviderJobItem | null;
  onConfirmReject: (job: ProviderJobItem, reason: string) => Promise<void>;
}

const COMMON_REJECT_REASONS = [
  'Lịch làm việc đã kín trong khung giờ này',
  'Địa chỉ khách hàng quá xa khu vực phục vụ',
  'Không đủ công cụ, thiết bị hoặc vật tư chuyên dụng',
  'Hạng mục công việc không đúng chuyên môn',
  'Khung giờ hẹn gấp không thể sắp xếp di chuyển kịp',
  'Lý do khác',
];

export function RejectRequestModal({
  isOpen,
  onClose,
  job,
  onConfirmReject,
}: RejectRequestModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>(COMMON_REJECT_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedReason(COMMON_REJECT_REASONS[0]);
      setCustomReason('');
      setLoading(false);
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen || !job) return null;

  const handleConfirm = async () => {
    const finalReason = selectedReason === 'Lý do khác' ? customReason.trim() : selectedReason;

    if (!finalReason) {
      setErrorMsg('Vui lòng cung cấp lý do từ chối nhận việc.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      await onConfirmReject(job, finalReason);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể từ chối yêu cầu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reject-modal-backdrop" onClick={onClose}>
      <div 
        className="reject-modal-sheet" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="reject-modal-header">
          <div className="reject-header-icon-wrap">
            <Ban size={22} />
          </div>
          <div className="reject-header-texts">
            <h3 className="reject-modal-title">Từ chối nhận yêu cầu</h3>
            <p className="reject-modal-subtitle">
              Mã đơn: #{job.orderCode} · {job.title}
            </p>
          </div>
          <button 
            type="button" 
            className="reject-modal-close-btn" 
            onClick={onClose}
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="reject-modal-alert">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Body */}
        <div className="reject-modal-body">
          {/* Customer Summary */}
          <div className="reject-customer-summary">
            <div className="reject-summary-row">
              <span className="summary-label">Khách hàng:</span>
              <span className="summary-value">{job.customerName}</span>
            </div>
            <div className="reject-summary-row">
              <span className="summary-label">Địa chỉ:</span>
              <span className="summary-value address">{job.addressSnapshot}</span>
            </div>
          </div>

          <div className="reject-reasons-container">
            <label className="reject-reasons-label">Chọn lý do từ chối:</label>
            <div className="reject-reasons-list">
              {COMMON_REJECT_REASONS.map((reason) => {
                const isSelected = selectedReason === reason;
                return (
                  <button
                    type="button"
                    key={reason}
                    className={`reject-reason-pill ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedReason(reason)}
                  >
                    <span className="pill-radio-indicator" />
                    <span className="pill-text">{reason}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedReason === 'Lý do khác' && (
            <div className="reject-custom-input-group">
              <label className="reject-custom-label">Chi tiết lý do từ chối:</label>
              <textarea
                className="reject-custom-textarea"
                rows={3}
                placeholder="Nhập lý do cụ thể để thông tin tới khách hàng..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
              />
            </div>
          )}

          <div className="reject-warning-box">
            <span className="warning-text">
              Sau khi từ chối, yêu cầu này sẽ bị hủy khỏi danh sách chờ của bạn và khách hàng có thể chọn thợ khác phục vụ.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="reject-modal-footer">
          <button
            type="button"
            className="reject-btn-back"
            onClick={onClose}
            disabled={loading}
          >
            Quay lại
          </button>
          <button
            type="button"
            className="reject-btn-confirm"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="btn-spinner" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <span>Xác nhận từ chối</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
