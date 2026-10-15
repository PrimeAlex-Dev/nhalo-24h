import { 
  Check, 
  MapPin, 
  ShieldCheck, 
  Award, 
  ChevronRight, 
  PhoneCall, 
  LogOut, 
  Repeat,
  Compass
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PATHS } from '../../../routes/paths';
import { mockProviderProfile } from '../data/providerMockData';
import './ProviderAccountPage.css';

export function ProviderAccountPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate(PATHS.AUTH.LOGIN);
  };

  return (
    <div className="provider-account-page">
      <h1 className="provider-account-title">Hồ sơ thợ & Cài đặt</h1>

      <div className="provider-account-desktop-grid">
        {/* Left Column on Laptop */}
        <div className="provider-account-left-col">
          {/* Profile Card */}
          <div className="provider-profile-card">
            <div className="provider-profile-avatar-box">
              <img 
                src={mockProviderProfile.avatar} 
                alt={mockProviderProfile.name} 
                className="provider-profile-avatar-img"
              />
              <div className="provider-verified-check" title="Đã xác minh danh tính và chứng chỉ">
                <Check size={14} strokeWidth={3} />
              </div>
            </div>

            <div className="provider-profile-info">
              <h2>{mockProviderProfile.name}</h2>
              <p className="provider-profile-role">{mockProviderProfile.role}</p>
              <div className="provider-profile-rating-pill">
                <span>★ {mockProviderProfile.rating}</span>
                <span>({mockProviderProfile.reviewsCount} đánh giá hài lòng)</span>
              </div>
            </div>
          </div>

          {/* Action links */}
          <div className="provider-account-actions-card">
            {/* Switch to customer view */}
            <Link to={PATHS.CUSTOMER.ROOT} className="provider-menu-btn">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Repeat size={18} color="#1D6AE5" />
                <span>Chuyển sang giao diện Khách hàng</span>
              </div>
              <ChevronRight size={18} color="#94A3B8" />
            </Link>

            {/* Support hotline */}
            <a href="tel:19006868" className="provider-menu-btn">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <PhoneCall size={18} color="#059669" />
                <span>Tổng đài hỗ trợ thợ (1900 6868 - 24/7)</span>
              </div>
              <ChevronRight size={18} color="#94A3B8" />
            </a>

            {/* Logout */}
            <button type="button" className="provider-menu-btn logout" onClick={handleLogout}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <LogOut size={18} color="#EF4444" />
                <span>Đăng xuất tài khoản</span>
              </div>
              <ChevronRight size={18} color="#EF4444" />
            </button>
          </div>
        </div>

        {/* Right Column on Laptop */}
        <div className="provider-account-right-col">
          {/* Operational Settings Card */}
          <div className="provider-settings-card">
            <h3 className="provider-settings-title">Cài đặt nhận việc</h3>

            <div className="provider-setting-list">
              <div className="provider-setting-item">
                <div className="provider-setting-label-row">
                  <Compass size={18} className="provider-setting-icon" />
                  <div>
                    <div className="provider-setting-text-main">Bán kính quét đơn</div>
                    <div className="provider-setting-text-sub">Ưu tiên đơn gần vị trí bạn</div>
                  </div>
                </div>
                <span className="provider-setting-value">10 km</span>
              </div>

              <div className="provider-setting-item">
                <div className="provider-setting-label-row">
                  <MapPin size={18} className="provider-setting-icon" />
                  <div>
                    <div className="provider-setting-text-main">Khu vực hoạt động</div>
                    <div className="provider-setting-text-sub">{mockProviderProfile.serviceArea}</div>
                  </div>
                </div>
                <span className="provider-setting-value">Đang áp dụng</span>
              </div>

              <div className="provider-setting-item">
                <div className="provider-setting-label-row">
                  <ShieldCheck size={18} className="provider-setting-icon" />
                  <div>
                    <div className="provider-setting-text-main">Bảo hiểm trách nhiệm nghề</div>
                    <div className="provider-setting-text-sub">Bảo hiểm PVI bảo lãnh dịch vụ 50 triệu</div>
                  </div>
                </div>
                <span className="provider-setting-value">Đã kích hoạt</span>
              </div>

              <div className="provider-setting-item">
                <div className="provider-setting-label-row">
                  <Award size={18} className="provider-setting-icon" />
                  <div>
                    <div className="provider-setting-text-main">Điểm tín nhiệm đối tác</div>
                    <div className="provider-setting-text-sub">Xếp hạng Thợ Bạc Cấp 2</div>
                  </div>
                </div>
                <span className="provider-setting-value">98/100</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
