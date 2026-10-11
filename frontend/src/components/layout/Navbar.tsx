import './Navbar.css';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';
import { ArrowUpRight, Menu } from 'lucide-react';
import { PATHS } from '../../routes/paths';

interface NavbarProps {
  onLogin?: () => void;
}

export function Navbar({ onLogin }: NavbarProps = {}) {
  const navigate = useNavigate();

  const handleNavigateToCustomer = () => {
    if (onLogin) {
      onLogin();
    } else {
      navigate(PATHS.CUSTOMER.ROOT);
    }
  };

  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        <Link to={PATHS.HOME} className="navbar-logo" style={{ textDecoration: 'none' }}>
          <span className="logo-text">Nhà Lo 24h</span>
        </Link>
        
        <nav className="navbar-links">
          <a href="#services">Dịch vụ</a>
          <a href="#process">Quy trình</a>
          <a href="#why-us">Vì sao chọn chúng tôi</a>
          <a href="#testimonials">Đánh giá</a>
        </nav>
        
        <div className="navbar-actions">
          <a href="#partner" className="partner-link">Trở thành đối tác</a>
          <Button 
            icon={<ArrowUpRight size={18} />} 
            className="find-pro-btn"
            onClick={handleNavigateToCustomer}
          >
            Tìm thợ ngay
          </Button>
          <button className="mobile-menu-btn" aria-label="Toggle menu">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}
