import { useState, useEffect } from 'react';
import { 
  X, 
  PlusCircle, 
  Clock, 
  MapPin, 
  Send, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import type { CustomerOrderSummary } from '../../../types/order';
import './SelectOrderForProviderModal.css';

interface TargetProvider {
  id: string;
  name: string;
  avatar?: string | null;
  category?: string;
  pricePerHour?: number;
}

interface SelectOrderForProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: TargetProvider | null;
  pendingOrders: CustomerOrderSummary[];
  onSelectExistingOrder: (orderId: string) => Promise<void>;
  onCreateNewOrder: () => void;
}

export function SelectOrderForProviderModal({
  isOpen,
  onClose,
  provider,
  pendingOrders,
  onSelectExistingOrder,
  onCreateNewOrder,
}: SelectOrderForProviderModalProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    pendingOrders.length > 0 ? pendingOrders[0].id : ''
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedOrderId(pendingOrders.length > 0 ? pendingOrders[0].id : '');
      setSubmitting(false);
      setErrorMsg(null);
    }
  }, [isOpen, pendingOrders]);

  if (!isOpen || !provider) return null;

  const handleSubmit = async () => {
    if (!selectedOrderId) {
      setErrorMsg('Vui lòng chọn một đơn hàng để gửi tới thợ.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);
      await onSelectExistingOrder(selectedOrderId);
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể gửi yêu cầu tới thợ.');
      setSubmitting(false);
    }
  };

  return (
    <div className="select-order-backdrop" onClick={onClose}>
      <div 
        className="select-order-sheet" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="select-order-header">
          <div className="select-order-target-provider">
            <div className="target-provider-avatar">
              {provider.avatar ? (
                <img src={provider.avatar} alt={provider.name} />
              ) : (
                <span>{provider.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <span className="select-order-badge">Đặt thợ dịch vụ</span>
              <h2 className="select-order-title">Gửi yêu cầu tới {provider.name}</h2>
              <p className="select-order-subtitle">
                {provider.category || 'Dịch vụ chuyên nghiệp'}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            className="select-order-close-btn" 
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Notices */}
        {errorMsg && (
          <div className="select-order-alert-error">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="select-order-body">
          {/* Section 1: Existing Orders */}
          <div className="select-order-section">
            <div className="section-title-row">
              <span className="section-number">1</span>
              <div>
                <h3 className="section-heading">Gửi từ đơn hàng bạn đã tạo (Khuyên dùng)</h3>
                <p className="section-desc">
                  Bạn đang có {pendingOrders.length} đơn hàng chưa chốt thợ. Chọn đơn này để thợ gửi báo giá ngay mà không cần nhập lại sự cố.
                </p>
              </div>
            </div>

            <div className="orders-radio-list">
              {pendingOrders.map((ord) => {
                const isSelected = selectedOrderId === ord.id;
                return (
                  <label 
                    key={ord.id} 
                    className={`order-radio-card ${isSelected ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="pendingOrderRadio"
                      value={ord.id}
                      checked={isSelected}
                      onChange={() => {
                        setSelectedOrderId(ord.id);
                        setErrorMsg(null);
                      }}
                      className="order-radio-input"
                    />

                    <div className="order-radio-content">
                      <div className="order-radio-header">
                        <span className="order-code-tag">{ord.orderCode}</span>
                        <span className="order-time-tag">
                          <Clock size={12} />
                          {ord.expectedScheduleTime || ord.createdAt}
                        </span>
                      </div>

                      <h4 className="order-item-title">{ord.title}</h4>

                      <div className="order-item-meta">
                        <div className="meta-line">
                          <MapPin size={13} />
                          <span>{ord.addressSnapshot}</span>
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            <button
              type="button"
              className="btn-send-existing-order"
              onClick={handleSubmit}
              disabled={submitting || !selectedOrderId}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="spin-icon" />
                  <span>Đang gửi yêu cầu...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Gửi đơn đã chọn tới thợ này</span>
                </>
              )}
            </button>
          </div>

          <div className="select-order-divider">
            <span>HOẶC</span>
          </div>

          {/* Section 2: Create new order */}
          <div className="select-order-section new-order-section">
            <div className="section-title-row">
              <span className="section-number secondary">2</span>
              <div>
                <h3 className="section-heading">Gặp vấn đề hoặc sự cố khác?</h3>
                <p className="section-desc">
                  Mô tả một vấn đề mới hoàn toàn và chỉ định thợ này nhận việc đầu tiên.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn-open-create-new"
              onClick={() => {
                onClose();
                onCreateNewOrder();
              }}
              disabled={submitting}
            >
              <PlusCircle size={16} />
              <span>Tạo đơn yêu cầu mới hoàn toàn</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
