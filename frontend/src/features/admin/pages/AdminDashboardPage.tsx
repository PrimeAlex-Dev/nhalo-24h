import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Eye, 
  ShieldCheck, 
  Wrench, 
  Activity,
  Filter
} from 'lucide-react';
import { AdminKpiCards } from '../components/AdminKpiCards';
import { OrderDetailModal } from '../components/OrderDetailModal';
import { UserDetailModal } from '../components/UserDetailModal';
import { 
  ADMIN_KPI_METRICS, 
  ADMIN_MOCK_ORDERS 
} from '../data/adminMockData';
import { userService } from '../../../services';
import type { AdminOrderItem, AdminUserItem, OrderStatus } from '../types/admin';
import { PATHS } from '../../../routes/paths';
import './AdminDashboardPage.css';

export function AdminDashboardPage() {
  const navigate = useNavigate();

  // State management
  const [orders, setOrders] = useState<AdminOrderItem[]>(ADMIN_MOCK_ORDERS);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderItem | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [orderQuickFilter, setOrderQuickFilter] = useState<'all' | 'backlog'>('all');

  useEffect(() => {
    userService.getUsers({ size: 10 }).then((res) => {
      setUsers(res.content);
    }).catch(() => {
      // Backend not running or error, keep empty
    });
  }, []);

  // Filter pending/disabled providers for the approval widget
  const pendingProviders = users.filter(
    (u) => u.role === 'PROVIDER' && u.status === 'DISABLED'
  );

  // Filter backlogged orders
  const backlogOrders = orders.filter((o) => o.backlogStatus !== 'normal');

  // Display orders based on quick filter
  const displayedOrders = orderQuickFilter === 'backlog' ? backlogOrders : orders;

  // Handlers for modal interactions
  const handleOpenOrderDetail = (order: AdminOrderItem) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleOpenUserDetail = (user: AdminUserItem) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleApproveProvider = (userId: string) => {
    userService.updateUserStatus(userId, { status: 'ACTIVE' }).then((updated) => {
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      if (selectedUser?.id === userId) {
        setSelectedUser(updated);
      }
    }).catch(() => {});
  };

  const handleToggleUserStatus = async (userId: string, newStatus: AdminUserItem['status']) => {
    try {
      const updated = await userService.updateUserStatus(userId, { status: newStatus });
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      if (selectedUser?.id === userId) {
        setSelectedUser(updated);
      }
    } catch {
      // ignore
    }
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
                  time: '11:28',
                  title: 'Admin điều phối thủ công',
                  description: `Đã gán trực tiếp cho thợ ${providerName}`,
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
              notes: `${o.notes || ''} [Hủy: ${reason}]`,
              timeline: [
                ...o.timeline,
                {
                  time: '11:28',
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

  const getOrderStatusBadge = (status: OrderStatus) => {
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
    <div className="admin-dashboard-page">
      {/* 01. Thẻ thống kê tổng quan (KPI Cards) */}
      <section className="dashboard-section" aria-labelledby="kpi-heading">
        <div className="section-title-row">
          <div>
            <h2 id="kpi-heading" className="section-heading">
              01. Thống Kê Tổng Quan Hệ Thống (KPI Cards)
            </h2>
            <p className="section-subheading">
              Chỉ số sức khỏe vận hành trực quan được cập nhật theo thời gian thực
            </p>
          </div>
          <span className="live-indicator-tag">
            <span className="live-dot" /> Dữ liệu trực tuyến
          </span>
        </div>

        <AdminKpiCards 
          metrics={ADMIN_KPI_METRICS} 
          onCardClick={(metricId) => {
            if (metricId === 'pending-approvals') {
              navigate(PATHS.ADMIN.USERS);
            } else if (metricId === 'in-progress-orders' || metricId === 'total-orders') {
              navigate(PATHS.ADMIN.ORDERS);
            } else if (metricId === 'total-customers' || metricId === 'total-providers') {
              navigate(PATHS.ADMIN.USERS);
            }
          }}
        />
      </section>

      {/* Critical Backlog Alert Banner */}
      {backlogOrders.length > 0 && (
        <div className="dashboard-alert-banner">
          <div className="banner-left">
            <div className="banner-icon-circle">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="banner-title">
                Phát hiện {backlogOrders.length} đơn hàng tồn đọng cần Admin can thiệp gấp!
              </h3>
              <p className="banner-desc">
                Các đơn hàng này đã quá 30 phút chưa có thợ nhận hoặc thi công kéo dài bất thường.
              </p>
            </div>
          </div>
          <div className="banner-actions">
            <button
              type="button"
              className="btn-banner-action"
              onClick={() => setOrderQuickFilter(orderQuickFilter === 'backlog' ? 'all' : 'backlog')}
            >
              <Filter size={15} />
              {orderQuickFilter === 'backlog' ? 'Xem tất cả đơn' : 'Lọc đơn tồn đọng'}
            </button>
            <button
              type="button"
              className="btn-banner-primary"
              onClick={() => navigate(PATHS.ADMIN.ORDERS)}
            >
              Tới trang đơn hàng <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Orders Oversight & Pending Approvals */}
      <div className="dashboard-main-grid">
        {/* Left Column: Tình hình đơn hàng */}
        <div className="dashboard-col-orders">
          <div className="dashboard-panel">
            <div className="panel-header">
              <div className="panel-title-wrap">
                <h3 className="panel-title">
                  <Activity size={18} className="text-primary inline-icon" /> Tình Hình Đơn Hàng Gần Đây
                </h3>
                <span className="panel-badge-count">
                  {displayedOrders.length} đơn
                </span>
              </div>

              <div className="panel-actions">
                <button
                  type="button"
                  className={`panel-filter-btn ${orderQuickFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setOrderQuickFilter('all')}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  className={`panel-filter-btn warning-tab ${orderQuickFilter === 'backlog' ? 'active' : ''}`}
                  onClick={() => setOrderQuickFilter('backlog')}
                >
                  Cần can thiệp ({backlogOrders.length})
                </button>
                <button
                  type="button"
                  className="panel-view-all-link"
                  onClick={() => navigate(PATHS.ADMIN.ORDERS)}
                >
                  Quản lý đơn <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Order status overview metric bar */}
            <div className="order-status-bar">
              <div className="status-bar-pill pill-new">
                <span className="bar-count">1</span>
                <span className="bar-label">Mới tạo</span>
              </div>
              <div className="status-bar-pill pill-unassigned">
                <span className="bar-count">2</span>
                <span className="bar-label">Chờ thợ</span>
              </div>
              <div className="status-bar-pill pill-progress">
                <span className="bar-count">2</span>
                <span className="bar-label">Đang làm</span>
              </div>
              <div className="status-bar-pill pill-completed">
                <span className="bar-count">1</span>
                <span className="bar-label">Hoàn thành</span>
              </div>
              <div className="status-bar-pill pill-cancelled">
                <span className="bar-count">1</span>
                <span className="bar-label">Đã hủy</span>
              </div>
            </div>

            {/* Orders Table */}
            <div className="orders-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Mã Đơn & Dịch Vụ</th>
                    <th>Khách Hàng</th>
                    <th>Thợ Phụ Trách</th>
                    <th>Trạng Thái</th>
                    <th>Chi Phí</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedOrders.map((ord) => (
                    <tr 
                      key={ord.id} 
                      className={ord.backlogStatus !== 'normal' ? 'row-backlog-highlight' : ''}
                    >
                      <td>
                        <div className="table-order-primary">
                          <span className="table-order-code">{ord.code}</span>
                          <span className="table-order-service">{ord.serviceName}</span>
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
                        </div>
                      </td>
                      <td>
                        {ord.providerName ? (
                          <div className="table-provider-cell">
                            <span className="table-user-name">{ord.providerName}</span>
                            <span className="table-user-sub">Đã tiếp nhận</span>
                          </div>
                        ) : (
                          <span className="table-unassigned-tag">
                            <Clock size={12} /> Chưa có thợ
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="table-status-cell">
                          {getOrderStatusBadge(ord.status)}
                          <span className="table-time-text">{ord.createdAt}</span>
                        </div>
                      </td>
                      <td>
                        <span className="table-price-text">
                          {ord.price.toLocaleString('vi-VN')} đ
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-table-inspect"
                          onClick={() => handleOpenOrderDetail(ord)}
                          title="Bấm để xem chi tiết và can thiệp"
                        >
                          <Eye size={14} /> Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Hồ sơ thợ chờ duyệt & Quick Admin Summary */}
        <div className="dashboard-col-side">
          {/* Hồ sơ thợ chờ duyệt widget */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <div className="panel-title-wrap">
                <h3 className="panel-title">
                  <ShieldCheck size={18} className="text-emerald-600 inline-icon" /> 
                  Hồ Sơ Thợ Chờ Duyệt
                </h3>
                <span className="panel-badge-count badge-warning">
                  {pendingProviders.length} mới
                </span>
              </div>
              <button
                type="button"
                className="panel-view-all-link"
                onClick={() => navigate(PATHS.ADMIN.USERS)}
              >
                Tất cả <ArrowRight size={14} />
              </button>
            </div>

            <div className="pending-providers-list">
              {pendingProviders.length === 0 ? (
                <div className="empty-pending-state">
                  <CheckCircle2 size={32} className="text-emerald-500" />
                  <p>Không có hồ sơ nào đang chờ duyệt.</p>
                </div>
              ) : (
                pendingProviders.map((prov) => (
                  <div key={prov.id} className="pending-provider-card">
                    <div className="pending-avatar-placeholder">
                      {prov.fullName ? prov.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="pending-info">
                      <h4 className="pending-name">{prov.fullName}</h4>
                      <span className="pending-prof">
                        <Wrench size={13} /> {prov.phone || prov.email}
                      </span>
                      <span className="pending-date">
                        Đăng ký: {new Date(prov.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="pending-card-actions">
                      <button
                        type="button"
                        className="btn-approve-quick"
                        onClick={() => handleApproveProvider(prov.id)}
                        title="Duyệt nhanh hồ sơ này"
                      >
                        Duyệt
                      </button>
                      <button
                        type="button"
                        className="btn-inspect-quick"
                        onClick={() => handleOpenUserDetail(prov)}
                        title="Xem chi tiết CCCD & Kinh nghiệm"
                      >
                        Xem
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick System Health summary */}
          <div className="dashboard-panel mt-4">
            <div className="panel-header">
              <h3 className="panel-title">
                Chỉ Số Chất Lượng Vận Hành
              </h3>
            </div>
            <div className="system-health-list">
              <div className="health-item">
                <div className="health-label-row">
                  <span>Thời gian tiếp nhận trung bình</span>
                  <strong className="text-emerald-600">4.2 phút</strong>
                </div>
                <div className="health-progress-bg">
                  <div className="health-progress-bar bg-emerald-500" style={{ width: '85%' }} />
                </div>
              </div>

              <div className="health-item">
                <div className="health-label-row">
                  <span>Tỷ lệ hoàn thành đúng hạn</span>
                  <strong className="text-blue-600">96.8%</strong>
                </div>
                <div className="health-progress-bg">
                  <div className="health-progress-bar bg-blue-500" style={{ width: '96.8%' }} />
                </div>
              </div>

              <div className="health-item">
                <div className="health-label-row">
                  <span>Đánh giá hài lòng khách hàng</span>
                  <strong className="text-amber-600">4.9 / 5.0 ⭐</strong>
                </div>
                <div className="health-progress-bg">
                  <div className="health-progress-bar bg-amber-500" style={{ width: '98%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Modals */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onAssignProvider={handleAssignProvider}
        onCancelOrder={handleCancelOrder}
        onResolveBacklog={handleResolveBacklog}
      />

      <UserDetailModal
        user={selectedUser}
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onApproveUser={handleApproveProvider}
        onToggleStatus={handleToggleUserStatus}
      />
    </div>
  );
}
