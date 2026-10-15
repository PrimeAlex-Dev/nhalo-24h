import { useState } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  AlertTriangle, 
  ChevronRight,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../../../routes/paths';
import './AdminHeader.css';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  backlogCount?: number;
  onSearchChange?: (query: string) => void;
}

export function AdminHeader({
  onToggleSidebar,
  backlogCount = 2,
  onSearchChange,
}: AdminHeaderProps) {
  const [searchVal, setSearchVal] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    onSearchChange?.(e.target.value);
  };

  const handleBacklogBannerClick = () => {
    navigate(PATHS.ADMIN.ORDERS);
  };

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button 
          type="button" 
          className="admin-hamburger-btn" 
          onClick={onToggleSidebar}
          aria-label="Mở menu thanh bên"
        >
          <Menu size={22} />
        </button>

        <div className="admin-header-welcome">
          <h1 className="admin-header-title">
            Bảng Quản Trị Hệ Thống
          </h1>
          <span className="admin-header-subtitle">
            Hôm nay, Thứ Năm 15/10/2026 • Giám sát thời gian thực
          </span>
        </div>
      </div>

      {/* Urgent backlog alert banner in center on desktop */}
      {backlogCount > 0 && (
        <button 
          type="button" 
          className="admin-urgent-alert-pill"
          onClick={handleBacklogBannerClick}
          title="Bấm để xem danh sách đơn tồn đọng"
        >
          <div className="urgent-pill-icon">
            <AlertTriangle size={15} />
          </div>
          <span className="urgent-pill-text">
            <strong>{backlogCount} đơn hàng tồn đọng</strong> cần can thiệp xử lý
          </span>
          <ChevronRight size={14} className="urgent-pill-arrow" />
        </button>
      )}

      {/* Right controls */}
      <div className="admin-header-right">
        {/* Search */}
        <div className="admin-search-box">
          <Search size={16} className="admin-search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Tìm kiếm mã đơn, khách, thợ..."
            value={searchVal}
            onChange={handleSearch}
          />
        </div>

        {/* Notification Bell Dropdown */}
        <div className="admin-notification-wrap">
          <button 
            type="button" 
            className="admin-icon-btn" 
            onClick={() => setShowNotifications((prev) => !prev)}
            aria-label="Thông báo hệ thống"
          >
            <Bell size={20} />
            {backlogCount > 0 && <span className="notification-indicator-dot" />}
          </button>

          {showNotifications && (
            <div className="admin-notification-dropdown">
              <div className="notification-dropdown-header">
                <span className="font-semibold text-slate-800">Cảnh báo hệ thống</span>
                <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                  {backlogCount} mới
                </span>
              </div>
              <div className="notification-dropdown-list">
                <div 
                  className="notification-item unread cursor-pointer"
                  onClick={() => {
                    setShowNotifications(false);
                    navigate(PATHS.ADMIN.ORDERS);
                  }}
                >
                  <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800 m-0">Đơn ORD-9821 chờ thợ &gt; 38 phút</p>
                    <p className="text-xs text-slate-500 m-0">Khu vực Bình Chánh chưa có đối tác tiếp nhận</p>
                  </div>
                </div>
                <div 
                  className="notification-item unread cursor-pointer"
                  onClick={() => {
                    setShowNotifications(false);
                    navigate(PATHS.ADMIN.ORDERS);
                  }}
                >
                  <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800 m-0">Đơn ORD-9788 chờ thợ &gt; 45 phút</p>
                    <p className="text-xs text-slate-500 m-0">Cần Admin chỉ định thợ trực tiếp tại Gò Vấp</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <div className="admin-user-badge">
          <div className="admin-badge-avatar-wrap">
            <Shield size={16} className="admin-shield-icon" />
          </div>
          <span className="admin-badge-name">Quản Trị Viên</span>
        </div>
      </div>
    </header>
  );
}
