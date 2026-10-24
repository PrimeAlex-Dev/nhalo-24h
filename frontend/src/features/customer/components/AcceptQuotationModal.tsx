import { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  FileText,
  Layers
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

  const isCommittedFixed = quotation.quoteMode === 'COMMITTED_FIXED';

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
            <span className="accept-header-tag">
              {isCommittedFixed ? 'Chốt gói giá cố định' : 'Chốt thợ đến khảo sát'}
            </span>
            <h3 className="accept-modal-title">
              {isCommittedFixed
                ? 'Chọn thợ & Chốt giá cố định'
                : 'Chọn thợ & Xác nhận khảo sát'}
            </h3>
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
                <span className="quote-label">
                  {isCommittedFixed ? 'Tổng giá cam kết:' : 'Tổng dự kiến (nếu sửa):'}
                </span>
                <span className="quote-value-price">
                  {quotation.quotedPrice !== undefined && quotation.quotedPrice !== null
                    ? `${quotation.quotedPrice.toLocaleString('vi-VN')} đ`
                    : 'Theo thỏa thuận'}
                </span>
              </div>

              {/* 3-Group Breakdown */}
              <div style={{
                padding: '0.65rem 0.75rem',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.8rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem',
                marginTop: '0.5rem'
              }}>
                <div style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.15rem' }}>
                  <Layers size={13} />
                  <span>Bóc tách 3 nhóm chi phí minh bạch:</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                  <span>1. Phí khảo sát kiểm tra:</span>
                  <span>
                    <strong>{(quotation.surveyFee ?? 0).toLocaleString('vi-VN')} đ</strong>
                    {quotation.waiveSurveyIfRepaired ? ' (Miễn phí khi sửa)' : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                  <span>2. Phí di chuyển:</span>
                  <span>
                    <strong>{(quotation.travelFee ?? 0).toLocaleString('vi-VN')} đ</strong>
                    {quotation.waiveTravelIfRepaired ? ' (Miễn phí khi sửa)' : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                  <span>3a. Tiền công {isCommittedFixed ? 'cam kết' : 'dự kiến'}:</span>
                  <strong>{(quotation.estimatedLaborFee ?? 0).toLocaleString('vi-VN')} đ</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                  <span>3b. Tiền vật tư {isCommittedFixed ? 'đi kèm' : 'dự kiến'}:</span>
                  <strong>{(quotation.estimatedMaterialsFee ?? 0).toLocaleString('vi-VN')} đ</strong>
                </div>
              </div>

              {quotation.estimatedArrivalTime && (
                <div className="accept-quote-row" style={{ marginTop: '0.5rem' }}>
                  <span className="quote-label">
                    <Clock size={14} className="icon-inline" /> Dự kiến có mặt:
                  </span>
                  <span className="quote-value">
                    {new Date(quotation.estimatedArrivalTime).toLocaleString('vi-VN', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
              )}

              {quotation.providerNote && (
                <div className="accept-note-box">
                  <div className="note-label">
                    <FileText size={13} /> Nhận định & Vật tư từ thợ:
                  </div>
                  <p className="note-text">{quotation.providerNote}</p>
                </div>
              )}

              {quotation.scopeAndConditions && (
                <div className="accept-note-box" style={{ marginTop: '0.45rem', background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                  <div className="note-label" style={{ color: '#166534' }}>
                    <ShieldCheck size={13} /> Phạm vi cam kết & Điều kiện:
                  </div>
                  <p className="note-text" style={{ color: '#14532d' }}>{quotation.scopeAndConditions}</p>
                </div>
              )}
            </div>
          </div>

          {/* Important Notice */}
          <div className="accept-notice-box">
            <ShieldCheck size={18} className="notice-icon" />
            <div className="notice-text">
              {isCommittedFixed ? (
                <>
                  Đây là <strong>Gói báo giá cố định cam kết theo mô tả</strong>. Khi bạn đồng ý, đơn hàng sẽ chuyển thẳng sang trạng thái <strong>Đang thực hiện (IN_PROGRESS)</strong>.
                </>
              ) : (
                <>
                  Đây là <strong>Báo giá cần khảo sát thực tế</strong>. Khi bạn đồng ý, đơn chuyển sang <strong>Chờ khảo sát (AWAITING_SURVEY)</strong>. Sau khi kiểm tra tại nhà, thợ sẽ gửi Báo giá cuối kèm danh sách vật tư để bạn bấm duyệt trước khi sửa. Nếu bạn quyết định không sửa sau khi khảo sát, bạn chỉ thanh toán Phí khảo sát + Phí di chuyển ({((quotation.surveyFee ?? 0) + (quotation.travelFee ?? 0)).toLocaleString('vi-VN')} đ).
                </>
              )}
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
                <span>{isCommittedFixed ? 'Đồng ý chốt giá & Làm ngay' : 'Đồng ý chốt thợ khảo sát'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
