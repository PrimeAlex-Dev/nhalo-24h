import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '../../../routes/paths';
import './MyOrdersPage.css';
import { 
  Calendar, 
  MapPin, 
  ChevronRight, 
  Plus, 
  Loader2, 
  AlertCircle, 
  Wrench, 
  Inbox,
  Bell,
  Home,
  ArrowLeft
} from 'lucide-react';
import { customerOrderService } from '../../../services';
import type { CustomerOrderSummary, OrderStatus } from '../../../types/order';
import { CreateOrderModal } from './CreateOrderModal';
import { CustomerOrderDetailModal } from './CustomerOrderDetailModal';
import { OrderChatDrawer } from '../../order/components/OrderChatDrawer';
import { Pagination } from '../../../components/common/Pagination';

type OrderTabFilter = 'ALL' | OrderStatus;

export function MyOrdersPage() {
  const [orders, setOrders] = useState<CustomerOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<OrderTabFilter>('ALL');

  // Pagination State (5 orders per page)
  const [page, setPage] = useState(0);
  const [pageSize] = useState(5);
  const [pageInfo, setPageInfo] = useState({ totalPages: 0, totalElements: 0 });

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Chat Drawer State
  const [chatRequestId, setChatRequestId] = useState<string | null>(null);
  const [chatPartnerName, setChatPartnerName] = useState('');
  const [chatPartnerAvatar, setChatPartnerAvatar] = useState<string | undefined>();
  const [chatPartnerHeadline, setChatPartnerHeadline] = useState<string | undefined>();
  const [chatQuotedPrice, setChatQuotedPrice] = useState<number | undefined>();
  const [chatOrderTitle, setChatOrderTitle] = useState<string | undefined>();

  useEffect(() => {
    loadOrders(false, page);

    // Auto-poll orders every 12 seconds
    const intervalTimer = setInterval(() => {
      loadOrders(true, page);
    }, 12000);

    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        loadOrders(true, page);
      }
    };

    const handleOrderRefresh = () => {
      loadOrders(false, page);
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('nhalo24h:refresh-orders', handleOrderRefresh);

    return () => {
      clearInterval(intervalTimer);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('nhalo24h:refresh-orders', handleOrderRefresh);
    };
  }, [activeTab, page]);

  const loadOrders = async (silent = false, pageToLoad = page) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setErrorMsg(null);
      const statusParam = activeTab === 'ALL' ? undefined : activeTab;
      const res = await customerOrderService.getMyOrders(statusParam, pageToLoad, pageSize);
      setOrders(res.content);
      setPageInfo({
        totalPages: res.totalPages,
        totalElements: res.totalElements,
      });
    } catch (err: any) {
      if (!silent) {
        setErrorMsg(err.message || 'Không thể tải danh sách đơn hàng.');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleTabChange = (newTab: OrderTabFilter) => {
    setActiveTab(newTab);
    setPage(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenChat = (
    requestId: string,
    partnerName: string,
    partnerAvatar?: string,
    partnerHeadline?: string,
    quotedPrice?: number,
    orderTitle?: string
  ) => {
    setChatRequestId(requestId);
    setChatPartnerName(partnerName);
    setChatPartnerAvatar(partnerAvatar);
    setChatPartnerHeadline(partnerHeadline);
    setChatQuotedPrice(quotedPrice);
    setChatOrderTitle(orderTitle);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING_PROVIDER':
        return <span className="order-status-badge status-pending">Chờ thợ báo giá</span>;
      case 'IN_PROGRESS':
        return <span className="order-status-badge status-in-progress">Đang thực hiện</span>;
      case 'COMPLETED':
        return <span className="order-status-badge status-completed">Hoàn thành</span>;
      case 'CANCELED':
        return <span className="order-status-badge status-canceled">Đã hủy</span>;
      default:
        return <span className="order-status-badge">{status}</span>;
    }
  };

  return (
    <div className="my-orders-page">
      <div className="container orders-container">
        {/* Page Header */}
        <div className="orders-header-row">
          <div className="orders-header-text">
            <h1 className="orders-page-title">Đơn hàng của tôi</h1>
            <p className="orders-page-subtitle">Theo dõi các đơn sửa chữa, xem báo giá của thợ và lịch sử hoàn tất.</p>
          </div>
          <Link to={PATHS.CUSTOMER.ROOT} className="orders-header-back-home" title="Trở về trang chủ">
            <ArrowLeft size={15} />
            <Home size={14} />
            <span className="back-home-text-full">Trở về trang chủ</span>
            <span className="back-home-text-short">Trang chủ</span>
          </Link>
        </div>

        {/* Tab Filters */}
        <div className="orders-filter-tabs">
          <button 
            type="button" 
            className={`filter-tab-btn ${activeTab === 'ALL' ? 'active' : ''}`}
            onClick={() => handleTabChange('ALL')}
          >
            Tất cả
          </button>
          <button 
            type="button" 
            className={`filter-tab-btn ${activeTab === 'PENDING_PROVIDER' ? 'active' : ''}`}
            onClick={() => handleTabChange('PENDING_PROVIDER')}
          >
            Chờ báo giá
          </button>
          <button 
            type="button" 
            className={`filter-tab-btn ${activeTab === 'IN_PROGRESS' ? 'active' : ''}`}
            onClick={() => handleTabChange('IN_PROGRESS')}
          >
            Đang làm
          </button>
          <button 
            type="button" 
            className={`filter-tab-btn ${activeTab === 'COMPLETED' ? 'active' : ''}`}
            onClick={() => handleTabChange('COMPLETED')}
          >
            Đã hoàn thành
          </button>
          <button 
            type="button" 
            className={`filter-tab-btn ${activeTab === 'CANCELED' ? 'active' : ''}`}
            onClick={() => handleTabChange('CANCELED')}
          >
            Đã hủy
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="orders-error-box">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Orders List */}
        {loading ? (
          <div className="orders-loading-state">
            <Loader2 size={36} className="spin-icon text-blue" />
            <p>Đang tải danh sách đơn hàng...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="orders-empty-state">
            <Inbox size={48} className="empty-icon" />
            <h3>Chưa có đơn hàng nào</h3>
            <p>Bạn chưa có đơn sửa chữa nào trong mục này. Bấm nút dưới để tạo đơn và nhận báo giá từ thợ nhé!</p>
            <div className="empty-state-actions">
              <button 
                type="button" 
                className="btn-empty-create"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus size={16} />
                <span>Đặt lịch sửa chữa ngay</span>
              </button>
              <Link 
                to={PATHS.CUSTOMER.ROOT} 
                className="btn-empty-back-home"
                title="Trở về trang chủ"
              >
                <Home size={15} />
                <span>Trở về trang chủ</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="orders-list">
            {orders.map((order) => {
              return (
                <div
                  key={order.id}
                  className="order-card"
                  onClick={() => setSelectedOrderId(order.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedOrderId(order.id);
                    }
                  }}
                >
                  {/* Left section: Avatar + Details */}
                  <div className="order-card-left">
                    {order.assignedProviderAvatar ? (
                      <img
                        src={order.assignedProviderAvatar}
                        alt={order.assignedProviderName}
                        className="order-provider-avatar"
                      />
                    ) : order.assignedProviderName ? (
                      <div className="order-provider-avatar-fallback">
                        {order.assignedProviderName.charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      <div className="order-provider-avatar-fallback pending">
                        <Wrench size={20} />
                      </div>
                    )}

                    <div className="order-details-stack">
                      {/* Title + Status Badge */}
                      <div className="order-title-row">
                        <h3 className="order-service-title">{order.title}</h3>
                        {getStatusBadge(order.status)}
                      </div>

                      {/* Provider Name + Order Code */}
                      <p className="order-provider-meta">
                        {order.categoryName ? `${order.categoryName} · ` : ''}
                        Mã đơn: <strong>{order.orderCode}</strong>
                        {order.assignedProviderName ? ` · Thợ: ${order.assignedProviderName}` : ''}
                      </p>

                      {/* Location & Time */}
                      <div className="order-meta-info-row">
                        <div className="meta-info-item">
                          <Calendar size={13} />
                          <span>
                            {new Date(order.expectedScheduleTime).toLocaleDateString('vi-VN')} {new Date(order.expectedScheduleTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="meta-info-item address-truncate">
                          <MapPin size={13} />
                          <span>{order.addressSnapshot}</span>
                        </div>
                      </div>

                      {/* Quotations Alert Badge if pending provider */}
                      {order.status === 'PENDING_PROVIDER' && order.quotationCount > 0 && (
                        <div className="quotation-received-pill">
                          <Bell size={12} />
                          <span>Đã nhận {order.quotationCount} báo giá từ các thợ — Bấm để so sánh</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right section: Price + Chevron */}
                  <div className="order-card-right">
                    <div className="order-price-group">
                      <span className="price-title">Giá dịch vụ:</span>
                      <span className="order-price-value">
                        {order.finalPrice ? `${order.finalPrice.toLocaleString('vi-VN')} đ` : 'Chờ báo giá'}
                      </span>
                    </div>
                    <ChevronRight size={20} className="order-chevron-icon" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          <Pagination
            currentPage={page}
            totalPages={pageInfo.totalPages}
            totalElements={pageInfo.totalElements}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            itemName="đơn hàng"
            disabled={loading}
          />
        </>
        )}
      </div>

      {/* Modal Tạo đơn mới */}
      {showCreateModal && (
        <CreateOrderModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            loadOrders();
          }}
        />
      )}

      {/* Modal Chi tiết đơn & Báo giá */}
      {selectedOrderId && (
        <CustomerOrderDetailModal
          orderId={selectedOrderId}
          isOpen={!!selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onOrderUpdated={loadOrders}
          onOpenChat={handleOpenChat}
        />
      )}

      {/* Khung Chat trao đổi báo giá */}
      {chatRequestId && (
        <OrderChatDrawer
          isOpen={!!chatRequestId}
          onClose={() => setChatRequestId(null)}
          requestId={chatRequestId}
          partnerName={chatPartnerName}
          partnerAvatar={chatPartnerAvatar}
          partnerHeadline={chatPartnerHeadline}
          quotedPrice={chatQuotedPrice}
          orderTitle={chatOrderTitle}
          currentUserRole="CUSTOMER"
        />
      )}
    </div>
  );
}

export default MyOrdersPage;
