import './Navbar.css';
import { Button } from '../common/Button';
import { ArrowUpRight, Menu } from 'lucide-react';

export function Navbar() {
  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        <div className="navbar-logo">
          <span className="logo-text">Nhà Lo 24h</span>
        </div>
        
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
          >
            Tìm thợ ngay
          </Button>
          <button className="mobile-menu-btn">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}
