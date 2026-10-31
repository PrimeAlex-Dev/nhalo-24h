import { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  ShieldCheck, 
  Eye, 
  Lock, 
  Unlock, 
  Users, 
  Wrench, 
  UserPlus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Shield
} from 'lucide-react';
import { UserDetailModal } from '../components/UserDetailModal';
import { CreateUserModal } from '../components/CreateUserModal';
import { userService } from '../../../services';
import type { 
  AdminUserItem, 
  SpringPageResponse, 
  UserRoleFilter, 
  UserStatusFilter, 
  CreateUserPayload, 
  UpdateUserPayload 
} from '../types/admin';
import './AdminUsersPage.css';

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [pageInfo, setPageInfo] = useState<SpringPageResponse<AdminUserItem>>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
    first: true,
    last: true,
    empty: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [roleTab, setRoleTab] = useState<UserRoleFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);

  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadUsers = useCallback(async (
    role: UserRoleFilter,
    status: UserStatusFilter,
    search: string,
    pageNum: number
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await userService.getUsers({
        role: role === 'ALL' ? undefined : role,
        status: status === 'ALL' ? undefined : status,
        search: search.trim() ? search.trim() : undefined,
        page: pageNum,
        size: 10,
        sort: 'createdAt,desc',
      });
      setUsers(res.content || []);
      setPageInfo(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi kết nối máy chủ backend');
      setUsers([]);
      setPageInfo({
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: true,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers(roleTab, statusFilter, searchQuery, page);
    }, 300);
    return () => clearTimeout(timer);
  }, [roleTab, statusFilter, searchQuery, page, loadUsers]);

  const handleRoleTabChange = (role: UserRoleFilter) => {
    setRoleTab(role);
    setPage(0);
  };

  const handleStatusFilterChange = (status: UserStatusFilter) => {
    setStatusFilter(status);
    setPage(0);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPage(0);
  };

  const handleOpenDetail = (user: AdminUserItem) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const handleToggleStatus = async (userId: string, newStatus: AdminUserItem['status']) => {
    try {
      const updated = await userService.updateUserStatus(userId, { status: newStatus });
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      if (selectedUser?.id === userId) {
        setSelectedUser(updated);
      }
      showToast(
        newStatus === 'DISABLED'
          ? 'Đã vô hiệu hóa tài khoản thành công.'
          : 'Đã kích hoạt lại tài khoản thành công.'
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể cập nhật trạng thái';
      alert(msg);
      throw err;
    }
  };

  const handleUpdateUser = async (userId: string, payload: UpdateUserPayload) => {
    try {
      const updated = await userService.updateUser(userId, payload);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      if (selectedUser?.id === userId) {
        setSelectedUser(updated);
      }
      showToast('Cập nhật thông tin người dùng thành công.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể cập nhật thông tin';
      alert(msg);
      throw err;
    }
  };

  const handleCreateUser = async (payload: CreateUserPayload) => {
    const created = await userService.createUser(payload);
    showToast(`Đã tạo thành công tài khoản "${created.fullName}"!`);
    loadUsers(roleTab, statusFilter, searchQuery, 0);
  };

  const getRoleBadge = (role: AdminUserItem['role']) => {
    switch (role) {
      case 'ADMIN':
        return <span className="user-role-badge role-admin">Quản trị viên</span>;
      case 'PROVIDER':
        return <span className="user-role-badge role-provider">Thợ kỹ thuật</span>;
      case 'CUSTOMER':
      default:
        return <span className="user-role-badge role-customer">Khách hàng</span>;
    }
  };

  const getStatusBadge = (status: AdminUserItem['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="user-status-pill status-active">Hoạt động</span>;
      case 'DISABLED':
        return <span className="user-status-pill status-suspended">Đã vô hiệu hóa</span>;
    }
  };

  return (
    <div className="admin-users-page">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="admin-toast-banner">
          <CheckCircle2 size={16} /> {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="users-page-header">
        <div>
          <h2 className="users-page-title">
            02. Quản Lý Người Dùng Hệ Thống
          </h2>
          <p className="users-page-sub">
            Kết nối API trực tiếp: Khách hàng (CUSTOMER), Thợ đối tác (PROVIDER) và Quản trị viên (ADMIN)
          </p>
        </div>

        <button
          type="button"
          className="btn-add-user-primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <UserPlus size={16} /> Thêm Người Dùng
        </button>
      </div>

      {/* Role Tabs */}
      <div className="users-tab-bar">
        <button
          type="button"
          className={`users-tab-btn ${roleTab === 'ALL' ? 'active' : ''}`}
          onClick={() => handleRoleTabChange('ALL')}
        >
          <Users size={16} /> Tất cả tài khoản
        </button>

        <button
          type="button"
          className={`users-tab-btn ${roleTab === 'CUSTOMER' ? 'active' : ''}`}
          onClick={() => handleRoleTabChange('CUSTOMER')}
        >
          Khách hàng (CUSTOMER)
        </button>

        <button
          type="button"
          className={`users-tab-btn ${roleTab === 'PROVIDER' ? 'active' : ''}`}
          onClick={() => handleRoleTabChange('PROVIDER')}
        >
          <Wrench size={15} /> Thợ kỹ thuật (PROVIDER)
        </button>

        <button
          type="button"
          className={`users-tab-btn ${roleTab === 'ADMIN' ? 'active' : ''}`}
          onClick={() => handleRoleTabChange('ADMIN')}
        >
          <ShieldCheck size={15} /> Quản trị viên (ADMIN)
        </button>
      </div>

      {/* Toolbar Search & Filter */}
      <div className="users-toolbar">
        <div className="toolbar-search-wrap">
          <Search size={16} className="toolbar-search-icon" />
          <input
            type="text"
            className="toolbar-search-input"
            placeholder="Tìm theo tên, email, số điện thoại..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div className="toolbar-filter-group">
          <div className="toolbar-select-wrap">
            <Filter size={14} className="toolbar-filter-icon" />
            <select
              className="toolbar-select"
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value as UserStatusFilter)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động (ACTIVE)</option>
              <option value="DISABLED">Đã vô hiệu hóa (DISABLED)</option>
            </select>
          </div>

          <button
            type="button"
            className="btn-refresh-users"
            onClick={() => loadUsers(roleTab, statusFilter, searchQuery, page)}
            title="Tải lại danh sách từ backend"
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Error Callout if Backend not reachable */}
      {error && (
        <div className="users-error-banner">
          <div className="error-banner-icon">
            <AlertCircle size={20} />
          </div>
          <div className="error-banner-text">
            <strong>Lỗi kết nối Backend:</strong> {error}
            <p className="error-banner-hint">
              Vui lòng kiểm tra lại dịch vụ Backend Spring Boot tại cổng 8080.
            </p>
          </div>
          <button
            type="button"
            className="btn-retry-fetch"
            onClick={() => loadUsers(roleTab, statusFilter, searchQuery, page)}
          >
            <RefreshCw size={14} /> Thử lại
          </button>
        </div>
      )}

      {/* Table Card */}
      <div className="users-card-table-panel">
        <div className="users-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Họ Tên & UUID</th>
                <th>Vai Trò (Role)</th>
                <th>Email Đăng Nhập</th>
                <th>Số Điện Thoại</th>
                <th>Xác Thực Email</th>
                <th>Ngày Tạo</th>
                <th>Trạng Thái</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    <RefreshCw size={28} className="mx-auto mb-3 animate-spin text-primary" />
                    Đang nạp dữ liệu người dùng từ máy chủ backend...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    <Shield size={36} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-700 m-0">Danh sách người dùng trống</p>
                    <p className="text-xs text-slate-400 mt-1 mb-4">
                      {searchQuery.trim() || roleTab !== 'ALL' || statusFilter !== 'ALL'
                        ? 'Không tìm thấy tài khoản nào khớp với bộ lọc tìm kiếm.'
                        : 'Chưa có tài khoản nào trong cơ sở dữ liệu.'}
                    </p>
                    <button
                      type="button"
                      className="btn-create-first-user"
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                      <UserPlus size={14} /> Thêm người dùng ngay
                    </button>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className={user.status === 'DISABLED' ? 'row-disabled-highlight' : ''}>
                    <td>
                      <div className="table-user-profile-cell">
                        <div className="table-user-avatar-placeholder">
                          {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="table-user-text">
                          <span className="table-user-fullname">{user.fullName}</span>
                          <span className="table-user-id" title={user.id}>
                            {user.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>{getRoleBadge(user.role)}</td>

                    <td>
                      <span className="table-contact-email font-mono">{user.email}</span>
                    </td>

                    <td>
                      <span className="table-contact-phone">
                        {user.phone ? user.phone : <em className="text-slate-400">Chưa có</em>}
                      </span>
                    </td>

                    <td>
                      <span className="table-email-verified-tag">
                        {user.isEmailVerified ? (
                          <span className="verified-yes">✅ Đã xác minh</span>
                        ) : (
                          <span className="verified-no">Chưa</span>
                        )}
                      </span>
                    </td>

                    <td>
                      <span className="table-created-date">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </td>

                    <td>{getStatusBadge(user.status)}</td>

                    <td>
                      <div className="table-actions-cell">
                        <button
                          type="button"
                          className={`btn-action-table-lock ${user.status === 'DISABLED' ? 'unlock' : ''}`}
                          onClick={() =>
                            handleToggleStatus(
                              user.id,
                              user.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED'
                            )
                          }
                          title={user.status === 'DISABLED' ? 'Kích hoạt lại tài khoản' : 'Vô hiệu hóa tài khoản'}
                        >
                          {user.status === 'DISABLED' ? <Unlock size={14} /> : <Lock size={14} />}
                        </button>

                        <button
                          type="button"
                          className="btn-table-inspect"
                          onClick={() => handleOpenDetail(user)}
                          title="Xem chi tiết & Chỉnh sửa hồ sơ"
                          aria-label="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="users-pagination-footer">
          <div className="pagination-info">
            Đang hiển thị <strong>{users.length}</strong> trên tổng số <strong>{pageInfo.totalElements}</strong> tài khoản
            {pageInfo.totalPages > 1 && ` (Trang ${page + 1} / ${pageInfo.totalPages})`}
          </div>

          <div className="pagination-controls">
            <button
              type="button"
              className="btn-page-nav"
              disabled={page <= 0 || loading}
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            >
              <ChevronLeft size={16} /> Trang trước
            </button>
            <span className="page-indicator">
              {page + 1}
            </span>
            <button
              type="button"
              className="btn-page-nav"
              disabled={page >= pageInfo.totalPages - 1 || loading}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Trang sau <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UserDetailModal
        user={selectedUser}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onUpdateUser={handleUpdateUser}
        onToggleStatus={handleToggleStatus}
      />

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateUser}
      />
    </div>
  );
}
