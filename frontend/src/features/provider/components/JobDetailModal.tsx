import { 
  X, 
  MapPin, 
  Clock, 
  Phone, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  Navigation
} from 'lucide-react';
import type { ProviderJob } from '../types/provider';
import './JobDetailModal.css';

interface JobDetailModalProps {
  job: ProviderJob | null;
  onClose: () => void;
  onAccept: (jobId: string) => void;
}

export function JobDetailModal({ job, onClose, onAccept }: JobDetailModalProps) {
  if (!job) return null;

  const handleCall = () => {
    window.open(`tel:${job.customerPhone}`);
  };

  const handleOpenMap = () => {
    const encodedAddress = encodeURIComponent(job.address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  return (
    <div className="job-modal-backdrop" onClick={onClose}>
      <div className="job-modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Grab bar for mobile */}
        <div className="job-modal-grab-bar" />

        {/* Modal Header */}
        <div className="job-modal-header">
          <div>
            <div className="job-modal-category-chip">
              <Wrench size={13} />
              <span>{job.category}</span>
            </div>
            <h3 className="job-modal-title">{job.title}</h3>
          </div>
          <button 
            type="button" 
            className="job-modal-close-btn" 
            onClick={onClose}
            aria-label="Đóng chi tiết"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="job-modal-body">
          {/* Price & Earnings box */}
          <div className="job-modal-price-box">
            <div>
              <div className="job-modal-price-label">Thu nhập ước tính</div>
              <div className="job-modal-price-value">{job.priceEstimate}</div>
            </div>
            <div className="job-modal-price-tag">Báo giá minh bạch</div>
          </div>

          {/* Location & Time info card */}
          <div className="job-modal-info-card">
            {/* Customer & Phone */}
            <div className="job-modal-info-row">
              <div className="job-modal-info-icon">
                <Phone size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="job-modal-info-label">Khách hàng</div>
                <div className="job-modal-info-val">{job.customerName} · {job.customerPhone}</div>
              </div>
              <button 
                type="button" 
                onClick={handleCall}
                style={{
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  color: '#1D6AE5',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Gọi điện
              </button>
            </div>

            {/* Address */}
            <div className="job-modal-info-row">
              <div className="job-modal-info-icon">
                <MapPin size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="job-modal-info-label">Địa chỉ ({job.distance} · {job.travelTime})</div>
                <div className="job-modal-info-val">{job.address}</div>
              </div>
              <button 
                type="button" 
                onClick={handleOpenMap}
                title="Mở chỉ đường Google Maps"
                style={{
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#334155',
                  padding: '6px 10px',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Navigation size={13} />
                <span>Bản đồ</span>
              </button>
            </div>

            {/* Time */}
            <div className="job-modal-info-row">
              <div className="job-modal-info-icon">
                <Clock size={18} />
              </div>
              <div>
                <div className="job-modal-info-label">Thời gian hẹn</div>
                <div className="job-modal-info-val">{job.scheduledTime}</div>
              </div>
            </div>
          </div>

          {/* Customer notes */}
          <div className="job-modal-note-box">
            <div className="job-modal-note-title">
              <AlertTriangle size={15} />
              <span>Ghi chú từ khách hàng:</span>
            </div>
            <p className="job-modal-note-text">{job.note}</p>
          </div>

          {/* Materials needed */}
          {job.materialsNeeded && job.materialsNeeded.length > 0 && (
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Vật tư / dụng cụ gợi ý:
              </div>
              <div className="job-modal-materials">
                {job.materialsNeeded.map((mat, idx) => (
                  <span key={idx} className="job-modal-mat-pill">{mat}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="job-modal-footer">
          <button 
            type="button" 
            className="job-modal-decline-btn" 
            onClick={onClose}
          >
            Để sau
          </button>
          <button 
            type="button" 
            className="job-modal-accept-btn" 
            onClick={() => onAccept(job.id)}
          >
            <CheckCircle2 size={20} />
            <span>Nhận công việc ngay</span>
          </button>
        </div>
      </div>
    </div>
  );
}
