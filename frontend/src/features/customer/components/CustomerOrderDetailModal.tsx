import { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  Phone, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  Loader2,
  Ban, 
  User,
  UserPlus
} from 'lucide-react';
import { customerOrderService } from '../../../services';
import type { CustomerOrderDetail, QuotationItem } from '../../../types/order';
import { InviteProvidersModal } from './InviteProvidersModal';
import { CancelOrderModal } from './CancelOrderModal';
import { AcceptQuotationModal } from './AcceptQuotationModal';
import './CustomerOrderDetailModal.css';

interface CustomerOrderDetailModalProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated?: () => void;
  onOpenChat: (
    requestId: string,
    partnerName: string,
    partnerAvatar?: string,
    partnerHeadline?: string,
    quotedPrice?: number,
    orderTitle?: string
  ) => void;
}

export function CustomerOrderDetailModal({
  orderId,
  isOpen,
  onClose,
  onOrderUpdated,
  onOpenChat,
}: CustomerOrderDetailModalProps) {
  const [order, setOrder] = useState<CustomerOrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [quotingToAccept, setQuotingToAccept] = useState<QuotationItem | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      loadOrderDetail(false);

      // Auto-poll order detail every 6 seconds while modal is open
      const intervalTimer = setInterval(() => {
        loadOrderDetail(true);
      }, 6000);

      const handleFocus = () => {
        if (document.visibilityState === 'visible') {
          loadOrderDetail(true);
        }
      };

      window.addEventListener('focus', handleFocus);
      document.addEventListener('visibilitychange', handleFocus);

      return () => {
        clearInterval(intervalTimer);
        window.removeEventListener('focus', handleFocus);
        document.removeEventListener('visibilitychange', handleFocus);
      };
    }
  }, [isOpen, orderId]);

  const loadOrderDetail = async (silent = false) => {
    if (!orderId) return;
    try {
      if (!silent) {
        setLoading(true);
      }
      setErrorMsg(null);
      const data = await customerOrderService.getOrderDetail(orderId);
      setOrder(data);
    } catch (err: any) {
      if (!silent) {
        setErrorMsg(err.message || 'Không thể tải chi tiết đơn hàng.');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleOpenAcceptModal = (q: QuotationItem) => {
    setQuotingToAccept(q);
  };

  const handleConfirmAcceptQuotation = async () => {
    if (!quotingToAccept) return;
    setActionLoading(true);
    setErrorMsg(null);
    try {
      await customerOrderService.acceptQuotation(quotingToAccept.requestId);
      setSuccessMsg(`Đã chọn thợ ${quotingToAccept.providerName} thành công! Đơn hàng bắt đầu thực hiện.`);
      await loadOrderDetail();
      if (onOrderUpdated) onOrderUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể chấp nhận báo giá.');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenCancelModal = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancelOrder = async (reason: string) => {
    if (!order) return;
    setActionLoading(true);
    setErrorMsg(null);
    try {
      await customerOrderService.cancelOrder(order.id, { reason: reason || 'Khách hàng yêu cầu hủy' });
      setSuccessMsg('Đã hủy đơn hàng thành công.');
      await loadOrderDetail();
      if (onOrderUpdated) onOrderUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể hủy đơn hàng.');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_PROVIDER':
        return <span className="status-badge-custom pending">Đang tìm / Chờ báo giá</span>;
      case 'IN_PROGRESS':
        return <span className="status-badge-custom in-progress">Đang sửa chữa</span>;
      case 'COMPLETED':
        return <span className="status-badge-custom completed">Đã hoàn thành</span>;
      case 'CANCELED':
        return <span className="status-badge-custom canceled">Đã hủy</span>;
      default:
        return <span className="status-badge-custom">{status}</span>;
    }
  };

  return (
    <div className="order-detail-backdrop" onClick={onClose}>
      <div 
        className="order-detail-sheet" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="order-detail-header">
          <div>
            <div className="order-code-badge">{order?.orderCode || 'Đang tải...'}</div>
            <h2 className="order-detail-title">{order?.title || 'Chi tiết đơn hàng'}</h2>
          </div>
          <div className="header-right-actions">
            {order && getStatusBadge(order.status)}
            <button 
              type="button" 
              className="order-detail-close-btn" 
              onClick={onClose}
              aria-label="Đóng"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Notices */}
        {errorMsg && (
          <div className="modal-alert-error">
            <AlertTriangle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="modal-alert-success">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="order-detail-loading">
            <Loader2 size={36} className="spin-icon text-blue" />
            <p>Đang tải dữ liệu đơn hàng...</p>
          </div>
        ) : order ? (
          <div className="order-detail-scroll-body">
            {/* Assigned Provider Banner if IN_PROGRESS or COMPLETED */}
            {order.assignedProviderId && (
              <div className="assigned-provider-box">
                <div className="assigned-provider-left">
                  {order.assignedProviderAvatar ? (
                    <img src={order.assignedProviderAvatar} alt={order.assignedProviderName} className="assigned-avatar" />
                  ) : (
                    <div className="assigned-avatar-fallback">
                      {order.assignedProviderName ? order.assignedProviderName.charAt(0).toUpperCase() : 'T'}
                    </div>
                  )}
                  <div>
                    <div className="assigned-name-title">
                      <span className="pro-tag">Thợ đảm nhận</span>
                      <h4>{order.assignedProviderName}</h4>
                    </div>
                    {order.assignedProviderPhone && (
                      <p className="assigned-phone">
                        <Phone size={13} /> SĐT: <strong>{order.assignedProviderPhone}</strong>
                      </p>
                    )}
                  </div>
                </div>
                <div className="assigned-price-box">
                  <span className="price-label">Giá chốt:</span>
                  <span className="price-val">
                    {order.finalPrice ? `${order.finalPrice.toLocaleString('vi-VN')} đ` : 'Chưa cập nhật'}
                  </span>
                </div>
              </div>
            )}

            {/* General Info Card */}
            <div className="detail-info-card">
              <div className="detail-info-row">
                <div className="info-icon-col"><Calendar size={17} /></div>
                <div>
                  <span className="info-item-label">Thời gian hẹn</span>
                  <span className="info-item-val">
                    {new Date(order.expectedScheduleTime).toLocaleString('vi-VN', {
                      dateStyle: 'full',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
              </div>

              <div className="detail-info-row">
                <div className="info-icon-col"><MapPin size={17} /></div>
                <div>
                  <span className="info-item-label">Địa chỉ thực hiện</span>
                  <span className="info-item-val">{order.addressSnapshot}</span>
                </div>
              </div>

              <div className="detail-info-row">
                <div className="info-icon-col"><User size={17} /></div>
                <div>
                  <span className="info-item-label">Người liên hệ</span>
                  <span className="info-item-val">{order.contactName} · {order.contactPhone}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="detail-desc-box">
              <h4 className="box-heading">Mô tả sự cố</h4>
              <p className="desc-text">{order.description}</p>
            </div>

            {/* Images */}
            {order.images && order.images.length > 0 && (
              <div className="detail-images-box">
                <h4 className="box-heading">Hình ảnh sự cố ({order.images.length})</h4>
                <div className="images-grid">
                  {order.images.map((imgUrl, idx) => (
                    <a key={idx} href={imgUrl} target="_blank" rel="noopener noreferrer" className="img-thumbnail-link">
                      <img src={imgUrl} alt={`Ảnh sự cố ${idx + 1}`} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Quotations List (Core multi-provider quotation feature) */}
            <div className="detail-quotations-section">
              <div className="quotations-header-row">
                <div className="quotations-title-wrap">
                  <h4 className="box-heading">
                    Danh sách Báo giá từ Thợ ({order.quotations ? order.quotations.length : 0})
                  </h4>
                  {order.status === 'PENDING_PROVIDER' && (
                    <span className="quotation-guide-tag">Chọn 1 báo giá ưng ý để chốt việc</span>
                  )}
                </div>
                {order.status === 'PENDING_PROVIDER' && (
                  <button
                    type="button"
                    className="btn-invite-more-pro"
                    onClick={() => setShowInviteModal(true)}
                  >
                    <UserPlus size={14} />
                    <span>Mời thêm thợ</span>
                  </button>
                )}
              </div>

              {(!order.quotations || order.quotations.length === 0) ? (
                <div className="no-quotation-notice">
                  <Clock size={24} className="text-gray" />
                  <p>Chưa có thợ nào được mời hoặc chưa có báo giá cho đơn này.</p>
                  {order.status === 'PENDING_PROVIDER' && (
                    <button
                      type="button"
                      className="btn-invite-first-pro"
                      onClick={() => setShowInviteModal(true)}
                    >
                      <UserPlus size={16} />
                      <span>Chọn thợ gửi yêu cầu ngay</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="quotation-cards-list">
                  {order.quotations.map((q) => {
                    const isQuoted = q.status === 'QUOTED';
                    const isAccepted = q.status === 'ACCEPTED';
                    const isRejected = q.status === 'REJECTED';
                    const isCanceled = q.status === 'CANCELED';

                    return (
                      <div key={q.requestId} className={`quotation-card ${q.status.toLowerCase()}`}>
                        <div className="quotation-card-top">
                          <div className="pro-brief-info">
                            {q.providerAvatar ? (
                              <img src={q.providerAvatar} alt={q.providerName} className="pro-avatar" />
                            ) : (
                              <div className="pro-avatar-fallback">
                                {q.providerName ? q.providerName.charAt(0).toUpperCase() : 'T'}
                              </div>
                            )}
                            <div>
                              <div className="pro-name-row">
                                <h5 className="pro-name">{q.providerName}</h5>
                                <span className="pro-headline">{q.providerHeadline || 'Thợ chuyên nghiệp'}</span>
                              </div>
                              {q.pricePerHour && q.pricePerHour > 0 && (
                                <span className="pro-ref-price">
                                  Đơn giá tham khảo: {q.pricePerHour.toLocaleString('vi-VN')} đ/giờ
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quoted Price Box */}
                          <div className="quote-price-col">
                            {isQuoted ? (
                              <>
                                <span className="quote-badge-label">Giá báo:</span>
                                <span className="quote-amount-highlight">
                                  {q.quotedPrice?.toLocaleString('vi-VN')} đ
                                </span>
                              </>
                            ) : isAccepted ? (
                              <span className="quote-status-pill accepted">✓ Đã chốt nhận việc</span>
                            ) : isRejected ? (
                              <span className="quote-status-pill rejected">Thợ từ chối</span>
                            ) : isCanceled ? (
                              <span className="quote-status-pill canceled">Đã hủy</span>
                            ) : (
                              <span className="quote-status-pill pending">⏳ Đang chờ thợ báo giá</span>
                            )}
                          </div>
                        </div>

                        {/* Note & Arrival Time */}
                        {q.providerNote && (
                          <div className="quote-note-row">
                            <strong>Ghi chú từ thợ:</strong> {q.providerNote}
                          </div>
                        )}
                        {q.estimatedArrivalTime && (
                          <div className="quote-eta-row">
                            <Clock size={13} />
                            <span>Ước tính có mặt: {new Date(q.estimatedArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        )}
                        {q.rejectReason && (
                          <div className="quote-reject-row">
                            Lý do thợ từ chối: {q.rejectReason}
                          </div>
                        )}

                        {/* Quotation Action Buttons */}
                        <div className="quotation-card-actions">
                          {/* Chat button always visible to talk with provider */}
                          <button
                            type="button"
                            className="btn-quote-chat"
                            onClick={() =>
                              onOpenChat(
                                q.requestId,
                                q.providerName,
                                q.providerAvatar,
                                q.providerHeadline,
                                q.quotedPrice,
                                order.title
                              )
                            }
                          >
                            <MessageSquare size={15} />
                            <span>Nhắn tin trao đổi</span>
                          </button>

                          {/* Accept button only if QUOTED and order is PENDING_PROVIDER */}
                          {isQuoted && order.status === 'PENDING_PROVIDER' && (
                            <button
                              type="button"
                              className="btn-quote-accept"
                              onClick={() => handleOpenAcceptModal(q)}
                              disabled={actionLoading}
                            >
                              <CheckCircle2 size={16} />
                              <span>Chấp nhận giá & Chọn thợ này</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Footer */}
        {order && (
          <div className="order-detail-footer">
            {order.status === 'PENDING_PROVIDER' && (
              <button 
                type="button" 
                className="btn-cancel-this-order"
                onClick={handleOpenCancelModal}
                disabled={actionLoading}
              >
                <Ban size={15} />
                <span>Hủy đơn hàng</span>
              </button>
            )}
            <button type="button" className="btn-close-modal" onClick={onClose}>
              Đóng
            </button>
          </div>
        )}
      </div>

      {/* Invite Providers Modal */}
      {showInviteModal && order && (
        <InviteProvidersModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          orderId={order.id}
          orderTitle={order.title}
          categoryId={order.categoryId}
          categoryName={order.categoryName}
          existingProviderIds={order.quotations ? order.quotations.map((q) => q.providerId) : []}
          onSuccess={() => {
            loadOrderDetail();
            if (onOrderUpdated) onOrderUpdated();
          }}
        />
      )}

      {/* Accept Quotation Modal */}
      {quotingToAccept && (
        <AcceptQuotationModal
          isOpen={!!quotingToAccept}
          onClose={() => setQuotingToAccept(null)}
          orderTitle={order?.title}
          quotation={quotingToAccept}
          onConfirmAccept={handleConfirmAcceptQuotation}
        />
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <CancelOrderModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          orderCode={order?.orderCode}
          orderTitle={order?.title}
          onConfirmCancel={handleConfirmCancelOrder}
        />
      )}
    </div>
  );
}
