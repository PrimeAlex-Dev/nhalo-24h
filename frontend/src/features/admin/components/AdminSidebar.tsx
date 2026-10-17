import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Layers,
  ArrowLeftRight, 
  LogOut, 
  X,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../auth';
import { PATHS } from '../../../routes/paths';
import './AdminSidebar.css';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  pendingUsersCount?: number;
  backlogOrdersCount?: number;
}

export function AdminSidebar({
  isOpen,
  onClose,
  pendingUsersCount = 2,
  backlogOrdersCount = 2,
}: AdminSidebarProps) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate(PATHS.AUTH.LOGIN);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="admin-sidebar-backdrop" 
          onClick={onClose} 
          aria-hidden="true" 
        />
      )}

      <aside className={`admin-sidebar ${isOpen ? 'is-open' : ''}`}>
        {/* Header / Brand */}
        <div className="sidebar-brand-box">
          <Link to={PATHS.ADMIN.DASHBOARD} className="sidebar-brand-link" onClick={onClose}>
            <div className="brand-logo-icon">
              <span>NL</span>
            </div>
            <div className="brand-text-wrap">
              <span className="brand-name">Nhà Lo 24h</span>
              <span className="brand-badge-admin">ADMIN PORTAL</span>
            </div>
          </Link>

          <button 
            type="button" 
            className="sidebar-mobile-close" 
            onClick={onClose}
            aria-label="Đóng menu điều hướng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation list */}
        <div className="sidebar-nav-container">
          <div className="sidebar-group-label">QUẢN TRỊ TRUNG TÂM</div>

          <nav className="sidebar-nav-list">
            <NavLink
              to={PATHS.ADMIN.DASHBOARD}
              end
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'is-active' : ''}`}
              onClick={onClose}
            >
              <LayoutDashboard size={20} className="nav-icon" />
              <span className="nav-label">Tổng quan</span>
            </NavLink>

            <NavLink
              to={PATHS.ADMIN.ORDERS}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'is-active' : ''}`}
              onClick={onClose}
            >
              <ShoppingBag size={20} className="nav-icon" />
              <span className="nav-label">Tình hình đơn hàng</span>
              {backlogOrdersCount > 0 && (
                <span className="nav-badge badge-warning" title={`${backlogOrdersCount} đơn cần xử lý gấp`}>
                  {backlogOrdersCount}
                </span>
              )}
            </NavLink>

            <NavLink
              to={PATHS.ADMIN.USERS}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'is-active' : ''}`}
              onClick={onClose}
            >
              <Users size={20} className="nav-icon" />
              <span className="nav-label">Quản lý người dùng</span>
              {pendingUsersCount > 0 && (
                <span className="nav-badge badge-primary" title={`${pendingUsersCount} hồ sơ thợ chờ duyệt`}>
                  {pendingUsersCount}
                </span>
              )}
            </NavLink>

            <NavLink
              to={PATHS.ADMIN.SERVICES}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'is-active' : ''}`}
              onClick={onClose}
            >
              <Layers size={20} className="nav-icon" />
              <span className="nav-label">Danh mục dịch vụ</span>
            </NavLink>
          </nav>

          <div className="sidebar-group-label mt-6">CHUYỂN GIAO DIỆN NHANH</div>
          <div className="sidebar-quick-switches">
            <Link to={PATHS.CUSTOMER.ROOT} className="switch-portal-link" target="_blank" rel="noreferrer">
              <div className="switch-portal-text">
                <span className="switch-title">Cổng Khách Hàng</span>
                <span className="switch-sub">Trải nghiệm đặt dịch vụ</span>
              </div>
              <ExternalLink size={15} />
            </Link>

            <Link to={PATHS.PROVIDER.ROOT} className="switch-portal-link" target="_blank" rel="noreferrer">
              <div className="switch-portal-text">
                <span className="switch-title">Cổng Đối Tác Thợ</span>
                <span className="switch-sub">Giao diện nhận cuốc</span>
              </div>
              <ArrowLeftRight size={15} />
            </Link>
          </div>
        </div>

        {/* Bottom Profile & Logout */}
        <div className="sidebar-footer">
          <div className="admin-profile-pill">
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" 
              alt="Admin Profile" 
              className="admin-avatar-small" 
            />
            <div className="admin-profile-info">
              <span className="admin-name">{user?.fullName || 'Hoàng Quốc Việt'}</span>
              <span className="admin-role">{user?.role || 'Super Admin'}</span>
            </div>
          </div>

          <button 
            type="button" 
            className="sidebar-logout-btn" 
            onClick={handleLogout}
            title="Đăng xuất"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
    </>
  );
}
