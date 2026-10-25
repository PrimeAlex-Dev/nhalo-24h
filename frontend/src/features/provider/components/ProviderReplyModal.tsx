import { useState } from 'react';
import { X, MessageSquare, Star, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { reviewService } from '../../../services';
import './ProviderReplyModal.css';

interface ProviderReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewId: string;
  customerName: string;
  rating: number;
  comment?: string;
  existingReply?: string;
  onSuccess: () => void;
}

export function ProviderReplyModal({
  isOpen,
  onClose,
  reviewId,
  customerName,
  rating,
  comment,
  existingReply = '',
  onSuccess,
}: ProviderReplyModalProps) {
  const [replyText, setReplyText] = useState<string>(existingReply);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) {
      setErrorMsg('Vui lòng nhập nội dung phản hồi');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);
      await reviewService.replyToReview(reviewId, replyText.trim());
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể gửi phản hồi. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="provider-reply-backdrop" onClick={onClose}>
      <div 
        className="provider-reply-card" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="reply-header">
          <div className="reply-header-left">
            <MessageSquare size={18} className="text-blue" />
            <h3 className="reply-title">Phản hồi đánh giá khách hàng</h3>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>

        {/* Customer Review Quote */}
        <div className="customer-review-snippet">
          <div className="snippet-top">
            <span className="customer-name">{customerName}</span>
            <div className="stars-row">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={13}
                  fill={i < rating ? '#f59e0b' : '#e2e8f0'}
                  stroke={i < rating ? '#f59e0b' : '#cbd5e1'}
                />
              ))}
            </div>
          </div>
          {comment ? (
            <p className="snippet-comment">"{comment}"</p>
          ) : (
            <p className="snippet-comment empty">Khách hàng không để lại nhận xét văn bản</p>
          )}
        </div>

        {errorMsg && (
          <div className="reply-alert-error">
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="reply-form">
          <div className="form-group">
            <div className="label-row">
              <label htmlFor="provider-reply-input">Nội dung câu trả lời của bạn:</label>
              <span className="count-chars">{replyText.length} / 1000</span>
            </div>
            <textarea
              id="provider-reply-input"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value.slice(0, 1000))}
              placeholder="Viết lời cảm ơn hoặc giải trình lịch sự tới khách hàng..."
              rows={4}
              className="reply-textarea"
            />
            <div className="reply-hint">
              💡 Phản hồi lịch sự, văn minh sẽ được hiển thị công khai trên hồ sơ thợ của bạn, giúp xây dựng niềm tin lớn với các khách hàng mới.
            </div>
          </div>

          <div className="reply-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-submit-reply"
              disabled={submitting || !replyText.trim()}
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="spin-icon" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>Gửi phản hồi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
