import { useState } from 'react';
import { 
  MapPin, 
  Clock, 
  Phone, 
  Navigation, 
  CheckCircle2, 
  Wrench, 
  Inbox,
  Check
} from 'lucide-react';
import { mockProviderJobs } from '../data/providerMockData';
import { JobDetailModal } from '../components/JobDetailModal';
import type { ProviderJob } from '../types/provider';
import './ProviderJobsPage.css';

type JobTabFilter = 'available' | 'in_progress' | 'scheduled' | 'completed';

export function ProviderJobsPage() {
  const [jobs, setJobs] = useState<ProviderJob[]>(mockProviderJobs);
  const [activeTab, setActiveTab] = useState<JobTabFilter>('available');
  const [selectedJob, setSelectedJob] = useState<ProviderJob | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Filter jobs by active tab
  const filteredJobs = jobs.filter((j) => {
    if (activeTab === 'available') return j.status === 'available';
    if (activeTab === 'in_progress') return j.status === 'in_progress';
    if (activeTab === 'scheduled') return j.urgency === 'scheduled' || j.status === 'accepted';
    if (activeTab === 'completed') return j.status === 'completed';
    return true;
  });

  const availableCount = jobs.filter((j) => j.status === 'available').length;
  const inProgressCount = jobs.filter((j) => j.status === 'in_progress').length;
  const scheduledCount = jobs.filter((j) => j.urgency === 'scheduled' || j.status === 'accepted').length;
  const completedCount = jobs.filter((j) => j.status === 'completed').length;

  const handleAcceptJob = (jobId: string) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, status: 'in_progress' as const } : job
      )
    );
    setSelectedJob(null);
    setActiveTab('in_progress');
    showNotice('Đã nhận việc! Đơn đã được chuyển vào mục Đang làm.');
  };

  const handleFinishJob = (jobId: string) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, status: 'completed' as const } : job
      )
    );
    showNotice('Chúc mừng bạn đã hoàn thành công việc và thu tiền thành công!');
  };

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  const handleOpenMap = (address: string) => {
    const encoded = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, '_blank');
  };

  return (
    <div className="provider-jobs-page">
      {/* Toast Alert */}
      {actionNotice && (
        <div style={{
          background: '#059669',
          color: '#FFFFFF',
          padding: '12px 18px',
          borderRadius: '14px',
          fontWeight: 700,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 8px 20px rgba(5, 150, 105, 0.3)'
        }}>
          <CheckCircle2 size={18} />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Header */}
      <div className="provider-jobs-header">
        <h1 className="provider-jobs-page-title">Quản lý công việc</h1>
        <span className="provider-jobs-count-tag">{jobs.length} công việc</span>
      </div>

      {/* Tabs */}
      <div className="provider-jobs-tabs">
        <button
          type="button"
          className={`provider-job-tab-btn ${activeTab === 'available' ? 'active' : ''}`}
          onClick={() => setActiveTab('available')}
        >
          <span>Việc mới</span>
          <span className="provider-tab-pill-badge">{availableCount}</span>
        </button>

        <button
          type="button"
          className={`provider-job-tab-btn ${activeTab === 'in_progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('in_progress')}
        >
          <span>Đang làm</span>
          <span className="provider-tab-pill-badge">{inProgressCount}</span>
        </button>

        <button
          type="button"
          className={`provider-job-tab-btn ${activeTab === 'scheduled' ? 'active' : ''}`}
          onClick={() => setActiveTab('scheduled')}
        >
          <span>Lịch hẹn</span>
          <span className="provider-tab-pill-badge">{scheduledCount}</span>
        </button>

        <button
          type="button"
          className={`provider-job-tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          <span>Đã xong</span>
          <span className="provider-tab-pill-badge">{completedCount}</span>
        </button>
      </div>

      {/* Job List */}
      <div className="provider-jobs-list">
        {filteredJobs.length === 0 ? (
          <div className="provider-empty-jobs">
            <div className="provider-empty-icon">
              <Inbox size={28} />
            </div>
            <h3 className="provider-empty-title">Không có công việc nào</h3>
            <p className="provider-empty-desc">
              Chưa có đơn hàng trong mục này. Khi khách hàng đặt lịch mới, hệ thống sẽ tự động thông báo ngay.
            </p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div 
              key={job.id} 
              className={`provider-job-card ${job.status === 'in_progress' ? 'active-working' : ''}`}
            >
              {/* Card Top */}
              <div className="provider-card-top">
                <div>
                  <div className="provider-card-service-chip">
                    <Wrench size={13} />
                    <span>{job.category}</span>
                  </div>
                  <h2 className="provider-card-title">{job.title}</h2>
                </div>
                <div className="provider-card-price">{job.priceEstimate}</div>
              </div>

              {/* Details Box */}
              <div className="provider-card-details-box">
                <div className="provider-card-detail-item">
                  <Clock size={16} className="provider-card-detail-icon" />
                  <span>{job.scheduledTime} · Cách {job.distance} ({job.travelTime})</span>
                </div>

                <div className="provider-card-detail-item">
                  <MapPin size={16} className="provider-card-detail-icon" />
                  <span>{job.address}</span>
                </div>

                <div className="provider-card-detail-item">
                  <Phone size={16} className="provider-card-detail-icon" />
                  <span>Khách: <strong>{job.customerName}</strong> ({job.customerPhone})</span>
                </div>
              </div>

              {/* Actions based on Job Status */}
              {job.status === 'available' && (
                <div className="provider-card-actions">
                  <button
                    type="button"
                    className="provider-btn-outline"
                    onClick={() => handleCall(job.customerPhone)}
                  >
                    <Phone size={15} />
                    <span>Gọi</span>
                  </button>

                  <button
                    type="button"
                    className="provider-btn-outline"
                    onClick={() => handleOpenMap(job.address)}
                  >
                    <Navigation size={15} />
                    <span>Chỉ đường</span>
                  </button>

                  <button
                    type="button"
                    className="provider-btn-primary"
                    onClick={() => setSelectedJob(job)}
                  >
                    Xem yêu cầu
                  </button>
                </div>
              )}

              {job.status === 'in_progress' && (
                <div className="provider-card-actions">
                  <button
                    type="button"
                    className="provider-btn-outline"
                    onClick={() => handleCall(job.customerPhone)}
                  >
                    <Phone size={15} />
                    <span>Gọi khách</span>
                  </button>

                  <button
                    type="button"
                    className="provider-btn-outline"
                    onClick={() => handleOpenMap(job.address)}
                  >
                    <Navigation size={15} />
                    <span>Chỉ đường</span>
                  </button>

                  <button
                    type="button"
                    className="provider-btn-primary"
                    onClick={() => handleFinishJob(job.id)}
                  >
                    <Check size={16} />
                    <span>Hoàn thành & Thu tiền</span>
                  </button>
                </div>
              )}

              {job.status === 'completed' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="provider-completed-badge">
                    <CheckCircle2 size={16} />
                    <span>Đã hoàn thành và thu tiền</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{job.createdAt}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <JobDetailModal 
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onAccept={handleAcceptJob}
      />
    </div>
  );
}
