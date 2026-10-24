import { useState, useEffect } from 'react';
import { X, AlertTriangle, Phone, MessageSquare, Send, CheckCircle2, Loader2 } from 'lucide-react';
import './CancelSurveyNoticeModal.css';

interface CancelSurveyNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderCode?: string;
  orderTitle?: string;
  providerName?: string;
  providerPhone?: string | null;
  scheduledTime?: string;
  onOpenChat: () => void;
  onSendNotify: (reason: string) => Promise<void>;
}

const QUICK_CHIPS = [
  'Có việc gia đình đột xuất',
  'Đã tự xử lý được tạm thời',
  'Muốn đổi giờ hẹn sang buổi khác',
  'Khu vực gặp sự cố thời tiết / mất điện',
];

export function CancelSurveyNoticeModal({
  isOpen,
  onClose,
  orderCode,
  orderTitle,
  providerName,
  providerPhone,
  scheduledTime,
  onOpenChat,
  onSendNotify,
}: CancelSurveyNoticeModalProps) {
  const [selectedChip, setSelectedChip] = useState<string>('');
  const [reasonText, setReasonText] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [successSent, setSuccessSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedChip('');
      setReasonText('');
      setSubmitting(false);
      setSuccessSent(false);
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChipClick = (chip: string) => {
    if (selectedChip === chip) {
      setSelectedChip('');
    } else {
      setSelectedChip(chip);
      if (!reasonText.trim()) {
        setReasonText(chip);
      }
    }
  };

  const handleSubmitNotify = async () => {
    const finalReason = reasonText.trim() || selectedChip;
    if (!finalReason) {
      setErrorMsg('Vui lòng nhập lý do bạn muốn dời lịch hẹn hoặc hủy đơn.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);
      await onSendNotify(finalReason);
      setSuccessSent(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể gửi thông báo tới thợ. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cancel-survey-modal-backdrop" onClick={onClose}>
      <div 
        className="cancel-survey-modal-sheet" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="cancel-survey-modal-header">
          <div className="cancel-survey-header-icon-wrap">
            <AlertTriangle size={22} />
          </div>
          <div className="cancel-survey-header-texts">
            <h3 className="cancel-survey-modal-title">Yêu cầu dời lịch / Hủy hẹn thợ</h3>
            <p className="cancel-survey-modal-subtitle">
              Đơn hàng <strong>{orderCode ? `[${orderCode}] ` : ''}{orderTitle || ''}</strong>
            </p>
          </div>
          <button 
            type="button" 
            className="cancel-survey-modal-close-btn" 
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="cancel-survey-modal-body">
          {/* Warning Banner */}
          <div className="cancel-survey-warning-box">
            <AlertTriangle size={20} className="cancel-survey-warning-icon" />
            <div>
              <div className="cancel-survey-warning-title">Thợ đang chuẩn bị đồ nghề & di chuyển tới nhà bạn</div>
              <div className="cancel-survey-warning-desc">
                Để tránh gây thiệt hại chi phí xăng xe và công sức của thợ, hệ thống không cho phép hủy tự do 1 chạm lúc này.
                Quý khách vui lòng liên hệ trực tiếp với thợ để trao đổi dời giờ hẹn hoặc thỏa thuận hủy việc.
              </div>
            </div>
          </div>

          {/* Assigned Provider Card */}
          <div className="cancel-survey-provider-card">
            <div className="cancel-survey-provider-header">Thợ phụ trách đơn hàng</div>
            <div className="cancel-survey-provider-info">
              <div className="cancel-survey-provider-name-box">
                <span className="cancel-survey-provider-name">{providerName || 'Thợ đối tác NhaLo24h'}</span>
              </div>
              {providerPhone && (
                <div className="cancel-survey-provider-phone">
                  <Phone size={14} />
                  <span>{providerPhone}</span>
                </div>
              )}
            </div>
            {scheduledTime && (
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Giờ hẹn khách mong muốn: <strong>{new Date(scheduledTime).toLocaleString('vi-VN')}</strong>
              </div>
            )}
          </div>

          {/* Quick Communication CTAs */}
          <div className="cancel-survey-quick-actions">
            {providerPhone ? (
              <a href={`tel:${providerPhone}`} className="btn-call-provider-cta">
                <Phone size={16} />
                <span>Gọi điện cho thợ</span>
              </a>
            ) : (
              <div />
            )}
            <button 
              type="button" 
              className="btn-chat-provider-cta"
              onClick={() => {
                onClose();
                onOpenChat();
              }}
            >
              <MessageSquare size={16} />
              <span>Nhắn tin cho thợ</span>
            </button>
          </div>

          {/* Divider */}
          <div className="cancel-survey-divider">
            <span>Hoặc gửi thông báo tới thợ</span>
          </div>

          {/* Success sent banner */}
          {successSent ? (
            <div className="cancel-survey-success-banner">
              <CheckCircle2 size={20} style={{ color: '#059669', flexShrink: 0 }} />
              <div>
                <strong>Đã gửi thông báo tới thợ thành công!</strong>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem' }}>
                  Thông báo và lý do của bạn đã được chuyển tới thợ. Thợ sẽ liên hệ lại với bạn để chốt dời lịch hẹn hoặc xác nhận hủy việc.
                </p>
              </div>
            </div>
          ) : (
            <div className="cancel-survey-notify-form">
              <label className="cancel-survey-form-title">
                Lý do muốn dời lịch / hủy đơn:
              </label>

              {/* Quick suggestion chips */}
              <div className="cancel-survey-chips">
                {QUICK_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    className={`cancel-survey-chip ${selectedChip === chip ? 'active' : ''}`}
                    onClick={() => handleChipClick(chip)}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <textarea
                className="cancel-survey-textarea"
                rows={3}
                placeholder="Nhập chi tiết lý do cần dời hẹn hoặc thỏa thuận hủy..."
                value={reasonText}
                onChange={(e) => {
                  setReasonText(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                maxLength={300}
              />

              {errorMsg && (
                <div style={{ color: '#dc2626', fontSize: '0.82rem', fontWeight: 600 }}>
                  {errorMsg}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="cancel-survey-modal-footer">
          <button 
            type="button" 
            className="btn-survey-dismiss" 
            onClick={onClose}
          >
            {successSent ? 'Đóng' : 'Quay lại'}
          </button>

          {!successSent && (
            <button
              type="button"
              className="btn-survey-submit-notify"
              onClick={handleSubmitNotify}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="spin-icon" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Send size={15} />
                  <span>Gửi thông báo cho thợ</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
