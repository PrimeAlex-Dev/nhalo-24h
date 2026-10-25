import { useState, useEffect, useCallback } from 'react';
import { 
  Star, 
  RotateCcw, 
  Search, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle,
  MessageSquare,
  ThumbsDown
} from 'lucide-react';
import { reviewService } from '../../../services';
import type { ReviewItem } from '../../../types/review';
import './AdminReviewsPage.css';

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [starFilter, setStarFilter] = useState<number | 'ALL'>('ALL');
  const [visibilityFilter, setVisibilityFilter] = useState<'ALL' | 'VISIBLE' | 'HIDDEN'>('ALL');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Lightbox preview for photos
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Toggling status tracking
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await reviewService.getAllReviewsAdmin(0, 100);
      setReviews(res.content || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải danh sách đánh giá';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // KPI calculations
  const totalCount = reviews.length;
  const star5Count = reviews.filter((r) => r.rating === 5).length;
  const lowStarCount = reviews.filter((r) => r.rating <= 2).length;
  const hiddenCount = reviews.filter((r) => !r.isVisible).length;

  // Filtered reviews
  const filteredReviews = reviews.filter((r) => {
    if (starFilter !== 'ALL' && r.rating !== starFilter) {
      return false;
    }
    if (visibilityFilter === 'VISIBLE' && !r.isVisible) {
      return false;
    }
    if (visibilityFilter === 'HIDDEN' && r.isVisible) {
      return false;
    }
    if (searchKeyword.trim()) {
      const query = searchKeyword.toLowerCase();
      const matchCustomer = r.customerName?.toLowerCase().includes(query);
      const matchProvider = r.providerName?.toLowerCase().includes(query);
      const matchOrder = r.orderCode?.toLowerCase().includes(query);
      const matchComment = r.comment?.toLowerCase().includes(query);
      if (!matchCustomer && !matchProvider && !matchOrder && !matchComment) {
        return false;
      }
    }
    return true;
  });

  const handleToggleVisibility = async (review: ReviewItem) => {
    const nextVisible = !review.isVisible;
    setTogglingId(review.id);
    setErrorMsg(null);
    try {
      await reviewService.toggleVisibilityAdmin(review.id, nextVisible);
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, isVisible: nextVisible } : r))
      );
      setSuccessMsg(
        nextVisible
          ? `Đã khôi phục hiển thị đánh giá của ${review.customerName || 'khách hàng'}`
          : `Đã ẩn đánh giá của ${review.customerName || 'khách hàng'} khỏi trang thợ`
      );
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể cập nhật trạng thái hiển thị';
      setErrorMsg(msg);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="admin-reviews-page">
      {/* Header */}
      <div className="admin-reviews-header">
        <div>
          <h1 className="admin-reviews-title">
            <Star size={28} color="#F59E0B" fill="#F59E0B" />
            <span>Kiểm duyệt & Quản lý Đánh giá</span>
          </h1>
          <p className="admin-reviews-sub">
            Theo dõi chất lượng phục vụ của đối tác thợ trên toàn sàn, kiểm duyệt nội dung đánh giá từ khách hàng và ngăn chặn ngôn từ phản cảm.
          </p>
        </div>

        <button type="button" className="btn-refresh-data" onClick={fetchReviews} disabled={loading}>
          <RotateCcw size={16} className={loading ? 'spin-icon' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="admin-alert success" role="alert">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="admin-alert error" role="alert">
          <AlertTriangle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="admin-reviews-kpi-grid">
        <div className="review-kpi-card">
          <div className="review-kpi-icon total">
            <MessageSquare size={24} />
          </div>
          <div>
            <div className="review-kpi-value">{totalCount}</div>
            <div className="review-kpi-label">Tổng số đánh giá</div>
          </div>
        </div>

        <div className="review-kpi-card">
          <div className="review-kpi-icon star5">
            <Star size={24} fill="#F59E0B" />
          </div>
          <div>
            <div className="review-kpi-value">{star5Count}</div>
            <div className="review-kpi-label">Đánh giá 5 sao xuất sắc</div>
          </div>
        </div>

        <div className="review-kpi-card">
          <div className="review-kpi-icon star12">
            <ThumbsDown size={24} />
          </div>
          <div>
            <div className="review-kpi-value">{lowStarCount}</div>
            <div className="review-kpi-label">Đánh giá tiêu cực (1-2★)</div>
          </div>
        </div>

        <div className="review-kpi-card">
          <div className="review-kpi-icon hidden">
            <EyeOff size={24} />
          </div>
          <div>
            <div className="review-kpi-value">{hiddenCount}</div>
            <div className="review-kpi-label">Đã ẩn khỏi sàn</div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="admin-reviews-filter-bar">
        <div className="reviews-filter-chips">
          <button
            type="button"
            className={`review-filter-btn ${starFilter === 'ALL' && visibilityFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => {
              setStarFilter('ALL');
              setVisibilityFilter('ALL');
            }}
          >
            Tất cả
          </button>
          {[5, 4, 3, 2, 1].map((s) => (
            <button
              key={s}
              type="button"
              className={`review-filter-btn ${starFilter === s ? 'active' : ''}`}
              onClick={() => setStarFilter(s)}
            >
              <Star size={13} fill={starFilter === s ? '#FFFFFF' : '#F59E0B'} color={starFilter === s ? '#FFFFFF' : '#F59E0B'} />
              <span>{s} sao</span>
            </button>
          ))}
          <button
            type="button"
            className={`review-filter-btn ${visibilityFilter === 'HIDDEN' ? 'active' : ''}`}
            onClick={() => setVisibilityFilter(visibilityFilter === 'HIDDEN' ? 'ALL' : 'HIDDEN')}
          >
            <EyeOff size={13} />
            <span>Đã ẩn</span>
          </button>
        </div>

        <div className="search-input-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Tìm theo thợ, khách, nội dung..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>
      </div>

      {/* Reviews Table */}
      <div className="admin-reviews-table-card">
        {loading ? (
          <div className="empty-table-state">
            <Loader2 size={32} className="spin-icon" style={{ margin: '0 auto 1rem auto' }} />
            <p>Đang tải danh sách đánh giá...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="empty-table-state">
            <h3>Không tìm thấy đánh giá nào</h3>
            <p>Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.</p>
          </div>
        ) : (
          <table className="reviews-data-table">
            <thead>
              <tr>
                <th>Đơn hàng & Thời gian</th>
                <th>Khách hàng</th>
                <th>Thợ đối tác</th>
                <th>Số sao & Điểm chi tiết</th>
                <th>Nội dung nhận xét & Ảnh</th>
                <th>Hiển thị</th>
                <th style={{ textAlign: 'right' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((rev) => (
                <tr key={rev.id}>
                  <td>
                    <span className="report-code-badge">#{rev.orderCode || 'N/A'}</span>
                    <div className="report-time-sub">
                      {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </td>

                  <td>
                    <div className="person-cell">
                      <span className="person-name">{rev.customerName || 'Khách ẩn danh'}</span>
                      {rev.isAnonymous && (
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>(Ẩn danh với thợ)</span>
                      )}
                    </div>
                  </td>

                  <td>
                    <div className="person-cell">
                      <span className="person-name">{rev.providerName}</span>
                    </div>
                  </td>

                  <td>
                    <div className="review-stars-display">
                      <div className="review-stars-row">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            fill={s <= rev.rating ? '#F59E0B' : '#E2E8F0'}
                            color={s <= rev.rating ? '#F59E0B' : '#CBD5E1'}
                          />
                        ))}
                      </div>
                      <span className="review-star-number">{rev.rating}.0</span>
                    </div>
                    <div className="review-subscores-text">
                      {rev.punctualityRating && <span>Đúng hẹn: {rev.punctualityRating}★ </span>}
                      {rev.skillRating && <span>Tay nghề: {rev.skillRating}★ </span>}
                      {rev.attitudeRating && <span>Thái độ: {rev.attitudeRating}★</span>}
                    </div>
                  </td>

                  <td>
                    <div className="review-content-col">
                      {rev.tags && rev.tags.length > 0 && (
                        <div className="review-tags-list">
                          {rev.tags.map((t, idx) => (
                            <span key={idx} className="review-tag-badge">{t}</span>
                          ))}
                        </div>
                      )}

                      {rev.comment ? (
                        <p className="review-comment-text">{rev.comment}</p>
                      ) : (
                        <span style={{ fontStyle: 'italic', color: '#94A3B8', fontSize: '0.85rem' }}>
                          (Khách không để lại lời bình)
                        </span>
                      )}

                      {rev.images && rev.images.length > 0 && (
                        <div className="review-images-thumbs">
                          {rev.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt="Ảnh nghiệm thu"
                              className="review-thumb"
                              onClick={() => setPreviewImage(img)}
                              title="Xem ảnh lớn"
                            />
                          ))}
                        </div>
                      )}

                      {rev.providerReply && (
                        <div className="review-reply-pill">
                          <strong>Thợ phản hồi:</strong> {rev.providerReply}
                        </div>
                      )}
                    </div>
                  </td>

                  <td>
                    {rev.isVisible ? (
                      <span className="visibility-status-badge visible">
                        <Eye size={12} />
                        <span>Công khai</span>
                      </span>
                    ) : (
                      <span className="visibility-status-badge hidden">
                        <EyeOff size={12} />
                        <span>Đã ẩn</span>
                      </span>
                    )}
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className={`btn-toggle-visibility ${rev.isVisible ? 'hide' : 'show'}`}
                      onClick={() => handleToggleVisibility(rev)}
                      disabled={togglingId === rev.id}
                    >
                      {togglingId === rev.id ? (
                        <Loader2 size={13} className="spin-icon" />
                      ) : rev.isVisible ? (
                        <>
                          <EyeOff size={13} />
                          <span>Ẩn đánh giá</span>
                        </>
                      ) : (
                        <>
                          <Eye size={13} />
                          <span>Mở hiển thị</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Lightbox Preview */}
      {previewImage && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
          onClick={() => setPreviewImage(null)}
        >
          <img 
            src={previewImage} 
            alt="Đánh giá phóng to" 
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '12px' }} 
          />
        </div>
      )}
    </div>
  );
}

export default AdminReviewsPage;
