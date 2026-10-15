import { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Wrench, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  UserPlus,
  Ban
} from 'lucide-react';
import type { AdminOrderItem } from '../types/admin';
import './OrderDetailModal.css';

interface OrderDetailModalProps {
  order: AdminOrderItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAssignProvider?: (orderId: string, providerName: string) => void;
  onCancelOrder?: (orderId: string, reason: string) => void;
  onResolveBacklog?: (orderId: string) => void;
}

export function OrderDetailModal({
  order,
  isOpen,
  onClose,
  onAssignProvider,
  onCancelOrder,
  onResolveBacklog,
}: OrderDetailModalProps) {
  const [selectedProvider, setSelectedProvider] = useState('Lê Hoàng Minh');
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const getStatusBadge = (status: AdminOrderItem['status']) => {
    switch (status) {
      case 'new':
        return <span className="status-badge status-new">Đơn mới tạo</span>;
      case 'unassigned':
        return <span className="status-badge status-unassigned">Đang chờ thợ nhận</span>;
      case 'in_progress':
        return <span className="status-badge status-progress">Đang thực hiện</span>;
      case 'completed':
        return <span className="status-badge status-completed">Hoàn thành</span>;
      case 'cancelled':
        return <span className="status-badge status-cancelled">Đã hủy</span>;
    }
  };

  const handleAssign = () => {
    onAssignProvider?.(order.id, selectedProvider);
    setActionSuccessMsg(`Đã chỉ định trực tiếp thợ ${selectedProvider} cho đơn hàng!`);
    setShowAssignDropdown(false);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const handleResolve = () => {
    onResolveBacklog?.(order.id);
    setActionSuccessMsg('Đã đánh dấu xử lý xong tình trạng tồn đọng!');
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
      onCancelOrder?.(order.id, 'Admin hủy do tồn đọng quá lâu');
      setActionSuccessMsg('Đã cập nhật trạng thái đơn sang Đã hủy.');
      setTimeout(() => setActionSuccessMsg(null), 3000);
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
            <span className="order-modal-code">{order.code}</span>
            <h2 id="order-modal-title" className="order-modal-title">
              {order.serviceName}
            </h2>
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

        {/* Backlog Alert Warning if applicable */}
        {order.backlogStatus !== 'normal' && (
          <div className="order-backlog-alert-box">
            <div className="backlog-alert-icon-wrap">
              <AlertTriangle size={24} className="backlog-alert-icon" />
            </div>
            <div className="backlog-alert-content">
              <h4 className="backlog-alert-heading">
                Cảnh báo phát hiện sự cố / tồn đọng đơn hàng
              </h4>
              <p className="backlog-alert-desc">
                {order.backlogReason || 'Đơn hàng đang vượt quá ngưỡng thời gian quy định.'}
              </p>
              {order.waitMinutes && (
                <span className="backlog-wait-tag">
                  <Clock size={13} /> Thời gian chờ đợi: {order.waitMinutes} phút
                </span>
              )}
            </div>
            <button 
              type="button" 
              className="backlog-resolve-btn"
              onClick={handleResolve}
            >
              <CheckCircle2 size={16} /> Đánh dấu đã can thiệp
            </button>
          </div>
        )}

        {actionSuccessMsg && (
          <div className="order-success-notice">
            <CheckCircle2 size={16} /> {actionSuccessMsg}
          </div>
        )}

        {/* Body Grid */}
        <div className="order-modal-body">
          {/* Column 1: Order Info & Customer / Technician */}
          <div className="order-modal-col">
            <div className="order-section-card">
              <h3 className="order-section-title">
                <User size={16} /> Thông tin khách hàng
              </h3>
              <div className="order-info-list">
                <div className="order-info-item">
                  <span className="order-info-label">Khách hàng:</span>
                  <span className="order-info-val font-semibold">{order.customerName}</span>
                </div>
                <div className="order-info-item">
                  <span className="order-info-label">Số điện thoại:</span>
                  <span className="order-info-val text-primary font-medium">
                    <Phone size={14} className="inline-icon" /> {order.customerPhone}
                  </span>
                </div>
                <div className="order-info-item">
                  <span className="order-info-label">Địa chỉ xử lý:</span>
                  <span className="order-info-val">
                    <MapPin size={14} className="inline-icon" /> {order.customerAddress}
                  </span>
                </div>
                {order.notes && (
                  <div className="order-notes-box">
                    <span className="order-notes-title">Ghi chú từ khách:</span>
                    <p className="order-notes-text">"{order.notes}"</p>
                  </div>
                )}
              </div>
            </div>

            <div className="order-section-card">
              <h3 className="order-section-title">
                <Wrench size={16} /> Thợ kỹ thuật phụ trách
              </h3>
              {order.providerName ? (
                <div className="provider-assigned-card">
                  {order.providerAvatar && (
                    <img 
                      src={order.providerAvatar} 
                      alt={order.providerName} 
                      className="provider-thumb-avatar" 
                    />
                  )}
                  <div className="provider-assigned-info">
                    <span className="provider-assigned-name">{order.providerName}</span>
                    <span className="provider-assigned-phone">
                      <Phone size={13} /> {order.providerPhone || '09xx xxx xxx'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="provider-unassigned-notice">
                  <AlertCircle size={18} className="text-amber-500" />
                  <div>
                    <p className="unassigned-title">Chưa có thợ nhận đơn</p>
                    <p className="unassigned-sub">Hệ thống đang phát tín hiệu hoặc đã quá giờ nhận.</p>
                  </div>
                </div>
              )}

              {/* Admin Direct Assignment action */}
              <div className="admin-assign-action-block">
                {!showAssignDropdown ? (
                  <button 
                    type="button" 
                    className="btn-open-assign" 
                    onClick={() => setShowAssignDropdown(true)}
                  >
                    <UserPlus size={15} /> Chỉ định thợ thủ công ngay
                  </button>
                ) : (
                  <div className="assign-dropdown-box">
                    <label htmlFor="select-provider" className="assign-label">
                      Chọn thợ đối tác khu vực gần nhất:
                    </label>
                    <div className="assign-controls-row">
                      <select 
                        id="select-provider"
                        className="assign-select"
                        value={selectedProvider}
                        onChange={(e) => setSelectedProvider(e.target.value)}
                      >
                        <option value="Lê Hoàng Minh">Lê Hoàng Minh (Đạt 4.9⭐ - Bán kính 2.1km)</option>
                        <option value="Phạm Đức Thành">Phạm Đức Thành (Đạt 4.8⭐ - Bán kính 3.5km)</option>
                        <option value="Võ Minh Trí">Võ Minh Trí (Thợ khóa - Bán kính 1.5km)</option>
                      </select>
                      <button 
                        type="button" 
                        className="btn-confirm-assign" 
                        onClick={handleAssign}
                      >
                        Gán thợ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Order Metadata & Timeline */}
          <div className="order-modal-col">
            <div className="order-section-card">
              <h3 className="order-section-title">
                <CreditCard size={16} /> Chi tiết thanh toán & Thời gian
              </h3>
              <div className="order-info-list">
                <div className="order-info-item">
                  <span className="order-info-label">Tổng chi phí:</span>
                  <span className="order-price-val">
                    {order.price.toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="order-info-item">
                  <span className="order-info-label">Hình thức:</span>
                  <span className="order-info-val uppercase">
                    {order.paymentMethod === 'vnpay' ? 'VNPay Trực Tuyến' : order.paymentMethod === 'wallet' ? 'Ví Điện Tử' : 'Tiền Mặt'}
                  </span>
                </div>
                <div className="order-info-item">
                  <span className="order-info-label">Lịch hẹn:</span>
                  <span className="order-info-val">{order.scheduledTime}</span>
                </div>
                <div className="order-info-item">
                  <span className="order-info-label">Thời điểm tạo đơn:</span>
                  <span className="order-info-val text-muted">{order.createdAt}</span>
                </div>
              </div>
            </div>

            <div className="order-section-card">
              <h3 className="order-section-title">
                <Clock size={16} /> Tiến độ xử lý & Dòng thời gian
              </h3>
              <div className="order-timeline-list">
                {order.timeline.map((evt, idx) => (
                  <div key={idx} className={`timeline-entry status-${evt.status}`}>
                    <div className="timeline-node">
                      <span className="timeline-dot" />
                      {idx < order.timeline.length - 1 && <span className="timeline-connector" />}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-header-line">
                        <span className="timeline-title">{evt.title}</span>
                        <span className="timeline-time">{evt.time}</span>
                      </div>
                      <p className="timeline-desc">{evt.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="order-modal-footer">
          <button 
            type="button" 
            className="btn-admin-cancel" 
            onClick={handleCancel}
          >
            <Ban size={15} /> Hủy đơn hàng
          </button>
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
