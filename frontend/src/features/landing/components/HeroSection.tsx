import './HeroSection.css';
import { Button } from '../../../components/common/Button';
import { Search, ShieldCheck } from 'lucide-react';
import heroImg from '../../../assets/hero_image.jpg';

export function HeroSection() {
  return (
    <section className="hero-section">
      <div className="container hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <ShieldCheck size={16} className="badge-icon" />
            <span>Nền tảng dịch vụ tại nhà uy tín</span>
          </div>
          
          <h1 className="hero-title">
            Giải pháp chăm sóc và sửa chữa ngôi nhà bạn <span>24/7</span>
          </h1>
          
          <p className="hero-subtitle">
            Kết nối nhanh chóng với thợ kỹ thuật uy tín gần bạn nhất. Báo giá minh bạch, an tâm chất lượng, có mặt kịp thời khi bạn cần.
          </p>
          
          <div className="hero-search-box">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={20} />
              <input 
                type="text" 
                placeholder="Nhập vấn đề bạn gặp phải (vd: rò rỉ nước, sửa máy lạnh...)" 
                className="search-input"
              />
            </div>
            <Button size="lg" className="search-btn">Tìm dịch vụ</Button>
          </div>
          
          <div className="hero-trust">
            <div className="trust-item">
              <span className="trust-check">✓</span>
              <span>Báo giá minh bạch</span>
            </div>
            <div className="trust-item">
              <span className="trust-check">✓</span>
              <span>Thợ xác minh 100%</span>
            </div>
            <div className="trust-item">
              <span className="trust-check">✓</span>
              <span>Bảo hành dịch vụ</span>
            </div>
          </div>
        </div>
        
        <div className="hero-image-wrapper">
          <img 
            src={heroImg} 
            alt="Thợ chuyên nghiệp đang làm việc" 
            className="hero-image-actual"
          />
          
          <div className="floating-card stat-card">
            <div className="stat-value">15+ Phút</div>
            <div className="stat-label">Thời gian thợ có mặt</div>
          </div>
          
          <div className="floating-card verify-card">
            <ShieldCheck size={24} className="verify-icon" />
            <div className="verify-text">
              <strong>Đã xác thực</strong>
              <span>Tay nghề & lý lịch</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
