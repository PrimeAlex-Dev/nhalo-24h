import { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  Eye, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  FileText
} from 'lucide-react';
import { OrderDetailModal } from '../components/OrderDetailModal';
import { ADMIN_MOCK_ORDERS } from '../data/adminMockData';
import type { AdminOrderItem, OrderFilterTab, OrderStatus } from '../types/admin';
import './AdminOrdersPage.css';

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderItem[]>(ADMIN_MOCK_ORDERS);
  const [activeTab, setActiveTab] = useState<OrderFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Tab counts
  const countAll = orders.length;
  const countBacklog = orders.filter((o) => o.backlogStatus !== 'normal').length;
  const countNew = orders.filter((o) => o.status === 'new').length;
  const countUnassigned = orders.filter((o) => o.status === 'unassigned').length;
  const countInProgress = orders.filter((o) => o.status === 'in_progress').length;
  const countCompleted = orders.filter((o) => o.status === 'completed').length;
  const countCancelled = orders.filter((o) => o.status === 'cancelled').length;

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Tab filter
      if (activeTab === 'backlog' && order.backlogStatus === 'normal') return false;
      if (activeTab === 'new' && order.status !== 'new') return false;
      if (activeTab === 'unassigned' && order.status !== 'unassigned') return false;
      if (activeTab === 'in_progress' && order.status !== 'in_progress') return false;
      if (activeTab === 'completed' && order.status !== 'completed') return false;
      if (activeTab === 'cancelled' && order.status !== 'cancelled') return false;

      // Category filter
      if (categoryFilter !== 'all' && order.category !== categoryFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchCode = order.code.toLowerCase().includes(query);
        const matchService = order.serviceName.toLowerCase().includes(query);
        const matchCustomer = order.customerName.toLowerCase().includes(query);
        const matchPhone = order.customerPhone.includes(query);
        const matchAddress = order.customerAddress.toLowerCase().includes(query);
        const matchProvider = order.providerName?.toLowerCase().includes(query) ?? false;
        if (!matchCode && !matchService && !matchCustomer && !matchPhone && !matchAddress && !matchProvider) {
          return false;
        }
      }

      return true;
    });
  }, [orders, activeTab, categoryFilter, searchQuery]);

  const handleOpenDetail = (order: AdminOrderItem) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleAssignProvider = (orderId: string, providerName: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              providerName,
              status: 'in_progress' as OrderStatus,
              backlogStatus: 'normal',
              backlogReason: undefined,
              timeline: [
                ...o.timeline,
                {
                  time: '11:30',
                  title: 'Admin điều phối thủ công',
                  description: `Đã giao cho thợ ${providerName}`,
                  status: 'current' as const,
                },
              ],
            }
          : o
      )
    );
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              providerName,
              status: 'in_progress',
              backlogStatus: 'normal',
              backlogReason: undefined,
            }
          : null
      );
    }
  };

  const handleCancelOrder = (orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'cancelled' as OrderStatus,
              notes: `${o.notes || ''} [Hủy bởi Admin: ${reason}]`,
              timeline: [
                ...o.timeline,
                {
                  time: '11:30',
                  title: 'Hủy đơn hàng',
                  description: reason,
                  status: 'done' as const,
                },
              ],
            }
          : o
      )
    );
  };

  const handleResolveBacklog = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              backlogStatus: 'normal',
              backlogReason: undefined,
            }
          : o
      )
    );
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              backlogStatus: 'normal',
              backlogReason: undefined,
            }
          : null
      );
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return <span className="order-chip chip-new">Mới tạo</span>;
      case 'unassigned':
        return <span className="order-chip chip-unassigned">Chờ thợ nhận</span>;
      case 'in_progress':
        return <span className="order-chip chip-progress">Đang thực hiện</span>;
      case 'completed':
        return <span className="order-chip chip-completed">Hoàn thành</span>;
      case 'cancelled':
        return <span className="order-chip chip-cancelled">Đã hủy</span>;
    }
  };

  return (
    <div className="admin-orders-page">
      {/* Header */}
      <div className="orders-page-header">
        <div>
          <h2 className="orders-page-title">
            03. Giám Sát & Điều Phối Đơn Hàng
          </h2>
          <p className="orders-page-sub">
            Theo dõi chi tiết các đơn mới, chờ thợ, đang làm, hoàn thành, bị hủy và phát hiện đơn tồn đọng
          </p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="orders-tab-bar">
        <button
          type="button"
          className={`orders-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Tất cả đơn ({countAll})
        </button>

        <button
          type="button"
          className={`orders-tab-btn tab-urgent ${activeTab === 'backlog' ? 'active' : ''}`}
          onClick={() => setActiveTab('backlog')}
        >
          <AlertTriangle size={15} /> Cần can thiệp ({countBacklog})
        </button>

        <button
          type="button"
          className={`orders-tab-btn ${activeTab === 'new' ? 'active' : ''}`}
          onClick={() => setActiveTab('new')}
        >
          Mới tạo ({countNew})
        </button>

        <button
          type="button"
          className={`orders-tab-btn ${activeTab === 'unassigned' ? 'active' : ''}`}
          onClick={() => setActiveTab('unassigned')}
        >
          Chờ thợ nhận ({countUnassigned})
        </button>

        <button
          type="button"
          className={`orders-tab-btn ${activeTab === 'in_progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('in_progress')}
        >
          Đang thực hiện ({countInProgress})
        </button>

        <button
          type="button"
          className={`orders-tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          <CheckCircle2 size={14} /> Hoàn thành ({countCompleted})
        </button>

        <button
          type="button"
          className={`orders-tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
          onClick={() => setActiveTab('cancelled')}
        >
          <XCircle size={14} /> Bị hủy ({countCancelled})
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="orders-toolbar">
        <div className="toolbar-search-wrap">
          <Search size={16} className="toolbar-search-icon" />
          <input
            type="text"
            className="toolbar-search-input"
            placeholder="Tìm theo mã đơn, khách hàng, SĐT, thợ, địa chỉ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="toolbar-filter-group">
          <div className="toolbar-select-wrap">
            <Filter size={14} className="toolbar-filter-icon" />
            <select
              className="toolbar-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Tất cả ngành dịch vụ</option>
              <option value="Sửa chữa điện nước">Sửa chữa điện nước</option>
              <option value="Điện lạnh">Điện lạnh</option>
              <option value="Sửa khóa & Cửa cuốn">Sửa khóa & Cửa cuốn</option>
              <option value="Điện dân dụng">Điện dân dụng</option>
              <option value="Điện tử gia dụng">Điện tử gia dụng</option>
            </select>
          </div>
        </div>
      </div>

      {/* Backlog Alert Notice in Page if activeTab is 'backlog' or has backlogs */}
      {activeTab === 'backlog' && (
        <div className="orders-backlog-callout">
          <AlertTriangle size={20} className="text-amber-600 flex-shrink-0" />
          <p className="callout-text">
            <strong>Khu vực giám sát tồn đọng:</strong> Các đơn hàng được cảnh báo tự động khi quá 30 phút phát sóng chưa có thợ nhận, hoặc đơn hàng đang xử lý vượt quá 2 giờ so với thời lượng thông thường. Admin có thể bấm "Chi tiết" để chỉ định thợ trực tiếp.
          </p>
        </div>
      )}

      {/* Orders Table */}
      <div className="orders-card-table-panel">
        <div className="orders-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã Đơn & Dịch Vụ</th>
                <th>Khách Hàng & Địa Chỉ</th>
                <th>Thợ Phụ Trách</th>
                <th>Lịch Hẹn / Tạo Lúc</th>
                <th>Trạng Thái</th>
                <th>Chi Phí</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    <FileText size={36} className="mx-auto mb-2 text-slate-300" />
                    Không tìm thấy đơn hàng nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr 
                    key={ord.id} 
                    className={ord.backlogStatus !== 'normal' ? 'row-backlog-highlight' : ''}
                  >
                    <td>
                      <div className="table-order-primary">
                        <span className="table-order-code">{ord.code}</span>
                        <span className="table-order-service">{ord.serviceName}</span>
                        <span className="table-category-label">{ord.category}</span>
                        {ord.backlogStatus !== 'normal' && (
                          <span className="table-backlog-tag" title={ord.backlogReason}>
                            <AlertTriangle size={12} /> {ord.backlogReason}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="table-customer-cell">
                        <span className="table-user-name">{ord.customerName}</span>
                        <span className="table-user-sub">{ord.customerPhone}</span>
                        <span className="table-address-sub" title={ord.customerAddress}>
                          {ord.customerAddress}
                        </span>
                      </div>
                    </td>

                    <td>
                      {ord.providerName ? (
                        <div className="table-provider-cell">
                          <span className="table-user-name">{ord.providerName}</span>
                          <span className="table-user-sub">{ord.providerPhone || 'Đối tác'}</span>
                        </div>
                      ) : (
                        <span className="table-unassigned-tag">
                          <Clock size={12} /> Chưa có thợ nhận
                        </span>
                      )}
                    </td>

                    <td>
                      <div className="table-time-cell">
                        <span className="table-scheduled-text">
                          <Calendar size={12} className="inline-icon" /> {ord.scheduledTime}
                        </span>
                        <span className="table-time-text">{ord.createdAt}</span>
                      </div>
                    </td>

                    <td>
                      <div className="table-status-cell">
                        {getStatusBadge(ord.status)}
                      </div>
                    </td>

                    <td>
                      <div className="table-price-cell">
                        <span className="table-price-text">
                          {ord.price.toLocaleString('vi-VN')} đ
                        </span>
                        <span className="table-payment-sub">
                          {ord.paymentMethod === 'vnpay' ? 'VNPay' : ord.paymentMethod === 'wallet' ? 'Ví điện tử' : 'Tiền mặt'}
                        </span>
                      </div>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="btn-table-inspect"
                        onClick={() => handleOpenDetail(ord)}
                        title="Bấm để xem chi tiết đầy đủ"
                      >
                        <Eye size={14} /> Chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAssignProvider={handleAssignProvider}
        onCancelOrder={handleCancelOrder}
        onResolveBacklog={handleResolveBacklog}
      />
    </div>
  );
}
