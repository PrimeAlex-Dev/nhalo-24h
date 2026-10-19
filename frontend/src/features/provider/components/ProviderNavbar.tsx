import { Link, useLocation } from 'react-router-dom';
import { 
  Wrench, 
  Home, 
  Briefcase, 
  Wallet, 
  User, 
  Bell, 
  Repeat,
  Power
} from 'lucide-react';
import { PATHS } from '../../../routes/paths';
import { useAuth } from '../../auth';
import type { ProviderProfileData } from '../../../services';
import './ProviderNavbar.css';

interface ProviderNavbarProps {
  isOnline: boolean;
  onToggleOnline: () => void;
  unreadNotifications?: number;
  profile?: ProviderProfileData | null;
  incomingRequestsCount?: number;
}

export function ProviderNavbar({
  isOnline,
  onToggleOnline,
  unreadNotifications = 2,
  profile,
  incomingRequestsCount
}: ProviderNavbarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const displayName = profile?.fullName || user?.fullName || 'Thợ đối tác';
  const displayAvatar = profile?.avatarUrl || '';
  const initialLetter = displayName.trim().charAt(0).toUpperCase() || 'T';
  const shortName = displayName.trim().split(' ').slice(-1)[0] || 'Thợ';
  const ratingText = '★ 5.0';

  const isCurrentPath = (path: string) => {
    if (path === PATHS.PROVIDER.ROOT) {
      return location.pathname === PATHS.PROVIDER.ROOT || location.pathname === '/provider/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* ======================================================================
          TOP HEADER (Desktop & Mobile)
          ====================================================================== */}
      <header className="provider-top-header">
        <div className="provider-header-container">
          {/* Brand Logo & Tag */}
          <Link to={PATHS.PROVIDER.ROOT} className="provider-brand-group">
            <div className="provider-brand-logo-icon">
              <Wrench size={20} strokeWidth={2.4} />
            </div>
            <div className="provider-brand-texts">
              <span className="provider-brand-title">Nhà Lo 24h</span>
              <span className="provider-brand-subtitle">Thợ Đối Tác</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="provider-desktop-nav" aria-label="Điều hướng chính">
            <Link 
              to={PATHS.PROVIDER.ROOT} 
              className={`provider-nav-link ${isCurrentPath(PATHS.PROVIDER.ROOT) ? 'active' : ''}`}
            >
              <Home size={18} />
              <span>Trang chủ</span>
            </Link>

            <Link 
              to={PATHS.PROVIDER.JOBS} 
              className={`provider-nav-link ${isCurrentPath(PATHS.PROVIDER.JOBS) ? 'active' : ''}`}
            >
              <Briefcase size={18} />
              <span>Công việc</span>
              {incomingRequestsCount !== undefined && incomingRequestsCount > 0 && (
                <span className="provider-nav-badge">{incomingRequestsCount}</span>
              )}
            </Link>

            <Link 
              to={PATHS.PROVIDER.EARNINGS} 
              className={`provider-nav-link ${isCurrentPath(PATHS.PROVIDER.EARNINGS) ? 'active' : ''}`}
            >
              <Wallet size={18} />
              <span>Thu nhập</span>
            </Link>

            <Link 
              to={PATHS.PROVIDER.ACCOUNT} 
              className={`provider-nav-link ${isCurrentPath(PATHS.PROVIDER.ACCOUNT) ? 'active' : ''}`}
            >
              <User size={18} />
              <span>Tài khoản</span>
            </Link>
          </nav>

          {/* Header Right Actions */}
          <div className="provider-header-actions">
            {/* Quick Online / Offline Toggle */}
            <button
              type="button"
              className={`provider-status-toggle-btn ${isOnline ? 'online' : 'offline'}`}
              onClick={onToggleOnline}
              title={isOnline ? 'Nhấn để tạm dừng nhận việc' : 'Nhấn để bật sẵn sàng nhận việc'}
            >
              {isOnline ? (
                <>
                  <span className="provider-status-pulse-dot" />
                  <span>Sẵn sàng</span>
                </>
              ) : (
                <>
                  <Power size={13} />
                  <span>Tạm ngưng</span>
                </>
              )}
            </button>

            {/* Notification Bell */}
            <button 
              type="button" 
              className="provider-icon-btn" 
              aria-label="Thông báo"
              title="Thông báo mới"
            >
              <Bell size={19} />
              {unreadNotifications > 0 && <span className="provider-icon-badge-dot" />}
            </button>

            {/* Switch to Customer Portal Mode */}
            <Link 
              to={PATHS.CUSTOMER.ROOT} 
              className="provider-switch-mode-btn"
              title="Chuyển sang giao diện Khách hàng để trải nghiệm"
            >
              <Repeat size={14} />
              <span>Khách hàng</span>
            </Link>

            {/* Provider Mini Profile */}
            <Link to={PATHS.PROVIDER.ACCOUNT} className="provider-avatar-pill" title={`Hồ sơ ${displayName}`}>
              {displayAvatar ? (
                <img 
                  src={displayAvatar} 
                  alt={displayName} 
                  className="provider-avatar-img" 
                />
              ) : (
                <div className="provider-avatar-placeholder">
                  {initialLetter}
                </div>
              )}
              <div className="provider-avatar-texts">
                <span className="provider-avatar-name">{shortName}</span>
                <span className="provider-avatar-rating">{ratingText}</span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* ======================================================================
          MOBILE BOTTOM NAVIGATION (Grab Driver Style)
          ====================================================================== */}
      <nav className="provider-bottom-nav" aria-label="Thanh điều hướng dưới">
        <div className="provider-bottom-nav-container">
          {/* 1. Trang chủ */}
          <Link
            to={PATHS.PROVIDER.ROOT}
            className={`provider-bottom-nav-item ${isCurrentPath(PATHS.PROVIDER.ROOT) ? 'active' : ''}`}
          >
            <div className="provider-bottom-nav-icon-box">
              <Home size={22} strokeWidth={isCurrentPath(PATHS.PROVIDER.ROOT) ? 2.5 : 2} />
            </div>
            <span className="provider-bottom-nav-label">Trang chủ</span>
          </Link>

          {/* 2. Công việc */}
          <Link
            to={PATHS.PROVIDER.JOBS}
            className={`provider-bottom-nav-item ${isCurrentPath(PATHS.PROVIDER.JOBS) ? 'active' : ''}`}
          >
            <div className="provider-bottom-nav-icon-box">
              <Briefcase size={22} strokeWidth={isCurrentPath(PATHS.PROVIDER.JOBS) ? 2.5 : 2} />
              {incomingRequestsCount !== undefined && incomingRequestsCount > 0 && (
                <span className="provider-bottom-badge">{incomingRequestsCount}</span>
              )}
            </div>
            <span className="provider-bottom-nav-label">Công việc</span>
          </Link>

          {/* 3. Thu nhập */}
          <Link
            to={PATHS.PROVIDER.EARNINGS}
            className={`provider-bottom-nav-item ${isCurrentPath(PATHS.PROVIDER.EARNINGS) ? 'active' : ''}`}
          >
            <div className="provider-bottom-nav-icon-box">
              <Wallet size={22} strokeWidth={isCurrentPath(PATHS.PROVIDER.EARNINGS) ? 2.5 : 2} />
            </div>
            <span className="provider-bottom-nav-label">Thu nhập</span>
          </Link>

          {/* 4. Tài khoản */}
          <Link
            to={PATHS.PROVIDER.ACCOUNT}
            className={`provider-bottom-nav-item ${isCurrentPath(PATHS.PROVIDER.ACCOUNT) ? 'active' : ''}`}
          >
            <div className="provider-bottom-nav-icon-box">
              <User size={22} strokeWidth={isCurrentPath(PATHS.PROVIDER.ACCOUNT) ? 2.5 : 2} />
            </div>
            <span className="provider-bottom-nav-label">Tài khoản</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
