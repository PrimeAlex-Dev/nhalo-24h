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
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { OrderDetailModal, type GenericOrderItem } from '../components/OrderDetailModal';
import { Pagination } from '../../../components/common/Pagination';
import { categoryService, adminOrderService } from '../../../services';
import type { AdminCategoryItem } from '../types/admin';
import type {
  CustomerOrderSummary,
  OrderStatus,
  ResolveDisputePayload,
  AdjustInvoicePayload,
  DismissAbnormalFlagPayload
} from '../../../types/order';
import { PATHS } from '../../../routes/paths';
import './AdminOrdersPage.css';

type OrderTabType =
  | 'ALL'
  | 'PENDING_PROVIDER'
  | 'AWAITING_SURVEY'
  | 'AWAITING_CUSTOMER_APPROVAL'
  | 'IN_PROGRESS'
  | 'AWAITING_COMPLETION_CONFIRMATION'
  | 'COMPLETED'
  | 'CANCELED';

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

  // Pagination State (10 items per page)
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [pageInfo, setPageInfo] = useState({ totalPages: 0, totalElements: 0 });

  useEffect(() => {
    categoryService.getCategories({ status: 'ACTIVE', size: 100 })
      .then((res) => {
        setCategories(res.content);
      })
      .catch(() => {});
  }, []);

  const fetchOrders = useCallback(async (isRefresh = false, pageIndex = page) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await adminOrderService.getOrders({
        status: activeTab === 'ALL' ? undefined : activeTab,
        categoryId: categoryFilter === 'all' ? undefined : categoryFilter,
        search: searchQuery.trim() || undefined,
        page: pageIndex,
        size: pageSize,
      });
      setOrders(res.content);
      setPageInfo({
        totalPages: res.totalPages,
        totalElements: res.totalElements,
      });
    } catch {
      setOrders([]);
      setPageInfo({ totalPages: 0, totalElements: 0 });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [activeTab, categoryFilter, searchQuery, page, pageSize]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleTabChange = (tab: OrderTabType) => {
    setActiveTab(tab);
    setPage(0);
  };

  const handleCategoryChange = (catId: string) => {
    setCategoryFilter(catId);
    setPage(0);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Status overview counts for current view
  const countPending = orders.filter((o) => o.status === 'PENDING_PROVIDER').length;
  const countInProgress = orders.filter((o) =>
    ['AWAITING_SURVEY', 'AWAITING_CUSTOMER_APPROVAL', 'IN_PROGRESS', 'AWAITING_COMPLETION_CONFIRMATION'].includes(o.status)
  ).length;
  const countCompleted = orders.filter((o) => o.status === 'COMPLETED' || o.status === 'DECLINED_AFTER_SURVEY').length;
  const countCanceled = orders.filter((o) => o.status === 'CANCELED').length;

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (activeTab !== 'ALL' && order.status !== activeTab) {
        return false;
      }

      if (categoryFilter !== 'all') {
        const matchesCat = order.categoryId === categoryFilter || order.categoryName?.toLowerCase() === categoryFilter.toLowerCase();
        if (!matchesCat) return false;
      }

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

  const handleResolveDispute = async (orderId: string, payload: ResolveDisputePayload) => {
    const updated = await adminOrderService.resolvePaymentDispute(orderId, payload);
    if (updated) {
      setSelectedOrder(updated as unknown as GenericOrderItem);
    }
    fetchOrders(true);
  };

  const handleAdjustInvoice = async (orderId: string, payload: AdjustInvoicePayload) => {
    const updated = await adminOrderService.adjustInvoice(orderId, payload);
    if (updated) {
      setSelectedOrder(updated as unknown as GenericOrderItem);
    }
    fetchOrders(true);
  };

  const handleDismissAbnormalFlag = async (orderId: string, payload: DismissAbnormalFlagPayload) => {
    const updated = await adminOrderService.dismissAbnormalFlag(orderId, payload);
    if (updated) {
      setSelectedOrder(updated as unknown as GenericOrderItem);
    }
    fetchOrders(true);
  };

  const getStatusBadge = (status: OrderStatus | string) => {
    switch (status) {
      case 'PENDING_PROVIDER':
        return <span className="order-chip chip-unassigned">Chờ thợ báo giá</span>;
      case 'AWAITING_SURVEY':
        return <span className="order-chip chip-progress">Chờ khảo sát</span>;
      case 'AWAITING_CUSTOMER_APPROVAL':
        return <span className="order-chip chip-unassigned">Chờ khách duyệt giá KS</span>;
      case 'IN_PROGRESS':
        return <span className="order-chip chip-progress">Đang thực hiện</span>;
      case 'AWAITING_COMPLETION_CONFIRMATION':
        return <span className="order-chip chip-progress">Chờ nghiệm thu & TT</span>;
      case 'DECLINED_AFTER_SURVEY':
        return <span className="order-chip chip-cancelled">Dừng sau khảo sát</span>;
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
            03. Giám Sát Đơn Hàng, Đối Soát Thanh Toán & Hoa Hồng
          </h2>
          <p className="orders-page-sub">
            Theo dõi toàn bộ quy trình Khảo sát - Báo giá 3 nhóm chi phí - Nghiệm thu - Thanh toán Online/Tiền mặt và Hoa hồng nền tảng
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
      <div className="orders-tab-bar" style={{ flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`orders-tab-btn ${activeTab === 'ALL' ? 'active' : ''}`}
          onClick={() => handleTabChange('ALL')}
        >
          Tất cả đơn {activeTab === 'ALL' && pageInfo.totalElements > 0 ? `(${pageInfo.totalElements})` : ''}
        </button>

        <button
          type="button"
          className={`orders-tab-btn ${activeTab === 'PENDING_PROVIDER' ? 'active' : ''}`}
          onClick={() => handleTabChange('PENDING_PROVIDER')}
        >
          <Clock size={14} /> Chờ báo giá
        </button>

        <button
          type="button"
          className={`orders-tab-btn ${activeTab === 'AWAITING_SURVEY' ? 'active' : ''}`}
          onClick={() => handleTabChange('AWAITING_SURVEY')}
        >
          Chờ khảo sát
        </button>

        <button
          type="button"
          className={`orders-tab-btn ${activeTab === 'AWAITING_CUSTOMER_APPROVAL' ? 'active' : ''}`}
          onClick={() => handleTabChange('AWAITING_CUSTOMER_APPROVAL')}
        >
          Chờ duyệt giá KS
        </button>

        <button
          type="button"
          className={`orders-tab-btn ${activeTab === 'IN_PROGRESS' ? 'active' : ''}`}
          onClick={() => handleTabChange('IN_PROGRESS')}
        >
          Đang thi công
        </button>

        <button
          type="button"
          className={`orders-tab-btn ${activeTab === 'AWAITING_COMPLETION_CONFIRMATION' ? 'active' : ''}`}
          onClick={() => handleTabChange('AWAITING_COMPLETION_CONFIRMATION')}
        >
          Chờ nghiệm thu & TT
        </button>

        <button
          type="button"
          className={`orders-tab-btn ${activeTab === 'COMPLETED' ? 'active' : ''}`}
          onClick={() => handleTabChange('COMPLETED')}
        >
          <CheckCircle2 size={14} /> Hoàn thành
        </button>

        <button
          type="button"
          className={`orders-tab-btn ${activeTab === 'CANCELED' ? 'active' : ''}`}
          onClick={() => handleTabChange('CANCELED')}
        >
          <XCircle size={14} /> Đã hủy
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
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div className="toolbar-filter-group">
          <div className="toolbar-select-wrap">
            <Filter size={14} className="toolbar-filter-icon" />
            <select
              className="toolbar-select"
              value={categoryFilter}
              onChange={(e) => handleCategoryChange(e.target.value)}
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
          <span className="bar-label">Chờ báo giá</span>
        </div>
        <div className="status-bar-pill pill-progress">
          <span className="bar-count">{countInProgress}</span>
          <span className="bar-label">Đang xử lý (KS / Thi công / TT)</span>
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
          <strong>Cơ chế giám sát 3 nhóm chi phí & Bảo vệ hoa hồng 4 lớp:</strong> Mọi đơn hàng đều lưu lịch sử phiên bản báo giá (Báo giá dự kiến &rarr; Báo giá chốt sau khảo sát &rarr; Phát sinh vật tư). Hoa hồng nền tảng (10%) chỉ tính trên Tiền công thực tế. Các đơn thanh toán tiền mặt lệch hóa đơn hoặc có biến động giá bất thường sẽ gắn cờ cảnh báo để Admin đối soát.
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
                <th>Trạng Thái Công Việc & TT</th>
                <th>Chi Phí & Hoa Hồng</th>
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
                        Chưa có đơn hàng nào trong danh sách này
                      </h4>
                      <p className="empty-state-sub">
                        {categoryFilter !== 'all' || searchQuery.trim() || activeTab !== 'ALL'
                          ? 'Không tìm thấy đơn hàng nào phù hợp với bộ lọc hiện tại.'
                          : 'Hiện tại chưa có đơn hàng nào phát sinh trên hệ thống.'}
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
                          <span className="table-user-sub">
                            {ord.workflowMode === 'COMMITTED_FIXED' ? 'Gói cố định' : 'Khảo sát thực tế'}
                          </span>
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
                      <div className="table-status-cell" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {getStatusBadge(ord.status)}
                        {ord.paymentStatus && (
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: ord.paymentStatus === 'PAYMENT_DISPUTED' ? '#dc2626' : '#475569'
                          }}>
                            TT: {ord.paymentStatus}
                          </span>
                        )}
                        {(ord.isFlaggedAbnormal || ord.paymentStatus === 'PAYMENT_DISPUTED') && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: '#b91c1c',
                            background: '#fef2f2',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            <AlertTriangle size={11} /> Cần đối soát
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="table-price-cell" style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                        <span className="table-price-text">
                          {ord.finalPrice !== undefined && ord.finalPrice !== null
                            ? `${ord.finalPrice.toLocaleString('vi-VN')} đ` 
                            : 'Chờ báo giá'}
                        </span>
                        {ord.commissionAmount !== undefined && ord.commissionAmount > 0 && (
                          <span style={{ fontSize: '0.73rem', color: '#0f766e', fontWeight: 600 }}>
                            HH: {ord.commissionAmount.toLocaleString('vi-VN')} đ
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="btn-table-inspect"
                        onClick={() => handleOpenDetail(ord)}
                        title="Xem chi tiết đơn hàng & đối soát"
                        aria-label="Xem chi tiết đơn hàng"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
      </div>

      {/* Modal Detail */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onResolveDispute={handleResolveDispute}
        onAdjustInvoice={handleAdjustInvoice}
        onDismissAbnormalFlag={handleDismissAbnormalFlag}
      />
    </div>
  );
}
