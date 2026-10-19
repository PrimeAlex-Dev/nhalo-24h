import { useState, useEffect } from 'react';
import { X, AlertTriangle, Ban, Loader2 } from 'lucide-react';
import './CancelOrderModal.css';

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderCode?: string;
  orderTitle?: string;
  onConfirmCancel: (reason: string) => Promise<void>;
}

const COMMON_REASONS = [
  'Tôi đã tự sửa được sự cố',
  'Không tìm thấy thợ phù hợp / Giá chưa hợp lý',
  'Thời gian thợ hẹn không phù hợp',
  'Đổi ý / Cần thay đổi thông tin sự cố',
  'Lý do khác',
];

export function CancelOrderModal({
  isOpen,
  onClose,
  orderCode,
  orderTitle,
  onConfirmCancel,
}: CancelOrderModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>(COMMON_REASONS[0]);
  const [customNote, setCustomNote] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedReason(COMMON_REASONS[0]);
      setCustomNote('');
      setErrorMsg(null);
      setSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    let finalReason = selectedReason;
    if (selectedReason === 'Lý do khác') {
      if (!customNote.trim()) {
        setErrorMsg('Vui lòng nhập lý do hủy đơn hàng.');
        return;
      }
      finalReason = customNote.trim();
    } else if (customNote.trim()) {
      finalReason = `${selectedReason} - ${customNote.trim()}`;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);
      await onConfirmCancel(finalReason);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể hủy đơn hàng. Vui lòng thử lại.');
      setSubmitting(false);
    }
  };

  return (
    <div className="cancel-modal-backdrop" onClick={onClose}>
      <div 
        className="cancel-modal-sheet" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="cancel-modal-header">
          <div className="cancel-header-icon-wrap">
            <Ban size={22} />
          </div>
          <div className="cancel-header-texts">
            <h3 className="cancel-modal-title">Xác nhận hủy đơn hàng</h3>
            <p className="cancel-modal-subtitle">
              Đơn hàng <strong>{orderCode ? `[${orderCode}] ` : ''}{orderTitle || ''}</strong>
            </p>
          </div>
          <button 
            type="button" 
            className="cancel-modal-close-btn" 
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="cancel-modal-alert">
            <AlertTriangle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Body */}
        <div className="cancel-modal-body">
          <div className="cancel-warning-banner">
            <AlertTriangle size={18} className="warning-icon" />
            <div className="warning-text">
              Sau khi hủy, tất cả báo giá và yêu cầu gửi tới thợ cho đơn này sẽ tự động đóng lại.
            </div>
          </div>

          <div className="cancel-reasons-group">
            <label className="cancel-group-label">Vui lòng chọn lý do hủy:</label>
            <div className="cancel-reasons-list">
              {COMMON_REASONS.map((r) => (
                <label 
                  key={r} 
                  className={`cancel-reason-item ${selectedReason === r ? 'active' : ''}`}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={r}
                    checked={selectedReason === r}
                    onChange={() => {
                      setSelectedReason(r);
                      setErrorMsg(null);
                    }}
                    className="cancel-radio-input"
                  />
                  <span className="cancel-reason-label">{r}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Optional custom note */}
          <div className="cancel-note-group">
            <label className="cancel-group-label">
              {selectedReason === 'Lý do khác' ? 'Chi tiết lý do (Bắt buộc):' : 'Ghi chú thêm (Tùy chọn):'}
            </label>
            <textarea
              className="cancel-textarea"
              rows={3}
              placeholder={
                selectedReason === 'Lý do khác' 
                  ? 'Vui lòng cho chúng tôi biết lý do bạn hủy đơn...' 
                  : 'Nhập thêm chi tiết nếu cần...'
              }
              value={customNote}
              onChange={(e) => {
                setCustomNote(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              maxLength={300}
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="cancel-modal-footer">
          <button
            type="button"
            className="btn-keep-order"
            onClick={onClose}
            disabled={submitting}
          >
            Giữ lại đơn hàng
          </button>

          <button
            type="button"
            className="btn-confirm-cancel"
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="spin-icon" />
                <span>Đang hủy...</span>
              </>
            ) : (
              <>
                <Ban size={16} />
                <span>Xác nhận hủy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
