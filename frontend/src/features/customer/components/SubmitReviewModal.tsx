import { useState } from 'react';
import { 
  X, 
  Star, 
  Upload, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  EyeOff
} from 'lucide-react';
import { reviewService, fileService } from '../../../services';
import './SubmitReviewModal.css';

interface SubmitReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderCode: string;
  orderTitle?: string;
  providerName?: string;
  providerAvatar?: string | null;
  onSuccess: () => void;
}

const QUICK_TAGS_POSITIVE = [
  'Đúng giờ',
  'Nhiệt tình',
  'Tay nghề cao',
  'Dọn dẹp sạch sẽ',
  'Giá cả minh bạch',
  'Tư vấn có tâm'
];

const QUICK_TAGS_CONSTRUCTIVE = [
  'Đến trễ',
  'Làm chưa kỹ',
  'Giá phát sinh cao',
  'Thái độ chưa tốt',
  'Chưa dọn vệ sinh'
];

const RATING_LABELS: Record<number, string> = {
  1: 'Rất không hài lòng (Kém)',
  2: 'Chưa đạt yêu cầu',
  3: 'Bình thường, tạm được',
  4: 'Hài lòng, dịch vụ tốt',
  5: 'Tuyệt vời! Rất hài lòng'
};

export function SubmitReviewModal({
  isOpen,
  onClose,
  orderId,
  orderCode,
  orderTitle,
  providerName = 'Thợ đảm nhận',
  providerAvatar,
  onSuccess,
}: SubmitReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);

  const [punctualityRating, setPunctualityRating] = useState<number>(5);
  const [skillRating, setSkillRating] = useState<number>(5);
  const [attitudeRating, setAttitudeRating] = useState<number>(5);
  const [priceRating, setPriceRating] = useState<number>(5);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);

    if (images.length + files.length > 5) {
      setErrorMsg('Bạn chỉ có thể tải lên tối đa 5 hình ảnh thực tế');
      return;
    }

    try {
      setUploadingImages(true);
      setErrorMsg(null);
      const urls = await fileService.uploadOrderImages(files);
      setImages((prev) => [...prev, ...urls]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setErrorMsg('Vui lòng chọn số sao đánh giá (từ 1 đến 5 sao)');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      await reviewService.createReview({
        orderId,
        rating,
        punctualityRating,
        skillRating,
        attitudeRating,
        priceRating,
        comment: comment.trim() || undefined,
        tags: selectedTags,
        images,
        isAnonymous,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeStarCount = hoverRating || rating;

  return (
    <div className="submit-review-backdrop" onClick={onClose}>
      <div 
        className="submit-review-card" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="submit-review-header">
          <div>
            <div className="order-code-badge">Đơn hàng: {orderCode}</div>
            <h3 className="submit-review-title">Đánh giá dịch vụ & Thợ sửa chữa</h3>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Đóng">
            <X size={20} />
          </button>
        </div>

        {/* Provider Snippet */}
        <div className="review-provider-row">
          {providerAvatar ? (
            <img src={providerAvatar} alt={providerName} className="review-prov-avatar" />
          ) : (
            <div className="review-prov-fallback">
              {providerName ? providerName.charAt(0).toUpperCase() : 'T'}
            </div>
          )}
          <div className="review-prov-info">
            <div className="prov-label">Thợ phụ trách thi công</div>
            <div className="prov-name">{providerName}</div>
            {orderTitle && <div className="prov-order-title">{orderTitle}</div>}
          </div>
        </div>

        {errorMsg && (
          <div className="review-alert-error">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="review-form">
          {/* Main Star Rating */}
          <div className="main-stars-section">
            <label className="section-label">Mức độ hài lòng chung của bạn (*)</label>
            <div className="stars-picker">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className={`star-btn ${star <= activeStarCount ? 'active' : ''}`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  aria-label={`${star} sao`}
                >
                  <Star 
                    size={34} 
                    fill={star <= activeStarCount ? '#f59e0b' : '#e2e8f0'} 
                    stroke={star <= activeStarCount ? '#f59e0b' : '#cbd5e1'}
                  />
                </button>
              ))}
            </div>
            <div className="rating-desc-text">
              {RATING_LABELS[activeStarCount] || 'Chọn số sao'}
            </div>
          </div>

          {/* Sub Criteria (4 Criteria Mini Bars) */}
          <div className="criteria-section">
            <div className="criteria-title">Đánh giá chi tiết các tiêu chí:</div>
            
            <div className="criteria-grid">
              {/* Đúng giờ */}
              <div className="criteria-item">
                <span className="crit-label">1. Đúng hẹn & tác phong:</span>
                <div className="crit-stars">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={17}
                      className="crit-star clickable"
                      fill={s <= punctualityRating ? '#f59e0b' : '#e2e8f0'}
                      stroke={s <= punctualityRating ? '#f59e0b' : '#cbd5e1'}
                      onClick={() => setPunctualityRating(s)}
                    />
                  ))}
                </div>
              </div>

              {/* Tay nghề kỹ thuật */}
              <div className="criteria-item">
                <span className="crit-label">2. Tay nghề kỹ thuật:</span>
                <div className="crit-stars">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={17}
                      className="crit-star clickable"
                      fill={s <= skillRating ? '#f59e0b' : '#e2e8f0'}
                      stroke={s <= skillRating ? '#f59e0b' : '#cbd5e1'}
                      onClick={() => setSkillRating(s)}
                    />
                  ))}
                </div>
              </div>

              {/* Thái độ phục vụ */}
              <div className="criteria-item">
                <span className="crit-label">3. Thái độ phục vụ:</span>
                <div className="crit-stars">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={17}
                      className="crit-star clickable"
                      fill={s <= attitudeRating ? '#f59e0b' : '#e2e8f0'}
                      stroke={s <= attitudeRating ? '#f59e0b' : '#cbd5e1'}
                      onClick={() => setAttitudeRating(s)}
                    />
                  ))}
                </div>
              </div>

              {/* Minh bạch chi phí */}
              <div className="criteria-item">
                <span className="crit-label">4. Minh bạch chi phí:</span>
                <div className="crit-stars">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={17}
                      className="crit-star clickable"
                      fill={s <= priceRating ? '#f59e0b' : '#e2e8f0'}
                      stroke={s <= priceRating ? '#f59e0b' : '#cbd5e1'}
                      onClick={() => setPriceRating(s)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tags Chips */}
          <div className="tags-section">
            <label className="section-label">Thẻ nhận xét nhanh:</label>
            <div className="tags-container">
              {QUICK_TAGS_POSITIVE.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    className={`tag-chip positive ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleToggleTag(tag)}
                  >
                    {tag}
                  </button>
                );
              })}
              {QUICK_TAGS_CONSTRUCTIVE.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    className={`tag-chip constructive ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleToggleTag(tag)}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Comment Textarea */}
          <div className="comment-section">
            <div className="comment-label-row">
              <label className="section-label" htmlFor="review-comment">Nhận xét chi tiết:</label>
              <span className="char-count">{comment.length} / 1000</span>
            </div>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 1000))}
              placeholder="Chia sẻ trải nghiệm của bạn về thợ, thời gian phản hồi, chất lượng thi công hoặc điều cần cải thiện..."
              rows={4}
              className="review-textarea"
            />
          </div>

          {/* Evidence / Completion Images */}
          <div className="images-upload-section">
            <label className="section-label">Ảnh công trình nghiệm thu sau sửa chữa (tối đa 5 ảnh):</label>
            <div className="image-thumbs-grid">
              {images.map((url, i) => (
                <div key={i} className="image-thumb-box">
                  <img src={url} alt={`Ảnh nghiệm thu ${i + 1}`} className="thumb-img" />
                  <button
                    type="button"
                    className="thumb-remove-btn"
                    onClick={() => handleRemoveImage(i)}
                    title="Xóa ảnh"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}

              {images.length < 5 && (
                <label className="image-upload-trigger">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    disabled={uploadingImages || submitting}
                    style={{ display: 'none' }}
                  />
                  {uploadingImages ? (
                    <Loader2 size={20} className="spin-icon text-blue" />
                  ) : (
                    <>
                      <Upload size={18} />
                      <span>Thêm ảnh</span>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>

          {/* Anonymous Option */}
          <div className="anonymous-toggle-box">
            <label className="anonymous-label">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              <div className="anonymous-text">
                <span className="anon-title">
                  <EyeOff size={15} /> Đánh giá ẩn danh
                </span>
                <span className="anon-sub">
                  Tên của bạn sẽ được hiển thị dạng viết tắt (ví dụ: N*** H***) trên hồ sơ công khai của thợ.
                </span>
              </div>
            </label>
          </div>

          {/* Trust Guarantee Note */}
          <div className="trust-note-box">
            <ShieldCheck size={18} className="trust-icon" />
            <span>
              Mọi đánh giá đều được xác minh thực tế từ đơn hàng đã hoàn tất. Đánh giá của bạn giúp cộng đồng chọn được thợ uy tín và nâng cao tiêu chuẩn dịch vụ.
            </span>
          </div>

          {/* Action buttons */}
          <div className="submit-review-actions">
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
              className="btn-submit"
              disabled={submitting || uploadingImages}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="spin-icon" />
                  <span>Đang gửi đánh giá...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Gửi đánh giá</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
