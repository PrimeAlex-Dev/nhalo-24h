import { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  FileText 
} from 'lucide-react';
import type { QuotationItem } from '../../../types/order';
import './AcceptQuotationModal.css';

interface AcceptQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderTitle?: string;
  quotation: QuotationItem | null;
  onConfirmAccept: () => Promise<void>;
}

export function AcceptQuotationModal({
  isOpen,
  onClose,
  orderTitle,
  quotation,
  onConfirmAccept,
}: AcceptQuotationModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen || !quotation) return null;

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      setErrorMsg(null);
      await onConfirmAccept();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể chấp nhận báo giá. Vui lòng thử lại.');
      setSubmitting(false);
    }
  };

  return (
    <div className="accept-modal-backdrop" onClick={onClose}>
      <div 
        className="accept-modal-sheet" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="accept-modal-header">
          <div className="accept-header-icon-wrap">
            <CheckCircle2 size={24} />
          </div>
          <div className="accept-header-texts">
            <span className="accept-header-tag">Xác nhận đặt việc</span>
            <h3 className="accept-modal-title">Chọn thợ &amp; Chốt báo giá</h3>
          </div>
          <button 
            type="button" 
            className="accept-modal-close-btn" 
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="accept-modal-alert">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Body */}
        <div className="accept-modal-body">
          {orderTitle && (
            <p className="accept-order-name">
              Sự cố: <strong>{orderTitle}</strong>
            </p>
          )}

          {/* Provider Card */}
          <div className="accept-pro-card">
            <div className="accept-pro-top">
              <div className="accept-avatar-wrap">
                {quotation.providerAvatar ? (
                  <img src={quotation.providerAvatar} alt={quotation.providerName} />
                ) : (
                  <span>{quotation.providerName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="accept-pro-info">
                <h4 className="accept-pro-name">{quotation.providerName}</h4>
                <p className="accept-pro-headline">
                  {quotation.providerHeadline || 'Thợ sửa chữa chuyên nghiệp'}
                </p>
              </div>
            </div>

            <div className="accept-quote-details">
              <div className="accept-quote-row price-row">
                <span className="quote-label">Giá chốt thực hiện:</span>
                <span className="quote-value-price">
                  {quotation.quotedPrice !== undefined && quotation.quotedPrice !== null
                    ? `${quotation.quotedPrice.toLocaleString('vi-VN')} đ`
                    : 'Theo thỏa thuận'}
                </span>
              </div>

              {quotation.estimatedArrivalTime && (
                <div className="accept-quote-row">
                  <span className="quote-label">
                    <Clock size={14} className="icon-inline" /> Dự kiến có mặt:
                  </span>
                  <span className="quote-value">{quotation.estimatedArrivalTime}</span>
                </div>
              )}

              {quotation.providerNote && (
                <div className="accept-note-box">
                  <div className="note-label">
                    <FileText size={13} /> Cam kết &amp; Vật tư từ thợ:
                  </div>
                  <p className="note-text">{quotation.providerNote}</p>
                </div>
              )}
            </div>
          </div>

          {/* Important Notice */}
          <div className="accept-notice-box">
            <ShieldCheck size={18} className="notice-icon" />
            <div className="notice-text">
              Khi bạn đồng ý, đơn hàng sẽ chuyển sang trạng thái <strong>Đang sửa chữa (IN_PROGRESS)</strong>. Thợ sẽ nhận được thông báo để xuất phát đến nhà bạn và các báo giá khác sẽ được đóng lại.
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="accept-modal-footer">
          <button
            type="button"
            className="btn-cancel-accept"
            onClick={onClose}
            disabled={submitting}
          >
            Suy nghĩ thêm
          </button>

          <button
            type="button"
            className="btn-confirm-accept"
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="spin-icon" />
                <span>Đang xác nhận...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Đồng ý chốt thợ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
