import { useState, useEffect } from 'react';
import { Link, useOutletContext, useNavigate } from 'react-router-dom';
import { 
  Power, 
  ClipboardList, 
  CalendarCheck, 
  ArrowRight, 
  AlertCircle,
  MapPin,
  Briefcase,
  Loader2
} from 'lucide-react';
import { PATHS } from '../../../routes/paths';
import { providerJobService } from '../../../services';
import type { ProviderJobItem } from '../../../types/order';
import { useAuth } from '../../auth';
import type { ProviderContextType } from '../../../layouts/ProviderLayout';
import './ProviderHomePage.css';

export function ProviderHomePage() {
  const { isOnline, toggleOnline, profile, refreshIncomingRequestsCount } = useOutletContext<ProviderContextType>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const displayName = profile?.fullName || user?.fullName || 'Thợ đối tác';
  const shortName = displayName.trim().split(' ').slice(-1)[0] || 'Thợ';

  const [loading, setLoading] = useState(true);
  const [incomingRequests, setIncomingRequests] = useState<ProviderJobItem[]>([]);
  const [inProgressOrders, setInProgressOrders] = useState<ProviderJobItem[]>([]);
  const [completedOrders, setCompletedOrders] = useState<ProviderJobItem[]>([]);

  useEffect(() => {
    let ignore = false;

    async function loadDashboardData(silent = false) {
      try {
        if (!silent) {
          setLoading(true);
        }
        const [requestsRes, inProgressRes, completedRes] = await Promise.all([
          providerJobService.getIncomingRequests(undefined, 0, 10),
          providerJobService.getAssignedOrders('IN_PROGRESS', 0, 10),
          providerJobService.getAssignedOrders('COMPLETED', 0, 10),
        ]);

        if (!ignore) {
          setIncomingRequests(requestsRes.content);
          setInProgressOrders(inProgressRes.content);
          setCompletedOrders(completedRes.content);
        }
      } catch (err) {
        console.warn('Could not load provider dashboard data:', err);
      } finally {
        if (!ignore && !silent) {
          setLoading(false);
        }
      }
    }

    loadDashboardData(false);
    if (refreshIncomingRequestsCount) {
      refreshIncomingRequestsCount();
    }

    // Auto-scan new jobs every 12 seconds
    const intervalTimer = setInterval(() => {
      loadDashboardData(true);
      if (refreshIncomingRequestsCount) {
        refreshIncomingRequestsCount();
      }
    }, 12000);

    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        loadDashboardData(true);
        if (refreshIncomingRequestsCount) {
          refreshIncomingRequestsCount();
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      ignore = true;
      clearInterval(intervalTimer);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [refreshIncomingRequestsCount]);

  // Compute real counts
  const pendingRequests = incomingRequests.filter(
    (r) => r.requestStatus === 'PENDING_RESPONSE' && r.orderStatus === 'PENDING_PROVIDER'
  );
  const newJobsCount = pendingRequests.length;
  const todayJobsCount = inProgressOrders.length;
  const completedCount = completedOrders.length;
  const todayEarnings = completedOrders.reduce((sum, ord) => sum + (ord.quotedPrice || 0), 0);

  // Real matching jobs from incoming requests: Chỉ lấy các yêu cầu đang mở (chờ báo giá hoặc đã báo giá)
  const actionableRequests = incomingRequests.filter(
    (r) => r.orderStatus === 'PENDING_PROVIDER' && r.requestStatus !== 'CANCELED' && r.requestStatus !== 'REJECTED'
  );
  const featuredJob = actionableRequests[0] || null;
  const secondaryJob = actionableRequests[1] || null;

  return (
    <div className="provider-home-container">
      {/* 1. Greeting Row */}
      <div className="provider-greeting-row">
        <div>
          <p className="provider-greeting-sub">Xin chào, {shortName}!</p>
          <h1 className="provider-greeting-title">Sẵn sàng nhận việc?</h1>
        </div>

        <div className="provider-desktop-live-status">
          <span className="live-radar-dot" />
          <span>Đang quét đơn tự động tại <strong>{profile?.serviceArea || 'Khu vực hoạt động'}</strong></span>
        </div>
      </div>

      {/* Main Grid: 2 columns on laptop, 1 column on mobile */}
      <div className="provider-home-main-grid">
        {/* Left Column (Command Cockpit) */}
        <div className="provider-home-left-col">
          {/* 2. Work Status Card */}
          <div 
            className="provider-status-card"
            onClick={toggleOnline}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleOnline(); }}
            title="Nhấn để bật / tắt trạng thái nhận việc"
          >
            <div className="provider-status-left">
              <div className={`provider-status-icon-box ${isOnline ? 'online' : 'offline'}`}>
                <Power size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="provider-status-title">Trạng thái nhận việc</h2>
                <p className={`provider-status-desc ${isOnline ? 'online' : 'offline'}`}>
                  {isOnline ? 'Đang sẵn sàng nhận việc' : 'Tạm ngưng nhận việc'}
                </p>
              </div>
            </div>

            <div className={`provider-status-pill ${isOnline ? 'online' : 'offline'}`}>
              {isOnline ? 'Sẵn sàng' : 'Tạm ngưng'}
            </div>
          </div>

          {!isOnline && (
            <div className="provider-offline-alert">
              <AlertCircle size={18} />
              <span>Bạn đang ở chế độ Tạm ngưng nhận việc. Bật Sẵn sàng để nhận đơn hàng mới.</span>
            </div>
          )}

          {/* 3. Quick Stats Row (2 Cards) */}
          <div className="provider-stats-grid">
            {/* Card A: Việc mới */}
            <Link to={PATHS.PROVIDER.JOBS} className="provider-stat-card">
              <div className="provider-stat-icon-wrapper">
                <ClipboardList size={26} strokeWidth={2.2} />
              </div>
              <div className="provider-stat-number">
                {loading ? '...' : newJobsCount}
              </div>
              <div className="provider-stat-label">Việc mới</div>
            </Link>

            {/* Card B: Lịch hôm nay */}
            <Link to={PATHS.PROVIDER.JOBS} className="provider-stat-card">
              <div className="provider-stat-icon-wrapper">
                <CalendarCheck size={26} strokeWidth={2.2} />
              </div>
              <div className="provider-stat-number">
                {loading ? '...' : todayJobsCount}
              </div>
              <div className="provider-stat-label">Lịch hôm nay</div>
            </Link>
          </div>

          {/* 4. Quick Today Earnings Banner */}
          <Link to={PATHS.PROVIDER.EARNINGS} className="provider-quick-earning-banner">
            <div>
              <div className="provider-earning-left-sub">
                {completedCount > 0 ? `Thu nhập (${completedCount} đơn hoàn thành)` : 'Thu nhập hôm nay'}
              </div>
              <div className="provider-earning-left-val">
                {loading ? '...' : `${todayEarnings.toLocaleString('vi-VN')} đ`}
              </div>
            </div>
            <div className="provider-earning-right-btn">
              <span>Xem ví</span>
              <ArrowRight size={14} />
            </div>
          </Link>
        </div>

        {/* Right Column (Job Feed) */}
        <div className="provider-home-right-col">
          {/* 5. Matching Job Card */}
          <section className="provider-jobs-section-card">
            <div className="provider-section-header">
              <h2 className="provider-section-title">Công việc phù hợp</h2>
              <Link to={PATHS.PROVIDER.JOBS} className="provider-section-link">
                Xem tất cả
              </Link>
            </div>

            {loading ? (
              <div className="provider-no-job-card">
                <Loader2 size={30} className="spin-icon text-blue" />
                <p>Đang tìm kiếm đơn việc phù hợp...</p>
              </div>
            ) : featuredJob ? (
              <div className="provider-job-item">
                <div className="provider-job-title-row">
                  <h3 className="provider-job-main-title">{featuredJob.title}</h3>
                  <span className="provider-job-price-chip">
                    {featuredJob.quotedPrice && featuredJob.quotedPrice > 0
                      ? `${featuredJob.quotedPrice.toLocaleString('vi-VN')} đ`
                      : profile?.pricePerHour && profile.pricePerHour > 0
                      ? `${profile.pricePerHour.toLocaleString('vi-VN')} đ/giờ`
                      : featuredJob.categoryName || 'Chờ báo giá'}
                  </span>
                </div>

                <p className="provider-job-meta-line">
                  Khách hàng: <strong>{featuredJob.customerName}</strong>
                  {featuredJob.expectedScheduleTime && ` · Hẹn: ${featuredJob.expectedScheduleTime}`}
                </p>

                <p className="provider-job-location-line">
                  <MapPin size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
                  {featuredJob.addressSnapshot} {featuredJob.categoryName ? `(${featuredJob.categoryName})` : ''}
                </p>

                {/* Big prominent CTA button */}
                <button 
                  type="button" 
                  className="provider-cta-btn"
                  onClick={() => navigate(PATHS.PROVIDER.JOBS)}
                >
                  Xem yêu cầu &amp; báo giá
                </button>
              </div>
            ) : (
              <div className="provider-no-job-card">
                <div className="provider-no-job-icon">
                  <Briefcase size={28} />
                </div>
                <h3 className="provider-no-job-title">Chưa có yêu cầu mới</h3>
                <p className="provider-no-job-desc">
                  Hiện tại chưa có khách hàng nào gửi yêu cầu sửa chữa. Khi có đơn mới gửi đến, công việc sẽ xuất hiện tại đây ngay lập tức!
                </p>
                <button
                  type="button"
                  className="provider-cta-btn secondary"
                  onClick={() => navigate(PATHS.PROVIDER.JOBS)}
                >
                  Xem tất cả công việc
                </button>
              </div>
            )}
          </section>

          {/* Desktop Secondary Opportunity */}
          {secondaryJob && (
            <section className="provider-jobs-section-card desktop-secondary-job">
              <div className="provider-section-header">
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1D6AE5' }}>
                  ⚡ Yêu cầu khác
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
                  {secondaryJob.createdAt || 'Mới nhận'}
                </span>
              </div>

              <div className="provider-job-item">
                <div className="provider-job-title-row">
                  <h3 className="provider-job-main-title">{secondaryJob.title}</h3>
                  <span className="provider-job-price-chip">
                    {secondaryJob.quotedPrice && secondaryJob.quotedPrice > 0
                      ? `${secondaryJob.quotedPrice.toLocaleString('vi-VN')} đ`
                      : profile?.pricePerHour && profile.pricePerHour > 0
                      ? `${profile.pricePerHour.toLocaleString('vi-VN')} đ/giờ`
                      : secondaryJob.categoryName || 'Chờ báo giá'}
                  </span>
                </div>

                <p className="provider-job-meta-line">
                  Khách hàng: <strong>{secondaryJob.customerName}</strong>
                  {secondaryJob.expectedScheduleTime && ` · Hẹn: ${secondaryJob.expectedScheduleTime}`}
                </p>

                <p className="provider-job-location-line">
                  <MapPin size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
                  {secondaryJob.addressSnapshot} {secondaryJob.categoryName ? `(${secondaryJob.categoryName})` : ''}
                </p>

                <button 
                  type="button" 
                  className="provider-cta-btn secondary"
                  onClick={() => navigate(PATHS.PROVIDER.JOBS)}
                >
                  Xem yêu cầu
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
