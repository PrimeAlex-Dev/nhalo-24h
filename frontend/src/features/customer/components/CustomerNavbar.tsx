import { useState, useRef, useEffect } from 'react';
import './CustomerNavbar.css';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Wrench, 
  Search, 
  Bell, 
  ClipboardList, 
  ChevronDown, 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { mockCurrentUser } from '../data/customerMockData';
import { PATHS } from '../../../routes/paths';

interface CustomerNavbarProps {
  onLogout?: () => void;
}

export function CustomerNavbar({ onLogout }: CustomerNavbarProps = {}) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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

  const handleLogoutClick = () => {
    setIsUserMenuOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      navigate(PATHS.HOME);
    }
  };

  return (
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

        {/* Center: Navigation Links */}
        <nav className="customer-nav-links">
          <a href="#services" className="customer-nav-link">
            Services
          </a>
          <a href="#providers" className="customer-nav-link">
            Find a Provider
          </a>
          <a href="#how-it-works" className="customer-nav-link">
            How It Works
          </a>
        </nav>

        {/* Right: Actions & User Info */}
        <div className="customer-actions">
          {/* Search Button */}
          <button 
            type="button" 
            className="customer-icon-btn" 
            aria-label="Search services"
            title="Search"
          >
            <Search size={19} />
          </button>

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

          {/* My Orders */}
          <button 
            type="button" 
            className="customer-orders-btn" 
            aria-label="My Orders"
          >
            <ClipboardList size={18} className="orders-icon" />
            <span className="orders-text">My Orders</span>
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
                {mockCurrentUser.avatarLetter}
              </div>
              <ChevronDown size={15} className={`chevron-icon ${isUserMenuOpen ? 'open' : ''}`} />
            </button>

            {isUserMenuOpen && (
              <div className="customer-dropdown-menu">
                <div className="dropdown-user-header">
                  <div className="dropdown-user-avatar">
                    {mockCurrentUser.avatarLetter}
                  </div>
                  <div className="dropdown-user-info">
                    <span className="dropdown-user-name">{mockCurrentUser.name}</span>
                    <span className="dropdown-user-role">Customer</span>
                  </div>
                </div>
                <div className="dropdown-divider" />
                <a 
                  href="#profile" 
                  className="dropdown-item" 
                  onClick={(e) => { e.preventDefault(); setIsUserMenuOpen(false); }}
                >
                  <User size={16} />
                  <span>My Profile</span>
                </a>
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

          {/* Mobile Menu Button */}
          <button 
            type="button" 
            className="customer-mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {isMobileMenuOpen && (
        <div className="customer-mobile-menu">
          <nav className="customer-mobile-links">
            <a 
              href="#services" 
              className="mobile-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Services
            </a>
            <a 
              href="#providers" 
              className="mobile-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Find a Provider
            </a>
            <a 
              href="#how-it-works" 
              className="mobile-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              How It Works
            </a>
            <a 
              href="#orders" 
              className="mobile-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              My Orders
            </a>
            <button
              type="button"
              className="mobile-link dropdown-logout-btn"
              style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogoutClick();
              }}
            >
              Log Out (Về Landing Page)
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
