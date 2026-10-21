import { useState, useRef, useEffect } from 'react';
import './CustomerNavbar.css';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Wrench, 
  Bell, 
  ClipboardList, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut,
  Plus
} from 'lucide-react';
import { mockCurrentUser } from '../data/customerMockData';
import { PATHS } from '../../../routes/paths';
import { useAuth } from '../../auth';
import { CreateOrderModal } from './CreateOrderModal';

interface CustomerNavbarProps {
  onLogout?: () => void;
}

export function CustomerNavbar({ onLogout }: CustomerNavbarProps = {}) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const displayName = user?.fullName || mockCurrentUser.name;
  const avatarLetter = (displayName[0] || 'U').toUpperCase();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoutClick = async () => {
    setIsUserMenuOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      await logout();
      navigate(PATHS.HOME);
    }
  };

  const handleCreateOrderSuccess = () => {
    setIsCreateModalOpen(false);
    // Notify order list to refresh without full reload
    window.dispatchEvent(new CustomEvent('nhalo24h:refresh-orders'));
    // Navigate to customer orders so user sees the newly created order
    navigate(PATHS.CUSTOMER.ORDERS);
  };

  return (
    <>
      <header className="customer-header">
        <div className="container customer-nav-container">
          {/* Left: Brand Logo */}
          <div className="customer-brand">
            <Link to={PATHS.CUSTOMER.ROOT} className="customer-logo-link">
              <div className="customer-logo-icon">
                <Wrench size={18} color="#FFFFFF" strokeWidth={2.4} />
              </div>
              <span className="customer-logo-text">HomeFix</span>
            </Link>
          </div>

          {/* Right: Actions & User Info */}
          <div className="customer-actions">
            {/* Create Order Button */}
            <button 
              type="button" 
              className="customer-create-order-btn"
              onClick={() => setIsCreateModalOpen(true)}
              aria-label="Tạo đơn hàng"
              title="Tạo đơn hàng mới"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Tạo đơn hàng</span>
            </button>

            {/* My Orders */}
            <Link 
              to={PATHS.CUSTOMER.ORDERS} 
              className="customer-orders-btn" 
              aria-label="My Orders"
            >
              <ClipboardList size={18} className="orders-icon" />
              <span className="orders-text">My Orders</span>
            </Link>

            {/* Notifications Bell with Badge */}
            <button 
              type="button" 
              className="customer-icon-btn customer-bell-btn" 
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={19} />
              {mockCurrentUser.unreadNotifications > 0 && (
                <span className="customer-badge">
                  {mockCurrentUser.unreadNotifications}
                </span>
              )}
            </button>

            {/* User Profile Avatar Pill */}
            <div className="customer-user-dropdown" ref={userMenuRef}>
              <button 
                type="button" 
                className="customer-avatar-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-expanded={isUserMenuOpen}
                aria-label="User menu"
              >
                <div className="customer-avatar-circle">
                  {avatarLetter}
                </div>
                <ChevronDown size={15} className={`chevron-icon ${isUserMenuOpen ? 'open' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div className="customer-dropdown-menu">
                  <div className="dropdown-user-header">
                    <div className="dropdown-user-avatar">
                      {avatarLetter}
                    </div>
                    <div className="dropdown-user-info">
                      <span className="dropdown-user-name">{displayName}</span>
                      <span className="dropdown-user-role">{user?.role || 'Customer'}</span>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <button 
                    type="button" 
                    className="dropdown-item" 
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsCreateModalOpen(true);
                    }}
                  >
                    <Plus size={16} />
                    <span>Tạo đơn hàng mới</span>
                  </button>
                  <Link 
                    to={PATHS.CUSTOMER.ORDERS} 
                    className="dropdown-item" 
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <ClipboardList size={16} />
                    <span>My Orders</span>
                  </Link>
                  <Link 
                    to={PATHS.CUSTOMER.PROFILE} 
                    className="dropdown-item" 
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <User size={16} />
                    <span>My Profile</span>
                  </Link>
                  <a 
                    href="#settings" 
                    className="dropdown-item" 
                    onClick={(e) => { e.preventDefault(); setIsUserMenuOpen(false); }}
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </a>
                  <div className="dropdown-divider" />
                  <button 
                    type="button" 
                    className="dropdown-item dropdown-logout-btn"
                    onClick={handleLogoutClick}
                  >
                    <LogOut size={16} />
                    <span>Log Out (Về Landing Page)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modal Tạo đơn mới */}
      {isCreateModalOpen && (
        <CreateOrderModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateOrderSuccess}
        />
      )}
    </>
  );
}

export default CustomerNavbar;
