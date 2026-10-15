import { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ShieldCheck, 
  Check, 
  Eye, 
  Lock, 
  Unlock, 
  Users, 
  Wrench, 
  UserPlus
} from 'lucide-react';
import { UserDetailModal } from '../components/UserDetailModal';
import { ADMIN_MOCK_USERS } from '../data/adminMockData';
import type { AdminUserItem, UserRoleFilter, UserStatusFilter } from '../types/admin';
import './AdminUsersPage.css';

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserItem[]>(ADMIN_MOCK_USERS);
  const [roleTab, setRoleTab] = useState<UserRoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Tab counters
  const countAll = users.length;
  const countCustomer = users.filter((u) => u.role === 'customer').length;
  const countProvider = users.filter((u) => u.role === 'provider').length;
  const countAdmin = users.filter((u) => u.role === 'admin').length;
  const countPending = users.filter((u) => u.status === 'pending').length;

  // Filtered list
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Role tab
      if (roleTab !== 'all' && user.role !== roleTab) return false;

      // Status filter
      if (statusFilter !== 'all' && user.status !== statusFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = user.fullName.toLowerCase().includes(query);
        const matchEmail = user.email.toLowerCase().includes(query);
        const matchPhone = user.phoneNumber.includes(query);
        const matchProf = user.profession?.toLowerCase().includes(query) ?? false;
        const matchId = user.id.toLowerCase().includes(query);
        if (!matchName && !matchEmail && !matchPhone && !matchProf && !matchId) {
          return false;
        }
      }

      return true;
    });
  }, [users, roleTab, statusFilter, searchQuery]);

  const handleOpenDetail = (user: AdminUserItem) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleApproveUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'active' } : u))
    );
    if (selectedUser?.id === userId) {
      setSelectedUser((prev) => (prev ? { ...prev, status: 'active' } : null));
    }
  };

  const handleToggleStatus = (userId: string, newStatus: AdminUserItem['status']) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    );
    if (selectedUser?.id === userId) {
      setSelectedUser((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const getRoleBadge = (role: AdminUserItem['role']) => {
    switch (role) {
      case 'admin':
        return <span className="user-role-badge role-admin">Quản trị viên</span>;
      case 'provider':
        return <span className="user-role-badge role-provider">Thợ kỹ thuật</span>;
      case 'customer':
        return <span className="user-role-badge role-customer">Khách hàng</span>;
    }
  };

  const getStatusBadge = (status: AdminUserItem['status']) => {
    switch (status) {
      case 'active':
        return <span className="user-status-pill status-active">Hoạt động</span>;
      case 'pending':
        return <span className="user-status-pill status-pending">Chờ duyệt</span>;
      case 'suspended':
        return <span className="user-status-pill status-suspended">Tạm khóa</span>;
    }
  };

  return (
    <div className="admin-users-page">
      {/* Header */}
      <div className="users-page-header">
        <div>
          <h2 className="users-page-title">
            02. Quản Lý Người Dùng Hệ Thống
          </h2>
          <p className="users-page-sub">
            Quản trị toàn diện danh sách tài khoản Khách hàng, Thợ đối tác và Quản trị viên
          </p>
        </div>
      </div>

      {/* Role Tabs */}
      <div className="users-tab-bar">
        <button
          type="button"
          className={`users-tab-btn ${roleTab === 'all' ? 'active' : ''}`}
          onClick={() => setRoleTab('all')}
        >
          <Users size={16} /> Tất cả tài khoản ({countAll})
        </button>

        <button
          type="button"
          className={`users-tab-btn ${roleTab === 'customer' ? 'active' : ''}`}
          onClick={() => setRoleTab('customer')}
        >
          Khách hàng ({countCustomer})
        </button>

        <button
          type="button"
          className={`users-tab-btn ${roleTab === 'provider' ? 'active' : ''}`}
          onClick={() => setRoleTab('provider')}
        >
          <Wrench size={15} /> Thợ kỹ thuật ({countProvider})
          {countPending > 0 && (
            <span className="users-tab-badge-warning" title={`${countPending} hồ sơ chờ duyệt`}>
              {countPending} chờ duyệt
            </span>
          )}
        </button>

        <button
          type="button"
          className={`users-tab-btn ${roleTab === 'admin' ? 'active' : ''}`}
          onClick={() => setRoleTab('admin')}
        >
          <ShieldCheck size={15} /> Quản trị viên ({countAdmin})
        </button>
      </div>

      {/* Toolbar */}
      <div className="users-toolbar">
        <div className="toolbar-search-wrap">
          <Search size={16} className="toolbar-search-icon" />
          <input
            type="text"
            className="toolbar-search-input"
            placeholder="Tìm theo họ tên, email, SĐT, ngành nghề..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="toolbar-filter-group">
          <div className="toolbar-select-wrap">
            <Filter size={14} className="toolbar-filter-icon" />
            <select
              className="toolbar-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as UserStatusFilter)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="pending">Chờ duyệt hồ sơ</option>
              <option value="suspended">Đã tạm khóa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="users-card-table-panel">
        <div className="users-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Họ Tên & ID</th>
                <th>Vai Trò</th>
                <th>Liên Hệ</th>
                <th>Khu Vực & Kinh Nghiệm</th>
                <th>Đơn Hàng</th>
                <th>Trạng Thái</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    <UserPlus size={36} className="mx-auto mb-2 text-slate-300" />
                    Không tìm thấy tài khoản người dùng nào khớp với tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className={user.status === 'pending' ? 'row-pending-highlight' : ''}>
                    <td>
                      <div className="table-user-profile-cell">
                        <img 
                          src={user.avatarUrl} 
                          alt={user.fullName} 
                          className="table-user-avatar" 
                        />
                        <div className="table-user-text">
                          <span className="table-user-fullname">{user.fullName}</span>
                          <span className="table-user-id">{user.id}</span>
                        </div>
                      </div>
                    </td>

                    <td>{getRoleBadge(user.role)}</td>

                    <td>
                      <div className="table-contact-cell">
                        <span className="table-contact-phone">{user.phoneNumber}</span>
                        <span className="table-contact-email">{user.email}</span>
                      </div>
                    </td>

                    <td>
                      <div className="table-meta-cell">
                        <span className="table-city-text">{user.city}</span>
                        {user.profession && (
                          <span className="table-prof-tag">{user.profession}</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="table-orders-stat-cell">
                        <span className="font-semibold text-slate-800">{user.totalOrders} đơn</span>
                        {user.rating && user.rating > 0 ? (
                          <span className="text-amber-600 text-xs font-semibold">
                            {user.rating} ⭐
                          </span>
                        ) : null}
                      </div>
                    </td>

                    <td>{getStatusBadge(user.status)}</td>

                    <td>
                      <div className="table-actions-cell">
                        {user.status === 'pending' && user.role === 'provider' ? (
                          <button
                            type="button"
                            className="btn-action-table-approve"
                            onClick={() => handleApproveUser(user.id)}
                            title="Duyệt hồ sơ thợ ngay"
                          >
                            <Check size={13} /> Duyệt
                          </button>
                        ) : user.role !== 'admin' ? (
                          <button
                            type="button"
                            className={`btn-action-table-lock ${user.status === 'suspended' ? 'unlock' : ''}`}
                            onClick={() =>
                              handleToggleStatus(
                                user.id,
                                user.status === 'suspended' ? 'active' : 'suspended'
                              )
                            }
                            title={user.status === 'suspended' ? 'Mở khóa' : 'Khóa tài khoản'}
                          >
                            {user.status === 'suspended' ? <Unlock size={13} /> : <Lock size={13} />}
                          </button>
                        ) : null}

                        <button
                          type="button"
                          className="btn-table-inspect"
                          onClick={() => handleOpenDetail(user)}
                          title="Xem chi tiết hồ sơ"
                        >
                          <Eye size={13} /> Chi tiết
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApproveUser={handleApproveUser}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
}
