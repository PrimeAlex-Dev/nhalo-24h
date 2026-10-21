import { 
  X, 
  MapPin, 
  User, 
  Phone, 
  Wrench, 
  CreditCard, 
  AlertCircle,
  Clock,
  Ban,
  Calendar,
  Image as ImageIcon
} from 'lucide-react';
import './OrderDetailModal.css';

export interface GenericOrderItem {
  id: string;
  orderCode?: string;
  code?: string;
  title?: string;
  serviceName?: string;
  categoryName?: string;
  category?: string;
  contactName?: string;
  customerName?: string;
  contactPhone?: string;
  customerPhone?: string;
  addressSnapshot?: string;
  customerAddress?: string;
  description?: string;
  notes?: string;
  expectedScheduleTime?: string;
  scheduledTime?: string;
  status: string;
  finalPrice?: number;
  price?: number;
  cancelReason?: string;
  assignedProviderName?: string;
  providerName?: string;
  assignedProviderPhone?: string;
  providerPhone?: string;
  assignedProviderAvatar?: string;
  providerAvatar?: string;
  images?: string[];
  quotationCount?: number;
  createdAt?: string;
}

interface OrderDetailModalProps {
  order: GenericOrderItem | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelOrder?: (orderId: string, reason: string) => void;
}

export function OrderDetailModal({
  order,
  isOpen,
  onClose,
  onCancelOrder,
}: OrderDetailModalProps) {
  if (!isOpen || !order) return null;

  const orderCode = order.orderCode || order.code || 'ORD-UNKNOWN';
  const orderTitle = order.title || order.serviceName || 'Dịch vụ sửa chữa';
  const categoryTitle = order.categoryName || order.category || 'Dịch vụ gia đình';
  const customer = order.contactName || order.customerName || 'Khách hàng';
  const phone = order.contactPhone || order.customerPhone || 'Chưa có SĐT';
  const address = order.addressSnapshot || order.customerAddress || 'Chưa có địa chỉ';
  const desc = order.description || order.notes;
  const provider = order.assignedProviderName || order.providerName;
  const provPhone = order.assignedProviderPhone || order.providerPhone;
  const provAvatar = order.assignedProviderAvatar || order.providerAvatar;
  const priceVal = order.finalPrice ?? order.price;
  const schedule = order.expectedScheduleTime || order.scheduledTime || 'Thỏa thuận';
  const createdDate = order.createdAt 
    ? new Date(order.createdAt).toLocaleDateString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'Chưa cập nhật';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_PROVIDER':
      case 'new':
      case 'unassigned':
        return <span className="status-badge status-unassigned">Chờ thợ nhận việc</span>;
      case 'IN_PROGRESS':
      case 'in_progress':
        return <span className="status-badge status-progress">Đang thực hiện</span>;
      case 'COMPLETED':
      case 'completed':
        return <span className="status-badge status-completed">Đã hoàn thành</span>;
      case 'CANCELED':
      case 'cancelled':
        return <span className="status-badge status-cancelled">Đã hủy</span>;
      default:
        return <span className="status-badge status-unassigned">{status}</span>;
    }
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
      onCancelOrder?.(order.id, 'Quản trị viên hủy đơn');
    }
  };

  return (
    <div className="order-modal-backdrop" onClick={onClose}>
      <div 
        className="order-modal-dialog" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-modal-title"
      >
        {/* Header */}
        <div className="order-modal-header">
          <div className="order-modal-title-wrap">
            <span className="order-modal-code">{orderCode}</span>
            <h2 id="order-modal-title" className="order-modal-title">
              {orderTitle}
            </h2>
            <span className="order-modal-category">{categoryTitle}</span>
          </div>
          <div className="order-modal-header-actions">
            {getStatusBadge(order.status)}
            <button 
              type="button" 
              className="order-modal-close-btn" 
              onClick={onClose}
              aria-label="Đóng chi tiết"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Cancel notice if canceled */}
        {order.cancelReason && (
          <div className="order-backlog-alert-box">
            <div className="backlog-alert-icon-wrap">
              <Ban size={22} className="backlog-alert-icon" />
            </div>
            <div className="backlog-alert-content">
              <h4 className="backlog-alert-heading">
                Đơn hàng đã bị hủy
              </h4>
              <p className="backlog-alert-desc">
                Lý do hủy: {order.cancelReason}
              </p>
            </div>
          </div>
        )}

        {/* Body Grid */}
        <div className="order-modal-body">
          {/* Column 1: Customer & Assigned Provider */}
          <div className="order-modal-col">
            <div className="order-section-card">
              <h3 className="order-section-title">
                <User size={16} /> Thông tin khách hàng & Địa điểm
              </h3>
              <div className="order-info-list">
                <div className="order-info-item">
                  <span className="order-info-label">Người liên hệ:</span>
                  <span className="order-info-val font-semibold">{customer}</span>
                </div>
                <div className="order-info-item">
                  <span className="order-info-label">Số điện thoại:</span>
                  <span className="order-info-val text-primary font-medium">
                    <Phone size={14} className="inline-icon" /> {phone}
                  </span>
                </div>
                <div className="order-info-item">
                  <span className="order-info-label">Địa chỉ thực hiện:</span>
                  <span className="order-info-val">
                    <MapPin size={14} className="inline-icon" /> {address}
                  </span>
                </div>
                {desc && (
                  <div className="order-notes-box">
                    <span className="order-notes-title">Mô tả chi tiết từ khách:</span>
                    <p className="order-notes-text">"{desc}"</p>
                  </div>
                )}
              </div>
            </div>

            <div className="order-section-card">
              <h3 className="order-section-title">
                <Wrench size={16} /> Thợ kỹ thuật phụ trách
              </h3>
              {provider ? (
                <div className="provider-assigned-card">
                  {provAvatar ? (
                    <img 
                      src={provAvatar} 
                      alt={provider} 
                      className="provider-thumb-avatar" 
                    />
                  ) : (
                    <div className="provider-thumb-avatar-placeholder">
                      {provider.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="provider-assigned-info">
                    <span className="provider-assigned-name">{provider}</span>
                    <span className="provider-assigned-phone">
                      <Phone size={13} /> {provPhone || 'Đã tiếp nhận'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="provider-unassigned-notice">
                  <AlertCircle size={18} className="text-amber-500" />
                  <div>
                    <p className="unassigned-title">Đang chờ thợ nhận việc / gửi báo giá</p>
                    <p className="unassigned-sub">
                      Khách hàng đang phát thông báo tới các thợ trong khu vực để nhận báo giá cạnh tranh.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Order Metadata, Pricing & Schedule */}
          <div className="order-modal-col">
            <div className="order-section-card">
              <h3 className="order-section-title">
                <CreditCard size={16} /> Chi phí & Lịch hẹn
              </h3>
              <div className="order-info-list">
                <div className="order-info-item">
                  <span className="order-info-label">Chi phí / Báo giá chốt:</span>
                  <span className="order-price-val">
                    {priceVal ? `${priceVal.toLocaleString('vi-VN')} đ` : 'Chờ thỏa thuận báo giá'}
                  </span>
                </div>
                <div className="order-info-item">
                  <span className="order-info-label">Lịch hẹn mong muốn:</span>
                  <span className="order-info-val">
                    <Calendar size={14} className="inline-icon" /> {schedule}
                  </span>
                </div>
                <div className="order-info-item">
                  <span className="order-info-label">Thời điểm tạo đơn:</span>
                  <span className="order-info-val text-muted">
                    <Clock size={14} className="inline-icon" /> {createdDate}
                  </span>
                </div>
                {order.quotationCount !== undefined && (
                  <div className="order-info-item">
                    <span className="order-info-label">Số lượng báo giá nhận được:</span>
                    <span className="order-info-val font-semibold text-blue-600">
                      {order.quotationCount} báo giá từ thợ
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Images attached by customer */}
            {order.images && order.images.length > 0 && (
              <div className="order-section-card">
                <h3 className="order-section-title">
                  <ImageIcon size={16} /> Hình ảnh hiện trường ({order.images.length})
                </h3>
                <div className="order-images-grid">
                  {order.images.map((img, idx) => (
                    <a 
                      key={idx} 
                      href={img} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="order-image-thumb"
                    >
                      <img src={img} alt={`Hiện trường ${idx + 1}`} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="order-modal-footer">
          {order.status !== 'CANCELED' && order.status !== 'cancelled' && onCancelOrder && (
            <button 
              type="button" 
              className="btn-admin-cancel" 
              onClick={handleCancel}
            >
              <Ban size={15} /> Hủy đơn hàng
            </button>
          )}
          <div className="order-footer-right">
            <button 
              type="button" 
              className="btn-modal-close" 
              onClick={onClose}
            >
              Đóng lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
