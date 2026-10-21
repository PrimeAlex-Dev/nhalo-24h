import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle2, 
  Eye, 
  ShieldCheck, 
  Wrench, 
  Activity,
  Layers,
  RefreshCw,
  ShieldAlert
} from 'lucide-react';
import { AdminKpiCards } from '../components/AdminKpiCards';
import { UserDetailModal } from '../components/UserDetailModal';
import { 
  userService, 
  categoryService, 
  providerProfileService,
  adminOrderService,
  request 
} from '../../../services';
import type { AdminKpiMetric, AdminUserItem, UserRole } from '../types/admin';
import { PATHS } from '../../../routes/paths';
import './AdminDashboardPage.css';

export function AdminDashboardPage() {
  const navigate = useNavigate();

  // State management
  const [metrics, setMetrics] = useState<AdminKpiMetric[]>([]);
  const [recentUsers, setRecentUsers] = useState<AdminUserItem[]>([]);
  const [pendingProviders, setPendingProviders] = useState<AdminUserItem[]>([]);
  const [activeCategoriesCount, setActiveCategoriesCount] = useState<number>(0);
  const [totalCategoriesCount, setTotalCategoriesCount] = useState<number>(0);
  const [activeProvidersCount, setActiveProvidersCount] = useState<number>(0);
  const [totalProvidersCount, setTotalProvidersCount] = useState<number>(0);
  const [availableProvidersCount, setAvailableProvidersCount] = useState<number>(0);
  const [systemHealth, setSystemHealth] = useState<'UP' | 'DOWN' | 'CHECKING'>('CHECKING');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userQuickFilter, setUserQuickFilter] = useState<'all' | 'CUSTOMER' | 'PROVIDER'>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Fetch real data from backend
  const loadDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [
        customersTotalRes,
        customersActiveRes,
        providersTotalRes,
        providersActiveRes,
        pendingProvidersRes,
        categoriesTotalRes,
        categoriesActiveRes,
        publicProvidersRes,
        recentUsersRes,
        healthRes,
        ordersRes,
      ] = await Promise.allSettled([
        userService.getUsers({ role: 'CUSTOMER', size: 1 }),
        userService.getUsers({ role: 'CUSTOMER', status: 'ACTIVE', size: 1 }),
        userService.getUsers({ role: 'PROVIDER', size: 1 }),
        userService.getUsers({ role: 'PROVIDER', status: 'ACTIVE', size: 1 }),
        userService.getUsers({ role: 'PROVIDER', status: 'DISABLED', size: 10 }),
        categoryService.getCategories({ size: 1 }),
        categoryService.getCategories({ status: 'ACTIVE', size: 1 }),
        providerProfileService.getPublicProviders(),
        userService.getUsers({ size: 8, sort: 'createdAt,desc' }),
        request<{ status: string }>('/api/v1/health'),
        adminOrderService.getOrders({ size: 100 }),
      ]);

      // Extract values with fallbacks
      const totalCustomers = customersTotalRes.status === 'fulfilled' ? customersTotalRes.value.totalElements : 0;
      const activeCustomers = customersActiveRes.status === 'fulfilled' ? customersActiveRes.value.totalElements : 0;

      const totalProviders = providersTotalRes.status === 'fulfilled' ? providersTotalRes.value.totalElements : 0;
      const activeProviders = providersActiveRes.status === 'fulfilled' ? providersActiveRes.value.totalElements : 0;
      setTotalProvidersCount(totalProviders);
      setActiveProvidersCount(activeProviders);

      const pendingList = pendingProvidersRes.status === 'fulfilled' ? pendingProvidersRes.value.content : [];
      const pendingCount = pendingProvidersRes.status === 'fulfilled' ? pendingProvidersRes.value.totalElements : 0;
      setPendingProviders(pendingList);

      const totalCategories = categoriesTotalRes.status === 'fulfilled' ? categoriesTotalRes.value.totalElements : 0;
      const activeCategories = categoriesActiveRes.status === 'fulfilled' ? categoriesActiveRes.value.totalElements : 0;
      setTotalCategoriesCount(totalCategories);
      setActiveCategoriesCount(activeCategories);

      const publicProviders = publicProvidersRes.status === 'fulfilled' && Array.isArray(publicProvidersRes.value) 
        ? publicProvidersRes.value 
        : [];
      const availableCount = publicProviders.filter((p) => p.isAvailable).length;
      setAvailableProvidersCount(availableCount);

      const usersList = recentUsersRes.status === 'fulfilled' ? recentUsersRes.value.content : [];
      setRecentUsers(usersList);

      const isUp = healthRes.status === 'fulfilled' && healthRes.value?.status === 'UP';
      setSystemHealth(isUp ? 'UP' : 'DOWN');

      // Orders metrics
      const ordersList = ordersRes.status === 'fulfilled' ? ordersRes.value : [];
      const totalOrdersCount = ordersList.length;
      const pendingOrdersCount = ordersList.filter((o) => o.status === 'PENDING_PROVIDER').length;

      const dynamicMetrics: AdminKpiMetric[] = [
        {
          id: 'total-customers',
          title: 'Tổng khách hàng',
          value: totalCustomers,
          formattedValue: totalCustomers.toLocaleString('vi-VN'),
          unit: 'người dùng',
          changeType: 'neutral',
          compareLabel: 'tài khoản trên hệ thống',
          trendLabel: `${activeCustomers} kích hoạt`,
          statusLabel: 'Tăng trưởng tự nhiên',
          statusVariant: 'success',
          icon: 'users',
        },
        {
          id: 'total-providers',
          title: 'Thợ đối tác kỹ thuật',
          value: totalProviders,
          formattedValue: totalProviders.toLocaleString('vi-VN'),
          unit: 'đối tác thợ',
          changeType: 'neutral',
          compareLabel: 'cung cấp dịch vụ',
          trendLabel: `${activeProviders} đang hoạt động`,
          statusLabel: 'Đối tác đã xác thực',
          statusVariant: 'info',
          icon: 'wrench',
        },
        {
          id: 'total-orders',
          title: 'Tổng đơn hàng dịch vụ',
          value: totalOrdersCount,
          formattedValue: totalOrdersCount.toLocaleString('vi-VN'),
          unit: 'đơn sửa chữa',
          changeType: 'neutral',
          compareLabel: 'toàn hệ thống',
          trendLabel: `${pendingOrdersCount} đơn chờ thợ`,
          statusLabel: 'Dữ liệu trực tiếp',
          statusVariant: 'info',
          icon: 'package',
        },
        {
          id: 'total-categories',
          title: 'Danh mục dịch vụ',
          value: totalCategories,
          formattedValue: totalCategories.toLocaleString('vi-VN'),
          unit: 'ngành dịch vụ',
          changeType: 'neutral',
          compareLabel: 'tiêu chuẩn vận hành',
          trendLabel: `${activeCategories} danh mục mở`,
          statusLabel: 'Danh mục chuẩn hóa',
          statusVariant: 'success',
          icon: 'package',
        },
        {
          id: 'pending-approvals',
          title: 'Hồ sơ chờ kích hoạt / duyệt',
          value: pendingCount,
          formattedValue: pendingCount < 10 ? `0${pendingCount}` : `${pendingCount}`,
          unit: 'hồ sơ mới',
          changeType: pendingCount > 0 ? 'increase' : 'neutral',
          compareLabel: 'cần xử lý',
          trendLabel: pendingCount > 0 ? 'Cần duyệt gấp' : 'Đã duyệt tất cả',
          statusLabel: pendingCount > 0 ? 'Yêu cầu kích hoạt' : 'Hồ sơ sạch',
          statusVariant: pendingCount > 0 ? 'danger' : 'success',
          icon: 'user-check',
        },
      ];

      setMetrics(dynamicMetrics);
    } catch {
      // Backend error fallback
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Filter displayed recent users
  const displayedUsers = recentUsers.filter((u) => {
    if (userQuickFilter === 'all') return true;
    return u.role === userQuickFilter;
  });

  // Handlers for modal interactions
  const handleOpenUserDetail = (user: AdminUserItem) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleApproveProvider = async (userId: string) => {
    try {
      const updated = await userService.updateUserStatus(userId, { status: 'ACTIVE' });
      showToast(`Đã kích hoạt và phê duyệt tài khoản thợ ${updated.fullName} thành công!`);
      // Refresh real data
      loadDashboardData(true);
      if (selectedUser?.id === userId) {
        setSelectedUser(updated);
      }
    } catch {
      showToast('Không thể kích hoạt tài khoản. Vui lòng kiểm tra lại kết nối!');
    }
  };

  const handleToggleUserStatus = async (userId: string, newStatus: AdminUserItem['status']) => {
    try {
      const updated = await userService.updateUserStatus(userId, { status: newStatus });
      showToast(`Đã đổi trạng thái tài khoản thành ${newStatus === 'ACTIVE' ? 'Hoạt động' : 'Vô hiệu hóa'}.`);
      loadDashboardData(true);
      if (selectedUser?.id === userId) {
        setSelectedUser(updated);
      }
    } catch {
      showToast('Có lỗi xảy ra khi cập nhật trạng thái người dùng.');
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return <span className="admin-chip chip-role-admin">Quản trị viên</span>;
      case 'PROVIDER':
        return <span className="admin-chip chip-role-provider">Thợ kỹ thuật</span>;
      case 'CUSTOMER':
      default:
        return <span className="admin-chip chip-role-customer">Khách hàng</span>;
    }
  };

  const getStatusBadge = (status: AdminUserItem['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="admin-chip chip-status-active">Đang hoạt động</span>;
      case 'DISABLED':
      default:
        return <span className="admin-chip chip-status-disabled">Chờ duyệt / Khóa</span>;
    }
  };

  return (
    <div className="admin-dashboard-page">
      {/* Toast notice */}
      {toastMsg && (
        <div className="dashboard-toast-notice">
          <CheckCircle2 size={18} className="text-emerald-500" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 01. Thẻ thống kê tổng quan (KPI Cards) */}
      <section className="dashboard-section" aria-labelledby="kpi-heading">
        <div className="section-title-row">
          <div>
            <h2 id="kpi-heading" className="section-heading">
              01. Thống Kê Tổng Quan Hệ Thống (KPI Cards)
            </h2>
            <p className="section-subheading">
              Chỉ số sức khỏe vận hành trực quan được đồng bộ trực tiếp từ cơ sở dữ liệu Backend
            </p>
          </div>
          <div className="header-actions-row">
            <button
              type="button"
              className={`btn-refresh-dashboard ${isRefreshing ? 'is-spinning' : ''}`}
              onClick={() => loadDashboardData(true)}
              title="Làm mới dữ liệu từ backend"
            >
              <RefreshCw size={14} /> Làm mới
            </button>
            <span className={`live-indicator-tag ${systemHealth === 'UP' ? 'tag-healthy' : 'tag-checking'}`}>
              <span className="live-dot" /> 
              {systemHealth === 'UP' ? 'Hệ thống trực tuyến (UP)' : 'Đang kết nối API'}
            </span>
          </div>
        </div>

        <AdminKpiCards 
          metrics={metrics} 
          onCardClick={(metricId) => {
            if (metricId === 'pending-approvals') {
              navigate(PATHS.ADMIN.USERS);
            } else if (metricId === 'total-customers' || metricId === 'total-providers' || metricId === 'available-providers') {
              navigate(PATHS.ADMIN.USERS);
            } else if (metricId === 'total-categories') {
              navigate(PATHS.ADMIN.SERVICES);
            }
          }}
        />
      </section>

      {/* Provider Approvals Alert Banner */}
      {pendingProviders.length > 0 && (
        <div className="dashboard-alert-banner">
          <div className="banner-left">
            <div className="banner-icon-circle">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 className="banner-title">
                Phát hiện {pendingProviders.length} hồ sơ thợ đối tác đang chờ quản trị viên kích hoạt / phê duyệt!
              </h3>
              <p className="banner-desc">
                Các hồ sơ thợ này đang ở trạng thái chưa kích hoạt (DISABLED), cần Admin kiểm tra thông tin để bắt đầu nhận việc.
              </p>
            </div>
          </div>
          <div className="banner-actions">
            <button
              type="button"
              className="btn-banner-primary"
              onClick={() => navigate(PATHS.ADMIN.USERS)}
            >
              Quản lý tài khoản thợ <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Recent Registered Users & Pending Provider Approvals */}
      <div className="dashboard-main-grid">
        {/* Left Column: Người dùng & Đối tác mới tham gia */}
        <div className="dashboard-col-orders">
          <div className="dashboard-panel">
            <div className="panel-header">
              <div className="panel-title-wrap">
                <h3 className="panel-title">
                  <Activity size={18} className="text-primary inline-icon" /> Người Dùng & Đối Tác Mới Đăng Ký
                </h3>
                <span className="panel-badge-count">
                  {displayedUsers.length} tài khoản
                </span>
              </div>

              <div className="panel-actions">
                <button
                  type="button"
                  className={`panel-filter-btn ${userQuickFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setUserQuickFilter('all')}
                >
                  Tất cả ({recentUsers.length})
                </button>
                <button
                  type="button"
                  className={`panel-filter-btn ${userQuickFilter === 'CUSTOMER' ? 'active' : ''}`}
                  onClick={() => setUserQuickFilter('CUSTOMER')}
                >
                  Khách hàng ({recentUsers.filter((u) => u.role === 'CUSTOMER').length})
                </button>
                <button
                  type="button"
                  className={`panel-filter-btn ${userQuickFilter === 'PROVIDER' ? 'active' : ''}`}
                  onClick={() => setUserQuickFilter('PROVIDER')}
                >
                  Thợ kỹ thuật ({recentUsers.filter((u) => u.role === 'PROVIDER').length})
                </button>
                <button
                  type="button"
                  className="panel-view-all-link"
                  onClick={() => navigate(PATHS.ADMIN.USERS)}
                >
                  Xem tất cả <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Quick Status Bar for User Metrics */}
            <div className="order-status-bar">
              <div className="status-bar-pill pill-new">
                <span className="bar-count">{recentUsers.filter((u) => u.role === 'CUSTOMER').length}</span>
                <span className="bar-label">Khách mới</span>
              </div>
              <div className="status-bar-pill pill-progress">
                <span className="bar-count">{recentUsers.filter((u) => u.role === 'PROVIDER').length}</span>
                <span className="bar-label">Thợ đối tác</span>
              </div>
              <div className="status-bar-pill pill-completed">
                <span className="bar-count">{recentUsers.filter((u) => u.status === 'ACTIVE').length}</span>
                <span className="bar-label">Đang hoạt động</span>
              </div>
              <div className="status-bar-pill pill-unassigned">
                <span className="bar-count">{recentUsers.filter((u) => u.status === 'DISABLED').length}</span>
                <span className="bar-label">Chờ duyệt / Khóa</span>
              </div>
            </div>

            {/* Users Table */}
            <div className="orders-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Họ Tên & Email</th>
                    <th>Vai Trò</th>
                    <th>Số Điện Thoại</th>
                    <th>Trạng Thái</th>
                    <th>Ngày Tham Gia</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        <RefreshCw size={24} className="mx-auto mb-2 is-spinning text-primary" />
                        Đang đồng bộ dữ liệu người dùng từ Backend...
                      </td>
                    </tr>
                  ) : displayedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        Chưa có người dùng nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    displayedUsers.map((u) => (
                      <tr 
                        key={u.id} 
                        className={u.status === 'DISABLED' ? 'row-disabled-highlight' : ''}
                      >
                        <td>
                          <div className="table-user-primary-cell">
                            <div className="table-avatar-circle">
                              {u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="table-user-details">
                              <span className="table-user-name font-semibold">{u.fullName}</span>
                              <span className="table-user-sub">{u.email}</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          {getRoleBadge(u.role)}
                        </td>

                        <td>
                          <span className="table-phone-text">
                            {u.phone || 'Chưa cập nhật'}
                          </span>
                        </td>

                        <td>
                          {getStatusBadge(u.status)}
                        </td>

                        <td>
                          <span className="table-time-text">
                            {new Date(u.createdAt).toLocaleDateString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="btn-table-inspect"
                            onClick={() => handleOpenUserDetail(u)}
                            title="Bấm để xem hồ sơ và chỉnh sửa trạng thái"
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
        </div>

        {/* Right Column: Hồ sơ thợ chờ duyệt & Quick Admin Summary */}
        <div className="dashboard-col-side">
          {/* Hồ sơ thợ chờ duyệt widget */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <div className="panel-title-wrap">
                <h3 className="panel-title">
                  <ShieldCheck size={18} className="text-emerald-600 inline-icon" /> 
                  Hồ Sơ Thợ Chờ Kích Hoạt
                </h3>
                <span className="panel-badge-count badge-warning">
                  {pendingProviders.length} hồ sơ
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
                  <CheckCircle2 size={36} className="text-emerald-500" />
                  <p className="font-semibold text-slate-700">Tất cả hồ sơ đã được duyệt!</p>
                  <span className="text-xs text-slate-400">Không có tài khoản thợ nào đang ở trạng thái vô hiệu hóa.</span>
                </div>
              ) : (
                pendingProviders.map((prov) => (
                  <div key={prov.id} className="pending-provider-card">
                    <div className="pending-avatar-placeholder">
                      {prov.fullName ? prov.fullName.charAt(0).toUpperCase() : 'P'}
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
                        title="Kích hoạt tài khoản thợ này ngay"
                      >
                        Kích hoạt
                      </button>
                      <button
                        type="button"
                        className="btn-inspect-quick"
                        onClick={() => handleOpenUserDetail(prov)}
                        title="Xem chi tiết hồ sơ tài khoản"
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
                  <span>Trạng thái máy chủ Backend</span>
                  <strong className={systemHealth === 'UP' ? 'text-emerald-600' : 'text-amber-600'}>
                    {systemHealth === 'UP' ? 'Hoạt động tốt (UP)' : 'Đang kiểm tra...'}
                  </strong>
                </div>
                <div className="health-progress-bg">
                  <div 
                    className={`health-progress-bar ${systemHealth === 'UP' ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                    style={{ width: systemHealth === 'UP' ? '100%' : '50%' }} 
                  />
                </div>
              </div>

              <div className="health-item">
                <div className="health-label-row">
                  <span>Thợ đối tác đã kích hoạt</span>
                  <strong className="text-blue-600">
                    {activeProvidersCount} / {totalProvidersCount || 0} thợ
                  </strong>
                </div>
                <div className="health-progress-bg">
                  <div 
                    className="health-progress-bar bg-blue-500" 
                    style={{ 
                      width: `${totalProvidersCount > 0 ? Math.min(100, Math.round((activeProvidersCount / totalProvidersCount) * 100)) : 0}%` 
                    }} 
                  />
                </div>
              </div>

              <div className="health-item">
                <div className="health-label-row">
                  <span>Thợ sẵn sàng nhận việc</span>
                  <strong className="text-amber-600">
                    {availableProvidersCount} thợ trực tuyến
                  </strong>
                </div>
                <div className="health-progress-bg">
                  <div 
                    className="health-progress-bar bg-amber-500" 
                    style={{ 
                      width: `${totalProvidersCount > 0 ? Math.min(100, Math.round((availableProvidersCount / totalProvidersCount) * 100)) : 0}%` 
                    }} 
                  />
                </div>
              </div>

              <div className="health-item">
                <div className="health-label-row">
                  <span>Danh mục dịch vụ kích hoạt</span>
                  <strong className="text-emerald-600">
                    {activeCategoriesCount} / {totalCategoriesCount || 0} danh mục
                  </strong>
                </div>
                <div className="health-progress-bg">
                  <div 
                    className="health-progress-bar bg-emerald-500" 
                    style={{ 
                      width: `${totalCategoriesCount > 0 ? Math.min(100, Math.round((activeCategoriesCount / totalCategoriesCount) * 100)) : 0}%` 
                    }} 
                  />
                </div>
              </div>

              <div className="category-quick-nav-box">
                <button
                  type="button"
                  className="btn-category-nav-link"
                  onClick={() => navigate(PATHS.ADMIN.SERVICES)}
                >
                  <Layers size={14} /> Quản lý danh mục dịch vụ ({totalCategoriesCount})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Detail & Status Management Modal */}
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
