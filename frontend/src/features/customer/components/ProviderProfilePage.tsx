import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './ProviderProfilePage.css';
import {
  ArrowLeft,
  BadgeCheck,
  Star,
  Award,
  Briefcase,
  Clock,
  MapPin,
  Check,
  Sparkles,
  ShieldCheck,
  ArrowLeftRight,
  CheckCircle2,
  X,
  Loader2
} from 'lucide-react';
import { PATHS } from '../../../routes/paths';
import { providerProfileService, customerOrderService, type PublicProviderItem } from '../../../services';
import type { CustomerOrderSummary } from '../../../types/order';
import type { ProviderItem } from '../types/customer';
import { CreateOrderModal } from './CreateOrderModal';
import { SelectOrderForProviderModal } from './SelectOrderForProviderModal';

export function ProviderProfilePage() {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();

  const [isBooked, setIsBooked] = useState(false);
  const [isCompared, setIsCompared] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSelectOrderModal, setShowSelectOrderModal] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<CustomerOrderSummary[]>([]);
  const [checkingOrders, setCheckingOrders] = useState(false);
  const [realProvider, setRealProvider] = useState<PublicProviderItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let ignore = false;
    async function loadProvider() {
      if (!providerId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await providerProfileService.getPublicProviderById(providerId);
        if (!ignore) {
          setRealProvider(data);
        }
      } catch {
        // Fallback to mock data if API fails or mock ID
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadProvider();
    return () => {
      ignore = true;
    };
  }, [providerId]);

  // Derive provider: prioritize real data from database; fallback to mock data
  const provider: ProviderItem | undefined = useMemo(() => {
    if (realProvider) {
      const skills = (realProvider.categories && realProvider.categories.length > 0)
        ? realProvider.categories.map((c) => c.name)
        : [realProvider.category || 'Dịch vụ chuyên nghiệp'];

      return {
        id: realProvider.id,
        name: realProvider.name,
        verified: realProvider.verified ?? true,
        company: realProvider.headline || realProvider.company || 'Nhà Lo 24h Pro',
        rating: realProvider.rating || 5.0,
        reviewsCount: realProvider.reviewsCount || 0,
        distance: realProvider.distance || '1.8 km',
        pricePerHour: realProvider.pricePerHour || 150000,
        category: realProvider.category || 'Dịch vụ chuyên nghiệp',
        isTopRated: realProvider.isTopRated ?? true,
        availability: (realProvider.availability === 'Available today' ? 'Available today' : 'Available soon') as 'Available today' | 'Available soon',
        avatar: realProvider.avatar || '',
        experienceYears: realProvider.experienceYears || 0,
        completedJobsCount: realProvider.completedJobsCount || 'Mới tham gia',
        responseTime: realProvider.responseTime || '~10 phút',
        availabilityDetail: realProvider.isAvailable ? 'Sẵn sàng nhận việc hôm nay' : 'Tạm bận',
        about: realProvider.about || 'Kỹ thuật viên đối tác tận tâm, uy tín, bảo hành dịch vụ chu đáo.',
        skills,
        aiInsight: 'AI Match: Tay nghề cao, phản hồi nhanh và mức giá phù hợp trong khu vực.',
        reviews: [
          {
            id: 'rev-default-1',
            author: 'Khách hàng ẩn danh',
            avatarLetter: 'K',
            service: realProvider.category || 'Dịch vụ kỹ thuật',
            date: 'Gần đây',
            rating: 5,
            comment: 'Thợ làm việc nhanh nhẹn, tư vấn rõ ràng, rất hài lòng với chất lượng phục vụ!'
          }
        ]
      };
    }
    return undefined;
  }, [realProvider]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [providerId]);

  if (loading) {
    return (
      <div className="provider-not-found-container container" style={{ padding: '6rem 0' }}>
        <div className="not-found-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Loader2 size={36} className="spin-icon" style={{ color: '#1D6AE5' }} />
          <p>Đang tải thông tin thợ từ hệ thống...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="provider-not-found-container container">
        <div className="not-found-card">
          <h2>Không tìm thấy thông tin thợ</h2>
          <p>Hồ sơ đối tác thợ này không tồn tại hoặc đã tạm ẩn.</p>
          <Link to={PATHS.CUSTOMER.PROVIDERS} className="btn-return-providers">
            <ArrowLeft size={16} />
            <span>Quay lại danh sách thợ</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    navigate(PATHS.CUSTOMER.PROVIDERS);
  };

  const handleBookNow = async () => {
    try {
      setCheckingOrders(true);
      const res = await customerOrderService.getMyOrders('PENDING_PROVIDER', 0, 50);
      const orders = res.content;
      if (orders && orders.length > 0) {
        setPendingOrders(orders);
        setShowSelectOrderModal(true);
      } else {
        setShowBookingModal(true);
      }
    } catch {
      // Fallback if not logged in or API fails
      setShowBookingModal(true);
    } finally {
      setCheckingOrders(false);
    }
  };

  const handleSelectExistingOrder = async (orderId: string) => {
    await customerOrderService.dispatchRequests(orderId, {
      providerIds: [provider.id],
    });
    setIsBooked(true);
    setShowSelectOrderModal(false);
    navigate(PATHS.CUSTOMER.ORDERS);
  };

  return (
    <div className="provider-profile-page">
      <div className="container">
        {/* Navigation Breadcrumb / Back button */}
        <div className="profile-navigation-bar">
          <button
            type="button"
            className="profile-back-link"
            onClick={handleBack}
            aria-label="Back to providers"
          >
            <ArrowLeft size={16} />
            <span>Back to providers</span>
          </button>
        </div>

        {/* Success toast if booked */}
        {isBooked && (
          <div className="booking-toast-alert" role="alert">
            <CheckCircle2 size={18} className="toast-icon" />
            <div className="toast-content">
              <strong>Booking request sent!</strong> {provider.name} has been notified and typically responds within {provider.responseTime || '~10 min'}.
            </div>
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => setIsBooked(false)}
              aria-label="Close notification"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Main Grid Layout */}
        <div className="profile-layout-grid">
          {/* Left Column: Comprehensive Profile Information */}
          <div className="profile-main-column">
            {/* Header Card */}
            <div className="profile-header-card">
              {provider.avatar ? (
                <img
                  src={provider.avatar}
                  alt={provider.name}
                  className="profile-avatar-img"
                />
              ) : (
                <div className="profile-avatar-letter-placeholder">
                  {provider.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="profile-header-info">
                <div className="profile-name-row">
                  <h1 className="profile-name">{provider.name}</h1>
                  {provider.verified && (
                    <BadgeCheck
                      size={20}
                      className="profile-verified-icon"
                      aria-label="Verified pro"
                    />
                  )}
                </div>

                <p className="profile-company">{provider.company}</p>

                <div className="profile-rating-row">
                  <div className="stars-group">
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
                  <span className="profile-rating-number">{provider.rating}</span>
                  <span className="profile-reviews-count">({provider.reviewsCount} reviews)</span>
                </div>

                {/* Tags Row */}
                <div className="profile-badges-row">
                  <span className="profile-badge service-badge">{provider.category}</span>
                  {provider.isTopRated && (
                    <span className="profile-badge top-rated-badge">Top rated</span>
                  )}
                  <span className="profile-badge availability-badge">
                    <Clock size={13} />
                    <span>{provider.availabilityDetail || `${provider.availability}, 2:00 PM`}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics Row (4 Cards) */}
            <div className="profile-metrics-grid">
              <div className="profile-metric-card">
                <div className="metric-icon-box">
                  <Award size={20} />
                </div>
                <div className="metric-value">{provider.experienceYears || 12} yrs</div>
                <div className="metric-label">Experience</div>
              </div>

              <div className="profile-metric-card">
                <div className="metric-icon-box">
                  <Briefcase size={20} />
                </div>
                <div className="metric-value">{provider.completedJobsCount || '1,840'}</div>
                <div className="metric-label">Jobs done</div>
              </div>

              <div className="profile-metric-card">
                <div className="metric-icon-box">
                  <Clock size={20} />
                </div>
                <div className="metric-value">{provider.responseTime || '~10 min'}</div>
                <div className="metric-label">Responds</div>
              </div>

              <div className="profile-metric-card">
                <div className="metric-icon-box">
                  <MapPin size={20} />
                </div>
                <div className="metric-value">{provider.distance}</div>
                <div className="metric-label">Distance</div>
              </div>
            </div>

            {/* About Section */}
            <div className="profile-section">
              <h2 className="section-title">About</h2>
              <p className="section-paragraph">
                {provider.about ||
                  'Certified professional with years of hands-on experience in residential services. Dedicated to punctual arrivals, upfront estimates, and high quality long-lasting results.'}
              </p>
            </div>

            {/* Skills & Specialties */}
            <div className="profile-section">
              <h2 className="section-title">Skills &amp; specialties</h2>
              <div className="skills-pill-group">
                {(provider.skills || ['Diagnosis & Repair', 'Installation', 'Preventative Maintenance', 'Emergency Callout']).map(
                  (skill, index) => (
                    <div key={index} className="skill-pill">
                      <Check size={14} strokeWidth={2.5} className="skill-check-icon" />
                      <span>{skill}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* AI Insight Box */}
            {provider.aiInsight && (
              <div className="ai-insight-box">
                <Sparkles size={18} className="ai-sparkles-icon" />
                <p className="ai-insight-text">
                  <strong className="ai-prefix">AI insight:</strong> {provider.aiInsight}
                </p>
              </div>
            )}

            {/* Reviews Section */}
            <div className="profile-section reviews-section">
              <div className="reviews-section-header">
                <h2 className="section-title">Reviews</h2>
                <div className="reviews-summary-right">
                  <div className="stars-group">
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
                  <span className="summary-score">{provider.rating}</span>
                  <span className="summary-dot">·</span>
                  <span className="summary-count">{provider.reviewsCount} reviews</span>
                </div>
              </div>

              {/* Reviews List */}
              <div className="reviews-list">
                {(provider.reviews || []).map((review) => (
                  <div key={review.id} className="review-card">
                    <div className="review-card-header">
                      <div className="reviewer-info-left">
                        <div className="reviewer-avatar-circle">
                          {review.avatarLetter}
                        </div>
                        <div className="reviewer-text-meta">
                          <h4 className="reviewer-name">{review.author}</h4>
                          <span className="review-service-time">
                            {review.service} · {review.date}
                          </span>
                        </div>
                      </div>

                      <div className="reviewer-stars-right">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            size={14}
                            fill={idx < review.rating ? '#F59E0B' : '#E2E8F0'}
                            stroke={idx < review.rating ? '#F59E0B' : '#E2E8F0'}
                            className="review-star"
                          />
                        ))}
                      </div>
                    </div>

                    <p className="review-comment-text">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking Card */}
          <div className="profile-sidebar-column">
            <div className="sticky-booking-card">
              <div className="booking-card-price-row">
                <div className="price-label-group">
                  <span className="starting-from-text">Starting from</span>
                  <div className="price-display">
                    <span className="price-value">{provider.pricePerHour > 1000 ? `${provider.pricePerHour.toLocaleString('vi-VN')} đ` : `$${provider.pricePerHour}`}</span>
                    <span className="price-unit">{provider.pricePerHour > 1000 ? '/giờ' : '/hr'}</span>
                  </div>
                </div>

                <div className="booking-availability-pill">
                  {provider.availability}
                </div>
              </div>

              <div className="booking-card-actions">
                <button
                  type="button"
                  className="btn-book-primary"
                  onClick={handleBookNow}
                  disabled={checkingOrders}
                >
                  {checkingOrders ? (
                    <>
                      <Loader2 size={16} className="spin-icon" />
                      <span>Đang kiểm tra...</span>
                    </>
                  ) : (
                    'Book Now'
                  )}
                </button>

                <button
                  type="button"
                  className={`btn-compare-secondary ${isCompared ? 'compared' : ''}`}
                  onClick={() => setIsCompared(!isCompared)}
                >
                  {isCompared ? (
                    <>
                      <Check size={16} />
                      <span>Added to compare</span>
                    </>
                  ) : (
                    <>
                      <ArrowLeftRight size={15} />
                      <span>Add to compare</span>
                    </>
                  )}
                </button>
              </div>

              <hr className="booking-card-divider" />

              <div className="booking-trust-list">
                <div className="trust-item">
                  <ShieldCheck size={17} className="trust-icon text-green" />
                  <span>Background-checked &amp; verified</span>
                </div>
                <div className="trust-item">
                  <Clock size={17} className="trust-icon text-blue" />
                  <span>Typically responds in {provider.responseTime || '~10 min'}</span>
                </div>
                <div className="trust-item">
                  <Award size={17} className="trust-icon text-amber" />
                  <span>{provider.completedJobsCount || '1,840'} jobs completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Select Existing Order Modal */}
      {showSelectOrderModal && (
        <SelectOrderForProviderModal
          isOpen={showSelectOrderModal}
          onClose={() => setShowSelectOrderModal(false)}
          provider={provider}
          pendingOrders={pendingOrders}
          onSelectExistingOrder={handleSelectExistingOrder}
          onCreateNewOrder={() => setShowBookingModal(true)}
        />
      )}

      {/* Booking Modal Dialog */}
      {showBookingModal && (
        <CreateOrderModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          initialProviderId={provider.id}
          initialProviderName={provider.name}
          onSuccess={() => {
            setIsBooked(true);
            setShowBookingModal(false);
            navigate(PATHS.CUSTOMER.ORDERS);
          }}
        />
      )}
    </div>
  );
}

export default ProviderProfilePage;
