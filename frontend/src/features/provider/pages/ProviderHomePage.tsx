import { useState } from 'react';
import { Link, useOutletContext, useNavigate } from 'react-router-dom';
import { 
  Power, 
  ClipboardList, 
  CalendarCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { PATHS } from '../../../routes/paths';
import { mockProviderJobs, mockProviderProfile } from '../data/providerMockData';
import { JobDetailModal } from '../components/JobDetailModal';
import { useAuth } from '../../auth';
import type { ProviderJob } from '../types/provider';
import type { ProviderContextType } from '../../../layouts/ProviderLayout';
import './ProviderHomePage.css';

export function ProviderHomePage() {
  const { isOnline, toggleOnline, profile } = useOutletContext<ProviderContextType>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const displayName = profile?.fullName || user?.fullName || mockProviderProfile.name;
  const shortName = displayName.trim().split(' ').slice(-1)[0] || 'Thợ';

  // Highlight job matching wireframe: 'job-101' (Sửa vòi nước bị rò rỉ)
  const featuredJob = mockProviderJobs.find((j) => j.id === 'job-101') || mockProviderJobs[0];
  const secondaryJob = mockProviderJobs.find((j) => j.id === 'job-102');

  const [selectedJob, setSelectedJob] = useState<ProviderJob | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenJobDetail = (job: ProviderJob) => {
    setSelectedJob(job);
  };

  const handleAcceptJob = (_jobId: string) => {
    setSelectedJob(null);
    setToastMessage('Đã nhận việc thành công! Đang chuyển đến đơn hàng...');
    setTimeout(() => {
      setToastMessage(null);
      navigate(PATHS.PROVIDER.JOBS);
    }, 1200);
  };

  return (
    <div className="provider-home-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="provider-toast">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Greeting Row */}
      <div className="provider-greeting-row">
        <div>
          <p className="provider-greeting-sub">Xin chào, {shortName}!</p>
          <h1 className="provider-greeting-title">Sẵn sàng nhận việc?</h1>
        </div>

        <div className="provider-desktop-live-status">
          <span className="live-radar-dot" />
          <span>Đang quét đơn tự động tại <strong>Cần Thơ</strong></span>
        </div>
      </div>

      {/* Main Grid: 2 columns on laptop, 1 column on mobile */}
      <div className="provider-home-main-grid">
        {/* Left Column (Command Cockpit) */}
        <div className="provider-home-left-col">
          {/* 2. Work Status Card (Matches Wireframe) */}
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

          {/* 3. Quick Stats Row (2 Cards - Matches Wireframe) */}
          <div className="provider-stats-grid">
            {/* Card A: Việc mới */}
            <Link to={PATHS.PROVIDER.JOBS} className="provider-stat-card">
              <div className="provider-stat-icon-wrapper">
                <ClipboardList size={26} strokeWidth={2.2} />
              </div>
              <div className="provider-stat-number">{mockProviderProfile.newJobsCount}</div>
              <div className="provider-stat-label">Việc mới</div>
            </Link>

            {/* Card B: Lịch hôm nay */}
            <Link to={PATHS.PROVIDER.JOBS} className="provider-stat-card">
              <div className="provider-stat-icon-wrapper">
                <CalendarCheck size={26} strokeWidth={2.2} />
              </div>
              <div className="provider-stat-number">{mockProviderProfile.todayJobsCount}</div>
              <div className="provider-stat-label">Lịch hôm nay</div>
            </Link>
          </div>

          {/* 4. Quick Today Earnings Banner */}
          <Link to={PATHS.PROVIDER.EARNINGS} className="provider-quick-earning-banner">
            <div>
              <div className="provider-earning-left-sub">Thu nhập hôm nay (2 đơn hoàn thành)</div>
              <div className="provider-earning-left-val">
                {mockProviderProfile.todayEarnings.toLocaleString('vi-VN')} đ
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
          {/* 5. Matching Job Card (Matches Wireframe) */}
          <section className="provider-jobs-section-card">
            <div className="provider-section-header">
              <h2 className="provider-section-title">Công việc phù hợp</h2>
              <Link to={PATHS.PROVIDER.JOBS} className="provider-section-link">
                Xem tất cả
              </Link>
            </div>

            {featuredJob && (
              <div className="provider-job-item">
                <div className="provider-job-title-row">
                  <h3 className="provider-job-main-title">{featuredJob.title}</h3>
                  <span className="provider-job-price-chip">{featuredJob.priceEstimate}</span>
                </div>

                <p className="provider-job-meta-line">
                  Cách {featuredJob.distance} · {featuredJob.scheduledTime}
                </p>

                <p className="provider-job-location-line">
                  Khu vực: {featuredJob.area} ({featuredJob.category})
                </p>

                {/* Big prominent CTA button */}
                <button 
                  type="button" 
                  className="provider-cta-btn"
                  onClick={() => handleOpenJobDetail(featuredJob)}
                >
                  Xem yêu cầu
                </button>
              </div>
            )}
          </section>

          {/* Desktop Secondary Opportunity */}
          {secondaryJob && (
            <section className="provider-jobs-section-card desktop-secondary-job">
              <div className="provider-section-header">
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1D6AE5' }}>
                  ⚡ Yêu cầu khẩn cấp khác
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>{secondaryJob.createdAt}</span>
              </div>

              <div className="provider-job-item">
                <div className="provider-job-title-row">
                  <h3 className="provider-job-main-title">{secondaryJob.title}</h3>
                  <span className="provider-job-price-chip">{secondaryJob.priceEstimate}</span>
                </div>

                <p className="provider-job-meta-line">
                  Cách {secondaryJob.distance} · {secondaryJob.scheduledTime}
                </p>

                <p className="provider-job-location-line">
                  Khu vực: {secondaryJob.area} ({secondaryJob.category})
                </p>

                <button 
                  type="button" 
                  className="provider-cta-btn secondary"
                  onClick={() => handleOpenJobDetail(secondaryJob)}
                >
                  Xem yêu cầu
                </button>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Job Detail Modal */}
      <JobDetailModal 
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onAccept={handleAcceptJob}
      />
    </div>
  );
}
