import { useState, useEffect } from 'react';
import './MyOrdersPage.css';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Star, 
  ChevronRight, 
  X, 
  MapPin, 
  Clock, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { mockCustomerOrders } from '../data/customerMockData';
import type { CustomerOrder } from '../types/customer';

export function MyOrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [reviewSubmitted, setReviewSubmitted] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleOrderClick = (order: CustomerOrder) => {
    setSelectedOrder(order);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  const handleLeaveReview = (orderId: string) => {
    setReviewSubmitted(orderId);
  };

  return (
    <div className="my-orders-page">
      <div className="container orders-container">
        {/* Page Header */}
        <div className="orders-header">
          <h1 className="orders-page-title">My orders</h1>
          <p className="orders-page-subtitle">Track active jobs and review past services.</p>
        </div>

        {/* Orders List */}
        <div className="orders-list">
          {mockCustomerOrders.map((order) => {
            const statusClass = 
              order.status === 'In progress' 
                ? 'status-in-progress' 
                : order.status === 'Scheduled' 
                ? 'status-scheduled' 
                : 'status-completed';

            return (
              <div
                key={order.id}
                className="order-card"
                onClick={() => handleOrderClick(order)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOrderClick(order);
                  }
                }}
              >
                {/* Left section: Avatar + Details */}
                <div className="order-card-left">
                  <img
                    src={order.providerAvatar}
                    alt={order.providerName}
                    className="order-provider-avatar"
                  />

                  <div className="order-details-stack">
                    {/* Title + Status Badge */}
                    <div className="order-title-row">
                      <h3 className="order-service-title">
                        {order.serviceCategory} — {order.serviceDetail}
                      </h3>
                      <span className={`order-status-badge ${statusClass}`}>
                        {order.status}
                      </span>
                    </div>

                    {/* Provider Name + Order Code */}
                    <p className="order-provider-meta">
                      {order.providerName} · {order.orderCode}
                    </p>

                    {/* Schedule + Review pending */}
                    <div className="order-schedule-row">
                      <div className="order-time-group">
                        <Calendar size={14} className="order-calendar-icon" />
                        <span>{order.scheduledTime}</span>
                      </div>

                      {order.reviewPending && (
                        <div className="review-pending-badge">
                          <Star size={13} fill="#F59E0B" stroke="#F59E0B" />
                          <span>
                            {reviewSubmitted === order.id ? 'Review submitted' : 'Review pending'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right section: Price + Chevron */}
                <div className="order-card-right">
                  <span className="order-price">${order.price}</span>
                  <ChevronRight size={18} className="order-chevron-icon" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="order-modal-overlay" onClick={handleCloseModal}>
          <div
            className="order-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              className="order-modal-close"
              onClick={handleCloseModal}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <div className="order-modal-header">
              <span className="modal-order-code">{selectedOrder.orderCode}</span>
              <h3 className="modal-order-title">
                {selectedOrder.serviceCategory} — {selectedOrder.serviceDetail}
              </h3>
              <p className="modal-provider-sub">
                With <strong>{selectedOrder.providerName}</strong>
              </p>
            </div>

            <div className="order-modal-body">
              {/* Status Banner */}
              <div className="modal-status-banner">
                <div className="status-banner-left">
                  <Clock size={16} />
                  <span>Status: <strong>{selectedOrder.status}</strong></span>
                </div>
                <span className="modal-price-tag">${selectedOrder.price}</span>
              </div>

              {/* Service Schedule & Location */}
              <div className="modal-info-group">
                <div className="modal-info-row">
                  <Calendar size={16} className="modal-info-icon" />
                  <div>
                    <span className="info-label">Scheduled Time</span>
                    <span className="info-value">{selectedOrder.scheduledTime}</span>
                  </div>
                </div>

                {selectedOrder.address && (
                  <div className="modal-info-row">
                    <MapPin size={16} className="modal-info-icon" />
                    <div>
                      <span className="info-label">Service Address</span>
                      <span className="info-value">{selectedOrder.address}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="modal-notes-box">
                  <span className="notes-label">Service Description / Notes:</span>
                  <p className="notes-text">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Review Prompt if applicable */}
              {selectedOrder.reviewPending && reviewSubmitted !== selectedOrder.id && (
                <div className="modal-review-prompt">
                  <div className="review-prompt-text">
                    <Star size={16} fill="#F59E0B" stroke="#F59E0B" />
                    <span>How was your experience with {selectedOrder.providerName}?</span>
                  </div>
                  <button
                    type="button"
                    className="btn-leave-review"
                    onClick={() => handleLeaveReview(selectedOrder.id)}
                  >
                    Leave 5-Star Review
                  </button>
                </div>
              )}

              {reviewSubmitted === selectedOrder.id && (
                <div className="modal-review-done">
                  <CheckCircle2 size={16} className="text-green" />
                  <span>Thank you! Your review for {selectedOrder.providerName} has been recorded.</span>
                </div>
              )}
            </div>

            <div className="order-modal-footer">
              <Link
                to={`/customer/providers/${selectedOrder.providerId}`}
                className="btn-view-pro-profile"
                onClick={handleCloseModal}
              >
                <span>View Provider Profile</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyOrdersPage;
