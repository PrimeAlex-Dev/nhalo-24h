import { 
  X, 
  MapPin, 
  Clock, 
  Phone, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  Navigation,
  MessageSquare,
  DollarSign,
  Ban,
  Info
} from 'lucide-react';
import type { ProviderJobItem } from '../../../types/order';
import './JobDetailModal.css';

interface JobDetailModalProps {
  job: ProviderJobItem | null;
  onClose: () => void;
  onOpenQuoteModal: (job: ProviderJobItem) => void;
  onRejectRequest: (job: ProviderJobItem) => void;
  onOpenChat: (job: ProviderJobItem) => void;
  onCompleteOrder: (job: ProviderJobItem) => void;
}

export function JobDetailModal({
  job,
  onClose,
  onOpenQuoteModal,
  onRejectRequest,
  onOpenChat,
  onCompleteOrder,
}: JobDetailModalProps) {
  if (!job) return null;

  const handleCall = () => {
    if (job.customerPhone && !job.customerPhone.includes('*')) {
      window.open(`tel:${job.customerPhone}`);
    }
  };

  const handleOpenMap = () => {
    const encodedAddress = encodeURIComponent(job.addressSnapshot);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const isMyJobInProgress = job.requestStatus === 'ACCEPTED' && job.orderStatus === 'IN_PROGRESS';
  const isMyJobCompleted = job.requestStatus === 'ACCEPTED' && job.orderStatus === 'COMPLETED';
  const isAssignedToOther = job.requestStatus === 'CANCELED' && (job.orderStatus === 'IN_PROGRESS' || job.orderStatus === 'COMPLETED');
  const isOrderCanceled = job.orderStatus === 'CANCELED';
  const isRejected = job.requestStatus === 'REJECTED';
  const isQuoted = job.requestStatus === 'QUOTED' && job.orderStatus === 'PENDING_PROVIDER';
  const isPending = job.requestStatus === 'PENDING_RESPONSE' && job.orderStatus === 'PENDING_PROVIDER';

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
              <span>{job.categoryName || 'Sửa chữa'}</span>
              <span className="order-code-tag">· {job.orderCode}</span>
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
          {/* Status / Earnings banner */}
          {isMyJobInProgress ? (
            <div className="job-modal-price-box in-progress">
              <div>
                <div className="job-modal-price-label">Giá chốt công việc</div>
                <div className="job-modal-price-value">
                  {job.quotedPrice ? `${job.quotedPrice.toLocaleString('vi-VN')} đ` : 'Chờ xác nhận'}
                </div>
              </div>
              <div className="job-modal-price-tag in-progress">Đang thực hiện</div>
            </div>
          ) : isMyJobCompleted ? (
            <div className="job-modal-price-box completed">
              <div>
                <div className="job-modal-price-label">Đã hoàn tất & Thu tiền</div>
                <div className="job-modal-price-value">
                  {job.quotedPrice?.toLocaleString('vi-VN')} đ
                </div>
              </div>
              <div className="job-modal-price-tag completed">Hoàn thành</div>
            </div>
          ) : isAssignedToOther ? (
            <div className="job-modal-price-box assigned-other">
              <div className="assigned-other-content">
                <div className="assigned-other-title">
                  <Info size={16} />
                  <span>Đơn đã có thợ khác nhận</span>
                </div>
                <div className="assigned-other-desc">
                  Khách hàng đã lựa chọn một thợ khác cho công việc này. Yêu cầu báo giá của bạn đã đóng.
                </div>
                {job.quotedPrice ? (
                  <div className="assigned-other-subprice">
                    Mức giá bạn đã gửi báo giá: <strong>{job.quotedPrice.toLocaleString('vi-VN')} đ</strong>
                  </div>
                ) : null}
              </div>
              <div className="job-modal-price-tag assigned-other">Đã đóng</div>
            </div>
          ) : isOrderCanceled ? (
            <div className="job-modal-price-box canceled">
              <div>
                <div className="job-modal-price-label">Trạng thái đơn hàng</div>
                <div className="job-modal-price-value text-muted">Đã bị hủy</div>
                <div className="job-modal-price-subdesc">Khách hàng đã hủy yêu cầu công việc này.</div>
              </div>
              <div className="job-modal-price-tag canceled">Đã hủy</div>
            </div>
          ) : isRejected ? (
            <div className="job-modal-price-box rejected">
              <div>
                <div className="job-modal-price-label">Trạng thái yêu cầu</div>
                <div className="job-modal-price-value text-muted">Đã từ chối</div>
                {job.rejectReason && <div className="job-modal-price-subdesc">Lý do: {job.rejectReason}</div>}
              </div>
              <div className="job-modal-price-tag rejected">Từ chối</div>
            </div>
          ) : isQuoted ? (
            <div className="job-modal-price-box quoted">
              <div>
                <div className="job-modal-price-label">Giá bạn đã báo cho khách</div>
                <div className="job-modal-price-value">
                  {job.quotedPrice?.toLocaleString('vi-VN')} đ
                </div>
              </div>
              <div className="job-modal-price-tag quoted">Đang chờ khách duyệt</div>
            </div>
          ) : (
            <div className="job-modal-price-box pending">
              <div>
                <div className="job-modal-price-label">Trạng thái yêu cầu</div>
                <div className="job-modal-price-value text-blue">Chờ bạn báo giá</div>
              </div>
              <div className="job-modal-price-tag pending">Yêu cầu mới</div>
            </div>
          )}

          {/* Location & Customer info card */}
          <div className="job-modal-info-card">
            {/* Customer & Phone */}
            <div className="job-modal-info-row">
              <div className="job-modal-info-icon">
                <Phone size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="job-modal-info-label">Khách hàng</div>
                <div className="job-modal-info-val">
                  {job.customerName} · <strong>{job.customerPhone || '***-***'}</strong>
                </div>
                {!isMyJobInProgress && !isMyJobCompleted && (
                  <span className="phone-privacy-hint">SĐT được bảo mật và hiển thị khi khách chốt việc.</span>
                )}
              </div>
              {isMyJobInProgress && (
                <button 
                  type="button" 
                  onClick={handleCall}
                  className="btn-call-customer"
                >
                  Gọi điện
                </button>
              )}
            </div>

            {/* Address */}
            <div className="job-modal-info-row">
              <div className="job-modal-info-icon">
                <MapPin size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="job-modal-info-label">Địa chỉ thực hiện</div>
                <div className="job-modal-info-val">{job.addressSnapshot}</div>
              </div>
              <button 
                type="button" 
                onClick={handleOpenMap}
                title="Mở chỉ đường Google Maps"
                className="btn-open-maps"
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
                <div className="job-modal-info-label">Thời gian khách mong muốn</div>
                <div className="job-modal-info-val">
                  {new Date(job.expectedScheduleTime).toLocaleString('vi-VN', {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Customer problem description */}
          <div className="job-modal-note-box">
            <div className="job-modal-note-title">
              <AlertTriangle size={15} />
              <span>Mô tả sự cố từ khách hàng:</span>
            </div>
            <p className="job-modal-note-text">{job.description}</p>
          </div>

          {/* Photos */}
          {job.images && job.images.length > 0 && (
            <div className="job-images-container">
              <div className="job-images-label">Ảnh sự cố khách cung cấp ({job.images.length})</div>
              <div className="job-images-grid">
                {job.images.map((url, idx) => (
                  <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="job-img-link">
                    <img src={url} alt={`Ảnh sự cố ${idx + 1}`} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Your submitted quotation notes if available */}
          {job.providerNote && (
            <div className="job-provider-note-box">
              <span className="note-box-title">Ghi chú bạn đã gửi cho khách:</span>
              <p className="note-box-text">{job.providerNote}</p>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="job-modal-footer">
          {/* Always provide chat button so provider can consult */}
          <button 
            type="button" 
            className="btn-provider-chat"
            onClick={() => onOpenChat(job)}
          >
            <MessageSquare size={16} />
            <span>Chat với khách</span>
          </button>

          {isPending && (
            <>
              <button 
                type="button" 
                className="job-modal-decline-btn" 
                onClick={() => onRejectRequest(job)}
              >
                <Ban size={15} />
                <span>Từ chối</span>
              </button>
              <button 
                type="button" 
                className="job-modal-accept-btn" 
                onClick={() => onOpenQuoteModal(job)}
              >
                <DollarSign size={17} />
                <span>Gửi báo giá</span>
              </button>
            </>
          )}

          {isMyJobInProgress && (
            <button 
              type="button" 
              className="job-modal-complete-btn"
              onClick={() => onCompleteOrder(job)}
            >
              <CheckCircle2 size={18} />
              <span>Đánh dấu hoàn thành việc</span>
            </button>
          )}

          {(isMyJobCompleted || isAssignedToOther || isOrderCanceled || isRejected || isQuoted) && (
            <button type="button" className="job-modal-done-btn" onClick={onClose}>
              Đóng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
