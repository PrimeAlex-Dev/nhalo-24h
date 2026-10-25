import { useState, useEffect } from 'react';
import { 
  X, 
  Star, 
  Award, 
  Briefcase, 
  Clock, 
  MapPin, 
  Check, 
  BadgeCheck, 
  ExternalLink, 
  Plus, 
  UserCheck, 
  ShieldCheck, 
  MessageSquareQuote,
  Loader2,
  ZoomIn
} from 'lucide-react';
import type { PublicProviderItem } from '../../../services/providerProfileService';
import { providerProfileService, reviewService } from '../../../services';
import type { ReviewItem } from '../../../types/review';
import { AvatarLightboxModal } from '../../../components/common';
import './ProviderQuickViewDrawer.css';

export interface ProviderQuickViewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  provider: PublicProviderItem | null;
  isSelected?: boolean;
  isAlreadyInvited?: boolean;
  isAssigned?: boolean;
  onToggleSelect?: (providerId: string) => void;
}

export function ProviderQuickViewDrawer({
  isOpen,
  onClose,
  provider,
  isSelected = false,
  isAlreadyInvited = false,
  isAssigned = false,
  onToggleSelect,
}: ProviderQuickViewDrawerProps) {
  const [detailProvider, setDetailProvider] = useState<PublicProviderItem | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showAvatarLightbox, setShowAvatarLightbox] = useState(false);
  const [realReviews, setRealReviews] = useState<ReviewItem[]>([]);

  useEffect(() => {
    if (isOpen && provider) {
      setDetailProvider(provider);
      loadFreshestData(provider.id);
    } else {
      setDetailProvider(null);
      setRealReviews([]);
    }
  }, [isOpen, provider]);

  const loadFreshestData = async (providerId: string) => {
    try {
      setLoadingDetail(true);
      const data = await providerProfileService.getPublicProviderById(providerId);
      if (data) {
        setDetailProvider(data);
      }
      reviewService.getPublicReviews(providerId, undefined, 0, 4)
        .then((res) => setRealReviews(res.content))
        .catch(() => setRealReviews([]));
    } catch {
      // Keep existing provider data if API is slow or fails
    } finally {
      setLoadingDetail(false);
    }
  };

  if (!isOpen || !provider) return null;

  const current = detailProvider || provider;

  const skills = (current.categories && current.categories.length > 0)
    ? current.categories.map((c) => c.name)
    : [current.category || 'Dịch vụ chuyên nghiệp', 'Khảo sát & Báo giá tại chỗ', 'Bảo hành uy tín'];

  return (
    <div className="quick-view-backdrop" onClick={onClose}>
      <div 
        className="quick-view-drawer" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="quick-view-header">
          <div className="quick-view-header-title-wrap">
            <span className="quick-view-subtitle">
              {loadingDetail ? (
                <span className="loading-sub-indicator">
                  <Loader2 size={11} className="spin-icon" /> Đang đồng bộ...
                </span>
              ) : (
                'Chi tiết hồ sơ đối tác'
              )}
            </span>
            <h3 className="quick-view-title">{current.name}</h3>
          </div>

          <div className="quick-view-header-actions">
            <a 
              href={`/customer/providers/${current.id}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-open-full-tab"
              title="Mở toàn bộ trang hồ sơ trong tab mới"
            >
              <span>Xem trang đầy đủ</span>
              <ExternalLink size={13} />
            </a>

            <button 
              type="button" 
              className="quick-view-close-btn" 
              onClick={onClose}
              aria-label="Đóng xem nhanh"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="quick-view-body">
          {/* Hero Profile Card */}
          <div className="quick-view-hero-card">
            <div className="quick-view-avatar-wrap">
              {current.avatar ? (
                <div 
                  className="quick-view-avatar-clickable"
                  onClick={() => setShowAvatarLightbox(true)}
                  title="Nhấp để phóng to xem rõ mặt thợ"
                >
                  <img src={current.avatar} alt={current.name} className="quick-view-avatar" />
                  <span className="quick-view-avatar-zoom-badge" aria-hidden="true">
                    <ZoomIn size={12} />
                  </span>
                </div>
              ) : (
                <div className="quick-view-avatar-fallback">
                  {current.name.charAt(0).toUpperCase()}
                </div>
              )}
              {current.verified !== false && (
                <span className="quick-view-verified-badge" title="Đối tác đã xác minh danh tính">
                  <BadgeCheck size={18} />
                </span>
              )}
            </div>

            <div className="quick-view-hero-info">
              <div className="quick-view-name-line">
                <h2 className="quick-view-provider-name">{current.name}</h2>
                {current.isTopRated && (
                  <span className="quick-view-top-rated-tag">Top Thợ Uy Tín</span>
                )}
              </div>

              <p className="quick-view-headline">{current.headline || current.company || 'Đối tác kỹ thuật Nhà Lo 24h'}</p>

              <div className="quick-view-rating-summary">
                <div className="quick-view-stars-row">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      size={15}
                      fill="#F59E0B"
                      stroke="#F59E0B"
                      className="star-icon"
                    />
                  ))}
                </div>
                <span className="rating-score">{(current.rating || 5.0).toFixed(1)}</span>
                <span className="rating-dot">·</span>
                <span className="rating-count">({current.reviewsCount || 12} đánh giá)</span>
              </div>
            </div>
          </div>

          {/* 4 Metrics Grid */}
          <div className="quick-view-metrics-grid">
            <div className="quick-view-metric-box">
              <div className="metric-icon-circle icon-award">
                <Award size={18} />
              </div>
              <div className="metric-val">{current.experienceYears || 5} năm</div>
              <div className="metric-lbl">Kinh nghiệm</div>
            </div>

            <div className="quick-view-metric-box">
              <div className="metric-icon-circle icon-jobs">
                <Briefcase size={18} />
              </div>
              <div className="metric-val">{current.completedJobsCount || '150+'}</div>
              <div className="metric-lbl">Đơn đã sửa</div>
            </div>

            <div className="quick-view-metric-box">
              <div className="metric-icon-circle icon-speed">
                <Clock size={18} />
              </div>
              <div className="metric-val">{current.responseTime || '~15 phút'}</div>
              <div className="metric-lbl">Phản hồi</div>
            </div>

            <div className="quick-view-metric-box">
              <div className="metric-icon-circle icon-location">
                <MapPin size={18} />
              </div>
              <div className="metric-val">{current.distance || 'Gần bạn'}</div>
              <div className="metric-lbl">Khoảng cách</div>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="quick-view-pricing-box">
            <div className="pricing-left">
              <span className="pricing-label">Đơn giá tham khảo</span>
              <div className="pricing-amount">
                <span className="pricing-number">
                  {current.pricePerHour > 1000
                    ? `${current.pricePerHour.toLocaleString('vi-VN')} đ`
                    : `${current.pricePerHour} đ`}
                </span>
                <span className="pricing-unit">/ giờ</span>
              </div>
            </div>
            <div className="pricing-status-pill">
              <ShieldCheck size={14} />
              <span>Bảo hành sau sửa</span>
            </div>
          </div>

          {/* About Section */}
          <div className="quick-view-section">
            <h4 className="section-heading">Giới thiệu kỹ thuật viên</h4>
            <p className="section-about-text">
              {current.about ||
                'Kỹ thuật viên đối tác Nhà Lo 24h được tuyển chọn và đào tạo bài bản. Cam kết đúng giờ, kiểm tra trung thực, thao tác an toàn và báo giá rõ ràng trước khi thực hiện.'}
            </p>
          </div>

          {/* Skills & Specialties */}
          <div className="quick-view-section">
            <h4 className="section-heading">Chuyên môn & Kỹ năng</h4>
            <div className="quick-view-skills-wrap">
              {skills.map((skill, idx) => (
                <div key={idx} className="quick-view-skill-chip">
                  <Check size={13} strokeWidth={2.5} className="chip-check" />
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="quick-view-section reviews-section">
            <div className="section-heading-row">
              <h4 className="section-heading">
                <MessageSquareQuote size={17} />
                <span>Nhận xét từ khách hàng ({current.reviewsCount || 12})</span>
              </h4>
              <div className="reviews-score-badge">
                <Star size={13} fill="#F59E0B" stroke="#F59E0B" />
                <span>{(current.rating || 5.0).toFixed(1)} / 5.0</span>
              </div>
            </div>

            <div className="quick-view-reviews-list">
              {realReviews.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.84rem' }}>
                  Chưa có nhận xét nào được gửi cho thợ này.
                </div>
              ) : (
                realReviews.map((rev) => {
                  const initialLetter = rev.customerName ? rev.customerName.charAt(0).toUpperCase() : 'K';
                  return (
                    <div key={rev.id} className="quick-view-review-card">
                      <div className="review-card-top">
                        <div className="reviewer-info">
                          <div className="reviewer-avatar">
                            {rev.customerAvatar ? (
                              <img src={rev.customerAvatar} alt={rev.customerName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              initialLetter
                            )}
                          </div>
                          <div>
                            <h5 className="reviewer-name">{rev.customerName}</h5>
                            <span className="review-meta-line">{rev.orderTitle || 'Dịch vụ'} · {new Date(rev.createdAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>

                        <div className="reviewer-stars">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              size={13}
                              fill={idx < rev.rating ? '#F59E0B' : '#E2E8F0'}
                              stroke={idx < rev.rating ? '#F59E0B' : '#E2E8F0'}
                            />
                          ))}
                        </div>
                      </div>

                      {rev.tags && rev.tags.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '4px 0' }}>
                          {rev.tags.map((t, idx) => (
                            <span key={idx} style={{ fontSize: '0.7rem', padding: '2px 6px', background: '#ecfdf5', color: '#047857', borderRadius: '10px' }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {rev.comment && <p className="review-comment">"{rev.comment}"</p>}

                      {rev.providerReply && (
                        <div style={{ marginTop: '6px', padding: '6px 8px', background: '#f0f9ff', borderLeft: '2px solid #0284c7', fontSize: '0.76rem', color: '#0369a1' }}>
                          <strong>Thợ phản hồi:</strong> "{rev.providerReply}"
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="quick-view-footer">
          <button 
            type="button" 
            className="btn-drawer-close"
            onClick={onClose}
          >
            Đóng
          </button>

          <div className="drawer-footer-action-wrap">
            {isAssigned ? (
              <div className="drawer-assigned-notice">
                <ShieldCheck size={16} />
                <span>Thợ đã nhận & thực hiện đơn này</span>
              </div>
            ) : isAlreadyInvited ? (
              <div className="drawer-invited-notice">
                <UserCheck size={16} />
                <span>Đã gửi yêu cầu tới thợ này</span>
              </div>
            ) : onToggleSelect ? (
              isSelected ? (
                <button
                  type="button"
                  className="btn-drawer-toggle selected"
                  onClick={() => onToggleSelect(current.id)}
                >
                  <Check size={16} />
                  <span>Đã chọn (Bấm để bỏ chọn)</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-drawer-toggle unselected"
                  onClick={() => onToggleSelect(current.id)}
                >
                  <Plus size={16} />
                  <span>Chọn thợ này vào danh sách mời</span>
                </button>
              )
            ) : null}
          </div>
        </div>
      </div>

      {/* Lightbox phóng to ảnh đại diện thợ */}
      <AvatarLightboxModal
        isOpen={showAvatarLightbox}
        onClose={() => setShowAvatarLightbox(false)}
        imageUrl={current.avatar}
        name={current.name}
        role={current.headline || current.company}
        verified={current.verified}
        badgeText="Xem chi tiết ảnh thợ"
      />
    </div>
  );
}
