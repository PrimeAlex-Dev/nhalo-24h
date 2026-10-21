import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Eye, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  FileText,
  RefreshCw,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { OrderDetailModal, type GenericOrderItem } from '../components/OrderDetailModal';
import { categoryService, adminOrderService } from '../../../services';
import type { AdminCategoryItem } from '../types/admin';
import type { CustomerOrderSummary, OrderStatus } from '../../../types/order';
import { PATHS } from '../../../routes/paths';
import './AdminOrdersPage.css';

type OrderTabType = 'ALL' | 'PENDING_PROVIDER' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';

export function AdminOrdersPage() {
  const navigate = useNavigate();

  // State
  const [orders, setOrders] = useState<CustomerOrderSummary[]>([]);
  const [categories, setCategories] = useState<AdminCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<OrderTabType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<GenericOrderItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch active categories from backend to populate filter dropdown
  useEffect(() => {
    categoryService.getCategories({ status: 'ACTIVE', size: 100 })
      .then((res) => {
        setCategories(res.content);
      })
      .catch(() => {
        // Fallback if backend offline
      });
  }, []);

  // Fetch orders from backend
  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await adminOrderService.getOrders({
        status: activeTab === 'ALL' ? undefined : activeTab,
        categoryId: categoryFilter === 'all' ? undefined : categoryFilter,
        search: searchQuery.trim() || undefined,
      });
      setOrders(data);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [activeTab, categoryFilter, searchQuery]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Tab counts
  const countAll = orders.length;
  const countPending = orders.filter((o) => o.status === 'PENDING_PROVIDER').length;
  const countInProgress = orders.filter((o) => o.status === 'IN_PROGRESS').length;
  const countCompleted = orders.filter((o) => o.status === 'COMPLETED').length;
  const countCanceled = orders.filter((o) => o.status === 'CANCELED').length;

  // Filtered orders for client-side search refinements
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Tab filter
      if (activeTab !== 'ALL' && order.status !== activeTab) {
        return false;
      }

      // Category filter (by category name or ID)
      if (categoryFilter !== 'all') {
        const matchesCat = order.categoryId === categoryFilter || order.categoryName?.toLowerCase() === categoryFilter.toLowerCase();
        if (!matchesCat) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = order.orderCode.toLowerCase().includes(q);
        const matchTitle = order.title.toLowerCase().includes(q);
        const matchAddress = order.addressSnapshot?.toLowerCase().includes(q) ?? false;
        const matchProvider = order.assignedProviderName?.toLowerCase().includes(q) ?? false;
        if (!matchCode && !matchTitle && !matchAddress && !matchProvider) {
          return false;
        }
      }

      return true;
    });
  }, [orders, activeTab, categoryFilter, searchQuery]);

  const handleOpenDetail = async (order: CustomerOrderSummary) => {
    setSelectedOrder(order as unknown as GenericOrderItem);
    setIsModalOpen(true);
    try {
      const detail = await adminOrderService.getOrderDetail(order.id);
      if (detail) {
        setSelectedOrder(detail as unknown as GenericOrderItem);
      }
    } catch {
      // Keep summary view if error
    }
  };

  const getStatusBadge = (status: OrderStatus | string) => {
    switch (status) {
      case 'PENDING_PROVIDER':
        return <span className="order-chip chip-unassigned">Chờ thợ nhận việc</span>;
      case 'IN_PROGRESS':
        return <span className="order-chip chip-progress">Đang thực hiện</span>;
      case 'COMPLETED':
        return <span className="order-chip chip-completed">Hoàn thành</span>;
      case 'CANCELED':
        return <span className="order-chip chip-cancelled">Đã hủy</span>;
      default:
        return <span className="order-chip chip-unassigned">{status}</span>;
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
            Theo dõi tiến độ, tình trạng tiếp nhận đơn và kết nối đối tác thợ kỹ thuật trên toàn hệ thống
          </p>
        </div>
        <div className="orders-header-actions">
          <button
            type="button"
            className={`btn-refresh-orders ${isRefreshing ? 'is-spinning' : ''}`}
            onClick={() => fetchOrders(true)}
            title="Làm mới danh sách đơn từ backend"
          >
            <RefreshCw size={14} /> Làm mới
          </button>
        </div>
      </div>

      {/* Tabs navigation matching backend OrderStatus */}
      <div className="orders-tab-bar">
        <button
          type="button"
          className={`orders-tab-btn ${activeTab === 'ALL' ? 'active' : ''}`}
          onClick={() => setActiveTab('ALL')}
        >
          Tất cả đơn ({countAll})
        </button>

        <button
          type="button"
          className={`orders-tab-btn ${activeTab === 'PENDING_PROVIDER' ? 'active' : ''}`}
          onClick={() => setActiveTab('PENDING_PROVIDER')}
        >
          <Clock size={14} /> Chờ thợ nhận việc ({countPending})
        </button>

        <button
          type="button"
          className={`orders-tab-btn ${activeTab === 'IN_PROGRESS' ? 'active' : ''}`}
          onClick={() => setActiveTab('IN_PROGRESS')}
        >
          Đang thực hiện ({countInProgress})
        </button>

        <button
          type="button"
          className={`orders-tab-btn ${activeTab === 'COMPLETED' ? 'active' : ''}`}
          onClick={() => setActiveTab('COMPLETED')}
        >
          <CheckCircle2 size={14} /> Hoàn thành ({countCompleted})
        </button>

        <button
          type="button"
          className={`orders-tab-btn ${activeTab === 'CANCELED' ? 'active' : ''}`}
          onClick={() => setActiveTab('CANCELED')}
        >
          <XCircle size={14} /> Đã hủy ({countCanceled})
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="orders-toolbar">
        <div className="toolbar-search-wrap">
          <Search size={16} className="toolbar-search-icon" />
          <input
            type="text"
            className="toolbar-search-input"
            placeholder="Tìm theo mã đơn, tiêu đề dịch vụ, địa chỉ, thợ phụ trách..."
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
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Order Status Overview Bar */}
      <div className="order-status-bar">
        <div className="status-bar-pill pill-unassigned">
          <span className="bar-count">{countPending}</span>
          <span className="bar-label">Chờ thợ nhận</span>
        </div>
        <div className="status-bar-pill pill-progress">
          <span className="bar-count">{countInProgress}</span>
          <span className="bar-label">Đang thực hiện</span>
        </div>
        <div className="status-bar-pill pill-completed">
          <span className="bar-count">{countCompleted}</span>
          <span className="bar-label">Hoàn thành</span>
        </div>
        <div className="status-bar-pill pill-cancelled">
          <span className="bar-count">{countCanceled}</span>
          <span className="bar-label">Đã hủy</span>
        </div>
      </div>

      {/* Architecture & Operational Notice Callout */}
      <div className="orders-info-callout">
        <Info size={20} className="text-blue-600 flex-shrink-0" />
        <p className="callout-info-text">
          <strong>Cơ chế điều phối đơn hàng P2P:</strong> Trên nền tảng Nhà Lo 24h, yêu cầu dịch vụ được kết nối trực tiếp giữa Khách hàng và Thợ kỹ thuật đối tác theo quy trình tự động: Khách tạo yêu cầu &rarr; Phát tín hiệu tới thợ khu vực &rarr; Thợ gửi báo giá &rarr; Khách chọn thợ &rarr; Tiến hành công việc. Khi có đơn hàng phát sinh, hệ thống sẽ tự động cập nhật danh sách tại đây.
        </p>
      </div>

      {/* Orders Table Panel */}
      <div className="orders-card-table-panel">
        <div className="orders-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã Đơn & Dịch Vụ</th>
                <th>Địa Chỉ & Yêu Cầu</th>
                <th>Thợ Phụ Trách</th>
                <th>Lịch Hẹn / Tạo Lúc</th>
                <th>Trạng Thái</th>
                <th>Chi Phí / Báo Giá</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <RefreshCw size={28} className="mx-auto mb-2 is-spinning text-primary" />
                    Đang đồng bộ dữ liệu đơn hàng từ Backend...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    <div className="orders-empty-state-box">
                      <FileText size={44} className="mx-auto mb-3 text-slate-300" />
                      <h4 className="empty-state-title">
                        Chưa có đơn hàng nào cần quản trị viên can thiệp
                      </h4>
                      <p className="empty-state-sub">
                        {categoryFilter !== 'all' || searchQuery.trim() || activeTab !== 'ALL'
                          ? 'Không tìm thấy đơn hàng nào phù hợp với bộ lọc hiện tại.'
                          : 'Hiện tại chưa có đơn hàng nào phát sinh trên hệ thống hoặc endpoint giám sát tập trung đang được chuẩn bị.'}
                      </p>
                      <div className="empty-actions-row">
                        <button
                          type="button"
                          className="btn-empty-action"
                          onClick={() => navigate(PATHS.ADMIN.SERVICES)}
                        >
                          <Layers size={14} /> Danh mục dịch vụ
                        </button>
                        <button
                          type="button"
                          className="btn-empty-action"
                          onClick={() => navigate(PATHS.ADMIN.USERS)}
                        >
                          Quản lý đối tác thợ <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id}>
                    <td>
                      <div className="table-order-primary">
                        <span className="table-order-code">{ord.orderCode}</span>
                        <span className="table-order-service">{ord.title}</span>
                        {ord.categoryName && (
                          <span className="table-category-label">{ord.categoryName}</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="table-customer-cell">
                        <span className="table-user-name font-semibold">{ord.contactName || 'Khách hàng'}</span>
                        {ord.contactPhone && (
                          <span className="table-user-sub">{ord.contactPhone}</span>
                        )}
                        <span className="table-address-sub" title={ord.addressSnapshot}>
                          {ord.addressSnapshot || 'Địa chỉ liên hệ tại nhà'}
                        </span>
                        {ord.quotationCount > 0 && (
                          <span className="text-xs text-blue-600 font-medium">
                            {ord.quotationCount} báo giá từ thợ
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      {ord.assignedProviderName ? (
                        <div className="table-provider-cell">
                          <span className="table-user-name">{ord.assignedProviderName}</span>
                          <span className="table-user-sub">Đã nhận việc</span>
                        </div>
                      ) : (
                        <span className="table-unassigned-tag">
                          <Clock size={12} /> Chờ thợ nhận việc
                        </span>
                      )}
                    </td>

                    <td>
                      <div className="table-time-cell">
                        <span className="table-scheduled-text">
                          <Calendar size={12} className="inline-icon" /> {ord.expectedScheduleTime || 'Thỏa thuận'}
                        </span>
                        <span className="table-time-text">
                          {new Date(ord.createdAt).toLocaleDateString('vi-VN')}
                        </span>
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
                          {ord.finalPrice 
                            ? `${ord.finalPrice.toLocaleString('vi-VN')} đ` 
                            : 'Chờ báo giá'}
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

      {/* Modal Detail */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
